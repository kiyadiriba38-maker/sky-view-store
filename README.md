# Sky View Store

A futuristic, mobile-responsive marketplace for Ethiopia, built with Next.js 16, React 19, Payload CMS 3, and PostgreSQL.

## Marketplace features

- Responsive storefront with search, categories, filters, sorting, deals, and product comparison
- Product detail pages, product galleries, variants, stock information, and customer reviews
- Customer registration and sign-in, account pages, notifications, and order history
- Simulated cart and checkout flow; no real payment is collected
- Seller applications, seller workspace, product submissions, and moderation workflows
- Admin workspace for orders, seller applications, listing moderation, reports, and audit history
- English, Amharic, and Afaan Oromo storefront languages
- Ethiopian Birr (ETB) as the storefront currency
- Demo catalogue and reviews are marked as demo content and excluded from real seller reputation and revenue reporting

## Important launch safeguards

- **Payments:** checkout is simulated. Live payment processing is not enabled.
- **Google sign-in:** requires a Google Web OAuth client ID. See [Google sign-in setup](docs/google-sign-in-setup.md).
- **Email:** without an SMTP provider, Payload writes email messages to the service console. Configure a provider before relying on email notifications.
- **Seller moderation:** keep `LISTING_MODERATOR_EMAIL` unset until a responsible adult store administrator is designated. Seller listings remain unpublished until policy review.
- **Media:** Render's ephemeral filesystem is not durable storage. Configure Vercel Blob or S3-compatible object storage before relying on uploaded media in production.
- **Production:** keep the feature branch preview separate from the production service until browser-based checkout, account, admin, and moderation flows have been tested and all required providers are configured.

## Local development

Requirements: Node.js 24+ and pnpm.

1. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

2. Create `.env.local` using [`.env.example`](.env.example). Configure a PostgreSQL database and unique values for `PAYLOAD_SECRET` and `PREVIEW_SECRET`.

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Build and quality checks

The production build runs database migrations, generates Payload types, checks TypeScript, runs ESLint, and compiles Next.js:

```bash
pnpm run build
```

The GitHub Actions workflow `.github/workflows/marketplace-checks.yml` runs the marketplace checks for pull requests.

## Demo catalogue

The isolated development database branch contains 25 demo categories, 1,000 demo products, and 2,000 demo reviews. Demo records are explicitly marked and must not be treated as real customer orders, seller performance, or revenue.

## Deployment

The project is deployed from the feature branch to the isolated Render preview service. Configure the environment values from [`.env.example`](.env.example) in the Render dashboard; do not commit secrets. Review the [Google sign-in setup](docs/google-sign-in-setup.md) for OAuth and adult-moderator setup.

The production Render service tracks `master`. Do not merge the feature branch or change the production service until the release checks and required account/provider setup are complete.
