import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Only use this in development
    },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    const mailOptions = {
        from: `"Esoko" <${process.env.SMTP_USER}>`,
        ...options,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
