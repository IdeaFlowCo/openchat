// Type used for general email template
// TODO: Refactor these types lol they are a mess. There should be one parent type for all email templates, and then each template should have its own type that extends the parent type.
export interface GeneralEmailTemplateProps {
    // Required
    to: string;

    // TODO: Remove the from, it should just always be alan@deepform.ai
    from: string;
    subject: string;
    plainText: string;
    previewText: string;
    p1Content: string;

    // Optional
    userFirstName?: string;
    p2Content?: string;
    p3Content?: string;
    p4Content?: string;
    closingLine?: string;
    ctaLink?: string;
    ctaText?: string;
}

// // Types needed for the API route (req.body)
// export interface EmailData {
//     to: string;
//     from: string;
//     subject: string;
//     plainText: string;
// }

// Type used for sign up email template
export interface SignUpEmailProps {
    portalId: number;
    to: string;
    userFirstName?: string;
}
