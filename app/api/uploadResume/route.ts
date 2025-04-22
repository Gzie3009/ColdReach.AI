import axios from "axios";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import PDFParser from "pdf2json";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }

    // accessing user's data
    const filepath = path.join(uploadDir, "userdata.json");
    let userData;
    if (existsSync(filepath)) {
      const userDataContent = await fs.readFile(filepath, "utf-8");
      userData = JSON.parse(userDataContent);

      const previousFileName = userData.resumeFileName;
      if (previousFileName) {
        const previousFilePath = path.join(uploadDir, previousFileName);
        if (existsSync(previousFilePath)) {
          unlinkSync(previousFilePath);
        }
      }
    }

    // Convert resume to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const filePath = path.join(uploadDir, file.name);

    // Save the uploaded resume file
    await writeFile(filePath, uint8Array);

    // Extract text content from the uploaded PDF
    const resumeContent = await extractResumeContent(filePath);

    // Store the new resume content and file name in userdata.json
    userData.resumeFileName = file.name;
    userData.resumeContent = resumeContent;

    // Write the updated userdata to file
    await writeFile(filepath, JSON.stringify(userData, null, 2));

    return NextResponse.json({
      message: "Resume uploaded and content extracted successfully",
      filePath: filePath,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Error uploading resume" },
      { status: 500 }
    );
  }
}

// Function to extract text content from PDF
const extractResumeContent = (pdfPath: any) => {
  const pdfParser = new PDFParser(this, true);
  return new Promise((resolve, reject) => {
    pdfParser.loadPDF(pdfPath);
    pdfParser.on("pdfParser_dataError", (errData) =>
      reject(errData.parserError)
    );
    pdfParser.on("pdfParser_dataReady", (txtData) => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
  });
};
