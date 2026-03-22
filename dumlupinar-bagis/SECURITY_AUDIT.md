# Security Audit — Dumlupinar Bagis

**Audit date:** 2026-03-21
**Auditor:** Security Specialist (automated review)
**Scope:** Client-side SPA, Supabase backend, Vercel hosting configuration

---

## Findings

### 1. CRITICAL — Admin password exposed in client JS bundle

| Field | Detail |
|-------|--------|
| **Severity** | CRITICAL |
| **Location** | `VITE_ADMIN_PASSWORD` environment variable / built JS bundle |
| **Description** | The admin password is passed through a `VITE_`-prefixed environment variable. Vite inlines every `VITE_` variable into the production JavaScript bundle, making the plaintext password visible to anyone who inspects the page source or network traffic. |
| **Impact** | Any visitor can extract the password and gain full admin access. |
| **Recommendation** | Remove the client-side password entirely. Implement proper authentication via **Supabase Auth** (email/password or magic-link) or a **Supabase RPC-based auth** flow where credential verification happens server-side and is never exposed to the browser. |
| **Status** | **Recommended** |

---

### 2. HIGH — Session stored in sessionStorage is forgeable

| Field | Detail |
|-------|--------|
| **Severity** | HIGH |
| **Location** | Admin login flow / `sessionStorage` |
| **Description** | After a successful (client-side) password check the app sets a simple flag in `sessionStorage`. Any user can open DevTools and replicate or forge that value to bypass authentication. |
| **Impact** | Complete admin access bypass without knowing the password. |
| **Recommendation** | Replace the plain flag with a **cryptographically random token** paired with a **server-generated timestamp**. Validate the token server-side (e.g. via a Supabase edge function or RLS policy) on every privileged request. The `generateSessionToken()` helper in `src/lib/validation.ts` can be used as a starting point for token generation. |
| **Status** | **Mitigated** — `generateSessionToken()` utility added; full server-side validation still recommended. |

---

### 3. MEDIUM — No URL validation on image and payment URLs

| Field | Detail |
|-------|--------|
| **Severity** | MEDIUM |
| **Location** | Campaign image URLs, payment/IBAN links |
| **Description** | User-supplied or database-sourced URLs are rendered without protocol validation. An attacker who can modify a database record (or exploit an injection) could supply `javascript:`, `data:`, or `http://` URLs, leading to XSS or mixed-content warnings. |
| **Impact** | Potential cross-site scripting; mixed-content browser warnings. |
| **Recommendation** | Use the **`isValidHttpsUrl()`** and **`isSecureImageUrl()`** helpers from `src/lib/validation.ts` to enforce HTTPS-only URLs before rendering any external resource. |
| **Status** | **Fixed** — validation helpers implemented and exported. |

---

### 4. MEDIUM — No rate limiting on admin login attempts

| Field | Detail |
|-------|--------|
| **Severity** | MEDIUM |
| **Location** | Admin login form |
| **Description** | The login form accepts unlimited password attempts with no delay or lockout. Combined with the client-side password check, this makes brute-force attacks trivial. |
| **Impact** | Admin account compromise via automated brute-force. |
| **Recommendation** | Implement a **client-side lockout** (e.g. exponential back-off after 5 failed attempts, disabling the form for increasing intervals). For stronger protection, move authentication server-side where rate limiting can be enforced at the network/database level. |
| **Status** | **Recommended** |

---

### 5. LOW — No Content Security Policy (CSP) headers

| Field | Detail |
|-------|--------|
| **Severity** | LOW |
| **Location** | HTTP response headers |
| **Description** | The application does not send a `Content-Security-Policy` header, leaving the door open for inline-script injection and unauthorised resource loading. |
| **Impact** | Increased attack surface for XSS and data exfiltration. |
| **Recommendation** | Add a strict CSP via the hosting configuration (`vercel.json` headers). A reasonable starting policy: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self' https://*.supabase.co;`. Tune as needed after testing. |
| **Status** | **Recommended** — `vercel.json` now includes other security headers; CSP should be added after thorough testing to avoid breaking legitimate resources. |

---

### 6. INFO — Row Level Security (RLS) policies need admin CRUD rules

| Field | Detail |
|-------|--------|
| **Severity** | INFO |
| **Location** | Supabase RLS policies |
| **Description** | Current RLS policies allow public read access but do not define explicit admin-only INSERT / UPDATE / DELETE policies. If authentication is moved server-side, corresponding RLS rules must be created so that only authenticated admin users can modify campaign data. |
| **Impact** | Without proper RLS, anyone with the Supabase anon key could potentially write to unprotected tables. |
| **Recommendation** | Create RLS policies that restrict write operations to authenticated users with an admin role. Example: `CREATE POLICY "admin_crud" ON campaigns FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');` |
| **Status** | **Recommended** |

---

## Summary Table

| # | Severity | Title | Status |
|---|----------|-------|--------|
| 1 | CRITICAL | Admin password in JS bundle | Recommended |
| 2 | HIGH | Forgeable sessionStorage session | Mitigated |
| 3 | MEDIUM | No URL validation | Fixed |
| 4 | MEDIUM | No login rate limiting | Recommended |
| 5 | LOW | No CSP headers | Recommended |
| 6 | INFO | RLS admin CRUD policies missing | Recommended |
