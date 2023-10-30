import {
  useQuery,
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from 'react-query';
import supabase from './supabase';
import { GeneralEmailTemplateProps } from 'types/emailTypes';
import { getFirstName } from './string';
import {
  FeedbackType,
  FollowupMessageType,
  FollowupSubmissionType,
} from 'types/supabaseDbTypes';
// React Query client
export const client = new QueryClient();

/**** USERS ****/

// Fetch user data
// Note: This is called automatically in `auth.js` and data is merged into `auth.user`
export function useUser(uid) {
  // Manage data fetching with React Query: https://react-query.tanstack.com/overview
  return useQuery(
    // Unique query key: https://react-query.tanstack.com/guides/query-keys
    ['user', { uid }],
    // Query function that fetches data
    () =>
      supabase
        .from('users')
        // .select(`*, customers ( * )`)
        .select(`*`)
        .eq('id', uid)
        .single()
        .then(handle),
    // Only call query function if we have a `uid`
    { enabled: !!uid }
  );
}

// Fetch user data (non-hook)
// Useful if you need to fetch data from outside of a component
export function getUser(uid) {
  return (
    supabase
      .from('users')
      // .select(`*, customers ( * )`)
      .select(`*`)
      .eq('id', uid)
      .single()
      .then(handle)
  );
}

// Fetch all users
export function useUsers() {
  return useQuery(
    ['users'],
    () =>
      supabase
        .from('users')
        // .select(`*, customers ( * )`)
        .select(`*`)
        .then(handle),
    { enabled: true }
  );
}

// Update an existing user
export async function updateUser(uid, data) {
  const response = await supabase
    .from('users')
    .update(data)
    .eq('id', uid)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['user', { uid }]);
  return response;
}

// WARNING: This is OLD DEEPFORM.AI CODE. REFERENCE IF YOU NEED TO, BUT IT WON'T GENERALLY BE USED
/**** PORTALS ****/

// Fetch portal data
export function usePortal(id) {
  return useQuery(
    ['portal', { id }],
    () => supabase.from('portals').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch the singular portal that belongs to an admin
export function usePortalByAdmin(admin) {
  return useQuery(
    ['portal', { admin }],
    () =>
      supabase
        .from('portals')
        .select()
        .eq('id', admin.portal_id)
        .single()
        .then(handle),
    { enabled: !!admin }
  );
}

// Create a new portal
export async function createPortal(data) {
  const response = await supabase
    .from('portals')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['portals']);
  return response;
}

// Update an existing portal
export async function updatePortal(id, data) {
  const response = await supabase
    .from('portals')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['portal', { id }]),
    client.invalidateQueries(['portals']),
  ]);
  return response;
}

// Delete an existing portal
export async function deletePortal(id) {
  const response = await supabase
    .from('portals')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['portal', { id }]),
    client.invalidateQueries(['portals']),
  ]);
  return response;
}

/**** FEEDBACK ****/

