/**
 * Premium Mediterranean-style environment for the 3D building scene.
 * All elements are added to a single THREE.Group so they can be toggled on/off.
 * Does NOT modify building geometry, apartment meshes, or facade textures.
 */

import type { Scene, Mesh, HemisphereLight, DirectionalLight, Object3D } from "three";

interface EnvConfig {
  /** Building envelope position (corner) */
  buildingPos: { x: number; y: number; z: number };
  /** Building envelope size */
  buildingSize: { x: number; y: number; z: number };
}

type THREE = typeof import("three");

export function createPremiumEnvironment(THREE: THREE, config: EnvConfig) {
  const group = new THREE.Group();
  group.name = "premium-environment";

  const bx = config.buildingPos.x;
  const bz = config.buildingPos.z;
  const bw = config.buildingSize.x; // width (X)
  const bd = config.buildingSize.z; // depth (Z)
  const bCx = bx + bw / 2;         // building center X
  const bCz = bz + bd / 2;         // building center Z

  // Shared materials — flat surfaces are semi-transparent to let EXR show through
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3e, roughness: 0.92, metalness: 0.0,
    transparent: true, opacity: 0.45, depthWrite: false,
  });
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0xd8d0c4, roughness: 0.85, metalness: 0.0,
    transparent: true, opacity: 0.4, depthWrite: false,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0xc8c0b4, roughness: 0.8, metalness: 0.0,
    transparent: true, opacity: 0.55,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xb8b0a4, roughness: 0.75, metalness: 0.02,
    transparent: true, opacity: 0.5, depthWrite: false,
  });
  const parkingLineMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee, roughness: 0.5, metalness: 0.0,
    transparent: true, opacity: 0.5,
  });

  // ================================================================
  // 1. ROAD — smooth asphalt road in front of building (front = +Z)
  // ================================================================
  const roadWidth = bw + 20;
  const roadDepth = 4.5;
  const roadZ = bz + bd + 8; // 8 units in front of building

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, roadDepth),
    asphaltMat,
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(bCx, 0.005, roadZ + roadDepth / 2);
  road.receiveShadow = true;
  group.add(road);

  // Lane markings — dashed center line
  const dashCount = Math.floor(roadWidth / 2.4);
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.12),
      parkingLineMat,
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(
      bCx - roadWidth / 2 + 1.2 + i * 2.4,
      0.008,
      roadZ + roadDepth / 2,
    );
    group.add(dash);
  }

  // Road edge lines (solid)
  for (const zOff of [0, roadDepth - 0.15]) {
    const edgeLine = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, 0.1),
      parkingLineMat,
    );
    edgeLine.rotation.x = -Math.PI / 2;
    edgeLine.position.set(bCx, 0.008, roadZ + 0.075 + zOff);
    group.add(edgeLine);
  }

  // Curbs along road edges
  for (const zOff of [-0.15, roadDepth + 0.05]) {
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.12, 0.2),
      curbMat,
    );
    curb.position.set(bCx, 0.06, roadZ + zOff);
    curb.castShadow = true;
    curb.receiveShadow = true;
    group.add(curb);
  }

  // ================================================================
  // 2. SIDEWALKS — light stone walkways along road and building sides
  // ================================================================
  const sidewalkWidth = 2.0;

  // Front sidewalk (between building area and road)
  const frontSidewalkZ = bz + bd + 3.5;
  const frontSidewalk = new THREE.Mesh(
    new THREE.PlaneGeometry(bw + 8, sidewalkWidth),
    sidewalkMat,
  );
  frontSidewalk.rotation.x = -Math.PI / 2;
  frontSidewalk.position.set(bCx, 0.015, frontSidewalkZ + sidewalkWidth / 2);
  frontSidewalk.receiveShadow = true;
  group.add(frontSidewalk);

  // Sidewalk along road (pedestrian side)
  const roadSidewalk = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, sidewalkWidth),
    sidewalkMat,
  );
  roadSidewalk.rotation.x = -Math.PI / 2;
  roadSidewalk.position.set(bCx, 0.015, roadZ - sidewalkWidth / 2);
  roadSidewalk.receiveShadow = true;
  group.add(roadSidewalk);

  // Side sidewalks along building
  for (const side of [-1, 1]) {
    const sideX = side === -1 ? bx - 2.5 : bx + bw + 2.5;
    const sideSidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, bd + 6),
      sidewalkMat,
    );
    sideSidewalk.rotation.x = -Math.PI / 2;
    sideSidewalk.position.set(sideX, 0.012, bCz + 1);
    sideSidewalk.receiveShadow = true;
    group.add(sideSidewalk);
  }

  // ================================================================
  // 3. ENTRANCE PATH — from building front door to sidewalk
  // ================================================================
  const entrancePathWidth = 2.2;
  const entrancePathDepth = frontSidewalkZ - (bz + bd) + sidewalkWidth;

  const entrancePath = new THREE.Mesh(
    new THREE.PlaneGeometry(entrancePathWidth, entrancePathDepth),
    stoneMat,
  );
  entrancePath.rotation.x = -Math.PI / 2;
  entrancePath.position.set(bCx, 0.018, bz + bd + entrancePathDepth / 2);
  entrancePath.receiveShadow = true;
  group.add(entrancePath);

  // Entrance framing — small raised steps
  const stepW = entrancePathWidth + 0.4;
  const stepD = 0.6;
  const stepH = 0.08;
  for (let s = 0; s < 2; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(stepW - s * 0.2, stepH, stepD),
      curbMat,
    );
    step.position.set(bCx, stepH / 2 + s * stepH, bz + bd + 0.3 + s * 0.5);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }

  // Entrance border stones (low pillars)
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.5, 0.25),
      stoneMat,
    );
    pillar.position.set(
      bCx + side * (entrancePathWidth / 2 + 0.2),
      0.25,
      bz + bd + 0.5,
    );
    pillar.castShadow = true;
    group.add(pillar);
  }

  // ================================================================
  // 7. PARKING AREA — clean, minimal, to the left side of building
  // ================================================================
  const parkingX = bx - 8;
  const parkingZ = bz + bd + 2;
  const spotW = 2.4;
  const spotD = 4.5;
  const spotCount = 4;
  const parkingTotalW = spotCount * spotW + 0.5;

  // Parking surface
  const parkingSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(parkingTotalW, spotD + 1),
    asphaltMat,
  );
  parkingSurface.rotation.x = -Math.PI / 2;
  parkingSurface.position.set(parkingX - parkingTotalW / 2, 0.004, parkingZ + spotD / 2);
  parkingSurface.receiveShadow = true;
  group.add(parkingSurface);

  // Parking spot markings
  for (let i = 0; i <= spotCount; i++) {
    const lineX = parkingX - parkingTotalW + 0.25 + i * spotW;
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, spotD - 0.4),
      parkingLineMat,
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(lineX, 0.007, parkingZ + spotD / 2);
    group.add(line);
  }

  // Front parking line
  const parkingFrontLine = new THREE.Mesh(
    new THREE.PlaneGeometry(parkingTotalW, 0.08),
    parkingLineMat,
  );
  parkingFrontLine.rotation.x = -Math.PI / 2;
  parkingFrontLine.position.set(parkingX - parkingTotalW / 2, 0.007, parkingZ + spotD + 0.3);
  group.add(parkingFrontLine);

  // Parking curb
  const parkingCurb = new THREE.Mesh(
    new THREE.BoxGeometry(parkingTotalW + 0.4, 0.1, 0.15),
    curbMat,
  );
  parkingCurb.position.set(parkingX - parkingTotalW / 2, 0.05, parkingZ - 0.1);
  group.add(parkingCurb);

  // Enable shadows on all meshes in group
  group.traverse((obj: Object3D) => {
    if ((obj as Mesh).isMesh) {
      (obj as Mesh).receiveShadow = true;
    }
  });

  return group;
}

