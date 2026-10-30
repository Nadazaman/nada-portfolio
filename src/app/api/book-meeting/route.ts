import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, dateTime, agenda } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof dateTime !== "string" ||
      typeof agenda !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !dateTime.trim() ||
      !agenda.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete all fields." },
        { status: 400 },
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const dateParts = dateTime.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );

    if (!dateParts) {
      return NextResponse.json(
        { error: "Please select a valid date and time." },
        { status: 400 },
      );
    }

    const [, year, month, day, hour, minute] = dateParts;

    const selectedDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) - 3,
        Number(minute),
      ),
    );

    if (
      selectedDate.getUTCFullYear() !== Number(year) ||
      selectedDate.getUTCMonth() !== Number(month) - 1 ||
      selectedDate.getUTCDate() !== Number(day) ||
      selectedDate.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "Please select a future date and time." },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!adminEmail || !gmailUser || !gmailPassword) {
      return NextResponse.json(
        { error: "Email service is not configured yet." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const formattedDate = selectedDate.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Riyadh",
    });

    // Send the booking notification to the admin.
    await transporter.sendMail({
      from: `"Portfolio Booking" <${gmailUser}>`,
      to: adminEmail,
      replyTo: email.trim(),
      subject: "New portfolio meeting request",
      text: `Name: ${name.trim()}
Email: ${email.trim()}
Preferred time (Riyadh): ${formattedDate}
Agenda: ${agenda.trim()}`,
    });

    // Send a confirmation to the visitor.
    await transporter.sendMail({
      from: `"Portfolio Booking" <${gmailUser}>`,
      to: email.trim(),
      subject: "Thank you for your meeting request",
      text: `Hi ${name.trim()},

Thank you for requesting a meeting. Your requested time is ${formattedDate} (Riyadh time).

Your meeting invitation or link will follow soon.

Best regards,
Nada`,
    });

    return NextResponse.json({
      message:
        "Booking submitted successfully! Check your email for confirmation.",
    });
  } catch (error) {
    console.error("Booking email error:", error);

    return NextResponse.json(
      {
        error:
          "Could not send your booking emails. Please check the email configuration and try again.",
      },
      { status: 500 },
    );
  }
}
