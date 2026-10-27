# Support7Care Employment Information & Acknowledgement Form

A compact, responsive React form based on the supplied Key Information Document, Working Time Opt-Out Agreement, and the written content of the Support 7 Care Agency Worker Handbook.

## What is included
- Green Support7Care branding and a logo cropped from the supplied handbook cover.
- Blank form fields (no pre-filled applicant details).
- Key employment information from the Key Information Document.
- A voluntary 48-hour working-time opt-out choice, employee name, electronic signature, and date.
- Handbook acknowledgements and the complete extracted written handbook in a collapsed, expandable reader so the form itself stays compact.
- Handbook images, contents pages, and blank/handwritten notes sections are not included in the online handbook reader.
- Express backend integrated with Resend. On a successful submission it sends one email to the configured admin/recruitment address and a confirmation email to the applicant.
- The API reports if the admin email succeeds but the applicant confirmation fails; it does not claim both succeeded in that case.

## Local setup
1. Install a current LTS version of Node.js.
2. Extract the ZIP and open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `server/.env` and add your real Resend API key.
5. Terminal 1: run `npm run server`.
6. Terminal 2: run `npm run dev`.
7. Open the Vite local URL, usually `http://localhost:5173`.

## Deploy the backend to Render
Create a **Web Service** from this project/repository. Use:
- Build command: `npm install`
- Start command: `npm run server`

Add these Render Environment variables:
- `RESEND_API_KEY` = your existing Resend API key (keep it secret)
- `FROM_EMAIL` = `Support7Care Applications <applications@support7care.co.uk>`
- `RECRUITMENT_EMAIL` = `leviemmanuel25@gmail.com`
- `FRONTEND_ORIGIN` = `https://support7care.vercel.app`
- `NODE_ENV` = `production`

Render supplies `PORT` automatically. Do not put the Resend API key in a `VITE_` variable or the browser.

After deployment, open `https://YOUR-RENDER-BACKEND.onrender.com/api/health`. It should return `{"ok":true}`.

## Deploy the frontend to Vercel
1. Import the project into Vercel.
2. Set the Vercel environment variable `VITE_API_BASE_URL` to the full Render backend URL, for example `https://YOUR-RENDER-BACKEND.onrender.com` (no trailing slash).
3. Deploy/redeploy the Vercel project.

The backend CORS allow-list must include the exact deployed frontend origin, `https://support7care.vercel.app`. If the Vercel URL changes, update `FRONTEND_ORIGIN` on Render and redeploy/restart.

## Resend notes
- The sender uses the verified domain `support7care.co.uk`.
- The admin email receives the submitted fields.
- The applicant receives a submission confirmation and a copy of the entered details.
- Email delivery is subject to Resend's API result and recipient mail provider.
- The full applicant data includes personal information. Only collect and send it through an employer-approved, access-controlled deployment, and confirm the organisation's retention/privacy requirements before production use.

## Important review note
The opt-out agreement is voluntary in the supplied source. The employer should review the wording and form fields before production use. This form is a technical conversion of the supplied documents and is not legal advice.
