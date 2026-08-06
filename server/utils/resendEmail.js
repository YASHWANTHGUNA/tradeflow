import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "TradeFlow <noreply@tradeflowapp.me>";

// Helper function to handle cold-start DNS/network glitches with exponential backoff retry
async function sendWithRetry(emailOptions, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await resend.emails.send(emailOptions);
    } catch (error) {
      console.warn(`[Resend Warning] Attempt ${attempt} failed:`, error?.error?.message || error.message);
      if (attempt === retries) {
        console.error("[Resend Error] All retry attempts failed.");
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

// ---- Registration OTP ----
export async function sendRegistrationOtp(toEmail, otp) {
  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;font-family:Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#2563eb;padding:20px 32px;">
          <span style="color:#fff;font-size:20px;font-weight:800;">TradeFlow</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#0f172a;">Verify your email</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">
            Use the code below to finish creating your TradeFlow account. It expires in 10 minutes.
          </p>
          <div style="margin:24px 0;text-align:center;">
            <span style="display:inline-block;background:#f1f5f9;border-radius:10px;padding:16px 32px;font-size:32px;font-weight:800;letter-spacing:8px;color:#1e293b;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:12px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

  return sendWithRetry({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `${otp} is your TradeFlow verification code`,
    html,
  });
}

// ---- Login security alert with signed Yes/No action links ----
export async function sendLoginAlert(toEmail, { name, timestamp, ip, confirmUrl, revokeUrl }) {
  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;font-family:Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#0f172a;padding:20px 32px;">
          <span style="color:#fff;font-size:20px;font-weight:800;">TradeFlow Security</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#0f172a;">New sign-in detected</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">
            Hi ${name || "there"}, we noticed a new login to your account:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f8fafc;border-radius:8px;">
            <tr><td style="padding:12px 16px;font-size:13px;color:#334155;">
              <strong>Time:</strong> ${timestamp}<br/>
              <strong>IP address:</strong> ${ip}
            </td></tr>
          </table>
          <p style="color:#475569;font-size:14px;">Was this you?</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
            <tr>
              <td style="padding-right:12px;">
                <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">Yes, it's me</a>
              </td>
              <td>
                <a href="${revokeUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">No, secure my account</a>
              </td>
            </tr>
          </table>
          <p style="color:#94a3b8;font-size:12px;">
            Clicking "secure my account" immediately signs this session out everywhere.
            These links expire in 30 minutes.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

  return sendWithRetry({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "New sign-in to your TradeFlow account",
    html,
  });
}