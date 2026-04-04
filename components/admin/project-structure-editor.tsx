"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  generateProjectStructure,
  addProjectUnit,
  updateProjectUnit,
  deleteProjectUnit,
  addProjectFloor,
  deleteProjectFloor,
  clearProjectStructure,
} from "@/lib/actions";

type UnitData = {
  id: string;
  building: string;
  entrance: string;
  floor: number;
  unitNumber: string;
  propertyId: string | null;
  propertyTitle: string | null;
};

type PropertyOption = {
  id: string;
  title: string;
};

type Props = {
  projectId: string;
  units: UnitData[];
  availableProperties: PropertyOption[];
};

export function ProjectStructureEditor({ projectId, units, availableProperties }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generator state
  const [buildings, setBuildings] = useState(1);
  const [entrances, setEntrances] = useState(1);
  const [floors, setFloors] = useState(5);
  const [unitsPerFloor, setUnitsPerFloor] = useState(4);

  // Manual add unit state
  const [manualBuilding, setManualBuilding] = useState("1");
  const [manualEntrance, setManualEntrance] = useState("A");
  const [manualFloor, setManualFloor] = useState(0);
  const [manualUnitNumber, setManualUnitNumber] = useState("");

  const hasUnits = units.length > 0;

  // Group units by building → entrance → floor
  const grouped = new Map<string, Map<string, Map<number, UnitData[]>>>();
  for (const u of units) {
    if (!grouped.has(u.building)) grouped.set(u.building, new Map());
    const bMap = grouped.get(u.building)!;
    if (!bMap.has(u.entrance)) bMap.set(u.entrance, new Map());
    const eMap = bMap.get(u.entrance)!;
    if (!eMap.has(u.floor)) eMap.set(u.floor, []);
    eMap.get(u.floor)!.push(u);
  }

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    const result = await generateProjectStructure(projectId, { buildings, entrances, floors, unitsPerFloor });
    if (!result.success) setError(result.error);
    setLoading(false);
    router.refresh();
  }

  async function handleClear() {
    if (!confirm("Clear entire project structure? This cannot be undone.")) return;
    setError(null);
    setLoading(true);
    const result = await clearProjectStructure(projectId);
    if (!result.success) setError(result.error);
    setLoading(false);
    router.refresh();
  }

  async function handleAddUnit(building: string, entrance: string, floor: number) {
    setError(null);
    const floorUnits = units.filter((u) => u.building === building && u.entrance === entrance && u.floor === floor);
    const nextNum = `${floor}${String(floorUnits.length + 1).padStart(2, "0")}`;
    await addProjectUnit(projectId, { building, entrance, floor, unitNumber: nextNum });
    router.refresh();
  }

  async function handleManualAddUnit() {
    if (!manualUnitNumber.trim()) { setError("Unit number is required"); return; }
    setError(null);
    await addProjectUnit(projectId, {
      building: manualBuilding,
      entrance: manualEntrance,
      floor: manualFloor,
      unitNumber: manualUnitNumber.trim(),
    });
    setManualUnitNumber("");
    router.refresh();
  }

  async function handleDeleteUnit(unitId: string) {
    setError(null);
    const result = await deleteProjectUnit(unitId);
    if (!result.success) setError(result.error);
    router.refresh();
  }

  async function handleUpdateUnitNumber(unitId: string, unitNumber: string) {
    await updateProjectUnit(unitId, { unitNumber });
  }

  async function handleLinkProperty(unitId: string, propertyId: string) {
    setError(null);
    const result = await updateProjectUnit(unitId, { propertyId: propertyId || null });
    if (!result.success) setError(result.error);
    router.refresh();
  }

  async function handleUnlinkProperty(unitId: string) {
    setError(null);
    await updateProjectUnit(unitId, { propertyId: null });
    router.refresh();
  }

  async function handleAddFloor(building: string, entrance: string) {
    setError(null);
    const existingFloors = [...(grouped.get(building)?.get(entrance)?.keys() ?? [])];
    const maxFloor = existingFloors.length > 0 ? Math.max(...existingFloors) : -1;
    const newFloor = maxFloor + 1;
    const firstFloorUnits = grouped.get(building)?.get(entrance)?.values().next().value;
    const count = (firstFloorUnits as UnitData[] | undefined)?.length ?? 2;
    await addProjectFloor(projectId, building, entrance, newFloor, count);
    router.refresh();
  }

  async function handleAddEntrance(building: string) {
    setError(null);
    const existingEntrances = [...(grouped.get(building)?.keys() ?? [])].sort();
    const lastEntrance = existingEntrances.length > 0 ? existingEntrances[existingEntrances.length - 1] : "@";
    const newEntrance = String.fromCharCode(lastEntrance.charCodeAt(0) + 1);
    // Copy floor structure from first entrance
    const firstEntrance = grouped.get(building)?.values().next().value as Map<number, UnitData[]> | undefined;
    if (firstEntrance) {
      for (const [floor, floorUnits] of firstEntrance.entries()) {
        await addProjectFloor(projectId, building, newEntrance, floor, floorUnits.length);
      }
    } else {
      await addProjectFloor(projectId, building, newEntrance, 0, 2);
    }
    router.refresh();
  }

  async function handleDeleteFloor(building: string, entrance: string, floor: number) {
    if (!confirm(`Delete floor ${floor}?`)) return;
    setError(null);
    const result = await deleteProjectFloor(projectId, building, entrance, floor);
    if (!result.success) setError(result.error);
    router.refresh();
  }

  // Properties not yet linked to any unit
  const linkedPropertyIds = new Set(units.filter((u) => u.propertyId).map((u) => u.propertyId!));
  const unlinkedProperties = availableProperties.filter((p) => !linkedPropertyIds.has(p.id));

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Project Structure</p>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            {hasUnits ? `${units.length} units defined` : "No structure defined yet"}
          </p>
        </div>
        {hasUnits && (
          <button type="button" className="button-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={handleClear} disabled={loading}>
            Clear Structure
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* Generator — only shown when no units exist */}
      {!hasUnits && (
        <div style={{ background: "var(--bg-alt)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 500 }}>Generate Initial Structure</p>
          <div className="admin-form-grid" style={{ marginBottom: 12 }}>
            <label>
              <span>Buildings</span>
              <input type="number" min={1} max={20} value={buildings} onChange={(e) => setBuildings(Number(e.target.value))} />
            </label>
            <label>
              <span>Entrances per building</span>
              <input type="number" min={1} max={10} value={entrances} onChange={(e) => setEntrances(Number(e.target.value))} />
            </label>
            <label>
              <span>Floors per entrance</span>
              <input type="number" min={1} max={50} value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
            </label>
            <label>
              <span>Units per floor</span>
              <input type="number" min={1} max={20} value={unitsPerFloor} onChange={(e) => setUnitsPerFloor(Number(e.target.value))} />
            </label>
          </div>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: "0.85rem" }}>
            This will create {buildings * entrances * (floors + 1) * unitsPerFloor} units
            ({buildings} building{buildings > 1 ? "s" : ""} × {entrances} entrance{entrances > 1 ? "s" : ""} × {floors + 1} floors × {unitsPerFloor} units).
            Floor 0 = ground floor.
          </p>
          <button type="button" className="button-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Structure"}
          </button>
        </div>
      )}

      {/* Manual add unit — always available */}
      <div style={{ background: "var(--bg-alt)", borderRadius: 12, padding: 16 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 500, fontSize: "0.9rem" }}>Add Unit Manually</p>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label style={{ flex: "0 0 70px" }}>
            <span style={{ fontSize: "0.8rem" }}>Building</span>
            <input value={manualBuilding} onChange={(e) => setManualBuilding(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem" }} />
          </label>
          <label style={{ flex: "0 0 70px" }}>
            <span style={{ fontSize: "0.8rem" }}>Entrance</span>
            <input value={manualEntrance} onChange={(e) => setManualEntrance(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem" }} />
          </label>
          <label style={{ flex: "0 0 70px" }}>
            <span style={{ fontSize: "0.8rem" }}>Floor</span>
            <input type="number" value={manualFloor} onChange={(e) => setManualFloor(Number(e.target.value))} style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem" }} />
          </label>
          <label style={{ flex: "1 1 100px" }}>
            <span style={{ fontSize: "0.8rem" }}>Unit #</span>
            <input value={manualUnitNumber} onChange={(e) => setManualUnitNumber(e.target.value)} placeholder="101" style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem" }} />
          </label>
          <button type="button" className="button-primary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={handleManualAddUnit}>
            Add
          </button>
        </div>
      </div>

      {/* Structure display */}
      {hasUnits && [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([building, entranceMap]) => (
        <div key={building} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "var(--bg-alt)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Building {building}</span>
            <button type="button" className="button-secondary" style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => handleAddEntrance(building)}>
              + Entrance
            </button>
          </div>

          {[...entranceMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([entrance, floorMap]) => (
            <div key={entrance} style={{ borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#f8fafc" }}>
                <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Entrance {entrance}</span>
                <button type="button" className="button-secondary" style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => handleAddFloor(building, entrance)}>
                  + Floor
                </button>
              </div>

              {[...floorMap.entries()].sort(([a], [b]) => b - a).map(([floor, floorUnits]) => (
                <div key={floor} style={{ borderTop: "1px solid var(--line)", padding: "8px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Floor {floor}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="button-secondary" style={{ padding: "2px 8px", fontSize: "0.75rem" }} onClick={() => handleAddUnit(building, entrance, floor)}>
                        + Unit
                      </button>
                      <button type="button" className="button-secondary" style={{ padding: "2px 8px", fontSize: "0.75rem", color: "#dc2626" }} onClick={() => handleDeleteFloor(building, entrance, floor)}>
                        Delete Floor
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    {floorUnits.map((unit) => (
                      <div key={unit.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                        <input
                          defaultValue={unit.unitNumber}
                          onBlur={(e) => {
                            if (e.target.value !== unit.unitNumber) handleUpdateUnitNumber(unit.id, e.target.value);
                          }}
                          style={{ width: 70, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem", textAlign: "center" }}
                          placeholder="#"
                        />

                        {unit.propertyId ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                            <Link href={`/admin/properties/${unit.propertyId}`} style={{ color: "var(--accent)", fontSize: "0.85rem", textDecoration: "underline" }}>
                              {unit.propertyTitle ?? "Property"}
                            </Link>
                            <button type="button" className="button-secondary" style={{ padding: "2px 8px", fontSize: "0.75rem" }} onClick={() => handleUnlinkProperty(unit.id)}>
                              Unlink
                            </button>
                          </div>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) handleLinkProperty(unit.id, e.target.value); }}
                            style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.85rem", color: "var(--muted)" }}
                          >
                            <option value="">Link property...</option>
                            {unlinkedProperties.map((p) => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        )}

                        <button type="button" className="icon-btn icon-btn-danger" style={{ padding: 4 }} onClick={() => handleDeleteUnit(unit.id)} title="Delete unit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
