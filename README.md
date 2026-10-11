# Bharat Pathology - Laboratory Management System & Admin Console

A complete, production-quality laboratory website and administrative operations console for **Bharat Pathology** in Ballia, Uttar Pradesh.

---

## 1. System Overview

- **Public Website** (`/#/`): Fast, mobile-first patient portal with direct home collection booking, transparent health packages, UPI payment guidance, real laboratory photos, and WhatsApp communication.
- **Admin Console** (`/#/admin`): Complete lab-operations dashboard for the laboratory owner and authorized staff to manage bookings, collector scheduling, payments verification, reports distribution, patient history, message templates, website content, staff roles, and immutable audit logs.
- **Security & Privacy**: Strict patient data protection with Attribute-Based Access Control (ABAC), zero-trust Firestore security rules, 30-minute inactivity auto-logout, and PII masking.

---

## 2. Configured Laboratory Administrator Credentials

The admin login page at `/#/admin` is pre-configured with the owner credentials:

- **Username / Email**: `sangamtrail@gmail.com`
- **Password**: `sangamtrial@2198`

When you visit `/#/admin`, these credentials are pre-filled. Clicking **"Sign In to Lab Console"** will automatically authenticate your session with full **Owner** privileges.

---

## 3. One-Time Setup: Creating Additional Laboratory Owners / Staff

Because public user registration is disabled for patient confidentiality, the first Owner administrator must be bootstrapped via Firebase:

### Step 1: Create the User in Firebase Authentication
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project and navigate to **Authentication** > **Users**.
3. Click **Add User** and create an account with an email (e.g. `owner@bharatpathology.in`) and a secure password.
4. Copy the generated **UID** (User Identifier) of this new account.

### Step 2: Add Document in Firestore `admins` Collection
1. Navigate to **Firestore Database** in the Firebase Console.
2. Under the root level, click **Start collection** (or select existing `admins` collection).
3. Set the **Collection ID** to `admins`.
4. Set the **Document ID** to the exact **UID** copied in Step 1.
5. Add the following fields:
   - `email` (string): `owner@bharatpathology.in`
   - `name` (string): `Dr. Lab Director` (or owner name)
   - `role` (string): `owner`
   - `active` (boolean): `true`
   - `createdAt` (string): Current ISO date (e.g. `2026-10-09T00:00:00.000Z`)
   - `phone` (string, optional): `+91 88877 90574`

Once saved, navigate to `/#/admin` in your browser and sign in with those credentials. You will have full Owner privileges to invite staff, change settings, and manage operations.

---

## 3. Firestore Security Rules & Deployment

The system is guarded by production-grade security rules defined in `firestore.rules`:

### Security Rules Architecture
- **Bookings (`/bookings/{bookingId}`)**:
  - **Public Visitors**: Allowed to **CREATE** a booking request only. Validates mandatory patient fields, string lengths (<=100 name, 10-15 phone, <=500 address), forces `status == 'New'`, forces `amountReceived == 0`, and prevents shadow/admin-only fields.
  - **Public Visitors**: Can **NEVER** read, list, update, or delete any booking.
  - **Active Admins (`owner` and `staff`)**: Can read, list, and update bookings.
  - **Owners Only**: Can permanently delete bookings.
- **Administrators (`/admins/{adminId}`)**:
  - Signed-in admins can read their own profile to verify their role and permissions.
  - Owners can read all staff records and write/update/deactivate accounts.
- **Settings (`/settings/{settingId}`)**:
  - Public can read published contact details, hours, and banners.
  - Only Owners can update operational configuration and capacity.
- **Audit Logs (`/auditLogs/{logId}`)**:
  - Any active admin action automatically creates an immutable audit trail entry.
  - Only Owners can read audit logs.
  - Modifications and deletions are strictly blocked (`allow update, delete: if false;`).
- **Default Deny**:
  - Catch-all rule (`match /{document=**} { allow read, write: if false; }`) prevents unauthorized access to any other path.

### How to Deploy Rules
Deploying `firestore.rules` is handled via the Firebase CLI or AI Studio automation:
```bash
# Using Firebase CLI:
firebase deploy --only firestore:rules
```

---

## 4. Role-Based Permissions Summary

| Feature / Action | Owner | Staff | Public Visitor |
| :--- | :---: | :---: | :---: |
| View & filter bookings | ✅ | ✅ | ❌ |
| Update status & schedule collector | ✅ | ✅ | ❌ |
| Verify payments & add notes | ✅ | ✅ | ❌ |
| Share WhatsApp report & updates | ✅ | ✅ | ❌ |
| Export data to CSV / Print receipts | ✅ | ❌ | ❌ |
| Permanently delete bookings | ✅ | ❌ | ❌ |
| Add / deactivate staff members | ✅ | ❌ | ❌ |
| Edit lab announcements & pricing | ✅ | ❌ | ❌ |
| View security audit log | ✅ | ❌ | ❌ |
| Submit home collection request | ✅ | ✅ | ✅ |

---

## 5. Contact Details & Lab Information

- **Name**: Bharat Pathology (Local Pathology Laboratory)
- **Address**: Bhimpura No. 1, Balauli Road, Ballia, Uttar Pradesh 221716
- **Hours**: Open daily, 8:00 AM to 7:00 PM
- **Phone / WhatsApp**: +91 88877 90574

---

## 6. Deploying on Netlify (Step-by-Step Guide)

This application is fully pre-configured for one-click deployment on Netlify with Vite, SPA routing (`_redirects` & `netlify.toml`), and Firebase.

### Option A: Deploy via GitHub / GitLab / Bitbucket (Recommended)
1. Push your repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. Netlify will auto-detect the configuration from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**.

### Option B: Manual Drag-and-Drop Deploy
1. Run local build:
   ```bash
   npm run build
   ```
2. In the Netlify dashboard, go to the **Sites** tab.
3. Drag and drop the generated `dist` folder into the Netlify upload box.

### CRITICAL: Authorize your Netlify Domain in Firebase Auth
To enable your admin login (`sangamtrail@gmail.com`) and Firebase services on Netlify:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`gen-lang-client-0087601607`).
3. Navigate to **Authentication** > **Settings** (tab) > **Authorized domains**.
4. Click **"Add domain"** and add your Netlify site URL (e.g., `your-site-name.netlify.app` or your custom domain).
5. Done! Your site and admin panel at `/#/admin` are live and operational.

