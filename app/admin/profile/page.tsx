import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/scope";
import { ProfileForm } from "@/components/forms/profile-form";
import { listCountries } from "@/lib/countries";
import { listTimezones } from "@/lib/timezones";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/admin/login");

  const user = await db.adminUser.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      phoneCountry: true,
      country: true,
      timezone: true,
      profileImage: true,
    },
  });
  if (!user) redirect("/admin/login");

  const countries = listCountries();
  const timezones = listTimezones();

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">My Profile</h1>
          <p className="at-page-subtitle">Update your name, phone number, location, and avatar.</p>
        </div>
      </div>
      <ProfileForm user={user} countries={countries} timezones={timezones} />
    </section>
  );
}
