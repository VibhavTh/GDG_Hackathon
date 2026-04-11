import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: Resend requires a verified domain for FROM. Set RESEND_FROM_EMAIL in .env.local.
// The admin Gmail is used as reply-to so replies land in the admin inbox.
const FROM = process.env.RESEND_FROM_EMAIL ?? "Green Market <notifications@greenmarket.farm>";
const REPLY_TO = "greenmarketfarms1@gmail.com";

export async function sendNewOrderEmail({
  farmerEmail,
  farmName,
  orderId,
  customerEmail,
  totalCents,
  items,
}: {
  farmerEmail: string;
  farmName: string;
  orderId: string;
  customerEmail: string;
  totalCents: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
}) {
  const orderNumber = orderId.slice(0, 8).toUpperCase();
  const total = (totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/orders`
    : "https://greenmarket.farm/orders";

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;text-align:right;">${((i.unitPriceCents * i.quantity) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#d4eeaa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:28px;font-weight:700;">New Order Received</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 8px;color:#555;font-size:14px;">Hi ${farmName},</p>
      <p style="margin:0 0 24px;color:#555;font-size:14px;">You have a new order from <strong>${customerEmail}</strong>.</p>

      <div style="background:#f7f4eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#888;">Order #${orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Item</th>
            <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Qty</th>
            <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top:16px;font-weight:700;font-size:16px;color:#1c1c17;">Total</td>
            <td style="padding-top:16px;font-weight:700;font-size:20px;color:#173809;text-align:right;">${total}</td>
          </tr>
        </tfoot>
      </table>

      <a href="${dashboardUrl}" style="display:block;background:#173809;color:#fcf9f0;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.05em;">
        View Order in Dashboard
      </a>

      <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center;">
        You received this email because you are a vendor on Green Market.
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: farmerEmail,
    subject: `New Order #${orderNumber} - ${total}`,
    html,
  });
}

export async function sendCustomerConfirmationEmail({
  customerEmail,
  orderId,
  farmName,
  totalCents,
  items,
}: {
  customerEmail: string;
  orderId: string;
  farmName: string;
  totalCents: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
}) {
  const orderNumber = orderId.slice(0, 8).toUpperCase();
  const total = (totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const trackUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-lookup?orderNumber=${orderNumber}&email=${encodeURIComponent(customerEmail)}`
    : `https://greenmarket.farm/order-lookup?orderNumber=${orderNumber}&email=${encodeURIComponent(customerEmail)}`;

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ede4;text-align:right;">${((i.unitPriceCents * i.quantity) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#d4eeaa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:28px;font-weight:700;">Order Confirmed!</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 8px;color:#555;font-size:14px;">Thank you for your order!</p>
      <p style="margin:0 0 24px;color:#555;font-size:14px;">
        <strong>${farmName}</strong> is preparing your items. You can track your order status anytime using the link below.
      </p>

      <div style="background:#f7f4eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#888;">Order #${orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Item</th>
            <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Qty</th>
            <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede4;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top:16px;font-weight:700;font-size:16px;color:#1c1c17;">Total Paid</td>
            <td style="padding-top:16px;font-weight:700;font-size:20px;color:#173809;text-align:right;">${total}</td>
          </tr>
        </tfoot>
      </table>

      <a href="${trackUrl}" style="display:block;background:#173809;color:#fcf9f0;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.05em;">
        Track Your Order
      </a>

      <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center;">
        Questions? Reply to this email or visit greenmarket.farm.
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: customerEmail,
    subject: `Your Green Market order is confirmed - #${orderNumber}`,
    html,
  });
}

