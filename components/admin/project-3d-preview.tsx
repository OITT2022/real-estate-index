"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WebGLRenderer, Mesh, MeshStandardMaterial } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneSpec } from "@/lib/building-3d/generate-scene";

type FaceName = "front" | "left" | "right" | "back";

interface FacadeTexture {
  face: FaceName;
  url: string;
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
  const [rendered, setRendered] = useState(false);
  const [expandedFace, setExpandedFace] = useState<FaceName | null>(null);

  // Ref to pass textures to viewer without full rebuild
  const texturesRef = useRef<FacadeTexture[]>([]);
  texturesRef.current = facadeTextures;

  const selectedApartment = sceneSpec.apartments.find(
    (a) => a.meta.apartmentId === selectedApartmentId
  );

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
      setRendered(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveTexture = (face: FaceName) => {
    setFacadeTextures((prev) => prev.filter((t) => t.face !== face));
    setRendered(false);
  };

  const handleUvChange = (face: FaceName, key: keyof FacadeTexture["uv"], value: number) => {
    setFacadeTextures((prev) =>
      prev.map((t) => (t.face === face ? { ...t, uv: { ...t.uv, [key]: value } } : t))
    );
  };

  const getTexture = (face: FaceName) => facadeTextures.find((t) => t.face === face);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>3D Building Preview</h3>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
            {sceneSpec.apartments.length} units &middot; {sceneSpec.envelopes.length} building(s)
            {facadeTextures.length > 0 && ` \u00b7 ${facadeTextures.length} texture(s)`}
          </p>
        </div>
        {facadeTextures.length > 0 && (
          <button
            className="button-primary"
            onClick={() => setRendered(true)}
            style={{ fontSize: "0.8rem", padding: "8px 20px" }}
          >
            {rendered ? "Re-render" : "Render with Textures"}
          </button>
        )}
      </div>

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
            facadeTextures={rendered ? facadeTextures : []}
            onSelectApartment={setSelectedApartmentId}
            onReady={() => setViewerReady(true)}
          />
        </div>

        {/* Side panel */}
        <div style={{ borderLeft: "1px solid var(--line)", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
            <button
              type="button"
              onClick={() => setSideTab("textures")}
              style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                background: sideTab === "textures" ? "var(--bg)" : "var(--bg-alt)",
                borderBottom: sideTab === "textures" ? "2px solid var(--accent)" : "2px solid transparent",
                color: sideTab === "textures" ? "var(--fg)" : "var(--muted)",
              }}
            >
              Facade Textures
            </button>
            <button
              type="button"
              onClick={() => setSideTab("unit")}
              style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                background: sideTab === "unit" ? "var(--bg)" : "var(--bg-alt)",
                borderBottom: sideTab === "unit" ? "2px solid var(--accent)" : "2px solid transparent",
                color: sideTab === "unit" ? "var(--fg)" : "var(--muted)",
              }}
            >
              Unit Info
            </button>
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
                      {/* Face header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-alt)" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, flex: 1 }}>{label}</span>
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

                            {/* UV Adjustments */}
                            {isExpanded && (
                              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                                <UvSlider label="Offset X" value={tex.uv.offsetX} min={-2} max={2} step={0.01}
                                  onChange={(v) => { handleUvChange(face, "offsetX", v); setRendered(false); }} />
                                <UvSlider label="Offset Y" value={tex.uv.offsetY} min={-2} max={2} step={0.01}
                                  onChange={(v) => { handleUvChange(face, "offsetY", v); setRendered(false); }} />
                                <UvSlider label="Repeat X" value={tex.uv.repeatX} min={0.1} max={5} step={0.05}
                                  onChange={(v) => { handleUvChange(face, "repeatX", v); setRendered(false); }} />
                                <UvSlider label="Repeat Y" value={tex.uv.repeatY} min={0.1} max={5} step={0.05}
                                  onChange={(v) => { handleUvChange(face, "repeatY", v); setRendered(false); }} />
                                <UvSlider label="Rotation" value={tex.uv.rotation} min={-180} max={180} step={1}
                                  onChange={(v) => { handleUvChange(face, "rotation", v); setRendered(false); }} />
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

                {facadeTextures.length > 0 && !rendered && (
                  <p style={{ fontSize: "0.7rem", color: "var(--muted)", textAlign: "center", margin: "4px 0 0" }}>
                    Click &quot;Render with Textures&quot; to apply.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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

// Three.js BoxGeometry material indices: +X, -X, +Y, -Y, +Z, -Z
const FACE_TO_MAT_INDEX: Record<FaceName, number> = { right: 0, left: 1, front: 4, back: 5 };

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
    envelopeMaterials: MeshStandardMaterial[];
    hoveredMesh: Mesh | null;
    animationId: number;
    threeModule: typeof import("three");
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
      } else if (mesh !== state.hoveredMesh) {
        mat.color.setHex(COLORS.apartment);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  }, [selectedApartmentId]);

  // Apply/update facade textures without full rebuild
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const THREE = state.threeModule;
    const loader = new THREE.TextureLoader();

    // Reset all envelope materials to default first
    for (let i = 0; i < 6; i++) {
      const mat = state.envelopeMaterials[i];
      if (!mat) continue;
      if (mat.map) { mat.map.dispose(); mat.map = null; }
      mat.color.setHex(COLORS.envelopeDefault);
      mat.transparent = true;
      mat.opacity = i === 3 ? 0 : 0.15; // bottom stays invisible
      mat.visible = i !== 3;
      mat.needsUpdate = true;
    }

    // Apply textures for faces that have them
    for (const tex of facadeTextures) {
      const matIndex = FACE_TO_MAT_INDEX[tex.face];
      if (matIndex === undefined) continue;
      const mat = state.envelopeMaterials[matIndex];
      if (!mat) continue;

      loader.load(tex.url, (t) => {
        t.offset.set(tex.uv.offsetX, tex.uv.offsetY);
        t.repeat.set(tex.uv.repeatX, tex.uv.repeatY);
        t.rotation = (tex.uv.rotation * Math.PI) / 180;
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.center.set(0.5, 0.5);
        t.colorSpace = THREE.SRGBColorSpace;
        mat.map = t;
        mat.color.setHex(0xffffff);
        mat.transparent = true;
        mat.opacity = 0.95;
        mat.needsUpdate = true;
      });
    }
  }, [facadeTextures]);

  const buildScene = useCallback(async (spec: SceneSpec) => {
    const container = mountRef.current;
    if (!container) return;

    const THREE = await import("three");
    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

    if (stateRef.current) {
      cancelAnimationFrame(stateRef.current.animationId);
      stateRef.current.controls.dispose();
      stateRef.current.renderer.dispose();
      container.innerHTML = "";
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    // Sky gradient background
    scene.background = new THREE.Color(COLORS.skyBottom);
    scene.fog = new THREE.Fog(COLORS.skyBottom, 80, 200);

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
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(target.x, target.y, target.z);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = distance * 3;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // --- Improved lighting ---
    // Hemisphere: sky blue from above, warm bounce from ground
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0xb89878, 0.6));
    // Main sun
    const sun = new THREE.DirectionalLight(0xfff5e6, 1.0);
    sun.position.set(20, 30, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -5;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.001;
    sun.shadow.radius = 3;
    scene.add(sun);
    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0xc0d0e0, 0.3);
    fill.position.set(-15, 12, -10);
    scene.add(fill);

    // --- Envelope materials (6 faces) ---
    const envelopeMaterials: MeshStandardMaterial[] = [];
    for (let i = 0; i < 6; i++) {
      const isBottom = i === 3;
      const isTop = i === 2;
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

    // --- Envelopes ---
    for (const env of spec.envelopes) {
      const geo = new THREE.BoxGeometry(env.size.x, env.size.y, env.size.z);
      const mesh = new THREE.Mesh(geo, envelopeMaterials);
      mesh.position.set(env.position.x + env.size.x / 2, env.position.y + env.size.y / 2, env.position.z + env.size.z / 2);
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Envelope edges
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.35 }));
      edges.position.copy(mesh.position);
      scene.add(edges);

      // --- Roof parapet (thin raised edge around rooftop) ---
      const parapetH = 0.15;
      const parapetT = 0.1;
      const parapetMat = new THREE.MeshStandardMaterial({ color: COLORS.roof, roughness: 0.9 });
      const roofY = env.position.y + env.size.y;
      // Front + back parapets
      for (const zOff of [0, env.size.z]) {
        const pg = new THREE.BoxGeometry(env.size.x, parapetH, parapetT);
        const pm = new THREE.Mesh(pg, parapetMat);
        pm.position.set(env.position.x + env.size.x / 2, roofY + parapetH / 2, env.position.z + zOff);
        pm.castShadow = true;
        scene.add(pm);
      }
      // Left + right parapets
      for (const xOff of [0, env.size.x]) {
        const pg = new THREE.BoxGeometry(parapetT, parapetH, env.size.z);
        const pm = new THREE.Mesh(pg, parapetMat);
        pm.position.set(env.position.x + xOff, roofY + parapetH / 2, env.position.z + env.size.z / 2);
        pm.castShadow = true;
        scene.add(pm);
      }

      // --- Floor separator lines ---
      const floorH = spec.apartments[0]?.size.y ? (spec.apartments[0].size.y / 0.9) : 3;
      const floorLineMat = new THREE.MeshStandardMaterial({ color: COLORS.floorLine, roughness: 0.8 });
      for (let f = 1; f < env.floorCount; f++) {
        const lineY = env.position.y + f * floorH;
        // Front line
        const fg = new THREE.BoxGeometry(env.size.x + 0.06, 0.06, 0.06);
        const fm = new THREE.Mesh(fg, floorLineMat);
        fm.position.set(env.position.x + env.size.x / 2, lineY, env.position.z + env.size.z + 0.03);
        scene.add(fm);
        // Back line
        const bm = fm.clone();
        bm.position.z = env.position.z - 0.03;
        scene.add(bm);
      }

      // --- Entrance emphasis (ground floor front) ---
      const entranceW = 1.2;
      const entranceH = floorH * 0.85;
      const entranceD = 0.15;
      const entranceMat = new THREE.MeshStandardMaterial({ color: COLORS.entrance, roughness: 0.5, metalness: 0.1 });
      const entranceGeo = new THREE.BoxGeometry(entranceW, entranceH, entranceD);
      const entranceMesh = new THREE.Mesh(entranceGeo, entranceMat);
      entranceMesh.position.set(
        env.position.x + env.size.x / 2,
        env.position.y + entranceH / 2,
        env.position.z + env.size.z + entranceD / 2
      );
      entranceMesh.castShadow = true;
      scene.add(entranceMesh);
      // Entrance canopy
      const canopyGeo = new THREE.BoxGeometry(entranceW + 0.6, 0.08, 0.8);
      const canopyMesh = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({ color: COLORS.edge, roughness: 0.4, metalness: 0.2 }));
      canopyMesh.position.set(entranceMesh.position.x, env.position.y + entranceH + 0.04, env.position.z + env.size.z + 0.4);
      canopyMesh.castShadow = true;
      scene.add(canopyMesh);
    }

    // --- Apartments with architectural details ---
    const apartmentMeshes: Mesh[] = [];
    const gap = 0.04;
    for (const apt of spec.apartments) {
      const sx = apt.size.x - gap;
      const sy = apt.size.y - gap;
      const sz = apt.size.z - gap * 2;
      const geo = new THREE.BoxGeometry(sx, sy, sz);
      const isSelected = apt.meta.apartmentId === selectedIdRef.current;
      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? COLORS.highlighted : COLORS.apartment,
        emissive: isSelected ? COLORS.highlightEmissive : 0x000000,
        emissiveIntensity: isSelected ? 0.3 : 0,
        roughness: 0.75,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const cx = apt.position.x + apt.size.x / 2;
      const cy = apt.position.y + apt.size.y / 2;
      const cz = apt.position.z + apt.size.z / 2;
      mesh.position.set(cx, cy, cz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = apt.meta;
      apartmentMeshes.push(mesh);
      scene.add(mesh);

      // Apartment edge lines
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeLines = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.5 }));
      edgeLines.position.copy(mesh.position);
      scene.add(edgeLines);

      // --- Windows on front face (Z+) ---
      const windowW = sx * 0.3;
      const windowH = sy * 0.45;
      const windowD = 0.05;
      const windowMat = new THREE.MeshStandardMaterial({ color: COLORS.window, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.8 });
      const windowFrameMat = new THREE.MeshStandardMaterial({ color: COLORS.windowFrame, roughness: 0.6 });

      // Two windows per apartment front
      for (const wxOff of [-sx * 0.2, sx * 0.2]) {
        // Glass pane
        const wg = new THREE.BoxGeometry(windowW, windowH, windowD);
        const wm = new THREE.Mesh(wg, windowMat);
        wm.position.set(cx + wxOff, cy + sy * 0.05, cz + sz / 2 + windowD / 2);
        scene.add(wm);
        // Frame
        const frameGeo = new THREE.EdgesGeometry(wg);
        const frame = new THREE.LineSegments(frameGeo, new THREE.LineBasicMaterial({ color: COLORS.windowFrame }));
        frame.position.copy(wm.position);
        scene.add(frame);
        // Sill
        const sillGeo = new THREE.BoxGeometry(windowW + 0.08, 0.04, 0.1);
        const sill = new THREE.Mesh(sillGeo, windowFrameMat);
        sill.position.set(cx + wxOff, cy + sy * 0.05 - windowH / 2 - 0.02, cz + sz / 2 + 0.05);
        scene.add(sill);
      }

      // --- Balcony on front (every other apartment, not ground floor) ---
      if (apt.meta.floorNumber > 1 && apartmentMeshes.length % 2 === 0) {
        const balconyW = sx * 0.6;
        const balconyD = 0.6;
        const balconyH = 0.08;
        const balconyFloor = new THREE.Mesh(
          new THREE.BoxGeometry(balconyW, balconyH, balconyD),
          new THREE.MeshStandardMaterial({ color: COLORS.balcony, roughness: 0.8 })
        );
        balconyFloor.position.set(cx, cy - sy / 2 + balconyH / 2, cz + sz / 2 + balconyD / 2);
        balconyFloor.castShadow = true;
        balconyFloor.receiveShadow = true;
        scene.add(balconyFloor);
        // Railing (simple lines)
        const railH = 0.5;
        const railMat = new THREE.LineBasicMaterial({ color: COLORS.windowFrame });
        // Front rail
        const railPts = [new THREE.Vector3(-balconyW / 2, 0, 0), new THREE.Vector3(balconyW / 2, 0, 0)];
        const railGeo = new THREE.BufferGeometry().setFromPoints(railPts);
        const rail = new THREE.Line(railGeo, railMat);
        rail.position.set(cx, cy - sy / 2 + balconyH + railH, cz + sz / 2 + balconyD);
        scene.add(rail);
        // Vertical posts
        for (const xp of [-balconyW / 2, 0, balconyW / 2]) {
          const postPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, railH, 0)];
          const postGeo = new THREE.BufferGeometry().setFromPoints(postPts);
          const post = new THREE.Line(postGeo, railMat);
          post.position.set(cx + xp, cy - sy / 2 + balconyH, cz + sz / 2 + balconyD);
          scene.add(post);
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

    const onPointerMove = (e: MouseEvent) => {
      const hit = getHit(e);
      if (hoveredMesh && hoveredMesh !== hit) {
        const m = hoveredMesh.material as MeshStandardMaterial;
        const isSel = hoveredMesh.userData.apartmentId === selectedIdRef.current;
        m.color.setHex(isSel ? COLORS.highlighted : COLORS.apartment);
        m.emissive.setHex(isSel ? COLORS.highlightEmissive : 0x000000);
        m.emissiveIntensity = isSel ? 0.3 : 0;
        renderer.domElement.style.cursor = "default";
      }
      if (hit && hit !== hoveredMesh) {
        const m = hit.material as MeshStandardMaterial;
        if (hit.userData.apartmentId !== selectedIdRef.current) {
          m.color.setHex(COLORS.hovered);
          m.emissive.setHex(COLORS.hoverEmissive);
          m.emissiveIntensity = 0.25;
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
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let animationId = 0;
    const animate = () => { controls.update(); renderer.render(scene, camera); animationId = requestAnimationFrame(animate); };
    animate();

    stateRef.current = { renderer, controls, apartmentMeshes, envelopeMaterials, hoveredMesh, animationId, threeModule: THREE };
    onReady();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
      stateRef.current = null;
    };
  }, [onReady]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    buildScene(sceneSpec).then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [sceneSpec, buildScene]);

  return <div ref={mountRef} style={{ width: "100%", height: 520 }} />;
}
