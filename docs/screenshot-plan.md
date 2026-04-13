# Screenshot Plan — AradRe User Manual

## Instructions for Capturing

- **Browser:** Chrome or Edge, 1440px wide window
- **Login:** admin@example.com / 123456 (Super Admin)
- **Save to:** `/docs/images/` folder
- **Format:** PNG, named exactly as shown below
- **State:** Ensure sample data exists (at least 2-3 properties, 1 project, 1 inquiry, 1 customer)

---

## Screenshot List by Module

### 1. Login (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 1 | `login.png` | `/admin/login` | Login page with email/password fields | Empty form, not logged in |

### 2. Dashboard (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 2 | `dashboard.png` | `/admin/dashboard` | Full dashboard with stat cards and charts | Logged in as Super Admin, sample data present |

### 3. Properties (4 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 3 | `properties-list.png` | `/admin/properties` | Property list table with filters | At least 2-3 properties exist |
| 4 | `property-form.png` | `/admin/properties/new` | Property creation form (Step 1) — top half with required fields | Empty form |
| 5 | `property-location.png` | `/admin/properties/new` | Location picker section with geocoding bar visible | City and address filled in, blue geocoding bar visible |
| 6 | `property-images.png` | `/admin/properties/[id]` | Image manager on an existing property | Property with 2+ images uploaded |

### 4. Projects (5 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 7 | `projects-list.png` | `/admin/projects` | Project list table | At least 1-2 projects |
| 8 | `project-wizard-steps.png` | `/admin/projects/new` | Wizard step indicator bar (all 5 steps visible) | Step 1 active |
| 9 | `project-form.png` | `/admin/projects/new` | Project form (Step 1) | Empty form |
| 10 | `project-structure.png` | `/admin/projects/[id]` | Project structure editor (Step 4) with buildings/floors/units | Project with generated structure |
| 11 | `project-3d.png` | `/admin/projects/[id]` | 3D preview (Step 5) | Project with structure defined |

### 5. Inquiries / CRM (3 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 12 | `inquiries-list.png` | `/admin/inquiries` | Inquiry list table with status badges | At least 2-3 inquiries with mixed statuses |
| 13 | `inquiry-crm.png` | `/admin/inquiries/[id]` | Full CRM view — header, status, context, two-column layout | Inquiry with at least 1 note and 1 appointment |
| 14 | `inquiry-create.png` | `/admin/inquiries/new` | Manual inquiry creation form | Empty form, property dropdown visible |

### 6. Calendar (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 15 | `calendar.png` | `/admin/calendar` | Calendar month view with appointment events | At least 2-3 appointments on current month |

### 7. Customers (2 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 16 | `customers-list.png` | `/admin/customers` | Customer list table | At least 1-2 customers |
| 17 | `customer-edit.png` | `/admin/customers/[id]` | Customer edit page showing form + linked projects/properties | Customer with linked data |

### 8. Users (2 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 18 | `users-list.png` | `/admin/users` | User list table with role badges | At least 2 users (1 Super Admin + 1 regular) |
| 19 | `user-form.png` | `/admin/users/new` | User creation form with page permissions checkboxes visible | Empty form, permissions section visible |

### 9. Homepage Manager (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 20 | `homepage-hero.png` | `/admin/homepage` | Hero image manager with image grid | At least 2 hero images uploaded |

### 10. Map Settings (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 21 | `map-settings.png` | `/admin/maps` | Map settings page with tile layer options and default view inputs | Current settings loaded |

### 11. API Clients (2 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 22 | `api-list.png` | `/admin/api` | API clients table with endpoint info card | At least 1 API client |
| 23 | `api-form.png` | `/admin/api/new` | API client creation form with field checkboxes | Empty form, field selectors visible |

### 12. Public Site (5 screenshots)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 24 | `public-home.png` | `/` | Public homepage with hero, search bar, and listings | Published properties and projects exist |
| 25 | `public-property.png` | `/properties/[slug]` | Property detail page — gallery, details, inquiry form | A published property with images |
| 26 | `public-project.png` | `/projects/[slug]` | Project detail page — gallery, details, documents | A published project with images |
| 27 | `public-contact.png` | `/contact` | Contact page with form and contact info | Static page |
| 28 | `public-projects.png` | `/projects` | Projects listing page | At least 1 published project |

### 13. Sidebar Navigation (1 screenshot)
| # | Filename | URL | Description | State Required |
|---|----------|-----|-------------|----------------|
| 29 | `admin-sidebar.png` | `/admin/dashboard` | Sidebar navigation showing all groups and links | Logged in as Super Admin |

---

## Summary

| Module | Screenshots | Filenames |
|--------|------------|-----------|
| Login | 1 | login.png |
| Dashboard | 1 | dashboard.png |
| Properties | 4 | properties-list, property-form, property-location, property-images |
| Projects | 5 | projects-list, project-wizard-steps, project-form, project-structure, project-3d |
| Inquiries/CRM | 3 | inquiries-list, inquiry-crm, inquiry-create |
| Calendar | 1 | calendar.png |
| Customers | 2 | customers-list, customer-edit |
| Users | 2 | users-list, user-form |
| Homepage | 1 | homepage-hero.png |
| Maps | 1 | map-settings.png |
| API Clients | 2 | api-list, api-form |
| Public Site | 5 | public-home, public-property, public-project, public-contact, public-projects |
| Sidebar | 1 | admin-sidebar.png |
| **Total** | **29** | |

## Duplicates Check
- No duplicate screens identified
- Each screenshot covers a unique view/state

## Coverage Check
- All 10 admin modules covered
- All 5 public pages covered
- All CRUD flows covered (list + create/edit)
- CRM detail view covered
- Wizard steps covered
- Navigation covered
