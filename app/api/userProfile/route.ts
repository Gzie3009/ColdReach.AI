export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface ProfileLink {
  id: string;
  platform: string;
  url: string;
}

export interface UserProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  profileLinks?: ProfileLink[];
  preferences?: string;
  skills?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  senderMail?: string;
  appPassword?: string;
  geminiKey?: string;
  resumeFileName?: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filepath = path.join(uploadsDir, "userdata.json");
    try {
      await fs.access(uploadsDir);
    } catch {
      console.error("No file found");
      return NextResponse.json(
        { success: false, message: "Error fetching profile" },
        { status: 404 }
      );
    }
    let userData = await fs.readFile(filepath, "utf-8");
    userData = JSON.parse(userData);
    return NextResponse.json(
      { success: true, data: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching profile" },
      { status: 404 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, "userdata.json");

    // Ensure uploads dir exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Load existing user profile object (not an array)
    let existingProfile: UserProfile = {};
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingProfile = JSON.parse(fileContent);
    } catch {
      // No file yet, start with empty object
    }

    // Merge new data into existing, preserving other fields
    const isNew = Object.keys(existingProfile).length === 0;

    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...data,
    };

    // Write updated profile back to the file
    await fs.writeFile(
      filePath,
      JSON.stringify(updatedProfile, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
      message: isNew
        ? "Profile created successfully"
        : "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save profile" },
      { status: 500 }
    );
  }
}
