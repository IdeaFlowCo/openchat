import React from "react";
import Link from "next/link";
function Logo() {
    return (
        <Link href="/">
            <button className="font-satoshi font-bold text-3xl text-gray-900">
                Deepform
            </button>
        </Link>
    );
}

export default Logo;
