import Link from "next/link";
import { Building2 } from "lucide-react";

type UnitProperty = {
  id: string;
  title: string;
  slug: string;
  price: number | { toNumber(): number } | any;
  bedrooms: number | null;
  areaSqm: number | null;
  floor: number | null;
  unitNumber: string | null;
  published: boolean;
  status: string;
};

type Unit = {
  id: string;
  building: string;
  entrance: string;
  floor: number;
  unitNumber: string;
  propertyId: string | null;
  property: UnitProperty | null;
};

type Props = {
  units: Unit[];
};

type GroupedStructure = Map<string, Map<string, Map<number, Unit[]>>>;

function groupUnits(units: Unit[]): GroupedStructure {
  const structure: GroupedStructure = new Map();
  for (const unit of units) {
    if (!structure.has(unit.building)) structure.set(unit.building, new Map());
    const bldg = structure.get(unit.building)!;
    if (!bldg.has(unit.entrance)) bldg.set(unit.entrance, new Map());
    const ent = bldg.get(unit.entrance)!;
    if (!ent.has(unit.floor)) ent.set(unit.floor, []);
    ent.get(unit.floor)!.push(unit);
  }
  return structure;
}

export function ProjectStructureView({ units }: Props) {
  const structure = groupUnits(units);
  const buildings = Array.from(structure.keys()).sort();
  const multipleBuildings = buildings.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {buildings.map((bldgKey) => {
        const entrances = structure.get(bldgKey)!;
        const entranceKeys = Array.from(entrances.keys()).sort();
        const multipleEntrances = entranceKeys.length > 1;

        return (
          <div key={bldgKey}>
            {multipleBuildings && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Building2 size={20} style={{ color: "var(--accent)" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Building {bldgKey}</h3>
              </div>
            )}

            {entranceKeys.map((entKey) => {
              const floors = entrances.get(entKey)!;
              const floorKeys = Array.from(floors.keys()).sort((a, b) => b - a);

              return (
                <div key={entKey} className="card" style={{ marginBottom: 16, overflow: "hidden" }}>
                  {multipleEntrances && (
                    <div style={{
                      padding: "10px 16px",
                      background: "var(--accent-light)",
                      borderBottom: "1px solid var(--line)",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "var(--accent-dark)",
                    }}>
                      Entrance {entKey}
                    </div>
                  )}

                  {/* Table header */}
                  <div className="st-row st-header muted" style={{
                    gridTemplateColumns: "80px 2fr 1fr 1fr 1fr 80px",
                    padding: "10px 16px 8px",
                  }}>
                    <div>Floor</div>
                    <div>Unit</div>
                    <div>Beds</div>
                    <div>Area</div>
                    <div>Price</div>
                    <div></div>
                  </div>

                  {floorKeys.map((floorNum) => {
                    const floorUnits = floors.get(floorNum)!;
                    return floorUnits.map((unit, idx) => {
                      const p = unit.property;
                      const isActive = p && p.published && p.status === "ACTIVE";
                      const showFloorLabel = idx === 0;

                      return (
                        <div
                          key={unit.id}
                          className="st-row"
                          style={{
                            gridTemplateColumns: "80px 2fr 1fr 1fr 1fr 80px",
                            padding: "12px 16px",
                            opacity: isActive ? 1 : p ? 0.5 : 0.45,
                          }}
                        >
                          <div style={{ fontWeight: showFloorLabel ? 600 : 400, color: showFloorLabel ? "var(--fg)" : "transparent" }}>
                            {showFloorLabel ? floorNum : floorNum}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.95rem" }}>
                              {isActive ? p.title : `Apt ${unit.unitNumber}`}
                            </strong>
                            {!p && (
                              <span className="muted" style={{ fontSize: "0.8rem", marginLeft: 8 }}>Not listed</span>
                            )}
                          </div>
                          <div>{isActive && p.bedrooms != null ? p.bedrooms : "-"}</div>
                          <div>{isActive && p.areaSqm ? `${p.areaSqm} sqm` : "-"}</div>
                          <div>
                            {isActive ? (
                              <span className="price-line" style={{ fontSize: "0.95rem" }}>
                                &euro;{Number(p.price).toLocaleString()}
                              </span>
                            ) : "-"}
                          </div>
                          <div>
                            {isActive ? (
                              <Link
                                href={`/properties/${p.slug}`}
                                className="button-primary"
                                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                              >
                                View
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