export async function sendVendorApprovalEmail({
  vendorEmail,
  shopName,
  approved,
  reason,
}: {
  vendorEmail: string;
  shopName: string;
  approved: boolean;
  reason?: string;
}) {
  const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    : "https://greenmarket.farm/dashboard";

  const html = approved
    ? `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#d4eeaa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:28px;font-weight:700;">You're Approved!</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 8px;color:#555;font-size:14px;">Hi ${shopName},</p>
      <p style="margin:0 0 24px;color:#555;font-size:14px;">
        Great news! Your vendor account has been approved. You can now log in to your dashboard and start listing products.
      </p>
      <a href="${dashboardUrl}" style="display:block;background:#173809;color:#fcf9f0;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.05em;">
        Go to Dashboard
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center;">
        Welcome to Green Market. Reply to this email if you have any questions.
      </p>
    </div>
  </div>
</body>
</html>`
    : `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#a03f29;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#fff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:28px;font-weight:700;">Application Update</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 8px;color:#555;font-size:14px;">Hi ${shopName},</p>
      <p style="margin:0 0 24px;color:#555;font-size:14px;">
        After reviewing your application, we are unable to approve your vendor account at this time.
        ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ""}
      </p>
      <p style="margin:0;font-size:12px;color:#aaa;">
        If you believe this is an error, please reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: vendorEmail,
    subject: approved
      ? `Welcome to Green Market, ${shopName} -- You're approved!`
      : `Green Market vendor application update`,
    html,
  });
}

export async function sendContactNotificationEmail({
  farmerEmail,
  fromName,
  fromEmail,
  subject,
  body,
}: {
  farmerEmail: string;
  fromName: string | null;
  fromEmail: string;
  subject: string;
  body: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#d4eeaa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:24px;font-weight:700;">New Customer Message</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">From</p>
      <p style="margin:0 0 20px;font-size:15px;color:#1c1c17;font-weight:600;">${fromName ? `${fromName} (${fromEmail})` : fromEmail}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">Subject</p>
      <p style="margin:0 0 20px;font-size:15px;color:#1c1c17;font-weight:600;">${subject}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">Message</p>
      <div style="background:#f7f4eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#1c1c17;line-height:1.6;white-space:pre-wrap;">${body}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenmarket.farm"}/dashboard/admin" style="display:block;background:#173809;color:#fcf9f0;text-align:center;padding:14px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
        Reply in Dashboard
      </a>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    replyTo: fromEmail,
    to: farmerEmail,
    subject: `New message: ${subject}`,
    html,
  });
}

export async function sendReplyEmail({
  toEmail,
  toName,
  originalSubject,
  replyBody,
  farmName,
}: {
  toEmail: string;
  toName: string | null;
  originalSubject: string;
  replyBody: string;
  farmName: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <p style="margin:0;color:#d4eeaa;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:8px 0 0;color:#fcf9f0;font-size:24px;font-weight:700;">${farmName}</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      <p style="margin:0 0 20px;font-size:14px;color:#555;">Hi${toName ? ` ${toName}` : ""},</p>
      <div style="background:#f7f4eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#1c1c17;line-height:1.6;white-space:pre-wrap;">${replyBody}</p>
      </div>
      <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
        This is a reply to your message: "${originalSubject}"
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: toEmail,
    subject: `Re: ${originalSubject}`,
    html,
  });
}

export async function sendNewsletterEmail({
  to,
  subject,
  bodyHtml,
}: {
  to: string[];
  subject: string;
  bodyHtml: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fcf9f0;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#173809;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
      <p style="margin:0 0 4px;color:#d4eeaa;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Green Market</p>
      <h1 style="margin:0;color:#fcf9f0;font-size:26px;font-style:italic;font-weight:700;letter-spacing:-0.01em;">The Weekly Harvest</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #f0ede4;margin:32px 0;">
      <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
        You are receiving this because you subscribed to The Weekly Harvest from Green Market.<br>
        Reply to unsubscribe.
      </p>
    </div>
  </div>
</body>
</html>`;

  // Resend supports batch sending up to 100 at a time
  const chunks: string[][] = [];
  for (let i = 0; i < to.length; i += 50) {
    chunks.push(to.slice(i, i + 50));
  }
  for (const chunk of chunks) {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: chunk,
      subject,
      html,
    });
  }
}
