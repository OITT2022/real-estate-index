import { db } from "@/lib/db";
import { isCustomerManager } from "@/lib/scope";

type SessionUser = { id: string; customerId?: string | null; isSuperAdmin?: boolean } | null | undefined;

type ResolveResult =
  | { ok: true; customerId: string | null }
  | { ok: false; error: string };

/**
 * Resolve effective customerId for a Property/Project create or update.
 *
 * Rules (in priority order):
 *  1. A customer-manager always writes within their own customer scope.
 *  2. If a Property is linked to a Project that has a customer, the Property
 *     inherits via the project — direct customerId is cleared (null).
 *  3. Otherwise the explicitly-supplied customerId is used.
 *
 * Cross-customer project linking by a customer manager is rejected.
 */
export async function resolveCustomerId(
  sessionUser: SessionUser,
  customerId: string | null | undefined,
  projectId: string | null | undefined,
): Promise<ResolveResult> {
  let resolved: string | null = customerId || null;

  if (sessionUser && isCustomerManager(sessionUser as never)) {
    resolved = sessionUser.customerId ?? null;
  }

  if (projectId) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { customerId: true },
    });
    if (
      sessionUser &&
      isCustomerManager(sessionUser as never) &&
      project?.customerId &&
      project.customerId !== sessionUser.customerId
    ) {
      return { ok: false, error: "You cannot use a project from another customer" };
    }
    if (project?.customerId) {
      // Inherit from project — clear direct assignment
      resolved = null;
    }
  }

  return { ok: true, customerId: resolved };
}
