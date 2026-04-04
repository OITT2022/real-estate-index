import type { SceneSpec } from '../../types/scene';

interface Props {
  sceneSpec: SceneSpec | null;
  selectedApartmentId: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  available: { bg: '#e8f5e9', text: '#2e7d32' },
  reserved: { bg: '#fff3e0', text: '#e65100' },
  sold: { bg: '#fce4ec', text: '#c62828' },
  hidden: { bg: '#f5f5f5', text: '#757575' },
};

export function ApartmentPanel({ sceneSpec, selectedApartmentId }: Props) {
  const apartment = sceneSpec?.apartments.find(
    (item) => item.meta.apartmentId === selectedApartmentId
  );

  return (
    <div style={{ padding: 16, border: '1px solid #e3e8ef', borderRadius: 12, background: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Apartment Info</h3>

      {!apartment ? (
        <div style={{ color: '#667', fontSize: 14 }}>Select an apartment in the viewer.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Status badge */}
          <div>
            <StatusBadge status={apartment.meta.status} />
          </div>

          <InfoRow label="Unit" value={apartment.meta.unitNumber} />
          <InfoRow label="Rooms" value={String(apartment.meta.rooms)} />
          <InfoRow label="Area" value={`${apartment.meta.areaSqm} sqm`} />
          <InfoRow label="Floor" value={String(apartment.meta.floorNumber)} />

          {/* Building context */}
          <div
            style={{
              marginTop: 4,
              padding: '8px 10px',
              background: '#f7f9fb',
              borderRadius: 6,
              fontSize: 13,
              color: '#556',
            }}
          >
            Building {apartment.meta.buildingId} &middot; Entrance {apartment.meta.entranceId}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: '#556' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? 'unknown';
  const colors = STATUS_COLORS[s] ?? { bg: '#f5f5f5', text: '#757575' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        background: colors.bg,
        color: colors.text,
      }}
    >
      {s}
    </span>
  );
}
