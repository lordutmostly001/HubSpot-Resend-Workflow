# 🚀 GTM Automation Workflow — Anakin Assignment

> **End-to-end GTM automation** using HubSpot CRM + Resend API + n8n for contact management, personalized outreach, and automated reply tracking.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [How It Works](#how-it-works)
- [Contacts & Personalization](#contacts--personalization)
- [Resend API](#resend-api)
- [n8n Reply Tracking Workflow](#n8n-reply-tracking-workflow)
- [Webhook Tracking](#webhook-tracking)
- [Limitations & Production Solution](#limitations--production-solution)
- [Environment Variables](#environment-variables)

---

## Overview

This project implements a focused GTM automation workflow for the Anakin assignment:

1. **Create contacts** in HubSpot CRM with role-specific details
2. **Send personalized emails** via the Resend API — each email tailored to the contact's background
3. **Track replies automatically** using an n8n workflow that detects incoming emails, matches them to HubSpot contacts, and logs them as activities on the contact record

---

## Tech Stack

| Tool | Purpose | Account |
|------|---------|---------|
| HubSpot CRM | Contact management & activity logging | Free Trial |
| Resend API | Transactional email sending | Free (`onboarding@resend.dev`) |
| n8n | Workflow automation & reply tracking | Self-hosted (`npx n8n`) |
| webhook.site | Outbound email event monitoring | Free |
| Google Cloud | Gmail OAuth2 for n8n | Free tier |

---

## Project Structure

```
HubSpot-Resend-Workflow/
├── send-emails.js          # Main script to send personalized emails via Resend
├── workflow.json           # n8n workflow export for reply tracking
├── .env                    # API keys (not committed)
├── .env.example            # Environment variable template
├── package.json
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm
- n8n (`npx n8n`)
- HubSpot free account
- Resend free account

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/hubspot-resend-workflow.git
cd hubspot-resend-workflow
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
RESEND_API_KEY=re_your_api_key_here
```

### 3. Send Emails

```bash
node send-emails.js
```

### 4. Start n8n

```bash
npx n8n
```

Open `http://localhost:5678` → Import `workflow.json` → Connect credentials → Activate

---

## How It Works

### Outbound Flow

```
HubSpot Contacts
      ↓
send-emails.js (personalized email per contact)
      ↓
Resend API (onboarding@resend.dev)
      ↓
Contact's Inbox ← replyTo: myselfgopie@gmail.com
      ↓
webhook.site (email.sent events)
```

### Inbound Flow (Reply Tracking)

```
n8n Schedule Trigger (every 1 min)
      ↓
Gmail — Get Unread Emails
      ↓
Extract Sender Email (regex)
      ↓
HubSpot — Search Contact by Email
      ↓
IF Contact Found?
   ├── TRUE → Update Contact (reply_status = Replied)
   │              ↓
   │          Log Reply as INCOMING_EMAIL in HubSpot
   └── FALSE → Stop (ignore non-contact emails)
```

---

## Contacts & Personalization

| Contact | Email | Personalization Angle |
|---------|-------|----------------------|
| Tosh Kothari | kotharitosh@gmail.com | GTM & AI-led growth strategy |
| Viral Patel | viral.patel@anakinai.com | Enterprise sales pipeline & deal intelligence |
| Viral Patel | viral.sensehawk@gmail.com | Informal tone for personal email |

Each email was personalized based on LinkedIn research of the contact's background and current role at Anakin.

---

## Resend API

### Key Configuration

```javascript
await resend.emails.send({
  from: 'Gopiechand <onboarding@resend.dev>',
  to: contact.email,
  subject: contact.subject,
  text: contact.body,
  replyTo: 'myselfgopie@gmail.com' // routes replies back to Gmail
});

// 1 second delay between sends to avoid rate limiting (2 req/sec limit)
await delay(1000);
```

### Rate Limits (Free Plan)
- 2 requests/second
- 100 emails/day
- 3,000 emails/month

---

## n8n Reply Tracking Workflow

### Nodes

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Schedule Trigger | Built-in | Fires every minute |
| 2 | Get Many Messages | Gmail | Fetches unread inbox emails |
| 3 | Extract Sender Email | Set | Parses From field with regex |
| 4 | Search Contact in HubSpot | HubSpot | Finds contact by email |
| 5 | IF Contact Found? | IF | Edge case handler |
| 6 | Update Contact | HTTP Request | Sets reply_status = Replied |
| 7 | Log Reply in HubSpot | HTTP Request | Creates INCOMING_EMAIL engagement |

### Import Workflow

1. Open n8n at `http://localhost:5678`
2. Click `...` → Import from file → select `workflow.json`
3. Connect Gmail OAuth2 credential
4. Connect HubSpot Private App token
5. Click **Activate**

### Required Credentials

**Gmail OAuth2:**
- Create OAuth2 app in [Google Cloud Console](https://console.cloud.google.com)
- Enable Gmail API
- Add redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
- Add your email as a test user in OAuth consent screen

**HubSpot Private App:**
- Go to HubSpot → Settings → Integrations → Private Apps
- Create app with scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.engagements.write`

---

## Webhook Tracking

Resend webhooks are configured to send events to [webhook.site](https://webhook.site) for real-time monitoring:

- `email.sent` — fires when API accepts the send request
- `email.delivered` — fires when email reaches recipient server *(verified domain only)*
- `email.opened` — fires when recipient opens email *(verified domain only)*

---

## Limitations & Production Solution

### Current Limitation

With `onboarding@resend.dev` (free domain), replies from contacts go to Resend's servers — not to Gmail. This means n8n cannot detect replies in the current setup.

**Partial mitigation applied:** `replyTo: myselfgopie@gmail.com` added to all outbound emails. Most email clients will route replies to Gmail, enabling n8n to detect them.

### Production Solution

When Anakin provides access to their Resend account with a verified domain, only **2 lines change** in `send-emails.js`:

```javascript
// Current (free tier)
from: 'Gopiechand <onboarding@resend.dev>',
email: 'myselfgopie@gmail.com', // test recipient

// Production (Anakin domain)
from: 'Gopiechand <gopiechand@anakin.company>',
email: contact.realEmail, // actual contact email
```

The n8n workflow requires **zero changes** — it is already built to handle real contact emails end to end.

### Recommended Production Improvements

| Area | Current | Recommended |
|------|---------|-------------|
| Gmail polling | Every 1 min (polling) | Gmail Push via Google Pub/Sub (real-time) |
| Duplicate handling | None | Check if reply already logged |
| Error handling | Workflow stops | Slack/email alert on failure |
| Contact matching | Email only | Fuzzy match by name + domain |

---

## Environment Variables

```env
# .env.example
RESEND_API_KEY=re_your_resend_api_key_here
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## Author

**Gopiechand S S**
GTM Automation Engineer Application — Anakin (YC S21)
