import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HeroEntity, EnemyEntity, FloatingText, QuestionData } from '../types';

interface ThreeArenaProps {
  hero: HeroEntity;
  enemies: EnemyEntity[];
  floatingTexts: FloatingText[];
  bgTheme: string;
  shakeIntensity: number;
  currentQuestion: QuestionData | null;
}

export const ThreeArena: React.FC<ThreeArenaProps> = ({
  hero,
  enemies,
  floatingTexts,
  bgTheme,
  shakeIntensity,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // References for Three.js scene instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Pixar Hero Parts
  const heroGroupRef = useRef<THREE.Group | null>(null);
  const heroBodySquashRef = useRef<THREE.Group | null>(null);
  const heroHeadRef = useRef<THREE.Group | null>(null);
  const scarfTailRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Mesh | null>(null);
  const slashArcRef = useRef<THREE.Mesh | null>(null);
  const eyelidsRef = useRef<THREE.Group | null>(null);

  // Environment Animated Objects
  const cloudsGroupRef = useRef<THREE.Group | null>(null);
  const petalsMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const lanternsRef = useRef<THREE.Group[]>([]);

  // Dynamic Enemy Group Map
  const enemiesGroupMap = useRef<Map<number, THREE.Group>>(new Map());

  // Floating text canvas overlay
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Initialise Pixar-Style Three.js Scene, Cinematic Lights & Lush World
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;

    // Scene with dreamy Pixar twilight/sunset atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1e1b4b);
    scene.fog = new THREE.FogExp2(0x2e1065, 0.014);

    // Camera with slight toy-diorama focal length
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 4.3, 18.5);
    camera.lookAt(0, 1.9, 0);
    cameraRef.current = camera;

    // WebGL Renderer with ACES Filmic Tone Mapping for vibrant Pixar colors
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ----------------- PIXAR 3-POINT CINEMATIC LIGHTING ----------------- //
    // 1. Soft Sky-to-Ground Hemisphere Bounce Light
    const hemiLight = new THREE.HemisphereLight(0xfdf4ff, 0x3b0764, 1.4);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // 2. Warm Golden Key Light (casts soft rounded shadows)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    keyLight.position.set(16, 28, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // 3. Cool Magical Rim/Back Light (separates characters from background)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-15, 12, -14);
    scene.add(rimLight);

    // 4. Warm Lantern Point Lights along the stage
    const lanternLight1 = new THREE.PointLight(0xfbbf24, 3.5, 16);
    lanternLight1.position.set(-7, 3.2, 2);
    scene.add(lanternLight1);

    const lanternLight2 = new THREE.PointLight(0xf472b6, 3.2, 16);
    lanternLight2.position.set(7, 3.2, 2);
    scene.add(lanternLight2);

    // ----------------- PIXAR STYLIZED ENVIRONMENT ----------------- //

    // 1. Lush Stylized Grass & Cobblestone Stage
    const grassGeo = new THREE.CylinderGeometry(45, 45, 2, 48);
    const grassMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.65,
      clearcoat: 0.1,
    });
    const grassBase = new THREE.Mesh(grassGeo, grassMat);
    grassBase.position.set(0, -1.05, -2);
    grassBase.receiveShadow = true;
    scene.add(grassBase);

    // Rounded Chibi Cobblestone Stones along the battle path
    const stoneColors = [0x64748b, 0x475569, 0x94a3b8];
    for (let i = -18; i <= 18; i++) {
      const stoneGeo = new THREE.CylinderGeometry(0.65 + (i % 2) * 0.15, 0.75, 0.25, 16);
      const stoneMat = new THREE.MeshPhysicalMaterial({
        color: stoneColors[Math.abs(i) % stoneColors.length],
        roughness: 0.5,
        clearcoat: 0.2,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(i * 1.35, -0.02, (i % 2) * 0.35);
      stone.scale.set(1.2, 1, 0.85);
      stone.receiveShadow = true;
      scene.add(stone);
    }

    // Golden Wooden Bridge Border
    const borderGeo = new THREE.CylinderGeometry(0.18, 0.18, 46, 16);
    borderGeo.rotateZ(Math.PI / 2);
    const borderMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.4,
      clearcoat: 0.3,
    });
    const frontBorder = new THREE.Mesh(borderGeo, borderMat);
    frontBorder.position.set(0, 0.12, 2.3);
    frontBorder.receiveShadow = true;
    scene.add(frontBorder);

    // 2. Soft Rolling Toy Hills in Background
    const hillColors = [0x065f46, 0x047857, 0x3730a3];
    const hillPositions = [
      { x: -16, y: -3, z: -14, r: 9 },
      { x: 4, y: -4, z: -18, r: 12 },
      { x: 20, y: -2.5, z: -13, r: 8.5 },
    ];
    hillPositions.forEach((h, idx) => {
      const hillGeo = new THREE.SphereGeometry(h.r, 32, 24);
      const hillMat = new THREE.MeshPhysicalMaterial({
        color: hillColors[idx % hillColors.length],
        roughness: 0.75,
      });
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(h.x, h.y, h.z);
      hill.scale.set(1.5, 0.9, 0.8);
      scene.add(hill);
    });

    // 3. Cute Rounded Pixar Torii Gates & Hanging Paper Lanterns
    lanternsRef.current = [];
    const buildPixarTorii = (xPos: number, zPos: number, scale = 1) => {
      const torii = new THREE.Group();
      const redLacquerMat = new THREE.MeshPhysicalMaterial({
        color: 0xef4444,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
      });
      const darkRoofMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        clearcoat: 0.5,
      });
      const goldRingMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Chubby Pillars
      const pillarGeo = new THREE.CapsuleGeometry(0.38 * scale, 5.2 * scale, 12, 24);
      const colL = new THREE.Mesh(pillarGeo, redLacquerMat);
      colL.position.set(-2.6 * scale, 2.8 * scale, 0);
      colL.castShadow = true;

      const colR = colL.clone();
      colR.position.x = 2.6 * scale;
      torii.add(colL, colR);

      // Gold Pillar Bases
      const baseGeo = new THREE.CylinderGeometry(0.46 * scale, 0.52 * scale, 0.6 * scale, 16);
      const baseL = new THREE.Mesh(baseGeo, goldRingMat);
      baseL.position.set(-2.6 * scale, 0.3 * scale, 0);
      const baseR = baseL.clone();
      baseR.position.x = 2.6 * scale;
      torii.add(baseL, baseR);

      // Rounded Top Roof Beam
      const topBeamGeo = new THREE.CapsuleGeometry(0.42 * scale, 7.2 * scale, 12, 24);
      topBeamGeo.rotateZ(Math.PI / 2);
      const topBeam = new THREE.Mesh(topBeamGeo, darkRoofMat);
      topBeam.position.set(0, 5.7 * scale, 0);
      topBeam.castShadow = true;

      const subBeamGeo = new THREE.CapsuleGeometry(0.28 * scale, 6.2 * scale, 12, 24);
      subBeamGeo.rotateZ(Math.PI / 2);
      const subBeam = new THREE.Mesh(subBeamGeo, redLacquerMat);
      subBeam.position.set(0, 4.6 * scale, 0);

      torii.add(topBeam, subBeam);

      // Glowing Chochin Paper Lantern hanging in center
      const lanternGroup = new THREE.Group();
      const lanternGeo = new THREE.SphereGeometry(0.48 * scale, 20, 16);
      const lanternMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.8,
        roughness: 0.3,
      });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.scale.set(0.85, 1.15, 0.85);
      lantern.position.y = -0.5 * scale;
      lanternGroup.add(lantern);
      lanternGroup.position.set(0, 4.5 * scale, 0);

      torii.add(lanternGroup);
      lanternsRef.current.push(lanternGroup);

      torii.position.set(xPos, 0, zPos);
      scene.add(torii);
    };

    buildPixarTorii(-9.5, -3.5, 1.05);
    buildPixarTorii(9.5, -3.5, 1.05);
    buildPixarTorii(0, -8.5, 1.45);

    // 4. Fluffy Candy-Pink Sakura Trees & Emerald Bush Clusters
    const buildFluffySakuraTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      const trunkMat = new THREE.MeshPhysicalMaterial({ color: 0x78350f, roughness: 0.7 });
      const trunkGeo = new THREE.CylinderGeometry(0.22 * scale, 0.42 * scale, 3.2 * scale, 12);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.6 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const blossomColors = [0xf472b6, 0xf9a8d4, 0xfbcfe8];
      const puffOffsets = [
        { x: 0, y: 3.6, z: 0, r: 1.45 },
        { x: -1.0, y: 3.1, z: 0.4, r: 1.05 },
        { x: 1.0, y: 3.2, z: -0.2, r: 1.1 },
        { x: 0.2, y: 4.3, z: -0.3, r: 1.0 },
        { x: -0.4, y: 3.8, z: -0.8, r: 0.95 },
      ];

      puffOffsets.forEach((p, idx) => {
        const puffGeo = new THREE.SphereGeometry(p.r * scale, 24, 20);
        const puffMat = new THREE.MeshPhysicalMaterial({
          color: blossomColors[idx % blossomColors.length],
          roughness: 0.5,
          clearcoat: 0.15,
          sheen: 0.6,
          sheenColor: new THREE.Color(0xffffff),
        });
        const puff = new THREE.Mesh(puffGeo, puffMat);
        puff.position.set(p.x * scale, p.y * scale, p.z * scale);
        puff.castShadow = true;
        tree.add(puff);
      });

      tree.position.set(x, 0, z);
      scene.add(tree);
    };

    buildFluffySakuraTree(-14.5, -2.8, 1.15);
    buildFluffySakuraTree(-4.8, -5.2, 0.95);
    buildFluffySakuraTree(5.2, -5.0, 1.0);
    buildFluffySakuraTree(14.8, -3.0, 1.2);

    // 5. Dreamy Floating Pixar Clouds + Glowing Full Moon
    const moonGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(13, 15, -26);
    scene.add(moon);

    const cloudsGroup = new THREE.Group();
    cloudsGroupRef.current = cloudsGroup;
    const cloudMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      clearcoat: 0.2,
    });

    for (let c = 0; c < 5; c++) {
      const singleCloud = new THREE.Group();
      const spheres = [
        { x: 0, y: 0, r: 1.2 },
        { x: -1.0, y: -0.2, r: 0.85 },
        { x: 1.0, y: -0.15, r: 0.9 },
      ];
      spheres.forEach((s) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(s.r, 16, 16), cloudMat);
        m.position.set(s.x, s.y, 0);
        singleCloud.add(m);
      });
      singleCloud.position.set(-18 + c * 9.5, 9.5 + (c % 2) * 2.2, -16 - (c % 3) * 3);
      cloudsGroup.add(singleCloud);
    }
    scene.add(cloudsGroup);

    // 6. Floating Sakura Petals & Magical Fireflies (InstancedMesh)
    const petalCount = 45;
    const petalGeo = new THREE.SphereGeometry(0.09, 8, 8);
    petalGeo.scale(1.6, 0.4, 1.0);
    const petalMat = new THREE.MeshBasicMaterial({ color: 0xfbcfe8 });
    const petalsMesh = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    petalsMeshRef.current = petalsMesh;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < petalCount; i++) {
      dummy.position.set((Math.random() - 0.5) * 32, Math.random() * 12, (Math.random() - 0.5) * 10);
      dummy.updateMatrix();
      petalsMesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(petalsMesh);

    // ----------------- 3D DISNEY PIXAR HERO NINJA MODEL ----------------- //
    const heroGroup = new THREE.Group();
    heroGroupRef.current = heroGroup;

    const squashGroup = new THREE.Group();
    heroBodySquashRef.current = squashGroup;
    heroGroup.add(squashGroup);

    // Glossy Pixar Royal-Blue Ninja Suit Material
    const suitMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      roughness: 0.32,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
      sheen: 0.5,
      sheenColor: new THREE.Color(0x60a5fa),
    });

    // Warm Peach Skin Material (Subsurface scattering look)
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xffedd5,
      roughness: 0.35,
      clearcoat: 0.2,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xfda4af),
    });

    // Red Scarf & Belt Material
    const redClothMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      clearcoat: 0.3,
    });

    // 1. Chubby Rounded Capsule Torso
    const torsoGeo = new THREE.CapsuleGeometry(0.46, 0.55, 16, 24);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    squashGroup.add(torso);

    // Golden Chest Armor Crest
    const crestGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16);
    crestGeo.rotateZ(Math.PI / 2);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.15 });
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.position.set(0.44, 1.3, 0);
    squashGroup.add(crest);

    // Red Obi Belt
    const beltGeo = new THREE.TorusGeometry(0.45, 0.11, 12, 24);
    beltGeo.rotateX(Math.PI / 2);
    const belt = new THREE.Mesh(beltGeo, redClothMat);
    belt.position.y = 0.88;
    squashGroup.add(belt);

    // 2. Oversized Cute Chibi Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.15;
    heroHeadRef.current = headGroup;
    squashGroup.add(headGroup);

    // Main Hooded Head Sphere
    const headGeo = new THREE.SphereGeometry(0.66, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, suitMat);
    headMesh.scale.set(1.0, 0.96, 1.04);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Warm Peach Face Opening
    const faceOpeningGeo = new THREE.SphereGeometry(0.56, 24, 24);
    const faceOpening = new THREE.Mesh(faceOpeningGeo, skinMat);
    faceOpening.position.set(0.16, 0.04, 0);
    faceOpening.scale.set(0.92, 0.65, 0.95);
    headGroup.add(faceOpening);

    // Lower Ninja Mask over mouth
    const maskGeo = new THREE.SphereGeometry(0.67, 24, 16, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48);
    const mask = new THREE.Mesh(maskGeo, suitMat);
    headGroup.add(mask);

    // Red Ninja Headband (Hachimaki) with Silver Plate
    const headbandGeo = new THREE.TorusGeometry(0.64, 0.085, 12, 32);
    headbandGeo.rotateX(Math.PI / 2);
    const headband = new THREE.Mesh(headbandGeo, redClothMat);
    headband.position.y = 0.25;
    headGroup.add(headband);

    const plateGeo = new THREE.BoxGeometry(0.1, 0.18, 0.45);
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.1 });
    const plate = new THREE.Mesh(plateGeo, silverMat);
    plate.position.set(0.64, 0.25, 0);
    headGroup.add(plate);

    // BIG EXPRESSIVE PIXAR EYES (Sclera + Iris + Pupil + Dual Catchlights + Rosy Cheeks)
    const buildPixarEye = (zOffset: number) => {
      const eyeGroup = new THREE.Group();

      // White Sclera
      const scleraGeo = new THREE.SphereGeometry(0.16, 20, 20);
      const scleraMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 1.0 });
      const sclera = new THREE.Mesh(scleraGeo, scleraMat);
      sclera.scale.set(0.55, 1.15, 0.95);
      eyeGroup.add(sclera);

      // Vibrant Sky-Blue Iris
      const irisGeo = new THREE.SphereGeometry(0.11, 16, 16);
      const irisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.x = 0.055;
      iris.scale.set(0.5, 1.1, 0.9);
      eyeGroup.add(iris);

      // Deep Black Pupil
      const pupilGeo = new THREE.SphereGeometry(0.075, 16, 16);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.x = 0.078;
      pupil.scale.set(0.45, 1.05, 0.85);
      eyeGroup.add(pupil);

      // Signature Pixar Big White Specular Highlight (Top-Left)
      const spec1Geo = new THREE.SphereGeometry(0.036, 12, 12);
      const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const spec1 = new THREE.Mesh(spec1Geo, specMat);
      spec1.position.set(0.098, 0.055, 0.035);
      eyeGroup.add(spec1);

      // Secondary Small Specular Highlight (Bottom-Right)
      const spec2Geo = new THREE.SphereGeometry(0.018, 8, 8);
      const spec2 = new THREE.Mesh(spec2Geo, specMat);
      spec2.position.set(0.098, -0.04, -0.03);
      eyeGroup.add(spec2);

      // Expressive Floating Eyebrow
      const browGeo = new THREE.CapsuleGeometry(0.032, 0.18, 8, 12);
      browGeo.rotateX(Math.PI / 2);
      const browMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const brow = new THREE.Mesh(browGeo, browMat);
      brow.position.set(0.06, 0.21, 0);
      brow.rotation.x = zOffset > 0 ? -0.18 : 0.18;
      eyeGroup.add(brow);

      eyeGroup.position.set(0.56, 0.06, zOffset);
      return eyeGroup;
    };

    headGroup.add(buildPixarEye(0.22));
    headGroup.add(buildPixarEye(-0.22));

    // Eyelids for blinking animation
    const eyelidsGroup = new THREE.Group();
    eyelidsRef.current = eyelidsGroup;
    const lidGeo = new THREE.SphereGeometry(0.17, 16, 16);
    const lidL = new THREE.Mesh(lidGeo, skinMat);
    lidL.position.set(0.56, 0.06, 0.22);
    lidL.scale.set(0.6, 1.2, 1.0);
    const lidR = lidL.clone();
    lidR.position.z = -0.22;
    eyelidsGroup.add(lidL, lidR);
    eyelidsGroup.visible = false;
    headGroup.add(eyelidsGroup);

    // Cute Rosy Blush Cheeks
    const blushGeo = new THREE.SphereGeometry(0.075, 12, 12);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.65 });
    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(0.58, -0.08, 0.34);
    blushL.scale.set(0.4, 0.65, 1.0);
    const blushR = blushL.clone();
    blushR.position.z = -0.34;
    headGroup.add(blushL, blushR);

    // 3. Flowing Pixar Red Scarf Tail
    const scarfGroup = new THREE.Group();
    scarfGroup.position.set(-0.42, 1.65, 0);
    scarfTailRef.current = scarfGroup;
    const scarfTailGeo = new THREE.CapsuleGeometry(0.14, 1.1, 12, 16);
    scarfTailGeo.rotateZ(Math.PI / 2);
    const scarfTail = new THREE.Mesh(scarfTailGeo, redClothMat);
    scarfTail.position.x = -0.55;
    scarfGroup.add(scarfTail);
    squashGroup.add(scarfGroup);

    // 4. Chubby Legs & Red Ninja Boots
    const buildLeg = (zOffset: number) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.42, 12, 16), suitMat);
      leg.position.set(0, 0.42, zOffset);
      leg.castShadow = true;

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16), redClothMat);
      boot.scale.set(1.35, 0.75, 0.95);
      boot.position.set(0.08, -0.22, 0);
      leg.add(boot);
      return leg;
    };

    const leftLeg = buildLeg(0.22);
    const rightLeg = buildLeg(-0.22);
    squashGroup.add(leftLeg, rightLeg);
    leftLegRef.current = leftLeg;
    rightLegRef.current = rightLeg;

    // 5. Rounded Arms & Toy-Stylized Glowing Katana
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.42, 12, 16), suitMat);
    leftArm.position.set(0, 1.25, -0.56);
    squashGroup.add(leftArm);
    leftArmRef.current = leftArm;

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.1, 1.25, 0.56);
    rightArmRef.current = rightArmGroup;

    const rightArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.42, 12, 16), suitMat);
    rightArmGroup.add(rightArmMesh);

    // Stylized Pixar Katana
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), redClothMat);
    hilt.rotation.z = Math.PI / 2;
    hilt.position.set(0.2, -0.15, 0);

    const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), goldMat);
    guard.rotation.z = Math.PI / 2;
    guard.position.set(0.42, -0.15, 0);

    const bladeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const blade = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 1.55, 12, 16), bladeMat);
    blade.rotation.z = Math.PI / 2;
    blade.scale.set(1, 1, 0.35);
    blade.position.set(1.22, -0.15, 0);

    rightArmGroup.add(hilt, guard, blade);
    squashGroup.add(rightArmGroup);

    // 6. Vibrant Cyan + Gold Pixar Swoop Slash Wave
    const slashGeo = new THREE.RingGeometry(1.1, 2.05, 24, 1, -Math.PI * 0.25, Math.PI * 0.85);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const slashArc = new THREE.Mesh(slashGeo, slashMat);
    slashArc.position.set(0.95, 1.35, 0.2);
    heroGroup.add(slashArc);
    slashArcRef.current = slashArc;

    scene.add(heroGroup);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 540;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // ----------------- 2. DYNAMIC THEME ATMOSPHERE SWITCHER ----------------- //
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (bgTheme === 'FOREST' || bgTheme === 'BAMBOO') {
      scene.background = new THREE.Color(0x064e3b);
      scene.fog = new THREE.FogExp2(0x065f46, 0.014);
    } else if (bgTheme === 'CASTLE' || bgTheme === 'THRONE') {
      scene.background = new THREE.Color(0x3b0764);
      scene.fog = new THREE.FogExp2(0x4c0519, 0.015);
    } else if (bgTheme === 'VALLEY' || bgTheme === 'TOWER') {
      scene.background = new THREE.Color(0x1e1b4b);
      scene.fog = new THREE.FogExp2(0x312e81, 0.014);
    } else {
      // Magical twilight village
      scene.background = new THREE.Color(0x1e1b4b);
      scene.fog = new THREE.FogExp2(0x2e1065, 0.013);
    }
  }, [bgTheme]);

  // ----------------- 3. RENDER TICK: PIXAR SQUASH & STRETCH + ANIMATIONS ----------------- //
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const heroGroup = heroGroupRef.current;
    const squashGroup = heroBodySquashRef.current;
    if (!scene || !camera || !renderer || !heroGroup || !squashGroup) return;

    const time = Date.now() * 0.001;
    const runCycle = Date.now() * 0.016;

    // Convert 2D logic coordinate to 3D world coordinate
    const heroWorldX = ((hero.x - 480) / 480) * 11;
    const heroWorldY = Math.max(0, ((440 - (hero.y + 50)) / 440) * 6);

    heroGroup.position.set(heroWorldX, heroWorldY, 0);

    // Smoothly orient character toward direction
    heroGroup.rotation.y = hero.facing === 1 ? 0.18 : Math.PI - 0.18;

    // PIXAR PRINCIPLE: Squash & Stretch + Bouncy Idle Breathing
    if (!hero.isGrounded) {
      // Stretch vertically while jumping/falling
      const stretchY = 1.18;
      const squashXZ = 0.88;
      squashGroup.scale.set(squashXZ, stretchY, squashXZ);
    } else if (hero.isDashing) {
      // Lean forward & stretch horizontally on dash
      squashGroup.scale.set(1.28, 0.82, 0.95);
    } else if (hero.state === 'RUN') {
      // Bouncy run bobbing
      const bounce = Math.abs(Math.sin(runCycle)) * 0.14;
      squashGroup.position.y = bounce;
      squashGroup.scale.set(1.0 + bounce * 0.2, 1.0 - bounce * 0.15, 1.0);
    } else {
      // Expressive Pixar breathing idle
      squashGroup.position.y = 0;
      const breath = Math.sin(time * 4.5) * 0.035;
      squashGroup.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5);
    }

    // Automatic Eye Blinking every ~3.2 seconds
    if (eyelidsRef.current) {
      eyelidsRef.current.visible = Math.sin(time * 2.2) > 0.96;
    }

    // Head subtle tilt
    if (heroHeadRef.current) {
      heroHeadRef.current.rotation.z = hero.state === 'RUN' ? -0.1 : Math.sin(time * 2.5) * 0.05;
    }

    // Legs & Arms Swing
    if (hero.state === 'RUN' && leftLegRef.current && rightLegRef.current && leftArmRef.current) {
      leftLegRef.current.rotation.z = Math.sin(runCycle) * 0.75;
      rightLegRef.current.rotation.z = -Math.sin(runCycle) * 0.75;
      leftArmRef.current.rotation.z = -Math.sin(runCycle) * 0.65;
    } else if (leftLegRef.current && rightLegRef.current && leftArmRef.current) {
      leftLegRef.current.rotation.z = 0;
      rightLegRef.current.rotation.z = 0;
      leftArmRef.current.rotation.z = 0;
    }

    // Katana Arm Swing & Glowing Slash Wave
    if (rightArmRef.current && slashArcRef.current) {
      if (hero.isAttacking) {
        rightArmRef.current.rotation.z = -Math.PI * 0.45 + (16 - hero.attackTimer) * 0.18;
        slashArcRef.current.material.opacity = 0.92;
        slashArcRef.current.rotation.z = -hero.attackTimer * 0.25;
        const s = 0.9 + (16 - hero.attackTimer) * 0.04;
        slashArcRef.current.scale.set(s, s, s);
      } else {
        rightArmRef.current.rotation.z = Math.sin(time * 3) * 0.08;
        slashArcRef.current.material.opacity = 0;
      }
    }

    // Scarf Billowing
    if (scarfTailRef.current) {
      scarfTailRef.current.rotation.z = Math.sin(time * 10) * 0.22 - Math.abs(hero.vx) * 0.04;
      scarfTailRef.current.scale.x = 1 + Math.abs(hero.vx) * 0.08;
    }

    // Invulnerability Flash
    heroGroup.visible = hero.invulnerableTimer > 0 ? Math.floor(Date.now() / 80) % 2 === 0 : true;

    // Animate Floating Clouds, Swinging Lanterns & Falling Sakura Petals
    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.position.x = Math.sin(time * 0.25) * 1.8;
    }
    lanternsRef.current.forEach((l, idx) => {
      l.rotation.z = Math.sin(time * 2.5 + idx) * 0.12;
    });
    if (petalsMeshRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 45; i++) {
        const px = ((i * 3.7 - time * 1.4) % 32) - 16;
        const py = ((12 - ((time * 1.2 + i * 0.9) % 12)));
        const pz = Math.sin(time + i) * 3.5;
        dummy.position.set(px, py, pz);
        dummy.rotation.set(time * 2 + i, time * 1.5, i);
        dummy.updateMatrix();
        petalsMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      petalsMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Camera Smooth Follow + Action Screen Shake
    const shakeX = (Math.random() - 0.5) * shakeIntensity * 0.08;
    const shakeY = (Math.random() - 0.5) * shakeIntensity * 0.08;
    camera.position.x = heroWorldX * 0.28 + shakeX;
    camera.position.y = 4.3 + heroWorldY * 0.14 + shakeY;

    // ----------------- UPDATE / SPAWN PIXAR 3D ENEMIES ----------------- //
    const activeEnemyIds = new Set<number>();

    enemies.forEach((enemy, idx) => {
      activeEnemyIds.add(enemy.id);
      const enemyWorldX = ((enemy.x - 480) / 480) * 11;
      let enemyMeshGroup = enemiesGroupMap.current.get(enemy.id);

      if (!enemyMeshGroup) {
        enemyMeshGroup = createPixarEnemyMesh(enemy);
        scene.add(enemyMeshGroup);
        enemiesGroupMap.current.set(enemy.id, enemyMeshGroup);
      }

      // Bouncy waddle walk for Pixar enemies
      const waddleBounce = enemy.isDead ? 0 : Math.abs(Math.sin(time * 9 + idx)) * 0.18;
      const waddleTilt = enemy.isDead ? 0 : Math.sin(time * 9 + idx) * 0.08;

      enemyMeshGroup.position.set(enemyWorldX, waddleBounce, 0);
      enemyMeshGroup.rotation.z = waddleTilt;

      if (enemy.hitFlash > 0) {
        enemyMeshGroup.scale.set(1.28, 0.78, 1.28);
      } else if (enemy.isDead) {
        // Cartoon pancake squish on defeat
        enemyMeshGroup.scale.set(1.45, 0.15, 1.45);
        enemyMeshGroup.position.y = 0.05;
      } else {
        const stretch = 1 + waddleBounce * 0.25;
        enemyMeshGroup.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
      }
    });

    // Clean up removed enemies
    enemiesGroupMap.current.forEach((meshGroup, id) => {
      if (!activeEnemyIds.has(id)) {
        scene.remove(meshGroup);
        enemiesGroupMap.current.delete(id);
      }
    });

    renderer.render(scene, camera);
    renderOverlayTexts(overlayCanvasRef.current, floatingTexts);
  }, [hero, enemies, floatingTexts, shakeIntensity]);

  return (
    <div className="relative w-full aspect-[16/9] max-w-[960px] mx-auto bg-indigo-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/40">
      {/* 3D WebGL Pixar World Canvas */}
      <div ref={mountRef} className="w-full h-full block" />

      {/* Crisp 2D Floating Score/Feedback Overlay */}
      <canvas
        ref={overlayCanvasRef}
        width={960}
        height={540}
        className="absolute inset-0 pointer-events-none w-full h-full object-contain"
      />
    </div>
  );
};