// Fetch feedback data
export function useFeedback(id: number) {
  return useQuery(
    ['singleFeedback', { id }],
    () => supabase.from('feedback').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all feedback by portal
export function useFeedbackByPortal(
  portalId: number,
  statusesFilterList: string[],
  topicsFilterList: string[]
) {
  return useQuery(
    ['feedback', { portalId }],
    () => {
      // Conditional Chaining
      let query = supabase
        .from('feedback')
        .select(
          `*,
                    users (
                        "*"
                    ),
                    upvotes (
                        "*" 
                    )
                    `
        )
        .eq('portal_id', portalId)
        .order('created_at', { ascending: false });
      if (statusesFilterList.length > 0) {
        query = query.in('status', statusesFilterList);
      }
      if (topicsFilterList.length > 0) {
        query = query.overlaps('topics', topicsFilterList);
      }
      return query.then(handle);
    },
    // supabase
    //     .from("feedback")
    //     .select(
    //         `*,
    //         users (
    //             "*"
    //         ),
    //         upvotes (
    //             "*"
    //         )
    //         `
    //     )
    //     .eq("portal_id", portalId)
    //     .order("created_at", { ascending: false })
    //     .then(handle),
    { enabled: !!portalId }
  );
}

// Create a new feedback
export async function createFeedback(
  data: FeedbackType,
  sendEmail: boolean = true
): Promise<FeedbackType> {
  const response = await supabase
    .from('feedback')
    .insert([data])
    .select()
    .single()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['feedback']);

  // Fetch "/api/email" endpoint to send email
  // The email should be from alan@deepform.ai
  // and to the email of the portal admin
  // with the subject "New Feedback Submitted"

  if (!sendEmail) {
    return response;
  }

  // Find the portal admin using data.portal_id
  const portalAdmin = await supabase
    .from('users')
    .select()
    .eq('portal_id', data.portal_id)
    .single()
    .then(handle);

  let capitalizedFirstName: string = getFirstName(portalAdmin.name);

  // Send email
  const generalEmailData: GeneralEmailTemplateProps = {
    // Required
    to: portalAdmin.email,
    from: 'Deepform <alan@deepform.ai>',
    subject: 'Deepform: New Feedback Submitted!',
    plainText: `Hi ${
      capitalizedFirstName ? capitalizedFirstName + ',' : 'there,'
    }, a new feedback has been submitted to your portal!
         Please login to your portal to view it.
            Preview: ${data.description.slice(0, 100)}...
          We're actively working on a weekly update email that will replace these individual emails.
           Thanks for your patience!`,
    previewText: `Deepform: New Feedback Submitted!`,
    p1Content: `A new idea has been submitted to your feedback portal! Please click the link below to enter your portal and view it.`,

    // Optional
    userFirstName: capitalizedFirstName,
    p2Content: `Title: ${data.title}`,
    p3Content: `Preview: ${data.description.slice(0, 100)}...`,
    p4Content: `We're actively working on a weekly update email that will replace these individual emails. Thanks for your patience!`,
    closingLine: `Happy building!`,
    ctaLink: `https://deepform.ai/portal/${data.portal_id}`,
    ctaText: `View Feedback`,
  };

  await fetch('/api/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(generalEmailData),
  });

  return response;
}

// Update an existing feedback
export async function updateFeedback(
  id: number,
  data: any
): Promise<FeedbackType> {
  const response = await supabase
    .from('feedback')
    .update(data)
    .eq('id', id)
    .select()
    .single()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['singleFeedback', { id }]),
    client.invalidateQueries(['feedback']),
  ]);
  return response;
}

// Delete an existing feedback
export async function deleteFeedback(id: number) {
  const response = await supabase
    .from('feedback')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['singleFeedback', { id }]),
    client.invalidateQueries(['feedback']),
  ]);
  return response;
}

// /**** UPVOTES ****/

// Fetch upvote data
export function useUpvote(id) {
  return useQuery(
    ['upvote', { id }],
    () => supabase.from('upvotes').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all upvotes by feedback
export function useUpvotesByFeedback(feedbackId) {
  return useQuery(
    ['upvotes', { feedbackId }],
    () =>
      supabase
        .from('upvotes')
        .select(`*, users ("*")`)
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!feedbackId }
  );
}

// Create a new upvote
export async function createUpvote(data) {
  const response = await supabase.from('upvotes').insert([data]).then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['upvotes']),
    client.invalidateQueries(['singleFeedback', { id: data.feedback_id }]),
    client.invalidateQueries(['feedback']),
  ]);
  return response;
}

// Update an existing upvote
export async function updateUpvote(id, data) {
  const response = await supabase
    .from('upvotes')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['upvote', { id }]),
    client.invalidateQueries(['upvotes']),
  ]);
  return response;
}

// Delete an existing upvote
export async function deleteUpvote(data) {
  const response = await supabase
    .from('upvotes')
    .delete()
    .eq('id', data.upvote_id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['upvote', { id: data.upvote_id }]),
    client.invalidateQueries(['upvotes']),
    client.invalidateQueries(['singleFeedback', { id: data.feedback_id }]),
    client.invalidateQueries(['feedback']),
  ]);
  return response;
}

