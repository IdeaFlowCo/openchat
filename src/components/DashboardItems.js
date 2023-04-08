import React, { useState } from "react";
import EditDeepformModal from "components/EditDeepformModal";
import { useAuth } from "util/auth";
// import { updateItem, deleteItem, useItemsByOwner } from "util/db";
import { deleteDeepform, useDeepformsByOwner } from "util/db";

function DashboardItems(props) {
  const auth = useAuth();

  const {
    data: deepforms,
    status: deepformsStatus,
    error: deepformsError,
  } = useDeepformsByOwner(auth.user.uid);

  const [creatingDeepform, setCreatingDeepform] = useState(false);

  // const [updatingItemId, setUpdatingItemId] = useState(null);

  const deepformsAreEmpty = !deepforms || deepforms.length === 0;

  // const canUseStar =
  //   auth.user.planIsActive &&
  //   (auth.user.planId === "pro" || auth.user.planId === "business");

  // const handleStarItem = (item) => {
  //   if (canUseStar) {
  //     updateItem(item.id, { featured: !item.featured });
  //   } else {
  //     alert("You must upgrade to the pro or business plan to use this feature");
  //   }
  // };

  return (
    <>
      {deepformsError && (
        <div className="mb-4 text-red-600">{deepformsError.message}</div>
      )}

      <div>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-xl">Your Deepforms</span>
          <button
            className="py-2 px-4 bg-gray-200 rounded border-0 hover:bg-gray-300 focus:outline-none"
            onClick={() => setCreatingDeepform(true)}
          >
            Create Deepform
          </button>
        </div>

        {(deepformsStatus === "loading" || deepformsAreEmpty) && (
          <div className="p-8">
            {deepformsStatus === "loading" && <>Loading...</>}

            {deepformsStatus !== "loading" && deepformsAreEmpty && (
              <>Nothing yet. Click the button to add your first Deepform.</>
            )}
          </div>
        )}

        {deepformsStatus !== "loading" && deepforms && deepforms.length > 0 && (
          <>
            {deepforms.map((deepform, index) => (
              <div
                className={
                  "flex p-4 border-b border-gray-200"
                  // "flex p-4 border-b border-gray-200" +
                  // (item.featured ? " bg-gray-100" : "")
                }
                key={index}
              >
                {deepform.name}
                <div className="ml-auto space-x-2">
                  {/* <button
                    className="text-blue-600"
                    onClick={() => handleStarItem(item)}
                  >
                    {item.featured ? "unstar" : "star"}
                  </button>
                  <button
                    className="text-blue-600"
                    onClick={() => setUpdatingItemId(item.id)}
                  >
                    edit
                  </button> */}
                  <button
                    className="text-blue-600"
                    onClick={() => deleteDeepform(deepform.id)}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {creatingDeepform && <EditDeepformModal onDone={() => setCreatingDeepform(false)} />}

      {/* {updatingItemId && (
        <EditItemModal
          id={updatingItemId}
          onDone={() => setUpdatingItemId(null)}
        />
      )} */}
    </>
  );
}

export default DashboardItems;
