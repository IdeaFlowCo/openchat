import React from "react";
import { deleteSubmission } from "util/db";

function SingleSubmission({ submission }) {
    const confirmDelete = () => {
        if (window.confirm("Are you sure you want to delete this submission?")) {
            deleteSubmission(submission?.id);
        }
    };
    return (
        <div className="flex flex-col gap-4 border border-black/10 p-8 rounded-xl">
            <h1 className="text-sm text-black/40">
                Submission Id: {submission?.id}
            </h1>
            <p>{submission?.summary}</p>
            <div className="flex justify-end">
                <button
                    className=" inline-flex justify-center py-2 px-4 w-fit text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={() =>
                        submission?.id ? confirmDelete() : null
                    }
                >
                    Delete Submission
                </button>
            </div>
        </div>
    );
}

export default SingleSubmission;
