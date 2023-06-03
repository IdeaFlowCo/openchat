import React, { useState, useEffect } from "react";

function StatusBadge({ portalData, currentStatus }) {
    const [color, setColor] = useState("");
    // const [textColor, setTextColor] = useState("text-white");
    // const [borderColor, setBorderColor] = useState("border-gray-500");
    
    console.log("portalData", portalData);
    useEffect(() => {
        if (portalData && currentStatus) {
            const status = portalData.statuses.find(
                (status) => status.name === currentStatus
            );
            if (status.backgroundColor === "bg-yellow-100") {
                setColor("yellow");
            } else if (status.backgroundColor === "bg-blue-100") {
                setColor("blue");
            } else if (status.backgroundColor === "bg-green-100") {
                setColor("green");
            } else if (status.backgroundColor === "bg-orange-100") {
                setColor("orange");
            } else if (status.backgroundColor === "bg-red-100") {
                setColor("red");
            }
        }
    }, [currentStatus, portalData]);
    if (!currentStatus) return null;
    return (
        <p
            className={
                color === "yellow"
                    ? "self-end rounded-md border border-yellow-500 bg-yellow-100 px-2 py-1 text-[11px] text-yellow-500"
                    : color === "blue"
                    ? "self-end rounded-md border border-blue-500 bg-blue-100 px-2 py-1 text-[11px] text-blue-500"
                    : color === "green"
                    ? "self-end rounded-md border border-green-500 bg-green-100 px-2 py-1 text-[11px] text-green-500"
                    : color === "orange"
                    ? "self-end rounded-md border border-orange-500 bg-orange-100 px-2 py-1 text-[11px] text-orange-500"
                    : color === "red"
                    ? "self-end rounded-md border border-red-500 bg-red-100 px-2 py-1 text-[11px] text-red-500"
                    : "self-end rounded-md border border-gray-500 bg-gray-100 px-2 py-1 text-[11px] text-gray-500"
            }
        >
            {currentStatus}
        </p>
    );
}

export default StatusBadge;
