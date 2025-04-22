import { NextRequest, NextResponse } from "next/server";
import path from "path";
import nodemailer from "nodemailer";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const { receiverEmail, body, subject } = await request.json();

    if (!receiverEmail || !body || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    const userDataPath = path.join(uploadsDir, "userdata.json");

    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Read user data
    let userData;
    try {
      const userDataRaw = await fs.readFile(userDataPath, "utf-8");
      userData = JSON.parse(userDataRaw);
    } catch (error) {
      console.error("Error reading user data:", error);
      return NextResponse.json(
        { error: "Failed to read user data" },
        { status: 500 }
      );
    }

    const { resumeFileName, senderMail, appPassword, fullName } = userData;

    if (!resumeFileName || !senderMail || !appPassword || !fullName) {
      return NextResponse.json(
        { error: "Incomplete user data for email" },
        { status: 400 }
      );
    }

    const resumePath = path.join(uploadsDir, resumeFileName);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderMail,
        pass: appPassword,
      },
    });

    const mailOptions = {
      from: senderMail,
      to: receiverEmail,
      subject: subject,
      text: body,
      html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
      attachments: [
        {
          filename: `${fullName}'s Resume.pdf`,
          path: resumePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
