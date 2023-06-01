import React, { useState, useEffect } from "react";
import { useAuth } from "util/auth";
import {
    updateComment,
    createCommentLike,
    deleteCommentLike,
    useCommentLikesByComment,
    useCommentsByParentComment,
} from "util/db";

import { formatDateString } from "./PreviewFeatureRequest";
import Replies from "./Replies";

function Comment({ comment, isReply = false, checkAuth }) {
    const auth = useAuth();
    const [openReplies, setOpenReplies] = useState(false);
    const [scrollToReply, setScrollToReply] = useState(false);
    const { data: commentLikesData, status: commentLikesStatus } =
        useCommentLikesByComment(comment.id);
    const { data: repliesData, status: repliesStatus } =
        useCommentsByParentComment(comment.id);

    const handleThumbsUpComment = async () => {
        // Check if user is logged in. If they aren't, show the AuthModal.
        const isLoggedIn = checkAuth();
        if (!isLoggedIn) return;

        const authUserCommentLike = commentLikesData?.find(
            (commentLike) => commentLike.liked_by === auth.user.uid
        );

        if (authUserCommentLike) {
            // console.log("authUserUpvote found", authUserCommentLike);
            await deleteCommentLike({ commentLike_id: authUserCommentLike.id });
        } else {
            // console.log("not found");
            await createCommentLike({
                comment_id: comment.id,
                liked_by: auth.user.uid,
            });
        }
    };

    const handleClickReply = () => {
        setOpenReplies(true);
        setScrollToReply(true);
    };

    useEffect(() => {
        
        // Scroll to the div with id: replyInput-${commentId}, where commentId should be comment.id
        const replyInput = document.getElementById(`replyInput-${comment.id}`);
        if (replyInput) {
            replyInput.scrollIntoView({ behavior: "smooth" });
            setScrollToReply(false);
        }
    }, [scrollToReply]);

    return (
        <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100">
                    <h1 className="text-indigo-500 ">
                        {comment.users?.name.charAt(0)}
                    </h1>
                </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div>
                    <h3 className=" text-sm font-medium text-gray-900">
                        {comment.users?.name}
                    </h3>
                </div>
                <div className=" ">
                    <p className="text-sm font-light text-gray-500">
                        {comment.body}
                    </p>
                </div>
                <div className="flex items-center justify-start gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleThumbsUpComment()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                            className="h-4 w-4 text-gray-700 hover:text-indigo-600"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                            />
                        </svg>
                    </button>

                    <p className="text-[11px] font-light text-gray-500">
                        {/* {comment.likes} {comment.likes === 1 ? "Like" : "Likes"} */}
                        {commentLikesData?.length}{" "}
                        {commentLikesData?.length === 1 ? "Like" : "Likes"}
                    </p>
                    <p className="text-2xl text-gray-500">·</p>
                    <p className="text-[11px] font-light text-gray-500">
                        {formatDateString(comment.created_at)}
                    </p>
                    {!isReply && (
                        <button
                            type="button"
                            onClick={() => handleClickReply()}
                            className="text-[11px] font-light text-gray-500 underline hover:text-indigo-600"
                        >
                            Reply
                        </button>
                    )}
                </div>
                {openReplies ? (
                    <div>
                        <button
                            className="mb-5 text-[11px] text-indigo-600"
                            onClick={() => setOpenReplies(false)}
                        >
                            <span className="mr-2">⏷</span>Hide{" "}
                            {repliesData.length} replies
                        </button>
                        <Replies
                            commentId={comment.id}
                            repliesData={repliesData}
                            feedbackId={comment.feedback_id}
                            checkAuth={checkAuth}
                        />
                    </div>
                ) : (
                    repliesData?.length > 0 && (
                        <div>
                            <button
                                className="text-[11px] text-indigo-600"
                                onClick={() => setOpenReplies(true)}
                            >
                                <span className="mr-2">⏵</span>Show{" "}
                                {repliesData.length} replies
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
export default Comment;
