import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // You can customize this after domain verification
      to: process.env.CONTACT_FORM_EMAIL as string, // The email where you want to receive messages
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Email sent successfully", data });
  } catch (error) {
    return NextResponse.json(
      { error: "Error sending email" },
      { status: 500 }
    );
  }
} 