import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { MapSettingsForm } from "@/components/admin/map-settings-form";
import { getMapSettings, MAP_TILE_LAYERS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminMapsPage() {
  const settings = await getMapSettings();

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <h1>Map Settings</h1>
        <p className="muted">Configure the look and feel of property maps across the site.</p>
        <MapSettingsForm
          currentLayer={settings.tileLayerKey}
          defaultZoom={settings.defaultZoom}
          defaultLat={settings.defaultLat}
          defaultLng={settings.defaultLng}
          layers={Object.entries(MAP_TILE_LAYERS).map(([key, layer]) => ({
            key,
            name: layer.name,
          }))}
        />
      </section>
    </main>
  );
}
