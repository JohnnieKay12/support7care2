import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

// Load environment variables from server/.env
dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || 'server/.env',
});

console.log('EMAIL CONFIGURATION CHECK:', {
  apiKeyLoaded: Boolean(process.env.RESEND_API_KEY),
  fromEmailLoaded: Boolean(process.env.FROM_EMAIL),
  recruitmentEmailLoaded: Boolean(process.env.RECRUITMENT_EMAIL),
});

const app = express();
const port = Number(process.env.PORT) || 4000;

// Initialise Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Allowed frontend origins
const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('CORS blocked origin:', origin);

      return callback(new Error('Origin not allowed by CORS'));
    },
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: '100kb' }));

const recruitmentEmails = (process.env.RECRUITMENT_EMAIL || '')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean);

// Fields accepted from the frontend
const allowedKeys = new Set([
  'fullName',
  'emailAddress',
  'phoneNumber',
  'homeAddress',
  'postcode',
  'position',
  'formDate',
  'employmentBusiness',
  'contractType',
  'payingBusiness',
  'payFrequency',
  'keyInfoAcknowledged',
  'policyCompliance',
  'safeguarding',
  'confidentiality',
  'professionalConduct',
  'healthSafetyTraining',
  'payrollProcedures',
  'otherPolicies',
  'questions',
  'workingTimeOptOutChoice',
  'workingTimeEmployeeName',
  'workingTimeSignature',
  'workingTimeDate',
  'signatureName',
  'signatureDate',
  'declarationAccepted',
]);

// Human-readable field names
const labels = {
  fullName: 'Full name',
  emailAddress: 'Email address',
  phoneNumber: 'Phone number',
  homeAddress: 'Home address',
  postcode: 'Postcode',
  position: 'Position / role',
  formDate: 'Form date',
  employmentBusiness: 'Employment business',
  contractType: 'Contract type',
  payingBusiness: 'Paying business',
  payFrequency: 'Pay frequency',
  keyInfoAcknowledged: 'Key information acknowledgement',
  policyCompliance: 'Policy compliance',
  safeguarding: 'Safeguarding',
  confidentiality: 'Confidentiality and data protection',
  professionalConduct: 'Professional conduct',
  healthSafetyTraining: 'Health, safety and training',
  payrollProcedures: 'Payroll procedures',
  otherPolicies: 'Other policies acknowledgement',
  questions: 'Questions for the agency',
  workingTimeOptOutChoice: 'Working-time opt-out decision',
  workingTimeEmployeeName:
    'Employee name for working-time agreement',
  workingTimeSignature: 'Working-time agreement signature',
  workingTimeDate: 'Working-time agreement date',
  signatureName: 'Electronic signature',
  signatureDate: 'Date signed',
  declarationAccepted: 'Declaration confirmation',
};

// Escape user-provided content before inserting it into HTML
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

// Convert submitted form fields into email table rows
function createRows(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      const displayValue = Array.isArray(value)
        ? value.join(', ')
        : value || '—';

      return `
        <tr>
          <th
            style="
              text-align: left;
              vertical-align: top;
              padding: 8px;
              border: 1px solid #ddd;
              background: #e5f2e9;
              width: 38%;
            "
          >
            ${esc(labels[key] || key)}
          </th>

          <td
            style="
              padding: 8px;
              border: 1px solid #ddd;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
            "
          >
            ${esc(displayValue)}
          </td>
        </tr>
      `;
    })
    .join('');
}

// Common email styling
function emailLayout(content) {
  return `
    <div
      style="
        font-family: Arial, sans-serif;
        color: #243247;
        line-height: 1.6;
        max-width: 850px;
        margin: 0 auto;
      "
    >
      ${content}
    </div>
  `;
}

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Support7Care API is running.',
  });
});