// ----------------- HELPER: CREATE CUTE PIXAR ROLY-POLY ONI DARUMA ENEMY ----------------- //

function createPixarEnemyMesh(enemy: EnemyEntity): THREE.Group {
  const group = new THREE.Group();
  const isBoss = enemy.type === 'BOSS' || enemy.type === 'MINIBOSS';
  const scale = isBoss ? 1.55 : 1.0;

  // Vibrant Pixar Toy Colors (Plum Purple / Crimson Boss / Teal)
  const bodyHex = isBoss ? 0xe11d48 : enemy.number % 2 === 0 ? 0x7c3aed : 0xd97706;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: bodyHex,
    roughness: 0.28,
    clearcoat: 0.65,
    clearcoatRoughness: 0.15,
    sheen: 0.5,
    sheenColor: new THREE.Color(0xffffff),
  });

  const bellyMat = new THREE.MeshPhysicalMaterial({
    color: 0xfef3c7,
    roughness: 0.4,
    clearcoat: 0.2,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.8,
    roughness: 0.2,
  });

  // 1. Chubby Roly-Poly Daruma/Oni Body
  const bodyGeo = new THREE.SphereGeometry(0.78 * scale, 28, 28);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(0.95, 1.12, 0.95);
  body.position.y = 0.95 * scale;
  body.castShadow = true;
  group.add(body);

  // Cream Belly Patch
  const bellyGeo = new THREE.SphereGeometry(0.62 * scale, 20, 20);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(-0.26 * scale, 0.88 * scale, 0);
  belly.scale.set(0.75, 0.88, 0.85);
  group.add(belly);

  // 2. Cute Stubby Golden Oni Horns
  const buildHorn = (zPos: number) => {
    const hornGeo = new THREE.ConeGeometry(0.14 * scale, 0.48 * scale, 16);
    const horn = new THREE.Mesh(hornGeo, goldMat);
    horn.position.set(-0.1 * scale, 1.85 * scale, zPos * scale);
    horn.rotation.x = zPos > 0 ? 0.28 : -0.28;
    horn.rotation.z = 0.2;
    return horn;
  };
  group.add(buildHorn(0.32), buildHorn(-0.32));

  // 3. Big Goofy Pixar Eyes (Facing Left towards Hero)
  const buildEnemyEye = (zPos: number) => {
    const eyeGrp = new THREE.Group();
    const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 1.0 });
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.17 * scale, 16, 16), whiteMat);
    white.scale.set(0.6, 1.1, 1.0);
    eyeGrp.add(white);

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.095 * scale, 12, 12), pupilMat);
    pupil.position.x = -0.075 * scale;
    pupil.scale.set(0.5, 1.0, 0.9);
    eyeGrp.add(pupil);

    // Eye glint
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * scale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    glint.position.set(-0.1 * scale, 0.05 * scale, 0.04 * scale);
    eyeGrp.add(glint);

    // Bushy Funny Eyebrow
    const brow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.04 * scale, 0.22 * scale, 8, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    brow.rotation.x = Math.PI / 2;
    brow.rotation.y = zPos > 0 ? 0.35 : -0.35;
    brow.position.set(-0.06 * scale, 0.2 * scale, 0);
    eyeGrp.add(brow);

    eyeGrp.position.set(-0.66 * scale, 1.28 * scale, zPos * scale);
    return eyeGrp;
  };
  group.add(buildEnemyEye(0.24), buildEnemyEye(-0.24));

  // 4. Cute Stubby Feet
  const footGeo = new THREE.SphereGeometry(0.22 * scale, 14, 14);
  const footL = new THREE.Mesh(footGeo, goldMat);
  footL.scale.set(1.3, 0.65, 0.9);
  footL.position.set(-0.1 * scale, 0.14 * scale, 0.32 * scale);
  const footR = footL.clone();
  footR.position.z = -0.32 * scale;
  group.add(footL, footR);

  // ----------------- 5. 3D PIXAR GOLDEN WOODEN NUMBER SIGNBOARD ----------------- //
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Vibrant Royal Blue / Warm Gold Framed Pill Signboard
  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, '#1e3a8a');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.roundRect(10, 10, 236, 140, 42);
  ctx.fill();
  ctx.stroke();

  // Inner subtle highlight border
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(20, 20, 216, 120, 32);
  ctx.stroke();

  // Crisp High-Contrast Number with 3D Drop Shadow
  ctx.fillStyle = '#000000';
  ctx.font = '900 84px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${enemy.number}`, 132, 86);

  ctx.fillStyle = '#fef08a';
  ctx.fillText(`${enemy.number}`, 128, 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const badgeGeo = new THREE.PlaneGeometry(1.75 * scale, 1.1 * scale);
  const badgeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMesh.position.y = 2.55 * scale;
  group.add(badgeMesh);

  return group;
}

// ----------------- HELPER: FLOATING TEXT OVERLAY ----------------- //

function renderOverlayTexts(canvas: HTMLCanvasElement | null, texts: FloatingText[]) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  texts.forEach((ft) => {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#090d16';
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}
