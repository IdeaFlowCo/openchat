import React, { useState, useEffect } from "react";

function StatusBadge({ portalData, currentStatus }) {
    const [backgroundColor, setBackgroundColor] = useState("bg-gray-500");
    const [textColor, setTextColor] = useState("text-white");
    const [borderColor, setBorderColor] = useState("border-gray-500");

    useEffect(() => {
        if (portalData && currentStatus) {
            const status = portalData.statuses.find(
                (status) => status.name === currentStatus
            );

            setBackgroundColor(status.backgroundColor);
            setTextColor(status.textColor);
            setBorderColor(status.borderColor);
        }
    }, [currentStatus, portalData]);
    if (!currentStatus) return null;
    return (
        <p
            className={
                ` self-end rounded-md border px-2 py-1 text-[11px] text-white` +
                " " +
                backgroundColor +
                " " +
                textColor +
                " " +
                borderColor
            }
        >
            {currentStatus}
        </p>
    );
}

export default StatusBadge;
