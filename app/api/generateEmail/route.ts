import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { promises as fs } from "fs";
import path from "path";

const generatePrompt = (
  jobPost: string,
  instructions: string,
  template: string,
  recieverMail: string,
  userData: any,
  resumeData: string
) => {
  const {
    resumeContent,
    geminiKey,
    senderMail,
    appPassword,
    resumeFileName,
    ...sanitizedUserData
  } = userData;
  const prompt = `
      # PROFESSIONAL JOB APPLICATION EMAIL GENERATOR

      You are an expert AI copywriter specializing in creating highly effective job application emails. Your goal is to craft a personalized, compelling email that will maximize the applicant's chances of getting an interview.

      ## TASK
      Generate a professional job application email based on the provided resume, job posting, and template style.

      ## EMAIL COMPONENTS TO GENERATE
      Return ONLY a valid JSON object with the following structure:
      {
        "subject": "A compelling, concise subject line that grabs attention",
        "body": "The complete email body (not including the signature)",
        "signature": "Professional signature with name and contact info",
        "receiverEmail": "The recipient's email address extracted from job post or provided input"
      }

      ## TEMPLATE STYLE: ${template.toUpperCase()}
      ${
        template === "standard"
          ? "Create a professional, straightforward email focusing on relevant qualifications. Use formal language, clear structure, and highlight 2-3 key qualifications that match job requirements."
          : template === "creative"
          ? "Create an engaging, memorable email with personality. Use a compelling hook, conversational yet professional tone, and distinctive approach while still highlighting relevant qualifications."
          : template === "technical"
          ? "Create a detail-oriented email emphasizing technical expertise. Reference specific technical skills, metrics, and relevant accomplishments with precise language and clear demonstration of technical knowledge."
          : template === "executive"
          ? "Create a sophisticated email highlighting leadership and strategic value. Emphasize high-level achievements, business impact, and leadership qualities with confident, executive-level language."
          : "Create a professional, straightforward email focusing on relevant qualifications."
      }

      ## INPUT DATA
      1. JOB POST:
      ${jobPost}

      2. RESUME CONTENT:
      ${resumeData}

      3. APPLICANT DETAILS:
      ${JSON.stringify(sanitizedUserData)}

      4. SPECIAL INSTRUCTIONS:
      ${instructions || "No special instructions provided."}

      5. RECEIVER EMAIL:
      ${
        recieverMail
          ? recieverMail
          : "Not provided - extract from job post if available"
      }

      ## REQUIREMENTS AND GUIDELINES

      ### EMAIL STRUCTURE
      - SUBJECT LINE: Brief, specific, and attention-grabbing (5-10 words)
      - GREETING: Personalized with recipient's name if available
      - OPENING: Strong first paragraph stating interest in specific position and brief introduction
      - BODY: 1-2 concise paragraphs highlighting ONLY the relevant experience/skills from resume that match job requirements
      - CALL TO ACTION: Clear request for interview or conversation
      - SIGNATURE: Include full name and contact information , emails , github or other social links. Also if there are any links related to the job post (for example leetcode link for technical jobs) then add it.

      ### CRITICAL RULES
      1. RECEIVER EMAIL: If email is not provided in input #5, extract it from the job post. If none found, use "none@found.com"
      2. PERSONALIZATION: Reference specific company details, job requirements, or projects mentioned in job post
      3. RELEVANCE: Focus only on experience and skills directly relevant to this specific job
      4. BREVITY: Keep email under 250 words total
      5. ACCURACY: Only include qualifications that are actually in the resume
      6. FORMAT: Return only valid JSON with clean formatting - no markdown, no backticks

      ### SPECIAL FORMATTING
      - Body text should use appropriate paragraph breaks for readability
      - Do not include the subject line within the body text
      - Ensure signature is formatted professionally with name and contact information

      Generate the email JSON now.
`;
  return prompt;
};

export async function POST(request: NextRequest) {
  console.log("Request received");
  try {
    // Parse request body
    const body = await request.json();
    const { jobPost, instructions, template, recieverMail } = body;

    // Validate required fields
    if (!jobPost) {
      return NextResponse.json(
        { success: false, message: "Job post is required" },
        { status: 400 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template is required" },
        { status: 400 }
      );
    }

    // Set up file paths
    const uploadsDir = path.join(process.cwd(), "uploads");
    const userDataPath = path.join(uploadsDir, "userdata.json");

    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      return NextResponse.json(
        { success: false, message: "User profile not configured" },
        { status: 404 }
      );
    }

    // Check if user data exists
    let userData;
    try {
      await fs.access(userDataPath);
      const userDataContent = await fs.readFile(userDataPath, "utf-8");
      userData = JSON.parse(userDataContent);
    } catch (error) {
      console.error("Error reading user data:", error);
      return NextResponse.json(
        { success: false, message: "User profile not found or invalid" },
        { status: 404 }
      );
    }

    // Validate API key
    if (!userData.geminiKey) {
      return NextResponse.json(
        { success: false, message: "Gemini API key not configured" },
        { status: 400 }
      );
    }

    // Ensure resume content is available
    if (!userData.resumeContent) {
      return NextResponse.json(
        { success: false, message: "Resume content not available" },
        { status: 400 }
      );
    }

    const resumeContent = userData.resumeContent;

    // Set up Gemini client
    let gemini;
    try {
      gemini = new GoogleGenerativeAI(userData.geminiKey);
    } catch (error) {
      console.error("Error initializing Gemini client:", error);
      return NextResponse.json(
        { success: false, message: "Invalid Gemini API key" },
        { status: 400 }
      );
    }

    // Generate email
    try {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
      });

      const prompt = generatePrompt(
        jobPost,
        instructions,
        template,
        recieverMail,
        userData,
        resumeContent
      );

      const result = await model.generateContent(prompt);
      const response = result.response;
      const rawText = response.text().trim();

      const cleanJsonResponse = (rawText: string) => {
        // Remove the markdown syntax (```) and extra spaces
        const cleanedText = rawText.replace(/```json|```/g, "").trim();
        return cleanedText;
      };

      // Then, use the cleanJsonResponse function before parsing
      try {
        const cleanedRawText = cleanJsonResponse(rawText);
        const parsedEmail = JSON.parse(cleanedRawText);

        // Validate required fields in response
        if (!parsedEmail.subject || !parsedEmail.body) {
          throw new Error("Generated email is missing required fields");
        }

        // If receiver email was provided, use it; otherwise use what the model found
        if (recieverMail && recieverMail.trim() !== "") {
          parsedEmail.receiverEmail = recieverMail;
        } else if (
          !parsedEmail.receiverEmail ||
          parsedEmail.receiverEmail === "Not specified"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "No receiver email found in job post. Please provide a receiver email.",
            },
            { status: 400 }
          );
        }

        // Return successful response
        return NextResponse.json({
          success: true,
          email: parsedEmail,
        });
      } catch (error) {
        console.error("Error parsing AI response:", error, rawText);
        return NextResponse.json(
          { success: false, message: "Failed to parse generated email" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error generating email with Gemini:", error);
      return NextResponse.json(
        { success: false, message: "Error generating email with AI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
