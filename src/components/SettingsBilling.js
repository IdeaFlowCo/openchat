import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "util/auth";
import { redirectToBilling } from "util/stripe";
import PageLoader from "./PageLoader";

function SettingsBilling(props) {
    const router = useRouter();
    const auth = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.user.planIsActive) {
            // If user has an active plan then
            // take them to Stripe billing
            redirectToBilling().catch((error) => {
                setLoading(false);
                props.onStatus({
                    type: "error",
                    message: error.message,
                });
            });
        } else {
            // Otherwise go to pricing so they can
            // purchase a plan
            router.replace("/pricing");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {loading && (
                <div className="">
                    <div className="mx-auto h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
        </>
    );
}

export default SettingsBilling;
