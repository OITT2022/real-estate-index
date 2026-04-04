import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type SessionUser = {
  id: string;
  isSuperAdmin: boolean;
  allowedPages: string[];
  customerId: string | null;
};

/**
 * Get the current admin user's session with typed fields.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as SessionUser;
  return {
    id: u.id,
    isSuperAdmin: u.isSuperAdmin ?? false,
    allowedPages: u.allowedPages ?? [],
    customerId: u.customerId ?? null,
  };
}

/** True if the user is a customer manager (has customerId, not super admin). */
export function isCustomerManager(user: SessionUser): boolean {
  return !user.isSuperAdmin && !!user.customerId;
}

/**
 * Returns a Prisma `where` filter for customerId scoping.
 * Super admins get no filter (undefined). Customer managers get their customerId.
 */
export function customerScope(user: SessionUser): { customerId: string } | undefined {
  if (user.isSuperAdmin) return undefined;
  if (user.customerId) return { customerId: user.customerId };
  return { customerId: "__none__" }; // no customer assigned = see nothing
}

/**
 * Returns a Prisma `where` filter for properties scoped to a customer.
 * Properties belong to customer either directly or through their project.
 */
export function propertyCustomerScope(user: SessionUser) {
  if (user.isSuperAdmin) return undefined;
  if (!user.customerId) return { id: "__none__" };
  return {
    OR: [
      { customerId: user.customerId },
      { project: { customerId: user.customerId } },
    ],
  };
}

/**
 * Check if a user can access a specific customer's data.
 */
export function canAccessCustomer(user: SessionUser, customerId: string | null): boolean {
  if (user.isSuperAdmin) return true;
  if (!customerId) return true; // no customer = unscoped
  return user.customerId === customerId;
}

/**
 * Build userScope for form components.
 * Returns null for super admins (no restriction) or { customerId, customerName } for customer managers.
 */
export async function getUserScope(user: SessionUser): Promise<{ customerId: string; customerName: string } | null> {
  if (user.isSuperAdmin || !user.customerId) return null;
  const { db } = await import("@/lib/db");
  const customer = await db.customer.findUnique({ where: { id: user.customerId }, select: { companyName: true } });
  if (!customer) return null;
  return { customerId: user.customerId, customerName: customer.companyName };
}
