// If you ever want to use this, you need to add the RESEND_API_KEY to the .env file and uncomment this ofc.
// import { SignUpEmail } from "components/emails/onboardingJourney/SignUpEmail";
// import { NextApiRequest, NextApiResponse } from "next";
// import { Resend } from "resend";
// import { SignUpEmailProps } from "types/emailTypes";
// const resend = new Resend(process.env.RESEND_API_KEY);
// import { emailBlacklist } from "util/emailBlacklist";

// // Basic API route that sends a general email
// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     const emailData: SignUpEmailProps = req.body;
//     console.log("in api/email/signup.ts");
//     console.log(req.body);
//     if (!emailData.portalId || !emailData.to) {
//         res.status(400).json({
//             error: "Missing required email data",
//         });
//         return;
//     }

//     // Check if the email is in the blacklist
//     if (emailBlacklist.includes(emailData.to)) {
//         res.status(400).json({
//             error: "Email is in the blacklist",
//         });
//         return;
//     }

//     const signUpPlainText = `
//     ${emailData.userFirstName ? `Hi ${emailData.userFirstName},` : "Hi there,"}
//     Welcome to Deepform! At Deepform, we believe customer feedback is the lifeblood of a company.
//     When your customers have feedback, they want to know that you're listening. Deepform helps you do that by making it easy to capture, organize, and analyze feedback with AI.
//     To get started, just share your feedback portal link on your app, website, or email. That's it! Find it here:
//     https://deepform.ai/portal/${emailData.portalId}

//     Happy building!

//     If you have any questions, feel free to reply to this email or schedule a call with me anytime.
//     `;

//     // Send the email
//     try {
//         await resend.emails.send({
//             to: emailData.to,
//             from: "Alan from Deepform <alan@deepform.ai>",
//             subject: emailData.userFirstName
//                 ? `Welcome to Deepform, ${emailData.userFirstName}!`
//                 : `Welcome to Deepform!`,
//             text: signUpPlainText,
//             react: SignUpEmail(emailData),
//         });
//         res.status(200).json({
//             message: "Email sent",
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// }
