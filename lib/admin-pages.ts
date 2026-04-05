import {
  LayoutDashboard, Home, Building2, FolderKanban,
  MessageSquare, Map, Users, Key, Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminPage {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
  group: "general" | "listings" | "crm" | "system";
}

export const ADMIN_PAGES: AdminPage[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, group: "general" },
  { key: "homepage", label: "Home Page", path: "/admin/homepage", icon: Home, group: "general" },
  { key: "properties", label: "Properties", path: "/admin/properties", icon: Building2, group: "listings" },
  { key: "projects", label: "Projects", path: "/admin/projects", icon: FolderKanban, group: "listings" },
  { key: "inquiries", label: "Inquiries", path: "/admin/inquiries", icon: MessageSquare, group: "crm" },
  { key: "customers", label: "Customers", path: "/admin/customers", icon: Users, group: "crm" },
  { key: "maps", label: "Maps", path: "/admin/maps", icon: Map, group: "system" },
  { key: "api", label: "API Clients", path: "/admin/api", icon: Key, group: "system" },
  { key: "users", label: "User Management", path: "/admin/users", icon: Shield, group: "system" },
];

export const ALL_PAGE_KEYS = ADMIN_PAGES.map((p) => p.key);

export const PAGE_GROUPS: { key: string; label: string }[] = [
  { key: "general", label: "General" },
  { key: "listings", label: "Listings" },
  { key: "crm", label: "CRM" },
  { key: "system", label: "System" },
];

export function getPageKeyFromPath(path: string): string | null {
  for (const page of ADMIN_PAGES) {
    if (path === page.path || path.startsWith(page.path + "/")) {
      return page.key;
    }
  }
  return null;
}
