import React, { useState } from "react";
import { useCommentsByParentComment, createComment } from "util/db";
import Comment from "./Comment";
import { useAuth } from "util/auth";
import { toast } from "react-hot-toast";

function Replies({ commentId, repliesData, feedbackId, checkAuth }) {
    const auth = useAuth();
    const [usersReply, setUsersReply] = useState("");
    const [loading, setLoading] = useState(false);
    const handleAddReply = async () => {
        if (usersReply.trim().length === 0) {
            toast.error("Comment cannot be empty");
            setUsersReply("");
            return;
        }

        // Check if user is logged in. If they aren't, show the AuthModal.
        const isLoggedIn = checkAuth();
        if (!isLoggedIn) return;    
        
        setLoading(true);
        const reply = await createComment({
            feedback_id: feedbackId,
            body: usersReply,
            commenter: auth.user.uid,
            parent_comment_id: commentId,
        });

        if (reply.length === 0) {
            alert("Error creating reply");
            return;
        }
        setUsersReply("");
        setLoading(false);
    };

    return (
        <div className="flex h-full w-full flex-col gap-2">
            {repliesData?.map((reply) => (
                <Comment key={reply.id} comment={reply} isReply={true} />
            ))}
            <div id={`replyInput-${commentId}`} className="min-w-0 flex-1 mt-2">
                <form action="#" className="relative">
                    <div className="overflow-hidden rounded-lg border-[1px]">
                        <label htmlFor="comment" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            rows={2}
                            name="comment"
                            id="comment"
                            value={usersReply}
                            className="block w-full resize-none border-0 bg-transparent p-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="Add your reply..."
                            onChange={(e) => setUsersReply(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddReply();
                                }
                            }}
                        />

                        {/* Spacer element to match the height of the toolbar */}
                        <div className="py-2" aria-hidden="true">
                            {/* Matches height of button in toolbar (1px border + 36px content height) */}
                            <div className="py-px">
                                <div className="h-9" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center space-x-5">
                            <div className="flex items-center">
                                {/* <button
                                        type="button"
                                        className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                                    >
                                        <PaperClipIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">ƒ
                                            Attach
                                            a
                                            file
                                        </span>
                                    </button> */}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="submit"
                                onClick={() => handleAddReply()}
                                disabled={loading}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {loading ? "..." : "Reply"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Replies;
