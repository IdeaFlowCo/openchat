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
import { GeneralEmailTemplateProps } from "types/emailTypes";

export const GeneralEmailTemplate = ({
    previewText,
    p1Content,
    userFirstName = "",
    p2Content = "",
    p3Content = "",
    p4Content = "",
    closingLine = "",
    ctaLink = "",
    ctaText = "",
}: GeneralEmailTemplateProps) => {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Preview>{previewText}</Preview>
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
                            <Text style={text}>{p1Content}</Text>
                            {ctaLink && ctaText && (
                                <Button
                                    className="block w-[210px] rounded bg-indigo-600 py-2 px-4 text-center text-sm font-bold text-white no-underline "
                                    href={ctaLink}
                                >
                                    {ctaText}
                                </Button>
                            )}
                            {p2Content && <Text style={text}>{p2Content}</Text>}
                            {p3Content && <Text style={text}>{p3Content}</Text>}
                            {p4Content && <Text style={text}>{p4Content}</Text>}
                            {/* <Text style={text}>
                                To keep your account secure, please don&apos;t
                                forward this email to anyone. See our Help
                                Center for{" "}
                                <Link style={anchor} href="https://dropbox.com">
                                    more security tips.
                                </Link>
                            </Text> */}
                            {closingLine ? (
                                <Text style={text}>{closingLine}</Text>
                            ) : (
                                <Text style={text}>Happy building!</Text>
                            )}
                            <Hr />

                            <Text style={text}>
                                If you have any questions, feel free to reply to 
                                this email.
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
