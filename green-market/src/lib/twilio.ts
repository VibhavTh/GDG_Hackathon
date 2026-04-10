/**
 * Twilio SMS helper -- uses the REST API directly (no SDK) to keep the
 * dependency footprint minimal. Configure these env vars:
 *
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER  (e.g. +15405551234)
 */
export async function sendSms({ to, body }: { to: string; body: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn("[twilio] SMS env vars not set -- skipping");
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[twilio] SMS send failed:", res.status, err);
  }
}
