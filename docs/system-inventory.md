# Implemented System Inventory — AradRe Real Estate Index
**Date:** 2026-04-13
**Based on:** Full codebase analysis (routes, schema, actions, components, middleware)

---

## 1. Implemented Modules

| Module | Status | Database Connected | Notes |
|--------|--------|-------------------|-------|
| Authentication (Login) | Full | Yes | NextAuth credentials, JWT sessions |
| Dashboard | Full | Yes | Stats + charts from real data |
| Properties CRUD | Full | Yes | Create, edit, delete, publish, images, search |
| Projects CRUD | Full | Yes | 5-step wizard, images, documents, units, 3D preview |
| Inquiries / CRM | Full | Yes | Create, notes, appointments, email, status |
| Calendar Schedule | Full | Yes | Appointments view, create, status management |
| Customer Management | Full | Yes | CRUD, linked projects/properties |
| User Management | Full | Yes | CRUD, roles, page permissions, customer assignment |
| Map Settings | Full | Yes | 8 tile layers, default center/zoom persisted |
| API Client Management | Full | Yes | Token CRUD, field-level access, customer scoping |
| Homepage Manager | Full | Yes | Hero image upload, toggle active, reorder |
| Image Bank | Full | Yes | Upload, link to properties/projects, delete |
| Contact Form (Public) | Partial | No (email only) | Sends email via Resend, does NOT save to DB |
| Public Property Pages | Full | Yes | Search, filter, detail, inquiry form |
| Public Project Pages | Full | Yes | List, detail, inquiry form |
| About Page | Full | N/A | Static content |
| File Upload | Full | Yes | Local or S3, presigned URLs for large files |
| External API (v1) | Full | Yes | Bearer token auth, customer scoping, field filtering |

---

## 2. Implemented Roles

| Role | Identifier | Access |
|------|-----------|--------|
| Super Admin | `isSuperAdmin: true` | Full access to all pages and all data |
| Customer Manager | `isSuperAdmin: false, customerId: set` | Access to allowed pages only; data scoped to their customer |
| Regular Admin | `isSuperAdmin: false, customerId: null` | Access to allowed pages only; no customer scope (limited data) |

**Password Reset / OTP / 2FA:** NOT implemented. No forgot-password flow exists.

---

## 3. Navigation Map (Admin Sidebar)

### General
- Dashboard (`/admin/dashboard`)
- Home Page (`/admin/homepage`)

### Listings
- Properties (`/admin/properties`)
- Projects (`/admin/projects`)

### CRM
- Inquiries (`/admin/inquiries`)
- Calendar Schedule (`/admin/calendar`)
- Customers (`/admin/customers`)

### System
- Maps (`/admin/maps`)
- API Clients (`/admin/api`)
- User Management (`/admin/users`)

### Public Site
- Home (`/`)
- Projects (`/projects`)
- Project Detail (`/projects/[slug]`)
- Property Detail (`/properties/[slug]`)
- About (`/about`)
- Contact (`/contact`)

---

## 4. Real Database-Connected Forms

| Form | Page | Server Action | Validates | Persists |
|------|------|--------------|-----------|----------|
| Login | /admin/login | NextAuth signIn | Yes | Session |
| PropertyForm | /admin/properties/new, /[id] | createProperty, updateProperty | Zod | Yes |
| ProjectForm | /admin/projects/new, /[id] | createProject, updateProject | Zod | Yes |
| CustomerForm | /admin/customers/new, /[id] | createCustomer, updateCustomer | Zod | Yes |
| AdminUserForm | /admin/users/new, /[id] | createAdminUser, updateAdminUser | Zod | Yes |
| AdminInquiryForm | /admin/inquiries/new | createAdminInquiry | Zod | Yes |
| InquiryCrm (notes) | /admin/inquiries/[id] | addInquiryNote | Yes | Yes |
| InquiryCrm (email) | /admin/inquiries/[id] | sendInquiryEmail | Yes | Yes (EmailLog) |
| InquiryCrm (appointment) | /admin/inquiries/[id] | addAppointment | Yes | Yes |
| ApiClientForm | /admin/api/new, /[id] | createApiClient, updateApiClient | Zod | Yes |
| MapSettingsForm | /admin/maps | saveMapSettings | Yes | Yes (SiteSetting) |
| InquiryForm (public) | /properties/[slug], /projects/[slug] | createInquiry | Zod | Yes |
| ContactForm (public) | /contact | submitContactForm | Zod | NO (email only) |
| Image uploads | Multiple pages | uploadFile API | File type/size | Yes |

---

## 5. Mock-Based / Non-Persistent Areas

| Area | Details |
|------|---------|
| Contact Form submissions | Form sends email via Resend but does NOT save to database. No record of contact submissions exists. |
| About page | Static hardcoded content, not editable from admin |

---

## 6. Partial / Incomplete Areas

| Area | Details |
|------|---------|
| Contact form | Sends email only; no DB persistence; no admin view of contact submissions |
| Password reset | Not implemented; no forgot-password or OTP flow |
| Customer/User backend authorization | Customer CRUD and User CRUD have no backend scope enforcement (frontend restrictions only) |
| Audit logging | No who-changed-what tracking anywhere |
| Rate limiting | No login attempt throttling |
| Image optimization | No automatic resizing/compression |
| Export | No CSV/PDF export functionality |

---

## 7. Recommended Scope for User Manual

**Include (fully working):**
- Login and navigation
- Dashboard overview
- Properties management (full CRUD + images + publishing)
- Projects management (full wizard + units + documents + 3D)
- Inquiries / CRM (full pipeline)
- Calendar schedule
- Customer management
- User management and roles
- Map settings
- API client management
- Homepage hero images
- Public site browsing
- Contact form (noting email-only limitation)

**Exclude or mark as limited:**
- Password reset (does not exist)
- Contact form database storage (does not exist)
- Backend authorization gaps (note for technical appendix only)

---

## Technical Appendix

### Database Tables (17 models)
AdminUser, Customer, Property, PropertyImage, Project, ProjectImage, ProjectDocument, ProjectUnit, Inquiry, InquiryNote, Appointment, EmailLog, ImageBank, HeroImage, ApiClient, SiteSetting

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection
- `NEXTAUTH_SECRET` — JWT signing
- `RESEND_API_KEY` — Email sending
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` — File storage
- `STORAGE_PROVIDER` — "local" or "s3"
- `NEXT_PUBLIC_MAP_LAT`, `NEXT_PUBLIC_MAP_LNG`, `NEXT_PUBLIC_MAP_ZOOM` — Map defaults

### Security Notes
- Customer Manager privilege escalation possible via direct API calls (frontend-only restriction on user creation)
- Customer CRUD has no backend authorization checks
- No rate limiting on authentication
- No audit trail
