# HB Mailing System

A sophisticated, professional email composition tool powered by an intelligent AI engine.

![HB Mailing System Screenshot](https://i.imgur.com/uF1f6fA.png)

## Overview

**HB Mailing System** is a single-page web application designed to streamline professional email communication. It combines a rich text editor, multi-firm identity management, and a suite of advanced AI-powered tools to help users draft, refine, and send perfectly formatted emails with unparalleled efficiency.

Built as a Progressive Web App (PWA), it can be installed on your desktop or mobile device for a seamless, native-app experience.

## Key Features

- **AI-Powered Composition:** Generate complete, professional emails from a simple prompt.
- **Content Refinement Tools:** Use one-click modifiers to adjust the tone (Formal, Casual), length (Shorten, Expand), or improve manually written text.
- **Integrated Inbox:** View your 10 most recent emails, with robust backend-powered search by sender or subject.
- **AI Smart Reply:** Generate context-aware replies for any email in your inbox.
- **True Threaded Replies:** Ensures your replies are correctly grouped within the original email conversation.
- **Rich Text Editor:** Format your emails with bold, italics, underlines, and ordered/unordered lists.
- **Live Preview:** See a pixel-perfect preview of exactly how your HTML email will look to the recipient before sending.
- **Multi-Firm Management:** Easily switch between different sending identities, each with its own unique signature and details.
- **PWA Ready:** Installable on your desktop or mobile device for fast, offline-capable access.

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Google Apps Script (acting as a secure, serverless intermediary for the Gmail API)
- **AI Engine:** Utilizes a powerful generative language model for all intelligent features.

## Setup & Deployment

To get the application running, you need to set up both the backend script and the frontend application.

### 1. Backend Setup (Google Apps Script)

The backend is responsible for all communication with your Gmail account.

1.  Navigate to [script.google.com](https://script.google.com) and create a new project.
2.  Delete any existing code in the `Code.gs` file and paste in the entire content from `appscript.txt`.
3.  Click **Deploy** > **New deployment**.
4.  For "Select type," choose **Web app**.
5.  Configure the deployment:
    -   **Description:** `HB Mailing System Backend`
    -   **Execute as:** `Me`
    -   **Who has access:** `Anyone` (This does NOT mean anyone can see your emails; it means anyone can trigger the script. Security is handled by it running as *you*).
6.  Click **Deploy**.
7.  Google will ask you to authorize the script's permissions. Click **Authorize access** and follow the prompts to allow it to access your Gmail account.
8.  After authorizing, copy the **Web app URL**. This is your backend endpoint.

### 2. Frontend Setup

1.  Open the `services/emailService.ts` file.
2.  Find the `APP_SCRIPT_URL` constant and paste the Web app URL you copied from the Google Apps Script deployment.
3.  The frontend is a static application. You can host it on any static web hosting service like Netlify, Vercel, or GitHub Pages.

## Author

Developed by **Hemant Borana**.