import React from "react";
import Link from "next/link";

function CTAButtons({ centered = false, demoMode = false }) {
    return (
        <div
            className={
                "mt-10 flex items-center justify-center gap-x-6" +
                (centered ? " justify-center" : "justify-start")
            }
        >
            <Link href="/pricing">
                <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Get started for free
                </button>
            </Link>
            {!demoMode && (
                <Link href="/about">
                    <button className="text-sm font-semibold leading-6 text-gray-900">
                        Contact Us <span aria-hidden="true">→</span>
                    </button>
                </Link>
            )}
        </div>
    );
}

export default CTAButtons;
