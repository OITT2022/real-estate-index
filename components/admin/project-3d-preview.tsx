"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WebGLRenderer, Mesh, MeshStandardMaterial } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneSpec } from "@/lib/building-3d/generate-scene";

interface Props {
  sceneSpec: SceneSpec;
}

export function Project3DPreview({ sceneSpec }: Props) {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const selectedApartment = sceneSpec.apartments.find(
    (a) => a.meta.apartmentId === selectedApartmentId
  );

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>3D Building Preview</h3>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
          {sceneSpec.apartments.length} units &middot; {sceneSpec.envelopes.length} building(s)
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: 500 }}>
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
            onSelectApartment={setSelectedApartmentId}
            onReady={() => setViewerReady(true)}
          />
        </div>

        {/* Side panel */}
        <div style={{ borderLeft: "1px solid var(--line)", padding: 16, background: "var(--bg)" }}>
          <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem" }}>Unit Info</h4>
          {!selectedApartment ? (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              Click a unit in the 3D view to see details.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <StatusBadge status={selectedApartment.meta.status} />
              <InfoRow label="Unit" value={selectedApartment.meta.unitNumber} />
              <InfoRow label="Rooms" value={String(selectedApartment.meta.rooms)} />
              <InfoRow label="Area" value={`${selectedApartment.meta.areaSqm} sqm`} />
              <InfoRow label="Floor" value={String(selectedApartment.meta.floorNumber)} />
              <div style={{
                marginTop: 4, padding: "6px 8px", background: "var(--bg-alt)",
                borderRadius: 6, fontSize: "0.75rem", color: "var(--muted)",
              }}>
                Building {selectedApartment.meta.buildingId} &middot; {selectedApartment.meta.entranceId}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Info display helpers ---

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
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
      letterSpacing: 0.5, background: colors.bg, color: colors.text,
      alignSelf: "flex-start",
    }}>
      {s}
    </span>
  );
}

// --- Three.js Viewer (inline, no cross-project imports) ---

interface ViewerProps {
  sceneSpec: SceneSpec;
  selectedApartmentId: string | null;
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
  roof: 0xb0bec5,
};

function ThreeViewer({ sceneSpec, selectedApartmentId, onSelectApartment, onReady }: ViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<{
    renderer: WebGLRenderer;
    controls: OrbitControls;
    apartmentMeshes: Mesh[];
    hoveredMesh: Mesh | null;
    animationId: number;
  } | null>(null);

  const onSelectRef = useRef(onSelectApartment);
  onSelectRef.current = onSelectApartment;
  const selectedIdRef = useRef(selectedApartmentId);
  selectedIdRef.current = selectedApartmentId;

  // Highlight sync without rebuild
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    for (const mesh of state.apartmentMeshes) {
      const mat = mesh.material as MeshStandardMaterial;
      const id = mesh.userData.apartmentId as string;
      if (id === selectedApartmentId) {
        mat.color.setHex(COLORS.highlighted);
      } else if (mesh !== state.hoveredMesh) {
        mat.color.setHex(COLORS.apartment);
      }
    }
  }, [selectedApartmentId]);

  const buildScene = useCallback(async (spec: SceneSpec) => {
    const container = mountRef.current;
    if (!container) return;

    // Dynamic import Three.js (client only)
    const THREE = await import("three");
    const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

    // Cleanup previous
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
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-10, 10, -10);
    scene.add(fill);

    // Envelopes
    for (const env of spec.envelopes) {
      const geo = new THREE.BoxGeometry(env.size.x, env.size.y, env.size.z);
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.envelopeDefault, transparent: true, opacity: 0.15,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(env.position.x + env.size.x / 2, env.position.y + env.size.y / 2, env.position.z + env.size.z / 2);
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
      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? COLORS.highlighted : COLORS.apartment,
        roughness: 0.7, metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(apt.position.x + apt.size.x / 2, apt.position.y + apt.size.y / 2, apt.position.z + apt.size.z / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = apt.meta;
      apartmentMeshes.push(mesh);
      scene.add(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeLines = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.6 }));
      edgeLines.position.copy(mesh.position);
      scene.add(edgeLines);
    }

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: COLORS.ground }),
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
      const hit = raycaster.intersectObjects(apartmentMeshes);
      return (hit[0]?.object as Mesh) ?? null;
    };

    const onPointerMove = (e: MouseEvent) => {
      const hit = getHit(e);
      if (hoveredMesh && hoveredMesh !== hit) {
        const m = hoveredMesh.material as MeshStandardMaterial;
        m.color.setHex(hoveredMesh.userData.apartmentId === selectedIdRef.current ? COLORS.highlighted : COLORS.apartment);
        renderer.domElement.style.cursor = "default";
      }
      if (hit && hit !== hoveredMesh) {
        const m = hit.material as MeshStandardMaterial;
        if (hit.userData.apartmentId !== selectedIdRef.current) m.color.setHex(COLORS.hovered);
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
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    stateRef.current = { renderer, controls, apartmentMeshes, hoveredMesh, animationId };
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

  return <div ref={mountRef} style={{ width: "100%", height: 500 }} />;
}