/**** COMMENTS ****/

// Fetch comment data
export function useComment(id) {
  return useQuery(
    ['comment', { id }],
    () => supabase.from('comments').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all parent comments by feedback
export function useCommentsByFeedback(feedbackId) {
  return useQuery(
    ['comments', { feedbackId }],
    () =>
      supabase
        .from('comments')
        .select(`*, users ("*")`)
        .eq('feedback_id', feedbackId)
        .filter('parent_comment_id', 'is', null)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!feedbackId }
  );
}

// Fetch count of replies for parent_comment_id TODO: IDK why this doesn't work
// export function useRepliesCount(parentCommentId) {
//     return useQuery(
//         ["repliesCount", { parentCommentId }],
//         () =>
//             supabase
//                 .from("comments")
//                 .select("*", { count: "exact", head: true })
//                 .eq("parent_comment_id", parentCommentId)
//                 .then(handle)
//         // { enabled: !!parentCommentId }
//     );
// }

// Fetch all comments by parent_comment_id
export function useCommentsByParentComment(parentCommentId) {
  return useQuery(
    ['replies', { parentCommentId }],
    () =>
      supabase
        .from('comments')
        .select(`*, users ("*")`)
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true })
        .then(handle),
    { enabled: !!parentCommentId }
  );
}

// Create a new comment
export async function createComment(data) {
  const response = await supabase
    .from('comments')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['comments']),
    client.invalidateQueries([
      'replies',
      {
        parentCommentId: data.parent_comment_id,
      },
    ]),
  ]);

  return response;
}

// Update an existing comment
export async function updateComment(id, data) {
  const response = await supabase
    .from('comments')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['comment', { id }]),
    client.invalidateQueries(['comments']),
  ]);
  return response;
}

// Delete an existing comment
export async function deleteComment(data) {
  const response = await supabase
    .from('comments')
    .delete()
    .eq('id', data.comment_id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['comment', { id: data.comment_id }]),
    client.invalidateQueries(['comments']),
    client.invalidateQueries([
      'replies',
      {
        parentCommentId: data.parent_comment_id,
      },
    ]),
  ]);
  return response;
}

/**** COMMENT_LIKES ****/

// Fetch commentlike data
export function useCommentLike(id) {
  return useQuery(
    ['commentLike', { id }],
    () =>
      supabase.from('commentLikes').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all commentLikes by comment
export function useCommentLikesByComment(commentId) {
  return useQuery(
    ['commentLikes', { commentId }],
    () =>
      supabase
        .from('commentLikes')
        .select(`*, users ("*")`)
        .eq('comment_id', commentId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!commentId }
  );
}

// Create a new commentLike
export async function createCommentLike(data) {
  const response = await supabase
    .from('commentLikes')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([client.invalidateQueries(['commentLikes'])]);
  return response;
}

// Update an existing commentLike
export async function updateCommentLike(id, data) {
  const response = await supabase
    .from('commentLikes')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['commentLike', { id }]),
    client.invalidateQueries(['commentLikes']),
  ]);
  return response;
}

// Delete an existing commentLike
export async function deleteCommentLike(data) {
  const response = await supabase
    .from('commentLikes')
    .delete()
    .eq('id', data.commentLike_id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['commentLike', { id: data.commentLike_id }]),
    client.invalidateQueries(['commentLikes']),
  ]);
  return response;
}

// Old Deepform Survey Stuff

/**** DEEPFORMS ****/
/* Example query functions (modify to your needs) */

// Fetch item data
export function useDeepform(id) {
  return useQuery(
    ['deepform', { id }],
    () =>
      supabase.from('deepforms').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all items by owner
export function useDeepformsByOwner(owner) {
  return useQuery(
    ['deepforms', { owner }],
    () =>
      supabase
        .from('deepforms')
        .select()
        .eq('owner', owner)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!owner }
  );
}

// Create a new item
export async function createDeepform(data) {
  const response = await supabase.from('deepforms').insert([data]).then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['deepforms']);
  return response;
}

