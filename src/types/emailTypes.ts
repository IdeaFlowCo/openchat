// Types needed for the React email template
// If you make a change here, update the API route as well (and ofc the initial sending code)
export interface GeneralEmailTemplateProps {
    // Required
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

// Types needed for the API route (req.body)
export interface EmailData extends GeneralEmailTemplateProps {
    to: string;
    from: string;
    subject: string;
    plainText: string;
}
