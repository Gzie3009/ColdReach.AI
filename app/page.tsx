"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Upload, Loader2, Edit2, Check, X, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { UserDataDialogBox } from "@/components/UserDataDialogBox";
import { UserProfile } from "./api/userProfile/route";

const emailTemplates = {
  standard: "standard",
  creative: "creative",
  technical: "technical",
  executive: "executive",
};

export default function Home() {
  const [senderMail, setSenderMail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [jobPost, setJobPost] = useState("");
  const [autoSend, setAutoSend] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [resume, setResume] = useState(null);
  const [template, setTemplate] = useState(emailTemplates.standard);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [userData, setUserData] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [recieverMail, setRecieverMail] = useState("");
  const [emailData, setEmailData] = useState<any>(null);

  const handleResumeUpload = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.type === "application/pdf") {
        setResume(file);

        const formData = new FormData();
        formData.append("resume", file);

        try {
          const res = await axios.post("/api/uploadResume", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (res.data.filePath) {
            setResumeFileName(res.data.fileName);
          }

          toast.success("Resume uploaded", {
            description: "Your resume has been successfully uploaded.",
          });
        } catch (error) {
          setResume(null);
          console.error("Upload failed:", error);
          toast.error("Upload failed", {
            description: "Something went wrong while uploading.",
          });
        }
      } else {
        toast.error("Invalid file type", {
          description: "Please upload a PDF file.",
        });
      }
    }
  };

  const handleGenerateEmail = async () => {
    if (!jobPost) {
      toast.error("Missing job post", {
        description: "Please paste the job post content first.",
      });
      return;
    }

    try {
      setIsLoading(true);
      setGeneratedEmail(null);

      const body = {
        jobPost,
        instructions,
        template,
        recieverMail,
      };
      const { data } = await axios.post("/api/generateEmail", body);

      if (data && data.email) {
        setEmailData(data.email);
        setGeneratedEmail(data.email.body);

        // If auto-send is enabled, send the email right away
        if (autoSend) {
          handleSendEmail();
        }

        toast.success("Email generated", {
          description: "Your personalized email has been generated.",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Error", {
        description: "Failed to generate email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (
      !emailData ||
      !emailData.body.trim() ||
      !emailData.receiverEmail.trim() ||
      !emailData.subject.trim()
    ) {
      toast.error("Missing email data", {
        description:
          "Please generate an email first or check if the receiver email is valid.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/sendEmail", emailData);

      if (response.data.success) {
        toast.success("Success", {
          description:
            "Your email has been sent successfully. Check Inbox to know more.",
        });
        setGeneratedEmail(null);
        setJobPost("");
        setInstructions("");
        setRecieverMail("");
        setTemplate(emailTemplates.standard);
      } else {
        throw new Error(response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Error", {
        description:
          "Failed to send email. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!senderMail || !appPassword || !resumeFileName || !geminiKey) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const profileData = {
        senderMail,
        appPassword,
        geminiKey,
        resumeFileName,
      };
      const res = await axios.post("/api/userProfile", profileData);

      if (res.data.success) {
        setIsConfigured(true);
        setIsEditing(false);

        toast.success("Configuration saved", {
          description: "Your email settings have been saved.",
        });
      } else {
        throw new Error(res.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Save config error:", error);
      toast.error("Error saving configuration", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const getProfileData = async () => {
    try {
      const res = await axios.get("/api/userProfile");
      if (res.data && res.data.data) {
        const { data } = res.data;
        setUserData(data);
        setSenderMail(data.senderMail || "");
        setAppPassword(data.appPassword || "");
        setGeminiKey(data.geminiKey || "");
        setResumeFileName(data.resumeFileName || "");
        setIsConfigured(true);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setIsConfigured(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  useEffect(() => {
    if (generatedEmail) {
      requestAnimationFrame(() => {
        document.getElementById("EmailPreview")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [generatedEmail]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">ColdReach.AI</h1>
            <p className="text-muted-foreground">
              Generate and send personalized job application emails.
              <br />
              Created By :{" "}
              <a
                href="https://mrinmoy.space/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline italic"
              >
                Mrinmoy Saikia
              </a>
            </p>
          </div>
          <UserDataDialogBox data={userData} />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6 space-y-4 h-max">
            <h2 className="text-2xl font-semibold">Job Details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobPost">Job Post Content</Label>
                <Textarea
                  id="jobPost"
                  placeholder="Paste the job post content here..."
                  value={jobPost}
                  onChange={(e) => setJobPost(e.target.value)}
                  className="h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Write instructions for generating the email if NEEDED..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="h-[50px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Receiver's Email Address (if not present in Job Post)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="receiver@email.com"
                  value={recieverMail}
                  onChange={(e) => setRecieverMail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={emailTemplates.standard}>
                      Standard
                    </SelectItem>
                    <SelectItem value={emailTemplates.creative}>
                      Creative
                    </SelectItem>
                    <SelectItem value={emailTemplates.technical}>
                      Technical
                    </SelectItem>
                    <SelectItem value={emailTemplates.executive}>
                      Executive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="autoSend">Auto-send</Label>
                  <Switch
                    id="autoSend"
                    checked={autoSend}
                    onCheckedChange={setAutoSend}
                  />
                </div>
                <p className="text-xs text-red-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  This will automatically send the mail without previewing
                </p>
              </div>
              <Button
                onClick={handleGenerateEmail}
                className="w-full"
                disabled={isLoading || !isConfigured}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Generate Email
              </Button>
              {!isConfigured && (
                <p className="text-sm text-red-500">
                  Please configure your settings first
                </p>
              )}
            </div>
          </Card>
          <Card className="p-6 space-y-4 h-max">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Configuration</h2>
              {isConfigured && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {isConfigured && isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveConfiguration}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">{senderMail}</p>
                ) : (
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={senderMail}
                    onChange={(e) => setSenderMail(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="appPassword">App Password</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">••••••••</p>
                ) : (
                  <Input
                    id="appPassword"
                    type="password"
                    placeholder="Your app password"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="geminiKey">Gemini API Key</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">••••••••</p>
                ) : (
                  <Input
                    id="geminiKey"
                    type="password"
                    placeholder="Your Gemini API Key"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF)</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">
                    {resumeFileName || "No resume uploaded"}
                  </p>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("resume")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {resumeFileName ? resumeFileName : "Upload Resume"}
                    </Button>
                  </div>
                )}
              </div>

              {!isConfigured && (
                <Button onClick={handleSaveConfiguration} className="w-full">
                  Save Configuration
                </Button>
              )}
            </div>
          </Card>
        </div>
        <section id="EmailPreview" className="scroll-mt-16">
          {generatedEmail && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Generated Email</h2>
              </div>

              {emailData && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Subject</Label>
                    <Input
                      value={emailData.subject}
                      onChange={(e) =>
                        setEmailData({ ...emailData, subject: e.target.value })
                      }
                      className="text-sm p-2 bg-gray-50 rounded-md"
                    ></Input>
                  </div>

                  <div className="space-y-1">
                    <Label>Receiver</Label>
                    <Input
                      value={emailData.receiverEmail}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          receiverEmail: e.target.value,
                        })
                      }
                      className="text-sm p-2 bg-gray-50 rounded-md"
                    ></Input>
                  </div>
                </div>
              )}

              <Textarea
                value={emailData.body}
                onChange={(e) =>
                  setEmailData({
                    ...emailData,
                    body: e.target.value,
                  })
                }
                className="h-[300px]"
                placeholder="Generated email will appear here..."
              />

              <Button
                onClick={() => handleSendEmail()}
                className="w-full"
                size="lg"
                disabled={
                  isLoading ||
                  !emailData ||
                  !emailData.receiverEmail ||
                  !emailData.subject ||
                  !emailData.body
                }
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Email
              </Button>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