// Update an item
export async function updateDeepform(id, data) {
  const response = await supabase
    .from('deepforms')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['deepform', { id }]),
    client.invalidateQueries(['deepforms']),
  ]);
  return response;
}

// Delete an item
export async function deleteDeepform(id) {
  const response = await supabase
    .from('deepforms')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['deepform', { id }]),
    client.invalidateQueries(['deepforms']),
  ]);
  return response;
}

/**** FOLLOWUPSUBMISSIONS  ****/

// Fetch single followup submission
export function useFollowupSubmission(id: number) {
  return useQuery(
    ['followupSubmission', { id }],
    () =>
      supabase
        .from('followupSubmissions')
        .select()
        .eq('id', id)
        .single()
        .then(handle),
    { enabled: !!id }
  );
}

// Fetch all followup submissions by Feedback
export function useFollowupSubmissionsByFeedback(feedbackId: number) {
  return useQuery(
    ['followupSubmissions', { feedbackId }],
    () =>
      supabase
        .from('followupSubmissions')
        .select()
        .eq('feedback', feedbackId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!feedbackId }
  );
}

// Create a new followup submission
export async function createFollowupSubmission(data: FollowupSubmissionType) {
  const response = await supabase
    .from('followupSubmissions')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['followupSubmissions']);
  return response;
}

// Update a followup submission
export async function updateFollowupSubmission(
  id: number,
  data: FollowupSubmissionType
) {
  const response = await supabase
    .from('followupSubmissions')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['followupSubmission', { id }]),
    client.invalidateQueries(['followupSubmissions']),
  ]);
  return response;
}

// Delete a followup submission
export async function deleteFollowupSubmission(id: number) {
  const response = await supabase
    .from('followupSubmissions')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['followupSubmission', { id }]),
    client.invalidateQueries(['followupSubmissions']),
  ]);
  return response;
}

/**** SUBMISSIONS (OLD DEEPFORM, DON'T USE) ****/
/* Example query functions (modify to your needs) */

// Fetch single submission data
export function useSubmission(id) {
  return useQuery(
    ['submission', { id }],
    () =>
      supabase.from('submissions').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all submissions by Deepform
export function useSubmissionsByDeepform(deepformId) {
  return useQuery(
    ['submissions', { deepformId }],
    () =>
      supabase
        .from('submissions')
        .select()
        .eq('deepform', deepformId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!deepformId }
  );
}

// Create a new submission
export async function createSubmission(data) {
  const response = await supabase
    .from('submissions')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['submissions']);
  return response;
}

// Update a submission
export async function updateSubmission(id, data) {
  const response = await supabase
    .from('submissions')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['submission', { id }]),
    client.invalidateQueries(['submissions']),
  ]);
  return response;
}

// Delete a submission
export async function deleteSubmission(id) {
  const response = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['submission', { id }]),
    client.invalidateQueries(['submissions']),
  ]);
  return response;
}

/**** FOLLOWUPMESSAGES ****/

// Fetch single followup message data
export function useFollowupMessage(id: number) {
  return useQuery(
    ['followupMessage', { id }],
    () =>
      supabase
        .from('followupMessages')
        .select()
        .eq('id', id)
        .single()
        .then(handle),
    { enabled: !!id }
  );
}

// Fetch all followup messages by followup submission
export function useFollowupMessagesByFollowupSubmission(
  followupSubmissionId: number
) {
  return useQuery(
    ['followupMessages', { followupSubmissionId }],
    () =>
      supabase
        .from('followupMessages')
        .select()
        .eq('followupSubmission', followupSubmissionId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!followupSubmissionId }
  );
}

// Create a new followup message
export async function createFollowupMessage(data: FollowupMessageType) {
  const response = await supabase
    .from('followupMessages')
    .insert([data])
    .select()
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['followupMessages']);
  return response;
}

