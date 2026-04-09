import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Green Market <notifications@greenmarket.farm>";

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
    to: customerEmail,
    subject: `Your Green Market order is confirmed - #${orderNumber}`,
    html,
  });
}
