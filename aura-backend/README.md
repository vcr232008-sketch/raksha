# Aura Boutique: Full Site (frontend + backend)

Storefront, admin and backend for your Next.js (App Router, TypeScript) project.

## Install
1. Copy `app/api`, `lib`, `prisma`, `tests` and `.env.example` into your project root (merge `app/` and `lib/`).
2. Add the entries from `package.additions.json` to your `package.json`, then `npm install`.
3. Make sure `tsconfig.json` has the `@/*` path alias (default in create-next-app).
4. `cp .env.example .env` and fill in every value (see below).
5. `npx prisma migrate dev --name init`, then `npm run db:seed`.
6. `npm run dev`, then `npm test`.

## Environment variables
| Variable | Needed for |
|---|---|
| DATABASE_URL | PostgreSQL connection (required) |
| AUTH_SECRET | Signing admin session cookies, 32+ chars (required) |
| ADMIN_EMAIL / ADMIN_PASSWORD | First admin created by the seed script only |
| CLOUDINARY_* | Product image uploads |
| RESEND_API_KEY, OWNER_EMAIL, EMAIL_FROM | Optional enquiry email alerts |

## API
Responses are `{ success: true, data }` or `{ success: false, error, details? }`.

**Public**
- `GET /api/products?q=&category=<slug>&minPrice=&maxPrice=&size=&colour=&featured=true&sort=newest|price_asc|price_desc&page=1&pageSize=12`
- `GET /api/products/:idOrSlug`
- `GET /api/categories`
- `POST /api/contact` `{ name, email, phone?, subject, message }` (5 per 15 min per IP)
- `POST /api/newsletter` `{ email }`
- `POST /api/auth/login` `{ email, password }` / `POST /api/auth/logout`

**Admin (session cookie required, role ADMIN)**
- `GET|POST /api/admin/products`, `PATCH|DELETE /api/admin/products/:id` (DELETE deactivates; add `?hard=true` to remove)
- `POST /api/admin/categories`, `PATCH|DELETE /api/admin/categories/:id`
- `GET /api/admin/enquiries?status=NEW`, `PATCH /api/admin/enquiries/:id` `{ status }`
- `GET /api/admin/subscribers`, `GET /api/admin/dashboard`
- `POST /api/admin/upload` (multipart, field `files`, returns Cloudinary URLs to pass in `images`)

Example: `curl -X POST localhost:3000/api/contact -H 'content-type: application/json' -d '{"name":"Asha","email":"asha@example.com","subject":"Custom blouse","message":"Do you do custom stitching?"}'`

## Notes
- Rate limiting is in-memory. On Vercel/serverless, swap `lib/rate-limit.ts` for Upstash Ratelimit.
- Admin pages (your UI) should call `/api/auth/login`; every admin route re-checks the session server-side.
- Prices are `Decimal` and serialise as strings in JSON; wrap with `Number()` on the frontend.
- No cart/payments yet; add later if you sell online.

## Frontend pages
`/` home · `/products` (search, category, size, sort, pagination) · `/products/[slug]` · `/contact` · `/admin/login` · `/admin` (stats, add product with image upload, stock and visibility, enquiries, subscribers).
Also copy `components/`, `tailwind.config.ts` and `app/globals.css`; if your project already has these, merge instead of overwriting. Product images use plain `<img>`, so no `next.config` image setup is needed.
Add a category first (POST `/api/admin/categories`, or run the seed) since new products require one.