// Create many new followup messages. Should be an array of objects.
export async function createFollowupMessages(data: FollowupMessageType[]) {
  const response = await supabase
    .from('followupMessages')
    .insert(data)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['followupMessages']);
  return response;
}

// Update a followup message
export async function updateFollowupMessage(
  id: number,
  data: FollowupMessageType
) {
  const response = await supabase
    .from('followupMessages')
    .update(data)
    .eq('id', id)
    .then(handle);

  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['followupMessage', { id }]),
    client.invalidateQueries(['followupMessages']),
  ]);
  return response;
}

// Delete a followup message
export async function deleteFollowupMessage(id: number) {
  const response = await supabase
    .from('followupMessages')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['followupMessage', { id }]),
    client.invalidateQueries(['followupMessages']),
  ]);
  return response;
}

/**** MESSAGES (OLD, DON'T USE) ****/

// Fetch single message data
export function useMessage(id) {
  return useQuery(
    ['message', { id }],
    () => supabase.from('messages').select().eq('id', id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all messages by submission
export function useMessagesBySubmission(submissionId) {
  return useQuery(
    ['messages', { submissionId }],
    () =>
      supabase
        .from('messages')
        .select()
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
        .then(handle),
    { enabled: !!submissionId }
  );
}

// Create a new message. Should be an object.
export async function createMessage(data) {
  const response = await supabase.from('messages').insert([data]).then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['messages']);
  return response;
}

// Create many new messages. Should be an array of objects.
export async function createMessages(data) {
  const response = await supabase.from('messages').insert(data).then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(['messages']);
  return response;
}

// Update a message
export async function updateMessage(id, data) {
  const response = await supabase
    .from('messages')
    .update(data)
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['message', { id }]),
    client.invalidateQueries(['messages']),
  ]);
  return response;
}

// Delete a message
export async function deleteMessage(id) {
  const response = await supabase
    .from('messages')
    .delete()
    .eq('id', id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(['message', { id }]),
    client.invalidateQueries(['messages']),
  ]);
  return response;
}

// /**** ITEMS ****/
// /* Example query functions (modify to your needs) */

// // Fetch item data
// export function useItem(id) {
//   return useQuery(
//     ["item", { id }],
//     () => supabase.from("items").select().eq("id", id).single().then(handle),
//     { enabled: !!id }
//   );
// }

// // Fetch all items by owner
// export function useItemsByOwner(owner) {
//   return useQuery(
//     ["items", { owner }],
//     () =>
//       supabase
//         .from("items")
//         .select()
//         .eq("owner", owner)
//         .order("createdAt", { ascending: false })
//         .then(handle),
//     { enabled: !!owner }
//   );
// }

// // Create a new item
// export async function createItem(data) {
//   const response = await supabase.from("items").insert([data]).then(handle);
//   // Invalidate and refetch queries that could have old data
//   await client.invalidateQueries(["items"]);
//   return response;
// }

// // Update an item
// export async function updateItem(id, data) {
//   const response = await supabase
//     .from("items")
//     .update(data)
//     .eq("id", id)
//     .then(handle);
//   // Invalidate and refetch queries that could have old data
//   await Promise.all([
//     client.invalidateQueries(["item", { id }]),
//     client.invalidateQueries(["items"]),
//   ]);
//   return response;
// }

// // Delete an item
// export async function deleteItem(id) {
//   const response = await supabase
//     .from("items")
//     .delete()
//     .eq("id", id)
//     .then(handle);
//   // Invalidate and refetch queries that could have old data
//   await Promise.all([
//     client.invalidateQueries(["item", { id }]),
//     client.invalidateQueries(["items"]),
//   ]);
//   return response;
// }

/**** HELPERS ****/

// Get response data or throw error if there is one
function handle(response) {
  if (response.error) throw response.error;
  return response.data;
}

// React Query context provider that wraps our app
// export function QueryClientProvider(props: any) {
//     return (
//         <QueryClientProviderBase client={client}>
//             {props.children}
//         </QueryClientProviderBase>
//     );
// }
