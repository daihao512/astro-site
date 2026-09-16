# Website issue tracker

Last checked: 2026-09-15

This is the working checklist for the 29-item site review. “Code complete” means the repository contains the fix and local verification passed. It does not mean the production account, DNS, or business data has been verified.

| # | Issue | Status | Evidence / next action |
|---:|---|---|---|
| 1 | Product, industry, blog and contact routes | Code complete | Static build and internal-link scan pass. |
| 2 | Product CTA did not retain product context | Code complete | Product links use `/contact?product=...`; contact page preselects it. |
| 3 | Form fields were inconsistent (`qty` vs `quantity`) | Code complete | Both forms and API use `quantity`. |
| 4 | Email was incorrectly mandatory when phone was allowed | Code complete | Email or WhatsApp/phone is accepted; client and server rules match. |
| 5 | Form had no bot trap or length limits | Code complete | Honeypot, field limits and request-size limit are implemented. |
| 6 | Duplicate inquiry submissions and test-row isolation | Code complete | Server submission ID and D1 unique key support idempotency; client cannot set `is_test`, which requires a server-only test token. |
| 7 | Form could remain stuck during network failure | Code complete | Client submit lock and 15-second timeout added. |
| 8 | Inquiry storage was not durable | Local schema complete / production pending | Local Wrangler applied both migrations and confirmed `inquiries`, `inquiry_events`, `urls` and indexes; current live deployment still needs verification. |
| 9 | CRM Webhook was not confirmed end to end | Not connected / endpoint missing | Read-only scan of `F:\test\work` found the control-plane read API but no confirmed `/webhook/lead` route. A real receiving endpoint must be implemented or supplied, then tested; optional shared-secret header is supported. |
| 10 | Inquiry email notification | Production pending | HTTPS mail adapter exists; configure sender/recipient and verify delivery. |
| 11 | Aliyun mailbox SMTP password handling | Decision documented | Cloudflare edge cannot use raw SMTP; do not put the client security password in source or Pages variables. |
| 12 | Inquiry event record and optional fan-out | Production pending | D1 event table and `INQUIRY_EVENT_WEBHOOK` support exist; deploy and inspect delivery. |
| 13 | Attribution and URL resolution | Code complete / registry pending | Real referrer/UTM are captured; URL Registry is intentionally unresolved until configured. |
| 14 | AI knowledge-base context was not passed to retrieval | Code complete | `KB_API` is passed into retrieval; timeout added. |
| 15 | AI endpoint lacked payload limits | Code complete | 30-message, 2,000-character message and 64 KB body limits. |
| 16 | AI client could issue duplicate or hanging requests | Code complete | Send lock, 1,000-character UI limit and 15-second timeout. |
| 17 | Missing custom 404 handling | Code complete | `src/pages/404.astro` generates `dist/404.html`. |
| 18 | Missing security response headers | Code complete | Middleware adds nosniff, frame, referrer, permissions and production HSTS. |
| 19 | Missing privacy page / policy link | Code complete | `/privacy` exists and is linked in the footer. |
| 20 | Broken or empty internal links | Code complete | `npm run check:links` scans generated HTML and passes. |
| 21 | Missing hero video assets caused 404s | Code complete | Absent video references removed; gradient hero remains. |
| 22 | External image CDN dependency | Mostly complete | Blog cover and legacy body URLs use local fallbacks; verify generated content before publishing new posts. |
| 23 | Empty article image sources | Code complete | Related article images have local fallback and alt text. |
| 24 | Fake phone, WhatsApp and street address | Code complete / business data pending | Unverified contact details removed; provide real details before adding them back. |
| 25 | Unverified company/social structured data | Local code complete / live deployment pending | Local code omits unverified `sameAs`, founding date and address; live `https://lubandart.com/ai/summary.json` still exposes `foundingDate: 2014` (checked 2026-09-15), so the latest build has not reached production. |
| 26 | Unverified numeric company claims | Code complete | Country counts, years, floor area and production-line counts removed from visible copy. |
| 27 | Unverified certification wording | Copy risk reduced / business verification pending | Product copy now requires grade-specific confirmation; certificate scope, issuer and validity still require business verification. |
| 28 | Unverified blog test figures and case studies | Copy risk reduced / business review pending | Technical-note banner added to every article and raw Markdown tokens cleaned; review ASTM/PSTC figures, customer cases and performance ranges before treating them as factual. |
| 29 | Production launch and monitoring | Production deployment pending | Wrangler access is available and the Pages project is `lubandart-tape`; the latest listed production deployment is still source commit `166a827`, while this workspace contains uncommitted fixes. Live AI summary still has old metadata. `GET /api/contact` returning 404 is expected for this POST-only endpoint and is not a POST health check; commit/publish the current workspace only after approval, then apply D1 migrations, set variables, and run one controlled inquiry. |

## Required production handoff

1. Confirm the canonical domain, legal company name, address, phone and verified social profiles.
2. Apply the D1 migrations configured in `wrangler.toml` and verify the `DB` binding in the deployed environment.
3. Provide the real CRM Webhook endpoint in Cloudflare Pages, or explicitly choose D1-only storage.
4. Configure the HTTPS mail provider, `MAIL_FROM`, `INQUIRY_NOTIFY_TO`, SPF and DKIM. Never upload the Aliyun client security password to this repository.
5. Confirm certificate files and every numerical test/case-study claim against the original documents.
6. Run one controlled production inquiry and verify: D1 row, event row, email arrival, CRM receipt, and attribution fields.

## Local gates

```bash
npm run build
npm run check:links
npm run smoke:inquiry
```
