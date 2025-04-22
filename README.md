# 📬 ColdReach.AI

ColdReach.AI is an AI-powered job application automation platform that helps users send personalized cold emails with ease. Upload your resume, extract its content, generate tailored email content using AI, and optionally send it directly to recruiters — all from one place.

---

## ✨ Features

- 📄 **Resume Upload**: Upload a PDF resume and extract text using AI (via `pdf2json`)

- 🤖 **Smart Email Generation**: Paste job posts and get personalized, professional email drafts

- 📤 **Auto-send Emails**: Send emails directly via Gmail using your app password

- 🛠️ **Edit Before Sending**: Customize the generated subject, body, or recipient email

- 💾 **Configuration Save**: Store your sender email, app password, and Gemini API key securely

- 🔄 **Autosave**: Resume and configuration are preserved locally

- 🧪 **PDF Parsing**: Extracted text is used to improve the AI's understanding of your experience

---

## 🧱 Tech Stack

- **Frontend**: React, TailwindCSS, ShadCN UI, Clerk Auth

- **Backend**: Node.js, Next.js (App Router)

- **AI**: Gemini API (for email generation)

- **Email Service**: Nodemailer (Gmail)

- **PDF Parsing**: pdf2json

- **File Storage**: Server-side `uploads` directory

---

## 📂 Project Structure

```bash

├──  app

│  └──  api

│  └──  uploadResume  # API for resume upload and extraction

│  └──  sendEmail  # API to send email with resume attached

├──  components  # Reusable UI components (Buttons, Inputs, etc.)

├──  lib  # Utility functions (e.g., resume parsing, email sending)

├──  public

├──  uploads  # Stores uploaded PDF and user config

├──  README.md

```

---

## 🧪 Running Locally

```bash

git  clone  https://github.com/Gzie3009/ColdReach.AI

cd  ColdReach.AI

npm  install

npm  run  dev

```

- Visit `http://localhost:3000` to get started.

---

## 📬 Usage Workflow

1. Upload your **PDF resume**

2. Paste a **job description**

3. Generate your **email using AI**

4. Optionally **edit and preview** it

5. Click **Send** or let Auto-send handle it!

---

## 🛡️ Security

- Resume files are stored temporarily server-side under `uploads/`

- Your app password is only used to send emails via Gmail securely

- Ensure you use environment variables for sensitive configs

---

## 💡 Future Enhancements

- 🔍 AI-based resume parsing & keyword analysis

- 📊 Analytics for sent emails and responses

- 🧠 Email improvement suggestions based on job role

- ☁️ Resume cloud storage (e.g., S3)

---

## 🤝 Contributing

Feel free to fork this repo and raise a PR for improvements or new features.