/**
 * Apply Mediterranean-style lighting upgrades to an existing scene.
 * Call AFTER adding the environment group.
 */
export function applyMediterraneanLighting(
  THREE: THREE,
  scene: Scene,
  buildingSize: { x: number; y: number; z: number },
) {
  // Do NOT overwrite scene.background — it's set from the EXR environment map
  // No fog — let the EXR environment show clearly through transparent elements
  scene.fog = null;

  // Rebalance existing lights for environment + EXR IBL
  scene.traverse((obj: Object3D) => {
    if ((obj as HemisphereLight).isHemisphereLight) {
      const hemi = obj as HemisphereLight;
      hemi.color.setHSL(0.58, 0.35, 0.72);
      hemi.groundColor.setHSL(0.09, 0.45, 0.6);
      hemi.intensity = 0.3;
    }
    if ((obj as DirectionalLight).isDirectionalLight) {
      const dir = obj as DirectionalLight;
      if (dir.castShadow) {
        dir.color.setHSL(0.09, 0.45, 0.97);
        dir.intensity = 0.85;
        dir.position.set(25, 35, 20);
        // Expand shadow camera for environment elements
        dir.shadow.camera.left = -50;
        dir.shadow.camera.right = 50;
        dir.shadow.camera.top = 50;
        dir.shadow.camera.bottom = -20;
        dir.shadow.camera.far = 120;
        dir.shadow.camera.updateProjectionMatrix();
      }
    }
  });
}