// Submit employment acknowledgement form
app.post('/api/acknowledgements', async (req, res) => {
  try {
    // Check required environment variables
    if (
      !process.env.RESEND_API_KEY ||
      !process.env.FROM_EMAIL ||
      recruitmentEmails.length === 0
    ) {
      console.error('Missing email configuration in environment.');

      return res.status(503).json({
        message:
          'Email is not configured yet. Please contact the site administrator.',
      });
    }

    // Validate request body
    const input = req.body;

    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input)
    ) {
      return res.status(400).json({
        message: 'Invalid form data.',
      });
    }

    // Accept only approved fields and limit their size
    const data = {};

    for (const [key, value] of Object.entries(input)) {
      if (!allowedKeys.has(key)) {
        continue;
      }

      if (Array.isArray(value)) {
        data[key] = value
          .slice(0, 30)
          .map((item) => String(item ?? '').slice(0, 3000));
      } else if (
        value !== null &&
        typeof value === 'object'
      ) {
        return res.status(400).json({
          message: 'Invalid value submitted in the form.',
        });
      } else {
        data[key] = String(value ?? '').slice(0, 3000);
      }
    }

    // Required fields
    const requiredFields = [
      'fullName',
      'emailAddress',
      'position',
      'workingTimeOptOutChoice',
      'workingTimeEmployeeName',
      'workingTimeSignature',
      'workingTimeDate',
      'signatureName',
      'signatureDate',
    ];

    for (const field of requiredFields) {
      if (!String(data[field] || '').trim()) {
        return res.status(400).json({
          message: 'Please complete all required fields.',
        });
      }
    }

    // Validate email address
    const email = String(data.emailAddress).trim();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({
        message: 'Please enter a valid email address.',
      });
    }

    // Keep email addresses clean
    data.emailAddress = email;

    // Create HTML table
    const rows = createRows(data);

    const subject =
      `Support7Care employment information form — ${data.fullName}`;

    // Email to Support7Care recruitment
    const adminHtml = emailLayout(`
      <h2 style="color: #185536;">
        Support7Care Limited
      </h2>

      <p>
        An Employment Information, Acknowledgement &amp;
        Working Time Agreement form has been submitted.
      </p>

      <table
        style="
          border-collapse: collapse;
          width: 100%;
          font-size: 14px;
        "
      >
        ${rows}
      </table>

      <p style="font-size: 12px; color: #667085;">
        This message contains personal information.
        Handle it under the organisation's approved
        data-protection and retention procedures.
      </p>
    `);

    const adminResult = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: recruitmentEmails,
      replyTo: data.emailAddress,
      subject,
      html: adminHtml,
    });

    if (adminResult.error) {
      console.error(
        'Admin email failed:',
        adminResult.error.message
      );

      return res.status(502).json({
        message:
          'The form could not be emailed to Support7Care. Please try again later.',
      });
    }

    // Confirmation email to the applicant
    const applicantHtml = emailLayout(`
      <h2 style="color: #185536;">
        Thank you, ${esc(data.fullName)}
      </h2>

      <p>
        Support7Care Limited has received your
        Employment Information, Acknowledgement &amp;
        Working Time Agreement form.
      </p>

      <p>
        This email confirms receipt of your submission.
        It does not replace your contract or the full
        agency worker handbook.
      </p>

      <h3>Your submitted details</h3>

      <table
        style="
          border-collapse: collapse;
          width: 100%;
          font-size: 14px;
        "
      >
        ${rows}
      </table>

      <p>
        For questions, please contact Support7Care
        through its usual official contact channels.
      </p>
    `);

    const applicantResult = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [data.emailAddress],
      replyTo: recruitmentEmails[0],
      subject:
        'Confirmation of your Support7Care form submission',
      html: applicantHtml,
    });

    if (applicantResult.error) {
      console.error(
        'Applicant confirmation failed:',
        applicantResult.error.message
      );

      return res.status(200).json({
        message:
          'Your form was sent to Support7Care, but we could not send the confirmation email to you. Please contact the agency if needed.',
      });
    }

    // Both emails were accepted by Resend
    return res.status(200).json({
      message:
        'Your form was sent to Support7Care and a confirmation email has been sent to you.',
    });
  } catch (error) {
    console.error(
      'Submission error:',
      error?.message || error
    );

    return res.status(500).json({
      message:
        'Something went wrong while submitting. Please try again later.',
    });
  }
});

// Handle invalid JSON and other Express errors
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      message: 'Invalid JSON submitted.',
    });
  }

  if (error.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      message:
        'This website is not permitted to access the API.',
    });
  }

  console.error('Server error:', error.message || error);

  return res.status(500).json({
    message: 'An unexpected server error occurred.',
  });
});

// Start the server
app.listen(port, () => {
  console.log(
    `Support7Care acknowledgement API running on port ${port}`
  );
});
