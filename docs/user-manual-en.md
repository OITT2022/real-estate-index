# User Manual — AradRe Real Estate Index Platform
**Version:** April 2026
**Based on:** Full analysis of the system as currently implemented

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Logging In](#2-logging-in)
3. [Navigation Structure](#3-navigation-structure)
4. [Roles and Permissions](#4-roles-and-permissions)
5. [Dashboard](#5-dashboard)
6. [Property Management](#6-property-management)
7. [Project Management](#7-project-management)
8. [Inquiries / CRM](#8-inquiries--crm)
9. [Calendar Schedule](#9-calendar-schedule)
10. [Customer Management](#10-customer-management)
11. [User Management](#11-user-management)
12. [Homepage Manager](#12-homepage-manager)
13. [Map Settings](#13-map-settings)
14. [API Client Management](#14-api-client-management)
15. [Public Website](#15-public-website)
16. [Known Limitations](#16-known-limitations)
17. [FAQ](#17-faq)

---

## 1. Introduction

AradRe is a real estate index platform that includes:
- **Public website** for showcasing properties and development projects
- **Admin panel** for managing properties, projects, inquiries, customers, and users
- **CRM system** for lead management with notes, appointments, and email
- **External API** for third-party system integration
- **Multi-tenancy support** — properties and projects can be assigned to different customers (companies)

The system is built on Next.js with TypeScript, PostgreSQL database, and local or S3 file storage.

---

## 2. Logging In

**URL:** `https://[domain]/admin/login`

![Screenshot - Login Page](/docs/images/login.png)

### Screen Overview
The login page displays a split layout: an illustration on the left and a sign-in card on the right with the "Arad Real Estate" branding.

### What You See on the Screen
- **Arad Real Estate logo** — brand identity at the top of the card
- **"Sign In" heading** — with subtitle "Enter your email address and password to access admin panel"
- **Email field** — enter your admin email address
- **Password field** — enter your password (shown as dots)
- **Sign In button** — dark green button to submit credentials

### Login Steps
1. Enter your **email address**
2. Enter your **password**
3. Click **Sign In**
4. On success — you are redirected to the Dashboard
5. On failure — the message "Invalid email or password" appears below the form

### Notes / Tips
- **There is no password reset mechanism.** If you forget your password, contact a Super Admin to reset it.
- **There is no two-factor authentication (2FA/OTP).** Login is email and password only.
- A user account can be deactivated (via the "Active" field in User Management) to block login.

---

## 3. Navigation Structure

![Screenshot - Admin Sidebar](/docs/images/admin-sidebar.png)

### Screen Overview
The admin sidebar appears on the left side of every admin page. It is organized into labeled groups with icons for each page.

### What You See on the Screen
- **"Admin Panel" brand header** — with a dashboard icon at the top
- **GENERAL group** — Dashboard, Home Page
- **LISTINGS group** — Properties, Projects
- **CRM group** — Inquiries, Calendar Schedule, Customers
- **SYSTEM group** — Maps, API Clients, User Management
- **Active page** — highlighted with a teal/green background
- **Icons** — each page link has an icon to its left (grid, home, building, folder, message, calendar, users, map, key, shield)

### Navigation Groups

#### General
| Page | Icon | Description |
|------|------|-------------|
| Dashboard | Grid icon | Overall statistics and charts |
| Home Page | Home icon | Manage homepage carousel images |

#### Listings
| Page | Icon | Description |
|------|------|-------------|
| Properties | Building icon | Manage individual property listings |
| Projects | Folder icon | Manage development projects |

#### CRM
| Page | Icon | Description |
|------|------|-------------|
| Inquiries | Message icon | Manage leads and contact requests |
| Calendar Schedule | Calendar icon | Appointment calendar view |
| Customers | Users icon | Manage customer companies |

#### System
| Page | Icon | Description |
|------|------|-------------|
| Maps | Map icon | Map tile layer and default settings |
| API Clients | Key icon | Manage external API access tokens |
| User Management | Shield icon | Manage admin users, roles, and permissions |

### Notes / Tips
- Each user only sees pages they have permission to access
- Super Admins see all pages
- If a page is missing from your sidebar, contact a Super Admin for access

---

## 4. Roles and Permissions

### User Types

#### Super Admin
- Full access to all pages and all data across the platform
- Can manage all customers, users, properties, and projects
- Can create and manage additional admin users
- Sees all navigation items in the sidebar

#### Customer Manager
- Limited to pages explicitly assigned to them
- Can only see data belonging to their assigned customer (company)
- Cannot view or edit data from other customers
- When creating a property or project, the customer is automatically assigned
- Can create new users only within their own customer scope

#### Regular Admin
- Access limited to assigned pages only
- Not assigned to any specific customer

### Page Permissions
Every non-Super Admin user receives a specific list of allowed pages:

| Permission Key | Page |
|---------------|------|
| `dashboard` | Dashboard |
| `homepage` | Home Page |
| `properties` | Properties |
| `projects` | Projects |
| `inquiries` | Inquiries |
| `calendar` | Calendar Schedule |
| `customers` | Customers |
| `maps` | Maps |
| `api` | API Clients |
| `users` | User Management |

If a page is not in the user's allowed list, it will not appear in the sidebar and direct URL access will redirect to the Dashboard with a "denied" notice.

---

## 5. Dashboard

**Path:** `/admin/dashboard`

![Screenshot - Dashboard](/docs/images/Dashboard.png)

### Screen Overview
The Dashboard is the first page you see after login. It provides a real-time overview of your platform data through stat cards and charts.

### What You See on the Screen

**Page Header:**
- Title: "Dashboard"
- Subtitle: "Overview of your real estate platform"

**Stat Cards (top row, 5 cards in a horizontal grid):**
| Card | Icon Color | Shows |
|------|-----------|-------|
| Properties | Teal | Total number of properties in the system |
| Published | Blue | Number of properties live on the public site |
| Projects | Amber | Number of development projects |
| Inquiries | Rose | Number of contact inquiries received |
| Units | Purple | Total project units defined |

Each card shows a colored icon on the left, the metric label, a large number value, and a description subtitle.

**Charts Section (below the stat cards):**
- **Properties by Status** — bar or pie chart showing DRAFT / ACTIVE / SOLD / ARCHIVED breakdown
- **Inquiries Over Time** — line chart showing inquiry volume trends
- **Properties by City** — horizontal bar chart spanning full width, showing how many properties exist per city

### Main Actions
- No actions on this page — it is a read-only overview
- Click any sidebar link to navigate to a specific module

### Notes / Tips
- Data refreshes on each page load (no auto-refresh)
- Customer Managers only see statistics for their own customer's data
- If all values show 0, the system has no data yet — start by creating properties or projects

---

## 6. Property Management

### 6.1 Property List

**Path:** `/admin/properties`

![Screenshot - Property List](/docs/images/properties-list-full.png)

#### Screen Overview
The main property management page shows all properties in a filterable, sortable table.

#### What You See on the Screen

**Page Header:**
- Title: "Properties"
- Subtitle showing total count (e.g., "5 total listings")

**Filter Toolbar (horizontal bar above the table):**
| Element | Description |
|---------|-------------|
| Search box | "Search by title or city..." — with magnifying glass icon |
| All Status dropdown | Filter: All Status / Published / Draft / Sold |
| All Cities dropdown | Filter by city name |
| All Types dropdown | Filter by property type |
| View toggle | Two icons to switch between List (table) and Grid (cards) view |
| **+ Add Property** | Green button on the right — navigates to property creation |

**Table Columns:**
| Column | Content |
|--------|---------|
| PROPERTY | Thumbnail image + title + property type subtitle (e.g., "Penthouse", "Apartment") |
| CITY | City name (e.g., "Larnaca", "Nicosia") |
| PRICE | Formatted with currency symbol (e.g., "€390,000") |
| PROJECT | Project name link (e.g., "Iconic") or blank |
| CUSTOMER | Customer company name (e.g., "Landsworthy...") |
| STATUS | Green "Published" badge with toggle — click to publish/unpublish |
| API | "ON" (green) or "OFF" (gray) toggle — enables/disables API access |
| ACTIONS | Three icons: View on site (eye), Edit (pencil), Delete (trash) |

**Footer:** "Showing X of Y properties"

#### Main Actions
- **Add Property** — click the green "+ Add Property" button
- **Search** — type in the search box to filter by title or city
- **Filter** — use the Status, Cities, Types dropdowns
- **Toggle publish** — click the Status toggle on any row
- **Toggle API** — click the API toggle to enable/disable API access
- **Edit** — click the pencil icon
- **View on site** — click the eye icon to open the public page
- **Delete** — click the trash icon

### 6.2 Creating a Property

**Path:** `/admin/properties/new`

![Screenshot - Property Form](/docs/images/property-form-filled.png)

#### Screen Overview
Property creation shows a clean form with fields arranged in a two-column grid. After saving, you proceed to image upload.

#### What You See on the Screen

**Page Header:**
- Breadcrumb: "Admin > Properties > New"
- Title: "Create Property"
- Subtitle: "Fill in the details and save. You can upload images after creation."

**Form Fields (two-column grid):**

**Required Fields:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Title | Text | Property title | Sea View Penthouse |
| Slug | Text | URL path (auto-generated, marked "(auto)") | sea-view-penthouse |
| City | Text | City name | Larnaca |
| Price | Number | Price value | 820000 |
| Address | Text | Full street address | Skala Area, Larnaca |
| Description | Textarea | Detailed description (min. 10 characters) | — |
| Seller Name | Text | Contact person name | Sales Office |
| Seller Email | Email | Contact email | sales@example.com |
| Seller Phone | Text | Contact phone (min. 5 chars) | +357-99-123456 |

**Optional Fields (also in the grid):**
| Field | Type | Description |
|-------|------|-------------|
| Property type | Text | Apartment, House, Penthouse, etc. |
| Bedrooms | Number | Number of bedrooms |
| Bathrooms | Number | Number of bathrooms |
| Area sqm | Number | Area in square meters |
| Neighborhood | Text | Neighborhood name |
| Unit Number | Text | Unit identifier (e.g., "4A") |
| Floor | Number | Floor number |
| Short Description | Text | Brief summary for listing cards |
| Video URL | Text | Link to video tour |
| Website URL | Text | External website link |
| Currency | Text | Currency code (default: EUR) |
| Project | Dropdown | Link to a project |
| Customer | Dropdown | Assign to a customer |
| Cooling Type / Heating Type | Text | HVAC details |
| Meta Title / Meta Description | Text | SEO fields |

**Checkboxes (horizontal row):**
- Parking, Balcony, Swimming Pool, Elevator, Fireplace

**Publishing Checkboxes:**
- Published, Featured, Sold

#### Location Section

![Screenshot - Location Picker with Geocoding](/docs/images/property-location-closeup.png)

Below the main form, the **LOCATION** card provides three ways to set coordinates:

| Element | Description |
|---------|-------------|
| **"LOCATION" header** | Green label with subtitle "Click on the map to set coordinates" |
| **Coordinates display** | Current lat/lng shown in top-right corner (e.g., "34.9056, 33.6232") |
| **Geocoding bar** | Blue clickable link showing a pin icon + the address (e.g., "📍 Skala Area, Larnaca"). Click to auto-lookup coordinates from the address. |
| **Interactive map** | Leaflet/OpenStreetMap — click anywhere to place the marker and set coordinates |
| **Latitude input** | Manual number input below the map |
| **Longitude input** | Manual number input below the map |

**How Geocoding Works:**
1. Type a **City** and **Address** in the form fields above
2. The blue geocoding bar appears in the Location card showing the combined address
3. **Click the blue bar** — "Looking up..." appears while searching
4. The map flies to the found location and lat/lng update automatically
5. You can still click the map or type coordinates manually to fine-tune

#### Image Upload (After Saving)

![Screenshot - Property Images](/docs/images/property-images.png)

After saving the property form, the image upload section appears:

| Element | Description |
|---------|-------------|
| Success message | Green card confirming property was created, with links to continue |
| Upload area | Drag-and-drop zone or file selection button |
| Image grid | Thumbnails of uploaded images |
| Primary badge | Star/label on the primary image |
| Reorder | Drag images to change their display order |
| Image Bank button | "Browse Image Bank" link to select from the shared library |
| Delete | Remove individual images |

**Supported formats:** JPEG, PNG, WebP, GIF (max 20MB per file)

### 6.3 Editing a Property

**Path:** `/admin/properties/[id]`

Same form as creation, pre-filled with existing data. Additional features:
- Full image management (upload, delete, reorder, set primary)
- Publish/unpublish toggle
- Delete property button
- All changes save to the database on form submit

### 6.4 Property Statuses

| Status | Meaning | Trigger |
|--------|---------|---------|
| DRAFT | Not visible on the public site | Default state |
| ACTIVE | Visible on the public site | `published` is checked |
| SOLD | Marked as sold | `sold` is checked |
| ARCHIVED | No longer active | Set manually |

**Automatic logic:** If `sold` is checked → SOLD. If `published` is checked → ACTIVE. Otherwise → DRAFT.

---

## 7. Project Management

### 7.1 Project List

**Path:** `/admin/projects`

![Screenshot - Project List](/docs/images/projects-list.png)

#### Screen Overview
Lists all development projects in a filterable table with key details.

#### What You See on the Screen

**Page Header:**
- Title: "Projects"
- Subtitle with total count

**Filter Toolbar:**
| Element | Description |
|---------|-------------|
| Search box | Search by title, city, or developer name |
| Status dropdown | All / Published / Draft |
| Cities dropdown | Filter by city |
| View toggle | List / Grid switch |
| **+ Add Project** | Green button |

**Table Columns:**
| Column | Content |
|--------|---------|
| Image | Thumbnail |
| Project | Title |
| City | City name |
| Developer | Developer/builder name |
| Customer | Customer company name |
| Units | Unit count |
| Status | Publish toggle |
| API | API enabled toggle |
| Actions | Edit, Delete |

#### Main Actions
- **Add Project** — click "+ Add Project" to start the 5-step wizard
- **Toggle publish / API** — click the toggle switches
- **Edit** — opens the project in the 5-step wizard
- **Delete** — remove the project

### 7.2 Creating a Project — 5-Step Wizard

**Path:** `/admin/projects/new`

#### Screen Overview
Project creation uses a guided 5-step wizard. A horizontal step indicator at the top shows your progress through each stage.

#### Step Indicator

![Screenshot - Wizard Steps](/docs/images/project-wizard-steps.png)

The step indicator bar spans the full width with 5 numbered steps:
- **Active step** — highlighted in teal/green with white text
- **Completed steps** — show a green checkmark circle
- **Upcoming steps** — light gray background

| Step | Label | Subtitle |
|------|-------|----------|
| 1 | General Info | Project details and location |
| 2 | Media | Images and documents |
| 3 | Structure | Buildings, floors and units |
| 4 | 3D Preview | Interactive building model |
| 5 | Finish | Review and update |

Navigation buttons at the bottom: **Previous** (left) and **Next Step** (right, green).

---

#### Step 1 — General Info

![Screenshot - Project Form](/docs/images/project-form.png)

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Title | Text | Project name |
| Slug | Text | URL path (auto-generated) |
| Developer Name | Text | Developer/builder company |
| City | Text | City name |
| Address | Text | Full address |
| Description | Textarea | Detailed project description (min. 10 chars) |
| Latitude / Longitude | Map + inputs | Location via geocoding, map click, or manual entry |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Short Description | Text | Brief card summary |
| Completion Date | Text | Estimated completion (e.g., "Q4 2027") |
| Total Units | Number | Total number of units |
| Video URL / Website URL | Text | Links |
| Customer | Dropdown | Assign to a customer |
| Published / Featured | Checkbox | Publishing options |
| Meta Title / Meta Description | Text | SEO fields |

The **Location section** works identically to the property form — with the blue geocoding bar, interactive map, and manual inputs.

---

#### Step 2 — Media (Images & Documents)

![Screenshot - Project Media](/docs/images/project-media.png)

**PROJECT IMAGES section:**
- Header shows count: "11 images — drag to reorder"
- **"Upload images"** green button on the right
- Image grid with thumbnails — first image shows a "Primary" badge
- Drag images to reorder
- **"Browse Image Bank (16 images)"** link at the bottom to select from shared library

![Screenshot - Project Documents](/docs/images/project-documents.png)

**DOCUMENTS section (below images):**
- Header: "DOCUMENTS" with subtitle "Upload floor plans, brochures, and PDF files"
- **File type selector** dropdown (Floor Plan, Brochure, Price List)
- **"Upload"** green button
- **FLOOR PLANS** list showing uploaded documents (e.g., "plans.pdf — Floor Plan") with "Remove" button

**Navigation:** "Previous" button (left) and "Next Step" button (right, green).

---

#### Step 3 — Structure

![Screenshot - Project Structure](/docs/images/project-structure.png)

##### Screen Overview
Define the physical layout of the project — buildings, entrances, floors, and individual units.

##### What You See on the Screen
- **"PROJECT STRUCTURE"** header with unit count (e.g., "12 units defined")
- **"Clear Structure"** link on the right (removes all units if none have linked properties)
- **Add Unit row:** Input fields — Bldg (building number), Ent (entrance letter), Floor (number), Unit # (text), Apt (unit description) — with green **"Add"** button
- **Building hierarchy:**
  - **Building 1** header with "+ Entrance" link
  - **Entrance A** header with "+ Floor" link
  - **Floor 1** — with "+ Unit" and "Delete Floor" links
    - Unit rows showing: unit number, linked property name (blue link, e.g., "2-Bedroom-Apt"), and **"Unlink"** button
  - **Floor 2**, **Floor 3**, etc.

##### Main Actions
- **Add unit** — fill in the fields at the top and click "Add"
- **Add floor** — click "+ Floor" under an entrance
- **Add entrance** — click "+ Entrance" under a building
- **Link property** — select a property to associate with a unit
- **Unlink** — disconnect a property from a unit
- **Delete floor** — click "Delete Floor" (only if no units have linked properties)
- **Clear all** — click "Clear Structure" to remove everything

---

#### Step 4 — 3D Preview

![Screenshot - 3D Preview](/docs/images/project-3d.png)

##### Screen Overview
A 3D visualization of the project structure rendered from the units defined in Step 3.

##### What You See on the Screen
- **"3D Building Preview"** header showing unit count and building count (e.g., "12 units · 1 building(s)")
- **"Debug"** link, **"Craft It!"** green button (regenerates the 3D model), **"Save"** button
- **3D viewport** — large interactive 3D rendering of the building with environment lighting
- **Right panel tabs:** Facades, Environment, Unit Info
  - **Facades:** Upload images for Front, Left, Right, Back building faces
  - **Environment:** Upload HDR/EXR file for realistic lighting (up to 100MB)
  - **Unit Info:** View details for selected units

##### Main Actions
- **Rotate/zoom/pan** — interact with the 3D model using mouse
- **Craft It!** — regenerate the 3D model from current structure
- **Upload facade images** — add textures to building faces
- **Upload environment** — add HDR/EXR for realistic lighting
- **Save** — persist changes

---

#### Step 5 — Finish

![Screenshot - Project Finish](/docs/images/project-finish.png)

##### What You See on the Screen
- All 5 step indicators show green checkmarks
- **"Project Updated"** heading with checkmark icon
- Subtitle: "All changes are saved automatically. Review the summary below."
- **Summary stats in 4 columns:**
  - Images count (e.g., "11")
  - Documents count (e.g., "1")
  - Units count (e.g., "12")
  - Properties count (e.g., "3")
- **"Back to Projects"** green button

---

### 7.3 Project Statuses

| Status | Meaning |
|--------|---------|
| DRAFT | Not visible on the public site |
| ACTIVE | Published and visible |
| COMPLETED | Construction completed |
| ARCHIVED | No longer active |

---

## 8. Inquiries / CRM

### 8.1 Inquiry List

**Path:** `/admin/inquiries`

**NEED FURTHER IMAGE** — `inquiries-list.png`

#### Screen Overview
Lists all inquiries (leads) received from the public website or created manually.

#### What You See on the Screen

**Page Header:**
- Title: "Inquiries"
- Subtitle with total count

**Filter Toolbar:**
| Element | Description |
|---------|-------------|
| Search box | Search by name, email, or property |
| Status dropdown | All / New / In Progress / Closed |
| Customer dropdown | Filter by customer company |
| Project dropdown | Filter by project |
| **+ Add Inquiry** | Green button — create inquiry manually |

**Table Columns:**
| Column | Content |
|--------|---------|
| Name | Contact name (phone shown as subtitle) |
| Email | Contact email |
| Property | Linked property title |
| Project | Project name tag (if applicable) |
| Customer | Customer company name |
| Status | Colored badge: **blue** = new, **amber** = in-progress, **green** = closed |
| Date | Inquiry creation date |
| Action | Eye icon — opens the CRM detail view |

#### Main Actions
- **Add Inquiry** — create a new inquiry manually
- **Open CRM** — click the eye icon on any row to open the full CRM view
- **Filter** — use the dropdowns to narrow results

### 8.2 Creating an Inquiry

**Path:** `/admin/inquiries/new`

**NEED FURTHER IMAGE** — `inquiry-create.png`

#### What You See on the Screen

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Full Name | Yes | Text | Contact person name |
| Email | Yes | Email | Contact email address |
| Phone | No | Text | Phone number |
| Message | Yes | Textarea | Inquiry content/notes |
| Property | Yes | Dropdown | Which property this inquiry relates to |
| Project | No | Dropdown | Optional project association |

Click **Save** to create the inquiry. It will appear in the Inquiries list with "new" status.

### 8.3 Managing an Inquiry — CRM View

**Path:** `/admin/inquiries/[id]`

**NEED FURTHER IMAGE** — `inquiry-crm.png`

#### Screen Overview
The CRM view is a comprehensive lead management screen for a single inquiry.

#### What You See on the Screen

**Header Area:**
| Element | Description |
|---------|-------------|
| Back link | "← Back to inquiries" |
| Contact name | Large heading with the person's name |
| Contact info | Email and phone displayed below the name |
| Status buttons | Three buttons on the right: **new** / **in-progress** / **closed** — click to change status |

**Context Card:**
- Linked property (clickable link)
- Linked project (if applicable)
- "Received" date

**Two-Column Layout:**

**Left Column — Action Cards:**

| Card | Fields | Button |
|------|--------|--------|
| **Add Note** | Textarea for free-text note | "Save Note" |
| **Schedule Appointment** | Date/time picker + summary text input | "Schedule" |
| **Send Email** | Subject input + body textarea | "Send Email" |

**Right Column — Activity Timeline:**
A scrollable timeline showing all activity in chronological order:

| Activity Type | Badge | Display |
|---------------|-------|---------|
| Initial inquiry | Gray "Initial" | Original message text |
| Note | Blue "Note" | Note content with timestamp |
| Appointment | Purple "Appt" | Summary, date/time, status buttons (scheduled/completed/cancelled) |
| Email | Green "Email" | Subject, body, recipient |

#### Main Actions
- **Change status** — click new / in-progress / closed buttons
- **Add a note** — type in the note box and click "Save Note"
- **Schedule appointment** — pick date/time, enter summary, click "Schedule"
- **Send email** — enter subject and body, click "Send Email" (sent via Resend, logged in timeline)
- **Update appointment** — click status buttons on timeline appointments

#### Inquiry Statuses

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| new | Blue | New inquiry, not yet handled |
| contacted | Amber | Initial contact made |
| meeting_scheduled | Amber | A meeting has been scheduled |
| negotiating | Amber | In negotiation |
| closed_won | Green | Successfully closed |
| closed_lost | Green | Lost / no deal |

### Notes / Tips
- Emails are actually sent to the contact's email address via the Resend email service
- All emails are permanently logged in the activity timeline
- Notes and appointments are visible to all users with inquiry access

---

## 9. Calendar Schedule

**Path:** `/admin/calendar`

![Screenshot - Calendar](/docs/images/calendar.png)

### Screen Overview
An interactive calendar showing all scheduled appointments across all inquiries.

### What You See on the Screen

**Page Header:**
- Title: "Calendar Schedule"
- Subtitle with event count

**Filter Bar:**
| Element | Description |
|---------|-------------|
| Customer dropdown | Filter appointments by customer |
| Status dropdown | All / Scheduled / Completed / Cancelled |
| Clear Filters button | Reset filters |
| Event count | Number of appointments displayed |

**Calendar View:**
- **Month view** (default) — grid of days with colored event bars
- **Week view** — hourly time slots with events
- **Day view** — single day with hourly slots
- **List view** — plain list of upcoming events
- View tabs at the top right of the calendar

**Event Colors:**
| Color | Status |
|-------|--------|
| Blue | Scheduled |
| Green | Completed |
| Red | Cancelled |

**Event Click Modal:**
When you click an event, a detail modal appears showing:
| Field | Description |
|-------|-------------|
| Contact name | The inquiry contact person |
| Property title | Linked property |
| Date & Time | Appointment date and time |
| Appointment Status | Badge (scheduled/completed/cancelled) |
| Inquiry Status | Badge (new/in-progress/closed) |
| Email / Phone | Contact details |
| Customer / Project | Associated records |
| Summary | Appointment summary text |
| Inquiry Message | Original inquiry message |
| "Open Inquiry" button | Navigate to the full CRM view |

### Main Actions
- **Navigate months** — use left/right arrows
- **Switch views** — click Month / Week / Day / List tabs
- **Filter** — use dropdowns to narrow events
- **Click event** — view appointment details in a modal
- **Open Inquiry** — jump to the CRM view from the modal

### Notes / Tips
- Appointments are created from the Inquiry CRM screen, not directly on the calendar
- Maximum 3 events shown per day cell in month view — click "+more" to see all
- Calendar data comes from the Appointment table, linked through Inquiries

---

## 10. Customer Management

### 10.1 Customer List

**Path:** `/admin/customers`

**NEED FURTHER IMAGE** — `customers-list.png`

#### Screen Overview
Lists all customer companies registered in the system.

#### What You See on the Screen

**Page Header:**
- Title: "Customers"
- Subtitle with count

**Filter Toolbar:**
| Element | Description |
|---------|-------------|
| Search box | Search by company name, contact name, or email |
| View toggle | List / Grid switch |
| **+ Add Customer** | Green button |

**Table Columns (List View):**
| Column | Content |
|--------|---------|
| Logo | Company logo (44px circle) or initial letter |
| Company | Company name |
| Contact | Primary contact name |
| Email | Contact email |
| Phone | Contact phone |
| Created | Creation date |
| Actions | View Projects (folder icon), View Properties (building icon), Edit (pencil), Delete (trash) |

#### Main Actions
- **Add Customer** — click the "+ Add Customer" button
- **View projects** — click the folder icon to see the customer's projects
- **View properties** — click the building icon to see the customer's properties
- **Edit** — click the pencil icon
- **Delete** — click the trash icon (ensure no linked records first)

### 10.2 Editing a Customer

**Path:** `/admin/customers/[id]`

**NEED FURTHER IMAGE** — `customer-edit.png`

#### What You See on the Screen

**Customer Form:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Company Name | Yes | Text | Company name |
| Logo | No | Upload | Company logo image |
| Description | No | Textarea | Company description |
| Contact Name | No | Text | Primary contact |
| Contact Email | No | Email | Contact email |
| Contact Phone | No | Text | Contact phone |

**Below the Form — Linked Records:**
- **Projects section** — list of projects belonging to this customer, with quick "Create new project" link
- **Properties section** — list of properties belonging to this customer, with quick "Create new property" link

### Notes / Tips
- Deleting a customer does not automatically delete linked properties or projects — unlink them first
- Customer Managers can only see their own customer record

---

## 11. User Management

### 11.1 User List

**Path:** `/admin/users`

**NEED FURTHER IMAGE** — `users-list.png`

#### Screen Overview
Lists all admin users with their roles and status.

#### What You See on the Screen

**Page Header:**
- Title: "User Management"
- Subtitle with count

**Filter Toolbar:**
| Element | Description |
|---------|-------------|
| Search box | Search by name or email |
| Role dropdown | All / Super Admin / User |
| Status dropdown | All / Active / Inactive |
| **+ Add User** | Green button |

**Table Columns:**
| Column | Content |
|--------|---------|
| Name | User's full name |
| Email | Email address |
| Role | Badge: "Super Admin" (accent color) or "User" (gray) |
| Pages | Number of allowed pages, or "All" for Super Admins |
| Status | Badge: "Active" (green) or "Inactive" (red) |
| Actions | Edit icon, Delete icon (disabled for Super Admins) |

#### Main Actions
- **Add User** — create a new admin user
- **Edit** — modify user details, role, or permissions
- **Delete** — remove a user (Super Admin accounts cannot be deleted)

### 11.2 Creating / Editing a User

**Path:** `/admin/users/new` or `/admin/users/[id]`

**NEED FURTHER IMAGE** — `user-form.png`

#### What You See on the Screen

**User Form Fields:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Name | Yes | Text | Full name |
| Email | Yes | Email | Must be unique across all users |
| Password | Yes (create) / No (edit) | Password | Leave blank when editing to keep current |
| Phone | No | Text | Phone number |
| Profile Image | No | Text/URL | Profile picture URL |
| Super Admin | No | Checkbox | Grants full access to everything |
| Customer | No | Dropdown | Assign to a customer (makes them a Customer Manager) |
| Active | Yes | Checkbox | Whether this user can log in |

**Page Permissions Section:**
A grid of checkboxes — one for each admin page:
- Dashboard, Home Page, Properties, Projects
- Inquiries, Calendar Schedule, Customers
- Maps, API Clients, User Management

### Notes / Tips
- Super Admins automatically have access to all pages — the checkboxes are irrelevant for them
- When a Customer is assigned, the user becomes a Customer Manager scoped to that customer's data
- Inactive users cannot log in
- Super Admin accounts cannot be deleted

---

## 12. Homepage Manager

**Path:** `/admin/homepage`

**NEED FURTHER IMAGE** — `homepage-hero.png`

### Screen Overview
Manage the hero carousel images displayed at the top of the public homepage.

### What You See on the Screen

**Page Header:**
- Title: "Home Page"
- Subtitle: "Manage hero images and slideshow on the homepage"

**Hero Images Card:**
| Element | Description |
|---------|-------------|
| Header | "Hero Images" + count + "Upload images" button |
| Image grid | Thumbnail grid of all uploaded hero images |
| Active badge | Green badge on active images |
| Inactive appearance | Faded (50% opacity) for inactive images |
| Toggle button | Checkmark (active) / circle (inactive) icon to switch |
| Delete button | X icon to remove an image |

### Main Actions
- **Upload** — click "Upload images" to add new hero images (JPEG, PNG, WebP, GIF, up to 20MB)
- **Activate/Deactivate** — click the toggle icon on each image
- **Delete** — click the X icon to remove

### Notes / Tips
- Only active images appear in the public homepage carousel
- Deactivating an image hides it without deleting it

---

## 13. Map Settings

**Path:** `/admin/maps`

**NEED FURTHER IMAGE** — `map-settings.png`

### Screen Overview
Configure the default map appearance used across all maps in the system (admin forms and public pages).

### What You See on the Screen

**Tile Layer Section:**
A grid of visual radio buttons — each shows a small map preview:

| Option | Source | Style |
|--------|--------|-------|
| OpenStreetMap | Free | Standard street map |
| CartoDB Light | Free | Clean, light background |
| CartoDB Dark | Free | Dark theme |
| Satellite (Esri) | Esri | Aerial photography |
| Topographic (Esri) | Esri | Elevation contours |
| Google Streets | Google | Google Maps roads |
| Google Satellite | Google | Satellite imagery |
| Google Hybrid | Google | Satellite with road labels |

**Default Map View Section:**
| Field | Description | Default |
|-------|-------------|---------|
| Default Latitude | Center point latitude | 32.0853 |
| Default Longitude | Center point longitude | 34.7818 |
| Default Zoom | Zoom level (1-18) | 15 |

**Save Button:** "Save map settings" — shows "Settings saved!" on success.

### Main Actions
- **Select tile layer** — click to change the map style globally
- **Set center/zoom** — adjust default map position
- **Save** — persist settings to the database

### Notes / Tips
- Changes affect all maps: property/project forms and public detail pages
- Settings are stored in the database and applied on next page load

---

## 14. API Client Management

### 14.1 API Client List

**Path:** `/admin/api`

**NEED FURTHER IMAGE** — `api-list.png`

#### Screen Overview
Manage access tokens for the external REST API.

#### What You See on the Screen

**API Endpoints Info Card (top of page):**
A reference card showing the available endpoints in code format:
```
GET /api/v1/properties
GET /api/v1/projects
Authorization: Bearer <token>
```

**Table Columns:**
| Column | Content |
|--------|---------|
| Name | Client name |
| Scope | "All Customers" or specific customer name |
| Token | Token prefix (first 8 characters) with "..." |
| Fields | Count: "XP / YPr" (X property fields / Y project fields) |
| Status | Badge: Active / Inactive |
| Created | Creation date |
| Actions | Edit icon, menu for additional actions |

#### Main Actions
- **Add Client** — click "+ Add Client"
- **Edit** — modify client settings
- **Regenerate token** — generate a new token (revokes the old one)
- **Delete** — remove the client

### 14.2 Creating an API Client

**Path:** `/admin/api/new`

**NEED FURTHER IMAGE** — `api-form.png`

#### What You See on the Screen

**Client Form:**
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Name | Yes | Text | Client identifier name |
| Description | No | Textarea | What this client is for |
| Scope Type | Yes | Radio | "All" (full access) or "Customer" (scoped) |
| Customer | Conditional | Dropdown | Required when scope = "Customer" |
| Active | Yes | Checkbox | Whether the token is active |

**Field Access — Property Fields:**
Grid of checkboxes — select which property fields the client can read (title, slug, description, price, city, address, latitude, longitude, bedrooms, bathrooms, etc.)

**Field Access — Project Fields:**
Grid of checkboxes for project fields (title, slug, description, city, address, developerName, etc.)

**Additional Options:**
- Include Images (checkbox)
- Include Documents (checkbox)

#### After Creation
A one-time token is displayed — **copy it immediately!** The token is shown only once and cannot be recovered.

### API Usage

```
GET /api/v1/properties?city=Larnaca&page=1&limit=50
Authorization: Bearer <your-token>
```

**Query Parameters (Properties):**
| Parameter | Description | Default |
|-----------|-------------|---------|
| city | Filter by city name | — |
| propertyType | Filter by type | — |
| page | Page number | 1 |
| limit | Results per page (max 100) | 50 |

**Enabling API per Property/Project:**
Each property and project has an **API** toggle on its list page and edit page. Only records with API enabled appear in API responses.

### Notes / Tips
- Token regeneration permanently revokes the old token
- Customer-scoped clients only see data belonging to their assigned customer
- Field-level access control means each client can have a different data view

---

## 15. Public Website

### 15.1 Homepage

**URL:** `/`

![Screenshot - Public Homepage](/docs/images/public-home.png)

#### Screen Overview
The public homepage is the main entry point for visitors browsing properties.

#### What You See on the Screen

**Hero Section:**
- Full-width image carousel (from Hero Images managed in admin)
- Overlay search card with:
  - Heading: "Find Your Dream Property"
  - Filter bar: City dropdown, Property Type dropdown, Bedrooms, Price Range
  - Stats row: Properties count, Cities count, Featured count

**Below the Hero:**
- **"How It Works"** section — "Find Your Home in 3 Steps" with 3 explanatory cards
- **Featured Listings** section — "Handpicked Properties" with property cards in a 3-column grid
- **Development Projects** section — project cards in a 3-column grid
- **All Properties / Search Results** — full property listing or filtered results

### 15.2 Property Detail Page

**URL:** `/properties/[slug]`

![Screenshot - Public Property Page](/docs/images/public-property.png)

#### What You See on the Screen

**Top:** Full-width image gallery with navigation arrows

**Header:** Property type badge, title (large), address, price (prominent), specs row (Beds, Bath, sqm)

**Two-Column Layout:**

| Left Column (Main Content) | Right Column (Sidebar) |
|---------------------------|----------------------|
| **Details & Features** — grid of specs with icons (beds, bath, area, floor, parking, balcony, pool, elevator, fireplace, cooling, heating) | **Inquiry Form** — contact form (name, email, phone, message) to reach the seller |
| **Description** — short + full description | |
| **Video** — embedded video (if configured) | |
| **Location** — interactive map with marker + address | |

**Below:** Related properties section — 3-column grid of similar properties in the same city.

### 15.3 Project Detail Page

**URL:** `/projects/[slug]`

![Screenshot - Public Project Page](/docs/images/public-project.png)

#### What You See on the Screen

**Header:** City label, project title, address, developer name card

**Gallery:** Full-width image carousel

**Two-Column Layout:**

| Left Column | Right Column |
|-------------|-------------|
| **Project Details** — Units, Completion date, Developer, City | **Project Inquiry Form** — contact form |
| **Description** — short + full text | |
| **Documents & Downloads** — downloadable PDFs with icons | |
| **Video** — embedded video (if configured) | |
| **Building Structure** — visual building/floor/unit layout | |

**Below:** Properties in project — grid of linked property cards.

### 15.4 Projects Listing

**URL:** `/projects`

**NEED FURTHER IMAGE** — `public-projects.png`

- Page heading with breadcrumb
- Grid of all published project cards
- Each card shows: image, title, city, developer, unit count

### 15.5 Contact Page

**URL:** `/contact`

![Screenshot - Contact Page](/docs/images/public-contact.png)

#### What You See on the Screen

**Two-Column Layout:**

| Left Column | Right Column |
|-------------|-------------|
| **Contact Form card** — Name, Email, Phone, Message fields + Submit button | **"Get In Touch"** heading + description paragraph |
| | Office location card (MapPin icon) |
| | Email card (Mail icon) |
| | Phone card (Phone icon) |
| | Contact illustration image |

**Important:** This form sends an email only (to the site owner via Resend). It does **not** save the submission to the database and does **not** appear in the Inquiries list.

### 15.6 About Page

**URL:** `/about`

- Page hero with "About Us" heading
- Two-column: illustration image + company description
- Stats row: Properties count, Cities count, Clients count
- "Why Choose Us" section with 3 feature cards (Verified Listings, Rich Media, Direct Contact)

---

## 16. Known Limitations

| Area | Details |
|------|---------|
| Password Reset | No password reset mechanism exists. Contact a Super Admin for reset. |
| Two-Factor Auth | Not implemented. Login is password-only. |
| Contact Form | Sends email only; not saved to the database and does not appear in Inquiries. |
| About Page | Static content; not editable from the admin panel. |
| Data Export | No CSV or PDF export functionality. |
| Image Optimization | Uploaded images are not automatically resized or compressed. |
| Audit Log | No record of who performed which action or when. |

---

## 17. FAQ

### How do I publish a property to the website?
When editing the property, check the **Published** checkbox and save. The property will receive ACTIVE status and appear on the public site.

### How do I mark a property as sold?
When editing the property, check the **Sold** checkbox and save. The property will receive SOLD status.

### How do I add a property to a project?
When creating or editing a property, select a project in the **Project** dropdown. Alternatively, in the project edit page (Step 3 — Structure), link a property to a specific unit.

### How does Geocoding work?
1. Enter a **city** and **address** in the form fields
2. Scroll down to the Location section
3. A blue clickable bar appears showing the full address with a pin icon
4. Click the bar — "Looking up..." appears briefly, then the map flies to the found location and coordinates update automatically
5. You can still click the map or type coordinates manually to fine-tune

### I forgot my password, what do I do?
There is no self-service password reset. Contact a Super Admin to reset your password from User Management.

### How do I create an API token?
Navigate to **System > API Clients > + Add Client**, configure the permissions and field access, and after creation **copy the token immediately** — it is displayed only once and cannot be recovered.

### Why don't I see all pages in the sidebar?
Your access is restricted by a system administrator based on your role and allowed pages. Contact a Super Admin for additional permissions.

### Why don't Contact page submissions appear in the Inquiries list?
The public "Contact" form only sends an email and does not save to the database. Only property-specific and project-specific inquiry forms save to the Inquiries list.

### How do I assign a property to a customer?
When creating or editing a property, select the customer in the **Customer** dropdown. If you are a Customer Manager, the customer is assigned automatically.

### Can I use the API without enabling it per property?
No. Each property and project must have the **API** toggle turned on to be accessible through the external API.

### How do I change the map style across the site?
Go to **System > Maps**, select a tile layer, optionally adjust the default center and zoom, and click **Save map settings**. The change applies to all maps.

---

## Technical Appendix (Internal Use)

### Modules Found
Authentication, Dashboard, Properties, Projects, Inquiries/CRM, Calendar, Customers, Users, Homepage, Maps, API Clients, Image Bank, Contact Form, Public Site

### Routes
**Public:** `/`, `/projects`, `/projects/[slug]`, `/properties/[slug]`, `/about`, `/contact`
**Admin:** `/admin/login`, `/admin/dashboard`, `/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]`, `/admin/inquiries`, `/admin/inquiries/new`, `/admin/inquiries/[id]`, `/admin/calendar`, `/admin/customers`, `/admin/customers/new`, `/admin/customers/[id]`, `/admin/users`, `/admin/users/new`, `/admin/users/[id]`, `/admin/homepage`, `/admin/maps`, `/admin/api`, `/admin/api/new`, `/admin/api/[id]`
**API:** `/api/auth/[...nextauth]`, `/api/health`, `/api/v1/properties`, `/api/v1/projects`, `/api/upload`, `/api/upload/presign`

### Roles Found
SuperAdmin, CustomerManager, RegularAdmin

### Database Tables (17)
AdminUser, Customer, Property, PropertyImage, Project, ProjectImage, ProjectDocument, ProjectUnit, Inquiry, InquiryNote, Appointment, EmailLog, ImageBank, HeroImage, ApiClient, SiteSetting

### Mock-Only Features
None. All displayed features are connected to the database.

### Partial / Incomplete Areas
- **Contact form** — sends email only, does not save to database
- **About page** — static content, not editable from admin
- **Backend authorization for users and customers** — enforcement is frontend-only, not server-side

---

## Screenshot Coverage

### Included Screenshots (22)
| Section | Filename | Status |
|---------|----------|--------|
| Login | `login.png` | Included |
| Sidebar | `admin-sidebar.png` | Included |
| Dashboard | `Dashboard.png` | Included |
| Properties List | `properties-list-full.png` | Included |
| Property Form | `property-form-filled.png` | Included |
| Property Location | `property-location-closeup.png` | Included |
| Property Images | `property-images.png` | Included |
| Projects List | `projects-list.png` | Included |
| Project Wizard Steps | `project-wizard-steps.png` | Included |
| Project Form | `project-form.png` | Included |
| Project Media | `project-media.png` | Included |
| Project Documents | `project-documents.png` | Included |
| Project Structure | `project-structure.png` | Included |
| Project 3D | `project-3d.png` | Included |
| Project Finish | `project-finish.png` | Included |
| Calendar | `calendar.png` | Included |
| Public Home | `public-home.png` | Included |
| Public Property | `public-property.png` | Included |
| Public Project | `public-project.png` | Included |
| Public Contact | `public-contact.png` | Included |

### Still Needed (9)
| Section | Filename | How to Capture |
|---------|----------|----------------|
| Inquiries List | `inquiries-list.png` | `/admin/inquiries` — with 2-3 inquiries |
| Inquiry Create | `inquiry-create.png` | `/admin/inquiries/new` — empty form |
| Inquiry CRM | `inquiry-crm.png` | `/admin/inquiries/[id]` — with notes/appointments |
| Customers List | `customers-list.png` | `/admin/customers` — with 1-2 customers |
| Customer Edit | `customer-edit.png` | `/admin/customers/[id]` — with linked records |
| Users List | `users-list.png` | `/admin/users` — with 2+ users |
| User Form | `user-form.png` | `/admin/users/new` — with permissions visible |
| Homepage Manager | `homepage-hero.png` | `/admin/homepage` — with 2+ images |
| Map Settings | `map-settings.png` | `/admin/maps` — tile options visible |
| API Client List | `api-list.png` | `/admin/api` — with 1+ client |
| API Client Form | `api-form.png` | `/admin/api/new` — with field checkboxes |
| Public Projects | `public-projects.png` | `/projects` — with published projects |
