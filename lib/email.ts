import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@aradre.com";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    text: body,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
