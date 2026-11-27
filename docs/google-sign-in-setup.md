# Google sign-in setup

The storefront uses Google Identity Services with a server-verified ID token and a Payload HTTP-only session cookie. No Google client secret is required for this sign-in flow.

## 1. Create a web OAuth client

In Google Cloud Console, create an OAuth client ID with application type **Web application**.

Add these authorized JavaScript origins:

- `https://sky-view-store-preview.onrender.com`
- `https://sky-view-store.onrender.com`

No redirect URI is needed for the Identity Services credential callback used by this app.

## 2. Configure Render environment variables

On the preview Render service, add both variables with the same client ID:

- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

The first is used only on the server to verify the ID token audience. The second is exposed to the browser so Google can render its sign-in button.

After the preview is verified, add the same two variables to the production service when the release is approved.

## 3. Verify

Open `/account/login` on the preview service. The Google button appears after the public client ID is configured. Test both a first-time customer account and an existing account with the same verified Google email.

Never paste credentials or private keys into source control or chat. The client ID is public; this implementation does not require a client secret.
