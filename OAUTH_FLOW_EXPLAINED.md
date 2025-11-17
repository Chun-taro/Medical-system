# Google OAuth 2.0 Flow Explained

## What the OAuth Playground Does

The Google OAuth 2.0 Playground (https://developers.google.com/oauthplayground) is a **testing tool** that helps developers understand and test OAuth flows before implementing them in their application.

---

## The 3-Step OAuth Flow (What You're Seeing)

### Step 1: Get Authorization Code
- User clicks a "Connect" button
- App redirects user to Google login page
- User approves permissions
- Google redirects back with an **Authorization Code** (one-time use)
- **Your Code:** `4/0Ab32j90KC7g4-lI0e5dPXGuoTIVKZHrx-Qe-Ep42oyV453y-FO5pNtvU8jBYzQBuiZHsng`

### Step 2: Exchange Code for Tokens
- Backend sends Authorization Code to Google
- Google responds with:
  - **Access Token** - Short-lived (expires in ~1 hour), used to access Google APIs
  - **Refresh Token** - Long-lived (expires in ~6 months), used to get new access tokens

```
Authorization Code
        ↓
    (Exchange)
        ↓
Access Token + Refresh Token
```

### Step 3: Use Tokens to Access Resources
- Use **Access Token** to make API calls to Google Calendar, Gmail, etc.
- When Access Token expires, use **Refresh Token** to get a new one (no user re-authentication needed)

---

## Your Current Setup in the Medical System

Your backend already does this automatically! Here's how:

```javascript
// Step 2 is handled here (in your authController.js):
const { tokens } = await oauth2Client.getToken(code);

// Stores both tokens:
googleAccessToken: tokens.access_token,      // Short-lived
googleRefreshToken: tokens.refresh_token     // Long-lived
```

---

## Token Lifecycle

### Access Token
- **Lifespan:** ~1 hour (3600 seconds)
- **Purpose:** Make API calls to Google Calendar
- **Expires:** Gets a countdown showing seconds remaining
- **What happens:** When it expires, you get an error and need a new one

### Refresh Token
- **Lifespan:** ~6 months (until user revokes access)
- **Purpose:** Get a new Access Token without user re-authenticating
- **Expires:** After 24 hours in the Playground (to prevent token accumulation)
- **What happens:** When expired, user must re-authenticate

---

## What Each Button Does in the Playground

| Button | Function |
|--------|----------|
| **Authorize APIs** | Step 1 - Get Authorization Code |
| **Exchange authorization code for tokens** | Step 2 - Convert code to tokens |
| **Auto-refresh the token before it expires** | Automatically gets new Access Token using Refresh Token |
| **The access token has expired** | Shows what happens when token expires |

---

## Your Authorization Code Explained

```
4/0Ab32j90KC7g4-lI0e5dPXGuoTIVKZHrx-Qe-Ep42oyV453y-FO5pNtvU8jBYzQBuiZHsng
```

This is a **one-time use** code that:
- ✅ Can be exchanged for tokens once
- ❌ Cannot be used again (security feature)
- ❌ Expires if not used quickly
- ✅ Already stored in your `.env` file

---

## How Your Medical System Uses This

### When User Connects Google Calendar:

1. **Frontend** calls `GET /api/calendar/oauth/url`
   ```javascript
   // Backend creates OAuth URL
   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',  // Get refresh token
     scope: ['https://www.googleapis.com/auth/calendar']
   });
   ```

2. **User** is redirected to Google, approves access
   ```
   https://accounts.google.com/o/oauth2/v2/auth?...
   ```

3. **Google** redirects to your callback with code
   ```
   http://localhost:5000/api/calendar/oauth/callback?code=4/0Ab32...
   ```

4. **Backend** exchanges code for tokens (Step 2)
   ```javascript
   const { tokens } = await oauth2Client.getToken(code);
   // tokens = { access_token, refresh_token, expires_in }
   ```

5. **Tokens** stored in database
   ```javascript
   User.findByIdAndUpdate(userId, {
     googleAccessToken: tokens.access_token,
     googleRefreshToken: tokens.refresh_token
   });
   ```

6. **Medical System** uses tokens to create/read calendar events
   ```javascript
   oauth2Client.setCredentials({
     access_token: user.googleAccessToken,
     refresh_token: user.googleRefreshToken
   });
   const calendar = google.calendar({ auth: oauth2Client });
   ```

---

## What Happens When Tokens Expire

### Access Token Expires (after ~1 hour):
```javascript
// This call fails with "invalid_grant" error
calendar.events.list({ calendarId: 'primary' });

// Solution: Use refresh token to get new access token
oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
const { credentials } = await oauth2Client.refreshAccessToken();
// Now use new credentials
```

### Refresh Token Expires (after ~6 months or if user revokes):
```
User must re-authenticate by clicking "Connect Google Calendar" again
```

---

## Important Security Notes

⚠️ **Never:**
- Commit tokens to Git
- Log tokens in console
- Share refresh tokens
- Use tokens in frontend (send from backend only)

✅ **Always:**
- Store tokens securely in database
- Refresh tokens before making API calls
- Validate tokens server-side
- Handle token expiration gracefully

---

## Testing in Your App

### Manual Testing Steps:

1. **Get OAuth URL**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/calendar/oauth/url
   ```

2. **Visit the URL** in browser
   - You'll be redirected to Google login
   - Approve permissions

3. **Google redirects to callback**
   - Backend exchanges code for tokens
   - Tokens stored in database
   - You're redirected to success page

4. **Test Calendar Access**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/calendar/events
   ```

---

## Quick Reference

| Term | Lifespan | Purpose | Storage |
|------|----------|---------|---------|
| **Auth Code** | Minutes | One-time exchange for tokens | Not stored |
| **Access Token** | 1 hour | Make API calls | Database (user record) |
| **Refresh Token** | 6 months | Get new access token | Database (user record) |
| **JWT Token** | 24 hours | Authenticate user to your app | Browser (localStorage) |

---

## TL;DR

The OAuth Playground shows the 3-step process:
1. **Get code** from Google (user approves)
2. **Exchange code** for tokens (backend does this)
3. **Use tokens** to access Google APIs (create/view calendar events)

Your Medical System backend **automatically handles all of this** when a user clicks "Connect Google Calendar"!

