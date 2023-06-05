import React from "react";

function PageLoader(props) {
    return (
        <div>
            {!props.children && (
                <div className="flex h-screen w-screen items-center justify-center">
                    <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {props.children && <>{props.children}</>}
        </div>
    );
}

export default PageLoader;
