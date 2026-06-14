import { Resend } from "resend";
import type { Order } from "./schema";
import { getBouquet, formatUSD } from "./bouquets";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "Petals by Dar <orders@petalsbydar.com>";

// Escape user-supplied text before dropping it into the HTML email so a name,
// note, or link can't inject markup into Dar's inbox.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only treat values that actually look like http(s) URLs as links/images, so a
// junk value can't produce a broken <img> or a non-http href.
function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

// Heads-up to the owner that a customer just submitted details on the site.
// The email SHOWS the inspiration photos as thumbnails + the notes and links,
// so Dar can see exactly what the client wants and start working — no need to
// hunt through the admin page or copy-paste URLs.
export async function sendOwnerNotification(order: Order) {
  if (!resend) return;
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) return;

  const bouquet = getBouquet(order.bouquetType);
  const bouquetName = bouquet?.name ?? order.bouquetType;

  const photoUrls = (order.inspirationUrls ?? []).filter(isHttpUrl);
  const refLinks = (order.inspirationLinks ?? []).filter(Boolean);

  const payLine =
    order.paymentType === "full"
      ? `Wants to pay IN FULL today: ${formatUSD(order.totalAmountCents)} — nothing owed at pickup.`
      : `Wants to pay deposit today: ${formatUSD(order.depositAmountCents)}. Remainder ${formatUSD(
          order.totalAmountCents - order.depositAmountCents,
        )} due at pickup.`;

  // ---- Plain-text fallback (for email clients that don't render HTML) ----
  const text = [
    `New order details from the website: ${bouquetName}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    order.instagram ? `Instagram: ${order.instagram}` : "",
    order.galleryStyle ? `Inspired by: ${order.galleryStyle}` : "",
    "",
    `Notes: ${order.notes ?? "(none)"}`,
    refLinks.length ? `Reference links: ${refLinks.join(", ")}` : "",
    photoUrls.length ? `Inspiration photos:\n${photoUrls.join("\n")}` : "",
    "",
    payLine,
    `Estimated total: ${formatUSD(order.totalAmountCents)}`,
  ]
    .filter(Boolean)
    .join("\n");

  // ---- HTML version (shows the photos) ----
  const photoGrid = photoUrls.length
    ? `<div style="margin:8px 0 4px;">
         ${photoUrls
           .map(
             (u) =>
               `<a href="${esc(u)}" style="text-decoration:none;">
                  <img src="${esc(u)}" alt="Inspiration photo" width="150" height="150"
                       style="width:150px;height:150px;object-fit:cover;border-radius:12px;
                              border:1px solid #fcd4dd;margin:4px;display:inline-block;" />
                </a>`,
           )
           .join("")}
       </div>
       <p style="font-size:12px;color:#6c4453;margin:4px 0 0;">Tap a photo to open it full-size.</p>`
    : `<p style="font-size:13px;color:#6c4453;">No photos uploaded.</p>`;

  const linkList = refLinks.length
    ? `<ul style="margin:6px 0;padding-left:18px;font-size:14px;color:#2a0d18;">
         ${refLinks
           .map((l) =>
             isHttpUrl(l)
               ? `<li><a href="${esc(l)}" style="color:#b51e51;">${esc(l)}</a></li>`
               : `<li>${esc(l)}</li>`,
           )
           .join("")}
       </ul>`
    : "";

  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:4px 12px 4px 0;color:#6c4453;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(
         label,
       )}</td>
       <td style="padding:4px 0;color:#2a0d18;font-size:14px;">${value}</td>
     </tr>`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
              max-width:600px;margin:0 auto;background:#fff5f7;padding:24px;border-radius:16px;">
    <h1 style="font-size:20px;color:#b51e51;margin:0 0 4px;">🌸 New website order</h1>
    <p style="font-size:15px;color:#2a0d18;margin:0 0 16px;">
      <strong>${esc(bouquetName)}</strong> for <strong>${esc(order.customerName)}</strong>
    </p>

    <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#b51e51;margin:0 0 8px;">
        What they want
      </h2>
      <p style="font-size:14px;color:#2a0d18;margin:0 0 12px;white-space:pre-wrap;">${
        order.notes ? esc(order.notes) : "<span style='color:#6c4453;'>(no notes)</span>"
      }</p>
      ${order.galleryStyle ? `<p style="font-size:13px;color:#6c4453;margin:0 0 12px;">Inspired by: ${esc(order.galleryStyle)}</p>` : ""}

      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#b51e51;margin:12px 0 4px;">
        Inspiration photos
      </h2>
      ${photoGrid}

      ${
        refLinks.length
          ? `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#b51e51;margin:14px 0 4px;">Reference links</h2>${linkList}`
          : ""
      }
    </div>

    <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#b51e51;margin:0 0 8px;">
        Customer
      </h2>
      <table style="border-collapse:collapse;">
        ${row("Name", esc(order.customerName))}
        ${row("Phone", `<a href="tel:${esc(order.phone)}" style="color:#b51e51;">${esc(order.phone)}</a>`)}
        ${row("Email", `<a href="mailto:${esc(order.email)}" style="color:#b51e51;">${esc(order.email)}</a>`)}
        ${order.instagram ? row("Instagram", esc(order.instagram)) : ""}
      </table>
    </div>

    <div style="background:#fff;border-radius:12px;padding:16px;">
      <p style="font-size:14px;color:#2a0d18;margin:0;">${esc(payLine)}</p>
      <p style="font-size:13px;color:#6c4453;margin:6px 0 0;">Estimated total: ${formatUSD(order.totalAmountCents)}</p>
    </div>
  </div>`;

  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `🌸 New website order: ${bouquetName} — ${order.customerName}`,
    text,
    html,
  });
}
