import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneSpec, FacadeMapping } from '../../types/scene';

interface Props {
  sceneSpec: SceneSpec | null;
  selectedApartmentId?: string | null;
  facadeMappings?: FacadeMapping[];
  onSelectApartment?: (apartmentId: string) => void;
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

// Three.js BoxGeometry material indices: +X, -X, +Y, -Y, +Z, -Z
const FACE_TO_MATERIAL_INDEX: Record<string, number> = {
  right: 0,   // +X
  left: 1,    // -X
  front: 4,   // +Z  (faces the camera)
  back: 5,    // -Z
};

export function BuildingViewer({ sceneSpec, selectedApartmentId, facadeMappings, onSelectApartment }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    apartmentMeshes: THREE.Mesh[];
    envelopeMaterials: THREE.MeshStandardMaterial[];
    hoveredMesh: THREE.Mesh | null;
    animationId: number;
  } | null>(null);

  const onSelectRef = useRef(onSelectApartment);
  onSelectRef.current = onSelectApartment;

  const selectedIdRef = useRef(selectedApartmentId);
  selectedIdRef.current = selectedApartmentId;

  // Update apartment highlight colors without rebuilding scene
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    for (const mesh of state.apartmentMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const id = mesh.userData.apartmentId as string;
      if (id === selectedApartmentId) {
        mat.color.setHex(COLORS.highlighted);
      } else if (mesh !== state.hoveredMesh) {
        mat.color.setHex(COLORS.apartment);
      }
    }
  }, [selectedApartmentId]);

  // Update facade texture UVs when mappings change (live preview from sliders)
  useEffect(() => {
    const state = stateRef.current;
    if (!state || !facadeMappings) return;

    for (const mapping of facadeMappings) {
      const matIndex = FACE_TO_MATERIAL_INDEX[mapping.face];
      if (matIndex === undefined) continue;
      const mat = state.envelopeMaterials[matIndex];
      if (!mat?.map) continue;

      const tex = mat.map;
      tex.offset.set(mapping.uv.offsetX, mapping.uv.offsetY);
      tex.repeat.set(mapping.uv.repeatX, mapping.uv.repeatY);
      tex.rotation = (mapping.uv.rotation * Math.PI) / 180;
      tex.needsUpdate = true;
    }
  }, [facadeMappings]);

  const buildScene = useCallback((spec: SceneSpec, initialMappings?: FacadeMapping[]) => {
    const container = mountRef.current;
    if (!container) return;

    // Clean up previous
    if (stateRef.current) {
      cancelAnimationFrame(stateRef.current.animationId);
      stateRef.current.controls.dispose();
      stateRef.current.renderer.dispose();
      container.innerHTML = '';
    }

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;
    const mappings = initialMappings ?? spec.facades;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    const { target, distance, yaw, pitch } = spec.camera;
    camera.position.set(
      target.x + distance * Math.sin(yaw) * Math.cos(pitch),
      target.y + distance * Math.sin(pitch),
      target.z + distance * Math.cos(yaw) * Math.cos(pitch)
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(target.x, target.y, target.z);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = distance * 3;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(15, 25, 20);
    directional.castShadow = true;
    directional.shadow.mapSize.set(1024, 1024);
    scene.add(directional);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // Build facade material lookup: face → FacadeMapping
    const facadeMap = new Map<string, FacadeMapping>();
    for (const m of mappings) {
      facadeMap.set(m.face, m);
    }

    // Build 6 materials for the envelope box: [+X, -X, +Y, -Y, +Z, -Z]
    const textureLoader = new THREE.TextureLoader();
    const envelopeMaterials: THREE.MeshStandardMaterial[] = [];

    const makeFallbackMaterial = (color: number) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.05,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      });

    const faceOrder: (string | null)[] = ['right', 'left', null, null, 'front', 'back'];

    for (let i = 0; i < 6; i++) {
      const faceName = faceOrder[i];
      const mapping = faceName ? facadeMap.get(faceName) : null;

      if (mapping) {
        const tex = textureLoader.load(
          mapping.image,
          // On success: apply UV from mapping
          (loadedTex) => {
            loadedTex.offset.set(mapping.uv.offsetX, mapping.uv.offsetY);
            loadedTex.repeat.set(mapping.uv.repeatX, mapping.uv.repeatY);
            loadedTex.rotation = (mapping.uv.rotation * Math.PI) / 180;
            loadedTex.wrapS = THREE.RepeatWrapping;
            loadedTex.wrapT = THREE.RepeatWrapping;
            loadedTex.center.set(0.5, 0.5);
          },
          undefined,
          // On error: texture didn't load — fall back to tinted material
          () => {
            mat.map = null;
            mat.color.setHex(COLORS.envelopeDefault);
            mat.opacity = 0.35;
            mat.needsUpdate = true;
          }
        );
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.center.set(0.5, 0.5);

        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.6,
          metalness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
        });
        envelopeMaterials.push(mat);
      } else if (i === 2) {
        // Top (roof)
        envelopeMaterials.push(makeFallbackMaterial(COLORS.roof));
      } else if (i === 3) {
        // Bottom — hidden, fully transparent
        const mat = new THREE.MeshStandardMaterial({ visible: false });
        envelopeMaterials.push(mat);
      } else {
        envelopeMaterials.push(makeFallbackMaterial(COLORS.envelopeDefault));
      }
    }

    // Building envelopes
    for (const env of spec.envelopes) {
      const geo = new THREE.BoxGeometry(env.size.x, env.size.y, env.size.z);
      const mesh = new THREE.Mesh(geo, envelopeMaterials);
      mesh.position.set(
        env.position.x + env.size.x / 2,
        env.position.y + env.size.y / 2,
        env.position.z + env.size.z / 2
      );
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Envelope edges
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.4 });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.position.copy(mesh.position);
      scene.add(edges);
    }

    // Apartment meshes
    const apartmentMeshes: THREE.Mesh[] = [];
    const apartmentGap = 0.05;

    for (const apt of spec.apartments) {
      const gapSize = {
        x: apt.size.x - apartmentGap,
        y: apt.size.y - apartmentGap,
        z: apt.size.z - apartmentGap * 2,
      };
      const geo = new THREE.BoxGeometry(gapSize.x, gapSize.y, gapSize.z);
      const isSelected = apt.meta.apartmentId === selectedIdRef.current;
      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? COLORS.highlighted : COLORS.apartment,
        roughness: 0.7,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        apt.position.x + apt.size.x / 2,
        apt.position.y + apt.size.y / 2,
        apt.position.z + apt.size.z / 2
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = apt.meta;
      apartmentMeshes.push(mesh);
      scene.add(mesh);

      // Apartment edges
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.6 });
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
      edgeLines.position.copy(mesh.position);
      scene.add(edgeLines);
    }

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: COLORS.ground })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;

    const getIntersectedApartment = (event: MouseEvent): THREE.Mesh | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(apartmentMeshes);
      return (intersects[0]?.object as THREE.Mesh) ?? null;
    };

    const handlePointerMove = (event: MouseEvent) => {
      const hit = getIntersectedApartment(event);

      if (hoveredMesh && hoveredMesh !== hit) {
        const mat = hoveredMesh.material as THREE.MeshStandardMaterial;
        const id = hoveredMesh.userData.apartmentId as string;
        mat.color.setHex(id === selectedIdRef.current ? COLORS.highlighted : COLORS.apartment);
        renderer.domElement.style.cursor = 'default';
      }

      if (hit && hit !== hoveredMesh) {
        const mat = hit.material as THREE.MeshStandardMaterial;
        const id = hit.userData.apartmentId as string;
        if (id !== selectedIdRef.current) {
          mat.color.setHex(COLORS.hovered);
        }
        renderer.domElement.style.cursor = 'pointer';
      }

      hoveredMesh = hit;
    };

    const handleClick = (event: MouseEvent) => {
      const hit = getIntersectedApartment(event);
      if (hit?.userData?.apartmentId) {
        onSelectRef.current?.(hit.userData.apartmentId as string);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Resize
    const handleResize = () => {
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animate
    let animationId = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    stateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      apartmentMeshes,
      envelopeMaterials,
      hoveredMesh,
      animationId,
    };

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
      stateRef.current = null;
    };
  }, []);

  // Build/rebuild scene when sceneSpec changes
  useEffect(() => {
    if (!sceneSpec) return;
    const cleanup = buildScene(sceneSpec, facadeMappings);
    return cleanup;
    // Only rebuild on sceneSpec change, not on facadeMappings (those are handled by UV sync effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneSpec, buildScene]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: 560, borderRadius: 12, overflow: 'hidden' }}
    />
  );
}
