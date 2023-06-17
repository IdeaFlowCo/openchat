import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr,
} from "@react-email/components";
import * as React from "react";
import { SignUpEmailProps } from "types/emailTypes";

export const SignUpEmail = ({
    portalId,
    userFirstName = "",
}: SignUpEmailProps) => {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Preview>
                    {userFirstName
                        ? `Welcome to Deepform, ${userFirstName}!`
                        : `Welcome to Deepform!`}
                </Preview>
                <Body style={main}>
                    <Container style={container}>
                        {/* <Img
            // src={`${baseUrl}/static/dropbox-logo.png`}
            width="40"
            height="33"
            alt="Dropbox"
          /> */}
                        <Button
                            href="https://deepform.ai"
                            className="font-satoshi text-3xl font-bold text-gray-900"
                        >
                            Deepform
                        </Button>

                        <Section>
                            <Text style={text}>
                                {userFirstName
                                    ? `Hi ${userFirstName},`
                                    : "Hi there,"}
                            </Text>
                            <Text style={text}>
                                Welcome to Deepform! At Deepform, we believe
                                customer feedback is the lifeblood of a company.
                            </Text>
                            <Text style={text}>
                                When your customers have feedback, they want to
                                know that you&apos;re listening. Deepform helps
                                you do that by making it easy to capture,
                                organize, and analyze feedback with AI.
                            </Text>
                            <Text style={text}>
                                To get started, just share your feedback portal
                                link on your app, website, or email. That's it!
                                Find it here:
                            </Text>
                            <Button
                                className="block w-[210px] rounded bg-indigo-600 py-2 px-4 text-center text-sm font-bold text-white no-underline "
                                href={`https://deepform.ai/portal/${portalId}`}
                            >
                                View your portal
                            </Button>
                            {/* <Text style={text}>
                                To keep your account secure, please don&apos;t
                                forward this email to anyone. See our Help
                                Center for{" "}
                                <Link style={anchor} href="https://dropbox.com">
                                    more security tips.
                                </Link>
                            </Text> */}

                            <Text style={text}>Happy building!</Text>
                            <Hr />

                            <Text style={text}>
                                If you have any questions, feel free to reply to
                                this email or{" "}
                                <Link
                                    style={anchor}
                                    href="https://cal.com/aland"
                                >
                                    schedule a call with me anytime.
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
};

const main = {
    backgroundColor: "#f6f9fc",
    padding: "10px 0",
};

const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #f0f0f0",
    padding: "45px",
};

const text = {
    fontSize: "16px",
    fontFamily:
        "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: "300",
    color: "#404040",
    lineHeight: "26px",
};

const button = {
    backgroundColor: "#4f46e5",
    borderRadius: "4px",
    color: "#fff",
    fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "210px",
    padding: "14px 7px",
};

const anchor = {
    textDecoration: "underline",
};
