import React, { useState } from 'react';
import EditDeepformModal from 'components/old/deepforms/EditDeepformModal';
import { useAuth } from 'util/auth';
import { useRouter } from 'next/router';
// import { updateItem, deleteItem, useItemsByOwner } from "util/db";
import { deleteDeepform, useDeepformsByOwner } from 'util/db';

function DeepformTableElement({ host }) {
  const auth = useAuth();
  const router = useRouter();

  const {
    data: deepforms,
    status: deepformsStatus,
    error: deepformsError,
  } = useDeepformsByOwner(auth.user.uid);

  const [creatingDeepform, setCreatingDeepform] = useState(false);

  const [updatingDeepformId, setUpdatingDeepformId] = useState(null);

  const deepformsAreEmpty = !deepforms || deepforms.length === 0;

  const confirmDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteDeepform(id);
    }
  };
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
        <div className='mb-4 text-red-600'>{deepformsError.message}</div>
      )}

      <div>
        <div className='flex items-center justify-between border-b border-gray-200 p-4'>
          <span className='text-xl'>Your Deepforms</span>
          <button
            className='rounded border-0 bg-gray-200 py-2 px-4 hover:bg-gray-300 focus:outline-none'
            onClick={() => setCreatingDeepform(true)}
          >
            Create Deepform
          </button>
        </div>

        {(deepformsStatus === 'loading' || deepformsAreEmpty) && (
          <div className='p-8'>
            {deepformsStatus === 'loading' && <>Loading...</>}

            {deepformsStatus !== 'loading' && deepformsAreEmpty && (
              <>Nothing yet. Click the button to add your first Deepform.</>
            )}
          </div>
        )}

        {deepformsStatus !== 'loading' && deepforms && deepforms.length > 0 && (
          <>
            {deepforms.map((deepform, index) => (
              <div
                className={
                  'flex border-b border-gray-200 p-4'
                  // "flex p-4 border-b border-gray-200" +
                  // (item.featured ? " bg-gray-100" : "")
                }
                key={index}
              >
                {deepform.name}
                <div className='ml-auto space-x-2'>
                  {/* <button
                    className="text-indigo-600"
                    onClick={() => handleStarItem(item)}
                  >
                    {item.featured ? "unstar" : "star"}
                  </button> */}
                  <button
                    className='text-indigo-600'
                    onClick={() => setUpdatingDeepformId(deepform.id)}
                  >
                    Open
                  </button>
                  <button
                    className='text-indigo-600'
                    onClick={() => confirmDelete(deepform.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {creatingDeepform && (
        <EditDeepformModal onDone={() => setCreatingDeepform(false)} />
      )}

      {updatingDeepformId && (
        <EditDeepformModal
          id={updatingDeepformId}
          onDone={() => setUpdatingDeepformId(null)}
          //TODO: Use global state to avoid prop drilling
          host={host}
        />
      )}
    </>
  );
}

export default DeepformTableElement;
