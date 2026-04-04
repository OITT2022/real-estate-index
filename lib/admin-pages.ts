export const ADMIN_PAGES = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "homepage", label: "Home Page", path: "/admin/homepage" },
  { key: "properties", label: "Properties", path: "/admin/properties" },
  { key: "projects", label: "Projects", path: "/admin/projects" },
  { key: "inquiries", label: "Inquiries", path: "/admin/inquiries" },
  { key: "maps", label: "Maps", path: "/admin/maps" },
  { key: "customers", label: "Customers", path: "/admin/customers" },
  { key: "api", label: "API Clients", path: "/admin/api" },
  { key: "users", label: "User Management", path: "/admin/users" },
] as const;

export const ALL_PAGE_KEYS = ADMIN_PAGES.map((p) => p.key);

export function getPageKeyFromPath(path: string): string | null {
  // Match /admin/properties, /admin/properties/new, /admin/properties/[id] etc.
  for (const page of ADMIN_PAGES) {
    if (path === page.path || path.startsWith(page.path + "/")) {
      return page.key;
    }
  }
  return null;
}
