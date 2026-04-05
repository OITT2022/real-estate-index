"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WebGLRenderer, Mesh, MeshStandardMaterial } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneSpec, FacadeMapping } from "@/lib/building-3d/generate-scene";

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
  background: 0xf4f6f8,
  ground: 0xe9edf2,
  apartment: 0xc8d0da,
  highlighted: 0xff6b6b,
  hovered: 0x64b5f6,
  envelopeDefault: 0xdce3ea,
  edge: 0x90a4ae,
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

  // Highlight sync
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    for (const mesh of state.apartmentMeshes) {
      const mat = mesh.material as MeshStandardMaterial;
      const id = mesh.userData.apartmentId as string;
      if (id === selectedApartmentId) mat.color.setHex(COLORS.highlighted);
      else if (mesh !== state.hoveredMesh) mat.color.setHex(COLORS.apartment);
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

      const texture = loader.load(tex.url, (t) => {
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
    scene.background = new THREE.Color(COLORS.background);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    const { target, distance, yaw, pitch } = spec.camera;
    camera.position.set(
      target.x + distance * Math.sin(yaw) * Math.cos(pitch),
      target.y + distance * Math.sin(pitch),
      target.z + distance * Math.cos(yaw) * Math.cos(pitch),
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(15, 25, 20);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    scene.add(dir);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.3).translateX(-10).translateY(10).translateZ(-10));

    // Build 6 envelope materials: [+X right, -X left, +Y top, -Y bottom, +Z front, -Z back]
    const envelopeMaterials: MeshStandardMaterial[] = [];
    for (let i = 0; i < 6; i++) {
      const isBottom = i === 3;
      envelopeMaterials.push(new THREE.MeshStandardMaterial({
        color: COLORS.envelopeDefault,
        transparent: true,
        opacity: isBottom ? 0 : 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
        visible: !isBottom,
        roughness: 0.6,
        metalness: 0.05,
      }));
    }

    // Envelopes
    for (const env of spec.envelopes) {
      const geo = new THREE.BoxGeometry(env.size.x, env.size.y, env.size.z);
      const mesh = new THREE.Mesh(geo, envelopeMaterials);
      mesh.position.set(env.position.x + env.size.x / 2, env.position.y + env.size.y / 2, env.position.z + env.size.z / 2);
      mesh.receiveShadow = true;
      scene.add(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.4 }));
      edges.position.copy(mesh.position);
      scene.add(edges);
    }

    // Apartments
    const apartmentMeshes: Mesh[] = [];
    const gap = 0.05;
    for (const apt of spec.apartments) {
      const geo = new THREE.BoxGeometry(apt.size.x - gap, apt.size.y - gap, apt.size.z - gap * 2);
      const isSelected = apt.meta.apartmentId === selectedIdRef.current;
      const mat = new THREE.MeshStandardMaterial({ color: isSelected ? COLORS.highlighted : COLORS.apartment, roughness: 0.7, metalness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(apt.position.x + apt.size.x / 2, apt.position.y + apt.size.y / 2, apt.position.z + apt.size.z / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = apt.meta;
      apartmentMeshes.push(mesh);
      scene.add(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      scene.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.6 })).translateX(mesh.position.x).translateY(mesh.position.y).translateZ(mesh.position.z));
    }

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: COLORS.ground }));
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
        (hoveredMesh.material as MeshStandardMaterial).color.setHex(
          hoveredMesh.userData.apartmentId === selectedIdRef.current ? COLORS.highlighted : COLORS.apartment
        );
        renderer.domElement.style.cursor = "default";
      }
      if (hit && hit !== hoveredMesh) {
        if (hit.userData.apartmentId !== selectedIdRef.current)
          (hit.material as MeshStandardMaterial).color.setHex(COLORS.hovered);
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
