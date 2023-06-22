import React from "react";
import Link from "next/link";
function Logo() {
    return (
        <Link href="/">
            <button className="font-satoshi text-3xl font-bold text-gray-900">
                TalkToGPT
            </button>
        </Link>
    );
}

export default Logo;
