import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const POST = async (request: NextRequest) => {
  try {
    const { name, email, subject, message } = await request.json();

    // First, let's log the incoming data
    console.log("Received form data:", { name, email, subject, message });
    console.log("Using Resend API Key:", process.env.RESEND_API_KEY?.slice(0, 10) + "...");
    console.log("Sending to:", process.env.CONTACT_FORM_EMAIL);

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_FORM_EMAIL as string,
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
};

export { POST }; 