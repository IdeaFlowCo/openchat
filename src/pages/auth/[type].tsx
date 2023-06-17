import React from "react";
import { useRouter } from "next/router";
import Meta from "components/Meta";
// import AuthSection from "components/AuthSection";
import NewAuthSection from "components/NewAuthSection";
import { GetStaticPaths, GetStaticProps } from "next";

export default function AuthPage(props) {
    const router = useRouter();

    return (
        <div className="h-screen bg-white">
            <Meta title="Auth" />
            <NewAuthSection
                type={router.query.type}
                providers={["google", "facebook", "twitter"]}
                afterAuthPath={router.query.next || "/dashboard"}
                redirect={true}
            />
        </div>
    );
}

// Tell Next.js to export static files for each page
// See https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
export const getStaticPaths: GetStaticPaths = () => ({
    paths: [
        { params: { type: "signin" } },
        { params: { type: "signup" } },
        { params: { type: "forgotpass" } },
        { params: { type: "changepass" } },
    ],
    fallback: true,
});

export const getStaticProps: GetStaticProps = ({ params }) => {
    return { props: {} };
};
