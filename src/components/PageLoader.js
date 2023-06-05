import React from "react";

function PageLoader(props) {
  return (
    <div>
      {!props.children && <div className="p-10 text-center h-screen w-screen flex justify-center items-center">Loading...</div>}

      {props.children && <>{props.children}</>}
    </div>
  );
}

export default PageLoader;
