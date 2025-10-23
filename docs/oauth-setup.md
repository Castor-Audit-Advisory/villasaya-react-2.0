# OAuth Authentication Setup Guide

This guide explains how to configure OAuth authentication providers (Google, Apple, and Microsoft/Azure) for VillaSaya using Supabase.

## Overview

VillaSaya supports OAuth authentication through:
- **Google** - Sign in with Google accounts
- **Apple** - Sign in with Apple ID
- **Microsoft/Azure** - Sign in with Microsoft accounts

The frontend implementation is complete and ready to use. You just need to configure the OAuth providers in your Supabase dashboard.

## Supabase OAuth Configuration

### Prerequisites
1. Access to your Supabase project dashboard
2. OAuth credentials from each provider you want to enable

### Step 1: Access Authentication Settings
1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. You'll see a list of available OAuth providers

### Step 2: Configure Google OAuth

1. **Enable Google Provider**
   - Find "Google" in the providers list
   - Toggle it ON

2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose "Web application"
   - Add authorized redirect URI:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret**

3. **Add Credentials to Supabase**
   - Paste the Client ID in Supabase
   - Paste the Client Secret in Supabase
   - Save the configuration

### Step 3: Configure Apple OAuth

1. **Enable Apple Provider**
   - Find "Apple" in the providers list
   - Toggle it ON

2. **Get Apple OAuth Credentials**
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Register an App ID with Sign in with Apple capability
   - Create a Service ID for web authentication
   - Configure the redirect URL:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Generate a private key for Sign in with Apple
   - Note your Team ID and Service ID

3. **Add Credentials to Supabase**
   - Add your Service ID (Client ID)
   - Add your Team ID
   - Add your Private Key
   - Save the configuration

### Step 4: Configure Microsoft/Azure OAuth

1. **Enable Azure Provider**
   - Find "Azure (Microsoft)" in the providers list
   - Toggle it ON

2. **Get Microsoft OAuth Credentials**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to **Azure Active Directory** → **App registrations**
   - Click **New registration**
   - Name your application
   - Select supported account types
   - Add redirect URI:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - After creation, go to **Certificates & secrets**
   - Create a new client secret
   - Copy the **Application (client) ID** and **Client Secret**

3. **Add Credentials to Supabase**
   - Add the Application (client) ID
   - Add the Client Secret
   - Optionally configure the Azure AD tenant
   - Save the configuration

## Frontend Implementation (Already Complete)

The OAuth authentication handlers are already implemented in the codebase:

### Key Files:
- `src/components/AuthPage.tsx` - Desktop OAuth authentication
- `src/components/MobileAuthPage.tsx` - Mobile OAuth authentication

### How It Works:
1. User clicks an OAuth button (Google, Apple, or Microsoft)
2. The `handleOAuthLogin` function is triggered
3. Supabase redirects to the provider's login page
4. After successful authentication, user is redirected back
5. Session is established and user is logged into VillaSaya

## Testing OAuth Authentication

1. **Enable at least one provider** in Supabase dashboard
2. **Restart the application**
3. **Click the OAuth button** on the login page
4. **Complete authentication** with the provider
5. **Verify successful login** to VillaSaya

## Troubleshooting

### Common Issues:

1. **"Provider not enabled" error**
   - Ensure the provider is enabled in Supabase dashboard
   - Check that credentials are saved properly

2. **Redirect URI mismatch**
   - Verify the redirect URI in provider settings matches Supabase's callback URL
   - Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`

3. **Invalid credentials**
   - Double-check Client ID and Secret are correct
   - Ensure no extra spaces when copying credentials

4. **Session not persisting**
   - Check browser cookies are enabled
   - Verify Supabase URL and anon key are correct

## Security Notes

- Never expose OAuth credentials in frontend code
- All OAuth secrets should be configured only in Supabase dashboard
- Use environment variables for Supabase project URL and anon key
- Enable only the providers you actually need

## Support

For additional help:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/auth-google)
- [Apple OAuth Setup](https://supabase.com/docs/guides/auth/auth-apple)
- [Azure OAuth Setup](https://supabase.com/docs/guides/auth/auth-azure)