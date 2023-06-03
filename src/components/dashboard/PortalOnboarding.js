import React from "react";
import { useAuth } from "util/auth";

export default function PortalOnboarding() {
    const auth = useAuth();

    const handleCreatePortal = async () => {
        const portal = await createPortal({});
        if (portal.length === 0) {
            alert("Error creating portal");
            return;
        }
        await updateUser(auth.user.uid, { portal_id: portal[0].id });
    };
    return <div>PortalOnboarding</div>;
}
