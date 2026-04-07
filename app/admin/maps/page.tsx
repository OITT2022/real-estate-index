import { MapSettingsForm } from "@/components/admin/map-settings-form";
import { getMapSettings, MAP_TILE_LAYERS } from "@/lib/settings";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminMapsPage() {
  await checkPageAccess("maps");
  const settings = await getMapSettings();

  return (
    <section className="admin-content">
        <div className="at-page-header">
          <div>
            <h1 className="at-page-title">Map Settings</h1>
            <p className="at-page-subtitle">Configure the look and feel of property maps across the site</p>
          </div>
        </div>
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
  );
}
