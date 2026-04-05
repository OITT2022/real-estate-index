"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WebGLRenderer, Mesh, MeshStandardMaterial } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneSpec } from "@/lib/building-3d/generate-scene";
import { craftFacades } from "@/lib/building-3d/craft-facade";
import type { BuildingGeometry } from "@/lib/building-3d/craft-facade";

type FaceName = "front" | "left" | "right" | "back";

interface FacadeTexture {
  face: FaceName;
  url: string;
  confidence?: number;
  warnings?: string[];
  uv: { offsetX: number; offsetY: number; repeatX: number; repeatY: number; rotation: number };
}

interface Props {
  sceneSpec: SceneSpec;
  projectId: string;
}

const FACE_LABELS: { face: FaceName; label: string }[] = [
  { face: "front", label: "Front" },
  { face: "left", label: "Left" },
  { face: "right", label: "Right" },
  { face: "back", label: "Back" },
];

const DEFAULT_UV = { offsetX: 0, offsetY: 0, repeatX: 1, repeatY: 1, rotation: 0 };

export function Project3DPreview({ sceneSpec, projectId }: Props) {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [sideTab, setSideTab] = useState<"unit" | "textures">("textures");

  // Facade texture state
  const [facadeTextures, setFacadeTextures] = useState<FacadeTexture[]>([]);
  const [uploading, setUploading] = useState<FaceName | null>(null);
  const [expandedFace, setExpandedFace] = useState<FaceName | null>(null);

  // Craft pipeline state
  const [crafting, setCrafting] = useState(false);
  const [craftLog, setCraftLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const selectedApartment = sceneSpec.apartments.find(
    (a) => a.meta.apartmentId === selectedApartmentId
  );

  // Derive building geometry from sceneSpec for the pipeline
  const buildingGeometry: BuildingGeometry | null = sceneSpec.envelopes[0]
    ? {
        width: sceneSpec.envelopes[0].size.x,
        height: sceneSpec.envelopes[0].size.y,
        depth: sceneSpec.envelopes[0].size.z,
        floorCount: sceneSpec.envelopes[0].floorCount,
        floorHeight: sceneSpec.envelopes[0].size.y / sceneSpec.envelopes[0].floorCount,
        apartmentsPerFloor: Math.round(
          sceneSpec.apartments.length / sceneSpec.envelopes[0].floorCount
        ),
      }
    : null;

  // Check if project already has facade images from the DB
  const hasProjectFacades = sceneSpec.facades.length > 0;

  const handleCraft = async () => {
    if (!buildingGeometry) return;
    setCrafting(true);
    setCraftLog(["Starting Craft it! pipeline..."]);

    try {
      // Use project facade images from sceneSpec + any manually uploaded ones
      const imageInputs = sceneSpec.facades.map((f) => ({ face: f.face, url: f.image }));

      // Merge with manually uploaded images (manual overrides project)
      const manualByFace = new Map(facadeTextures.map((t) => [t.face, t]));
      const mergedInputs = imageInputs
        .filter((i) => !manualByFace.has(i.face))
        .concat([...manualByFace.values()].map((t) => ({ face: t.face, url: t.url })));

      const result = await craftFacades(mergedInputs, buildingGeometry);
      setCraftLog(result.log);

      // Convert crafted results to FacadeTexture state
      const newTextures: FacadeTexture[] = result.facades.map((f) => ({
        face: f.face,
        url: f.url,
        confidence: f.confidence,
        warnings: f.warnings,
        uv: f.uv,
      }));

      setFacadeTextures(newTextures);
    } catch (err) {
      setCraftLog((prev) => [...prev, `ERROR: ${err instanceof Error ? err.message : "Pipeline failed"}`]);
    } finally {
      setCrafting(false);
    }
  };

  const handleUpload = async (face: FaceName, file: File) => {
    setUploading(face);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("projectId", projectId);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setFacadeTextures((prev) => {
        const filtered = prev.filter((t) => t.face !== face);
        return [...filtered, { face, url: data.url, uv: { ...DEFAULT_UV } }];
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveTexture = (face: FaceName) => {
    setFacadeTextures((prev) => prev.filter((t) => t.face !== face));
  };

  const handleUvChange = (face: FaceName, key: keyof FacadeTexture["uv"], value: number) => {
    setFacadeTextures((prev) =>
      prev.map((t) => (t.face === face ? { ...t, uv: { ...t.uv, [key]: value } } : t))
    );
  };

  const getTexture = (face: FaceName) => facadeTextures.find((t) => t.face === face);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>3D Building Preview</h3>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
            {sceneSpec.apartments.length} units &middot; {sceneSpec.envelopes.length} building(s)
            {facadeTextures.length > 0 && (
              <> &middot; <span style={{ color: "#2e7d32" }}>{facadeTextures.length} texture(s)</span></>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Debug toggle */}
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            style={{
              padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)",
              background: showDebug ? "var(--accent)" : "var(--bg-alt)",
              color: showDebug ? "white" : "var(--muted)",
              fontSize: "0.7rem", cursor: "pointer", fontWeight: 600,
            }}
          >
            Debug
          </button>
          {/* Craft it! button */}
          <button
            className="button-primary"
            onClick={handleCraft}
            disabled={crafting || (!hasProjectFacades && facadeTextures.length === 0)}
            style={{
              fontSize: "0.8rem", padding: "8px 20px",
              opacity: crafting ? 0.7 : 1,
            }}
          >
            {crafting ? "Crafting..." : "Craft it!"}
          </button>
        </div>
      </div>

      {/* Debug log panel */}
      {showDebug && craftLog.length > 0 && (
        <div style={{
          padding: "8px 16px", background: "#1a1a2e", color: "#a0f0a0",
          fontSize: "0.65rem", fontFamily: "monospace", maxHeight: 120, overflowY: "auto",
          borderBottom: "1px solid var(--line)",
        }}>
          {craftLog.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("WARN") ? "#f0c040" : line.startsWith("ERROR") ? "#f06060" : "#a0f0a0" }}>
              {line}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", minHeight: 520 }}>
        {/* 3D Viewer */}
        <div style={{ position: "relative", background: "#f4f6f8" }}>
          {!viewerReady && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--muted)", fontSize: "0.85rem",
            }}>
              Loading 3D viewer...
            </div>
          )}
          <ThreeViewer
            sceneSpec={sceneSpec}
            selectedApartmentId={selectedApartmentId}
            facadeTextures={facadeTextures}
            onSelectApartment={setSelectedApartmentId}
            onReady={() => setViewerReady(true)}
          />
        </div>

        {/* Side panel */}
        <div style={{ borderLeft: "1px solid var(--line)", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
            {(["textures", "unit"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSideTab(tab)}
                style={{
                  flex: 1, padding: "10px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                  background: sideTab === tab ? "var(--bg)" : "var(--bg-alt)",
                  borderBottom: sideTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                  color: sideTab === tab ? "var(--fg)" : "var(--muted)",
                }}
              >
                {tab === "textures" ? "Facade Textures" : "Unit Info"}
              </button>
            ))}
          </div>

          <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
            {sideTab === "unit" && (
              <>
                {!selectedApartment ? (
                  <p className="muted" style={{ fontSize: "0.8rem" }}>Click a unit in the 3D view.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <StatusBadge status={selectedApartment.meta.status} />
                    <InfoRow label="Unit" value={selectedApartment.meta.unitNumber} />
                    <InfoRow label="Rooms" value={String(selectedApartment.meta.rooms)} />
                    <InfoRow label="Area" value={`${selectedApartment.meta.areaSqm} sqm`} />
                    <InfoRow label="Floor" value={String(selectedApartment.meta.floorNumber)} />
                    <div style={{ marginTop: 4, padding: "6px 8px", background: "var(--bg-alt)", borderRadius: 6, fontSize: "0.75rem", color: "var(--muted)" }}>
                      Building {selectedApartment.meta.buildingId} &middot; {selectedApartment.meta.entranceId}
                    </div>
                  </div>
                )}
              </>
            )}

            {sideTab === "textures" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FACE_LABELS.map(({ face, label }) => {
                  const tex = getTexture(face);
                  const isExpanded = expandedFace === face;
                  return (
                    <div key={face} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                      {/* Face header with confidence */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-alt)" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, flex: 1 }}>{label}</span>
                        {tex?.confidence != null && <ConfidenceBadge confidence={tex.confidence} />}
                        {tex && (
                          <button
                            type="button"
                            onClick={() => setExpandedFace(isExpanded ? null : face)}
                            style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.7rem", color: "var(--accent)" }}
                          >
                            {isExpanded ? "Hide" : "Adjust"}
                          </button>
                        )}
                      </div>

                      <div style={{ padding: "8px 10px" }}>
                        {tex ? (
                          <div>
                            {/* Thumbnail */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <img
                                src={tex.url}
                                alt={`${label} facade`}
                                style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 4, border: "1px solid var(--line)" }}
                              />
                              <div style={{ flex: 1, fontSize: "0.7rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {tex.url.split("/").pop()}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTexture(face)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#c62828", fontSize: "0.8rem", padding: 4 }}
                                title="Remove"
                              >
                                &times;
                              </button>
                            </div>

                            {/* Warnings */}
                            {tex.warnings && tex.warnings.length > 0 && (
                              <div style={{ marginTop: 6, padding: "4px 6px", background: "#fff8e1", borderRadius: 4, fontSize: "0.65rem", color: "#e65100" }}>
                                {tex.warnings.map((w, i) => <div key={i}>{w}</div>)}
                              </div>
                            )}

                            {/* Debug UV info */}
                            {showDebug && (
                              <div style={{ marginTop: 4, padding: "4px 6px", background: "#f0f4f8", borderRadius: 4, fontSize: "0.6rem", fontFamily: "monospace", color: "#556" }}>
                                UV: oX={tex.uv.offsetX.toFixed(3)} oY={tex.uv.offsetY.toFixed(3)} rX={tex.uv.repeatX.toFixed(3)} rY={tex.uv.repeatY.toFixed(3)} rot={tex.uv.rotation.toFixed(1)}
                              </div>
                            )}

                            {/* UV Adjustments */}
                            {isExpanded && (
                              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                                <UvSlider label="Offset X" value={tex.uv.offsetX} min={-2} max={2} step={0.01}
                                  onChange={(v) => handleUvChange(face, "offsetX", v)} />
                                <UvSlider label="Offset Y" value={tex.uv.offsetY} min={-2} max={2} step={0.01}
                                  onChange={(v) => handleUvChange(face, "offsetY", v)} />
                                <UvSlider label="Repeat X" value={tex.uv.repeatX} min={0.1} max={5} step={0.05}
                                  onChange={(v) => handleUvChange(face, "repeatX", v)} />
                                <UvSlider label="Repeat Y" value={tex.uv.repeatY} min={0.1} max={5} step={0.05}
                                  onChange={(v) => handleUvChange(face, "repeatY", v)} />
                                <UvSlider label="Rotation" value={tex.uv.rotation} min={-180} max={180} step={1}
                                  onChange={(v) => handleUvChange(face, "rotation", v)} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", border: "1px dashed var(--line)", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", color: "var(--muted)" }}>
                            {uploading === face ? "Uploading..." : "Upload image"}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              disabled={uploading !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(face, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}

                <p style={{ fontSize: "0.7rem", color: "var(--muted)", textAlign: "center", margin: "4px 0 0" }}>
                  {hasProjectFacades
                    ? "Click \"Craft it!\" to auto-map project images."
                    : "Upload images or add them in Media tab, then click \"Craft it!\"."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Confidence Badge ---

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const isLow = confidence < 0.7;
  const isMed = confidence >= 0.7 && confidence < 0.85;
  const bg = isLow ? "#fce4ec" : isMed ? "#fff3e0" : "#e8f5e9";
  const color = isLow ? "#c62828" : isMed ? "#e65100" : "#2e7d32";
  return (
    <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: bg, color }}>
      {pct}%
    </span>
  );
}

// --- Helpers ---

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function UvSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: "0.7rem", color: "var(--muted)", width: 52, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, height: 3, cursor: "pointer" }} />
      <span style={{ fontSize: "0.7rem", fontFamily: "monospace", width: 40, textAlign: "right" }}>{value.toFixed(2)}</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  available: { bg: "#e8f5e9", text: "#2e7d32" },
  reserved: { bg: "#fff3e0", text: "#e65100" },
  sold: { bg: "#fce4ec", text: "#c62828" },
  hidden: { bg: "#f5f5f5", text: "#757575" },
};

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "unknown";
  const colors = STATUS_COLORS[s] ?? { bg: "#f5f5f5", text: "#757575" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 10,
      fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
      letterSpacing: 0.5, background: colors.bg, color: colors.text, alignSelf: "flex-start",
    }}>
      {s}
    </span>
  );
}

// --- Three.js Viewer ---

interface ViewerProps {
  sceneSpec: SceneSpec;
  selectedApartmentId: string | null;
  facadeTextures: FacadeTexture[];
  onSelectApartment: (id: string) => void;
  onReady: () => void;
}

const COLORS = {
  skyTop: 0x87ceeb,
  skyBottom: 0xd4e8f7,
  ground: 0x8fbc8f,
  pavement: 0xc0c0c0,
  apartment: 0xe8e0d8,
  apartmentSide: 0xd5cdc5,
  highlighted: 0xe85d4a,
  highlightEmissive: 0x441100,
  hovered: 0x5c9fd4,
  hoverEmissive: 0x0a1a30,
  envelopeDefault: 0xd9d0c5,
  edge: 0x8a8078,
  floorLine: 0x9a918a,
  apartmentGrid: 0xb0c8d8,
  window: 0x7ab8d4,
  windowFrame: 0x706860,
  entrance: 0x5a5048,
  roof: 0xa09890,
  balcony: 0xccc4bc,
};

function ThreeViewer({ sceneSpec, selectedApartmentId, facadeTextures, onSelectApartment, onReady }: ViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<{
    renderer: WebGLRenderer;
    controls: OrbitControls;
    apartmentMeshes: Mesh[];
    hoveredMesh: Mesh | null;
    animationId: number;
    threeModule: typeof import("three");
    isTextured: boolean;
  } | null>(null);

  const onSelectRef = useRef(onSelectApartment);
  onSelectRef.current = onSelectApartment;
  const selectedIdRef = useRef(selectedApartmentId);
  selectedIdRef.current = selectedApartmentId;

  // Highlight sync with emissive glow
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    for (const mesh of state.apartmentMeshes) {
      const mat = mesh.material as MeshStandardMaterial;
      const id = mesh.userData.apartmentId as string;
      if (id === selectedApartmentId) {
        mat.color.setHex(COLORS.highlighted);
        mat.emissive.setHex(COLORS.highlightEmissive);
        mat.emissiveIntensity = 0.3;
        mat.opacity = state.isTextured ? 0.6 : 1.0;
      } else if (mesh !== state.hoveredMesh) {
        mat.color.setHex(state.isTextured ? COLORS.apartmentGrid : COLORS.apartment);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.opacity = state.isTextured ? 0.08 : 1.0;
      }
    }
  }, [selectedApartmentId]);

  const buildScene = useCallback(async (spec: SceneSpec, textures: FacadeTexture[] = []) => {
    const container = mountRef.current;
    if (!container) return;

    const THREE = await import("three");
    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
    const { Sky } = await import("three/examples/jsm/objects/Sky.js");

    if (stateRef.current) {
      cancelAnimationFrame(stateRef.current.animationId);
      stateRef.current.controls.dispose();
      stateRef.current.renderer.dispose();
      container.innerHTML = "";
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    // Physically-based sky (Preetham atmospheric model)
    const sky = new Sky();
    sky.scale.setScalar(10000);
    const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value = 4;
    skyUniforms["rayleigh"].value = 1.5;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;
    const sunPos = new THREE.Vector3();
    const sunPhi = THREE.MathUtils.degToRad(90 - 35);   // elevation 35°
    const sunTheta = THREE.MathUtils.degToRad(160);       // azimuth 160°
    sunPos.setFromSphericalCoords(1, sunPhi, sunTheta);
    skyUniforms["sunPosition"].value.copy(sunPos);
    scene.add(sky);
    scene.fog = new THREE.Fog(0xd4e8f7, 60, 250);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    const { target, distance, yaw, pitch } = spec.camera;
    camera.position.set(
      target.x + distance * Math.sin(yaw) * Math.cos(pitch),
      target.y + distance * Math.sin(pitch) + distance * 0.15,
      target.z + distance * Math.cos(yaw) * Math.cos(pitch),
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Generate PMREM environment map from the sky for proper PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const skyRenderTarget = pmremGenerator.fromScene(scene, 0, 0.1, 10000);
    scene.environment = skyRenderTarget.texture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(target.x, target.y, target.z);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = distance * 3;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.zoomToCursor = true;
    controls.update();

    // --- Lighting (matched to sky sun position) ---
    // Hemisphere: HSL-tuned sky blue above, warm earth bounce below
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    hemiLight.color.setHSL(0.6, 0.6, 0.65);        // desaturated sky blue
    hemiLight.groundColor.setHSL(0.095, 0.5, 0.7);  // warm sandy bounce
    scene.add(hemiLight);
    // Main sun — position aligned with sky shader sun
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.color.setHSL(0.1, 0.6, 0.95);  // warm sunlight
    sun.position.copy(sunPos).multiplyScalar(30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -5;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 2;
    scene.add(sun);
    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0xc8d8e8, 0.25);
    fill.position.set(-15, 12, -10);
    scene.add(fill);

    // --- MODE: textured (photo facades) vs procedural (generated detail) ---
    const hasTextures = textures.length > 0;
    const texByFace = new Map<FaceName, FacadeTexture>();
    for (const t of textures) texByFace.set(t.face, t);

    // Face index mapping for BoxGeometry: [+X right, -X left, +Y top, -Y bottom, +Z front, -Z back]
    const faceToIndex: [FaceName, number][] = [["right", 0], ["left", 1], ["front", 4], ["back", 5]];
    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // --- Envelopes ---
    for (const env of spec.envelopes) {
      // In textured mode: expand envelope slightly so it sits in front of apartments
      const expand = hasTextures ? 0.12 : 0;
      const envW = env.size.x + expand * 2;
      const envH = env.size.y + expand;
      const envZ = env.size.z + expand * 2;

      // Build 6 materials for the envelope box
      const envelopeMaterials: MeshStandardMaterial[] = [];
      for (let i = 0; i < 6; i++) {
        const isBottom = i === 3;
        const isTop = i === 2;
        const faceEntry = faceToIndex.find(([, idx]) => idx === i);
        const tex = faceEntry ? texByFace.get(faceEntry[0]) : undefined;

        if (tex) {
          // Textured face — will be populated by texture loader below
          const mat = new THREE.MeshStandardMaterial({
            color: COLORS.envelopeDefault,
            side: THREE.FrontSide,
            roughness: 0.8,
            metalness: 0.0,
          });
          envelopeMaterials.push(mat);

          // Load texture asynchronously
          loader.load(tex.url, (loadedTex) => {
            loadedTex.wrapS = THREE.ClampToEdgeWrapping;
            loadedTex.wrapT = THREE.ClampToEdgeWrapping;
            loadedTex.center.set(0.5, 0.5);
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            loadedTex.anisotropy = maxAniso;
            loadedTex.offset.set(tex.uv.offsetX, tex.uv.offsetY);
            loadedTex.repeat.set(tex.uv.repeatX, tex.uv.repeatY);
            loadedTex.rotation = (tex.uv.rotation * Math.PI) / 180;
            mat.map = loadedTex;
            mat.color.setHex(0xffffff);
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
            mat.envMapIntensity = 0.4;
            mat.needsUpdate = true;
          });
        } else {
          // Non-textured face
          envelopeMaterials.push(new THREE.MeshStandardMaterial({
            color: isTop ? COLORS.roof : COLORS.envelopeDefault,
            transparent: true,
            opacity: isBottom ? 0 : isTop ? 0.6 : 0.15,
            side: THREE.DoubleSide,
            depthWrite: false,
            visible: !isBottom,
            roughness: isTop ? 0.9 : 0.7,
            metalness: 0.02,
          }));
        }
      }

      const geo = new THREE.BoxGeometry(envW, envH, envZ);
      const mesh = new THREE.Mesh(geo, envelopeMaterials);
      mesh.position.set(
        env.position.x + env.size.x / 2,
        env.position.y + envH / 2,
        env.position.z + env.size.z / 2,
      );
      mesh.receiveShadow = true;
      mesh.castShadow = hasTextures;
      scene.add(mesh);

      // Envelope edges
      if (!hasTextures) {
        const edgeGeo = new THREE.EdgesGeometry(geo);
        const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.35 }));
        edges.position.copy(mesh.position);
        scene.add(edges);
      }

      // --- Procedural details: only in non-textured mode ---
      if (!hasTextures) {
        // Roof parapet
        const parapetH = 0.15;
        const parapetT = 0.1;
        const parapetMat = new THREE.MeshStandardMaterial({ color: COLORS.roof, roughness: 0.9 });
        const roofY = env.position.y + env.size.y;
        for (const zOff of [0, env.size.z]) {
          const pm = new THREE.Mesh(new THREE.BoxGeometry(env.size.x, parapetH, parapetT), parapetMat);
          pm.position.set(env.position.x + env.size.x / 2, roofY + parapetH / 2, env.position.z + zOff);
          pm.castShadow = true;
          scene.add(pm);
        }
        for (const xOff of [0, env.size.x]) {
          const pm = new THREE.Mesh(new THREE.BoxGeometry(parapetT, parapetH, env.size.z), parapetMat);
          pm.position.set(env.position.x + xOff, roofY + parapetH / 2, env.position.z + env.size.z / 2);
          pm.castShadow = true;
          scene.add(pm);
        }

        // Floor separator lines
        const floorH = spec.apartments[0]?.size.y ? (spec.apartments[0].size.y / 0.9) : 3;
        const floorLineMat = new THREE.MeshStandardMaterial({ color: COLORS.floorLine, roughness: 0.8 });
        for (let f = 1; f < env.floorCount; f++) {
          const lineY = env.position.y + f * floorH;
          const fm = new THREE.Mesh(new THREE.BoxGeometry(env.size.x + 0.06, 0.06, 0.06), floorLineMat);
          fm.position.set(env.position.x + env.size.x / 2, lineY, env.position.z + env.size.z + 0.03);
          scene.add(fm);
          const bm = fm.clone();
          bm.position.z = env.position.z - 0.03;
          scene.add(bm);
        }

        // Entrance
        const entranceW = 1.2;
        const entranceH = floorH * 0.85;
        const entranceD = 0.15;
        const entranceMesh = new THREE.Mesh(
          new THREE.BoxGeometry(entranceW, entranceH, entranceD),
          new THREE.MeshStandardMaterial({ color: COLORS.entrance, roughness: 0.5, metalness: 0.1 }),
        );
        entranceMesh.position.set(env.position.x + env.size.x / 2, env.position.y + entranceH / 2, env.position.z + env.size.z + entranceD / 2);
        entranceMesh.castShadow = true;
        scene.add(entranceMesh);
        const canopy = new THREE.Mesh(
          new THREE.BoxGeometry(entranceW + 0.6, 0.08, 0.8),
          new THREE.MeshStandardMaterial({ color: COLORS.edge, roughness: 0.4, metalness: 0.2 }),
        );
        canopy.position.set(entranceMesh.position.x, env.position.y + entranceH + 0.04, env.position.z + env.size.z + 0.4);
        canopy.castShadow = true;
        scene.add(canopy);
      }
    }

    // --- Apartment meshes ---
    const apartmentMeshes: Mesh[] = [];
    const gap = 0.04;

    // --- Procedural concrete roughness/bump map (canvas-generated) ---
    let wallBumpTex: InstanceType<typeof THREE.CanvasTexture> | null = null;
    if (!hasTextures) {
      const bumpCanvas = document.createElement("canvas");
      bumpCanvas.width = bumpCanvas.height = 256;
      const bCtx = bumpCanvas.getContext("2d")!;
      // Draw subtle noise to simulate concrete/plaster surface grain
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const v = 170 + Math.random() * 50 + Math.sin(x * 0.3) * 8 + Math.sin(y * 0.2) * 6;
          bCtx.fillStyle = `rgb(${v},${v},${v})`;
          bCtx.fillRect(x, y, 1, 1);
        }
      }
      wallBumpTex = new THREE.CanvasTexture(bumpCanvas);
      wallBumpTex.wrapS = THREE.RepeatWrapping;
      wallBumpTex.wrapT = THREE.RepeatWrapping;
      wallBumpTex.repeat.set(2, 2);
    }

    // Shared materials for procedural mode
    const windowMat = !hasTextures ? new THREE.MeshPhysicalMaterial({
      color: COLORS.window, roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: 0.7, reflectivity: 0.9,
      clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.0,
    }) : null;
    const windowFrameMat = !hasTextures ? new THREE.MeshStandardMaterial({ color: COLORS.windowFrame, roughness: 0.6, metalness: 0.15 }) : null;
    const recessMat = !hasTextures ? new THREE.MeshStandardMaterial({ color: 0x504840, roughness: 0.95 }) : null;
    const balconyMat = !hasTextures ? new THREE.MeshStandardMaterial({ color: COLORS.balcony, roughness: 0.85, bumpMap: wallBumpTex, bumpScale: 0.15 }) : null;
    const recessDepth = 0.08;
    const windowCols = 2;

    for (const apt of spec.apartments) {
      const sx = apt.size.x - gap;
      const sy = apt.size.y - gap;
      const sz = apt.size.z - gap * 2;
      const cx = apt.position.x + apt.size.x / 2;
      const cy = apt.position.y + apt.size.y / 2;
      const cz = apt.position.z + apt.size.z / 2;
      const isSelected = apt.meta.apartmentId === selectedIdRef.current;

      if (hasTextures) {
        // TEXTURED MODE: apartments are transparent clickable grid cells
        const bodyGeo = new THREE.BoxGeometry(sx, sy, sz);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isSelected ? COLORS.highlighted : COLORS.apartmentGrid,
          emissive: isSelected ? COLORS.highlightEmissive : 0x000000,
          emissiveIntensity: isSelected ? 0.3 : 0,
          transparent: true,
          opacity: isSelected ? 0.6 : 0.08,
          depthWrite: false,
          roughness: 0.5,
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(cx, cy, cz);
        bodyMesh.userData = apt.meta;
        apartmentMeshes.push(bodyMesh);
        scene.add(bodyMesh);

        // Thin edge outlines so apartments are visible as a grid
        const edgeGeo = new THREE.EdgesGeometry(bodyGeo);
        const edgeLines = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
          color: COLORS.edge, transparent: true, opacity: 0.3,
        }));
        edgeLines.position.copy(bodyMesh.position);
        scene.add(edgeLines);

      } else {
        // PROCEDURAL MODE: full architectural detail
        const bodyGeo = new THREE.BoxGeometry(sx, sy, sz);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isSelected ? COLORS.highlighted : COLORS.apartment,
          emissive: isSelected ? COLORS.highlightEmissive : 0x000000,
          emissiveIntensity: isSelected ? 0.3 : 0,
          roughness: 0.78, metalness: 0.02,
          bumpMap: wallBumpTex,
          bumpScale: 0.2,
          envMapIntensity: 0.3,
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(cx, cy, cz);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        bodyMesh.userData = apt.meta;
        apartmentMeshes.push(bodyMesh);
        scene.add(bodyMesh);

        // Window dimensions
        const winW = sx * 0.28;
        const winH = sy * 0.42;
        const winMarginY = sy * 0.08;

        // Window recess + glass + frame + sill helper
        const addWindowSet = (wx: number, wy: number, wz: number, axis: "z" | "x", dir: number) => {
          // Recess cavity
          const rMesh = new THREE.Mesh(
            new THREE.BoxGeometry(axis === "z" ? winW + 0.02 : recessDepth, winH + 0.02, axis === "z" ? recessDepth : winW + 0.02),
            recessMat!,
          );
          rMesh.position.set(wx + (axis === "x" ? dir * (-recessDepth / 2 + 0.01) : 0), wy, wz + (axis === "z" ? dir * (-recessDepth / 2 + 0.01) : 0));
          rMesh.receiveShadow = true;
          scene.add(rMesh);

          // Glass pane
          const gGeo = new THREE.BoxGeometry(axis === "z" ? winW : 0.02, winH, axis === "z" ? 0.02 : winW);
          const gMesh = new THREE.Mesh(gGeo, windowMat!);
          gMesh.position.set(wx + (axis === "x" ? dir * (-recessDepth + 0.02) : 0), wy, wz + (axis === "z" ? dir * (-recessDepth + 0.02) : 0));
          scene.add(gMesh);

          // Frame edges
          const frameLine = new THREE.LineSegments(new THREE.EdgesGeometry(gGeo), new THREE.LineBasicMaterial({ color: COLORS.windowFrame }));
          frameLine.position.copy(gMesh.position);
          scene.add(frameLine);

          // Sill
          const sillW = axis === "z" ? winW + 0.1 : 0.12;
          const sillD = axis === "z" ? 0.12 : winW + 0.1;
          const sMesh = new THREE.Mesh(new THREE.BoxGeometry(sillW, 0.04, sillD), windowFrameMat!);
          sMesh.position.set(wx + (axis === "x" ? dir * 0.04 : 0), wy - winH / 2 - 0.02, wz + (axis === "z" ? dir * 0.04 : 0));
          sMesh.castShadow = true;
          scene.add(sMesh);

          // Lintel
          const lMesh = new THREE.Mesh(new THREE.BoxGeometry(sillW, 0.03, sillD), windowFrameMat!);
          lMesh.position.set(wx + (axis === "x" ? dir * 0.03 : 0), wy + winH / 2 + 0.015, wz + (axis === "z" ? dir * 0.03 : 0));
          scene.add(lMesh);
        };

        // Front + back windows
        for (let w = 0; w < windowCols; w++) {
          const wxOff = (w - (windowCols - 1) / 2) * (sx * 0.4);
          addWindowSet(cx + wxOff, cy + winMarginY, cz + sz / 2, "z", 1);
          addWindowSet(cx + wxOff, cy + winMarginY, cz - sz / 2, "z", -1);
        }

        // Balcony
        if (apt.meta.floorNumber > 1 && apartmentMeshes.length % 2 === 0) {
          const balW = sx * 0.6;
          const balD = 0.65;
          const balH = 0.1;
          const slab = new THREE.Mesh(new THREE.BoxGeometry(balW, balH, balD), balconyMat!);
          slab.position.set(cx, cy - sy / 2 + balH / 2, cz + sz / 2 + balD / 2);
          slab.castShadow = true; slab.receiveShadow = true;
          scene.add(slab);
          const railH = 0.55;
          const railPanel = new THREE.Mesh(
            new THREE.BoxGeometry(balW - 0.06, railH, 0.03),
            new THREE.MeshPhysicalMaterial({ color: 0xc8e8f0, transparent: true, opacity: 0.35, roughness: 0.05, clearcoat: 0.5 }),
          );
          railPanel.position.set(cx, cy - sy / 2 + balH + railH / 2, cz + sz / 2 + balD - 0.015);
          scene.add(railPanel);
          const topRail = new THREE.Mesh(new THREE.BoxGeometry(balW, 0.03, 0.04), windowFrameMat!);
          topRail.position.set(cx, cy - sy / 2 + balH + railH + 0.015, cz + sz / 2 + balD - 0.02);
          scene.add(topRail);
          for (const xOff of [-balW / 2 + 0.02, balW / 2 - 0.02]) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.03, railH + balH, 0.03), windowFrameMat!);
            post.position.set(cx + xOff, cy - sy / 2 + (railH + balH) / 2, cz + sz / 2 + balD - 0.015);
            scene.add(post);
          }
        }
      }
    }

    // --- Ground layers ---
    // Pavement around building
    const maxEnv = spec.envelopes[0];
    if (maxEnv) {
      const pavW = maxEnv.size.x + 6;
      const pavD = maxEnv.size.z + 6;
      const pavement = new THREE.Mesh(
        new THREE.PlaneGeometry(pavW, pavD),
        new THREE.MeshStandardMaterial({ color: COLORS.pavement, roughness: 0.9 })
      );
      pavement.rotation.x = -Math.PI / 2;
      pavement.position.set(maxEnv.position.x + maxEnv.size.x / 2, -0.005, maxEnv.position.z + maxEnv.size.z / 2);
      pavement.receiveShadow = true;
      scene.add(pavement);
    }
    // Grass ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredMesh: Mesh | null = null;

    const getHit = (e: MouseEvent): Mesh | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return (raycaster.intersectObjects(apartmentMeshes)[0]?.object as Mesh) ?? null;
    };

    const defaultColor = hasTextures ? COLORS.apartmentGrid : COLORS.apartment;
    const defaultOpacity = hasTextures ? 0.08 : 1.0;

    const onPointerMove = (e: MouseEvent) => {
      const hit = getHit(e);
      if (hoveredMesh && hoveredMesh !== hit) {
        const m = hoveredMesh.material as MeshStandardMaterial;
        const isSel = hoveredMesh.userData.apartmentId === selectedIdRef.current;
        m.color.setHex(isSel ? COLORS.highlighted : defaultColor);
        m.emissive.setHex(isSel ? COLORS.highlightEmissive : 0x000000);
        m.emissiveIntensity = isSel ? 0.3 : 0;
        m.opacity = isSel ? (hasTextures ? 0.6 : 1.0) : defaultOpacity;
        renderer.domElement.style.cursor = "default";
      }
      if (hit && hit !== hoveredMesh) {
        const m = hit.material as MeshStandardMaterial;
        if (hit.userData.apartmentId !== selectedIdRef.current) {
          m.color.setHex(COLORS.hovered);
          m.emissive.setHex(COLORS.hoverEmissive);
          m.emissiveIntensity = 0.25;
          m.opacity = hasTextures ? 0.4 : 1.0;
        }
        renderer.domElement.style.cursor = "pointer";
      }
      hoveredMesh = hit;
    };

    const onClick = (e: MouseEvent) => {
      const hit = getHit(e);
      if (hit?.userData?.apartmentId) onSelectRef.current(hit.userData.apartmentId as string);
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    const onResize = () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- Post-processing: SSAO + SMAA ---
    const { EffectComposer, EffectPass, RenderPass, SMAAEffect, SSAOEffect, BlendFunction, SMAAPreset } = await import("postprocessing");

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const ssaoEffect = new SSAOEffect(camera, undefined, {
      blendFunction: BlendFunction.MULTIPLY,
      samples: 16,
      rings: 5,
      worldDistanceThreshold: 20,
      worldDistanceFalloff: 5,
      worldProximityThreshold: 0.4,
      worldProximityFalloff: 0.1,
      luminanceInfluence: 0.7,
      radius: 0.04,
      intensity: 1.8,
      bias: 0.025,
    });

    const smaaEffect = new SMAAEffect({ preset: SMAAPreset.HIGH });

    composer.addPass(new EffectPass(camera, ssaoEffect, smaaEffect));

    let animationId = 0;
    const animate = () => { controls.update(); composer.render(); animationId = requestAnimationFrame(animate); };
    animate();

    stateRef.current = { renderer, controls, apartmentMeshes, hoveredMesh, animationId, threeModule: THREE, isTextured: textures.length > 0 };
    onReady();

    return () => {
      cancelAnimationFrame(animationId);
      composer.dispose();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
      stateRef.current = null;
    };
  }, [onReady]);

  // Serialize texture state for dependency tracking
  const textureKey = JSON.stringify(
    facadeTextures.map((t) => ({ face: t.face, url: t.url, uv: t.uv }))
  );

  // Rebuild entire scene when sceneSpec or textures change
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    buildScene(sceneSpec, facadeTextures).then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneSpec, textureKey, buildScene]);

  return <div ref={mountRef} style={{ width: "100%", height: 520 }} />;
}
