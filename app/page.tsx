"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ScrollControls,
  useScroll,
  Html,
  OrthographicCamera,
  Text,
  RoundedBox,
  Float,
} from "@react-three/drei";

/**
 * CONFIGURATION & DATA
 * Customize colors and positions here.
 */
const BOARD_COLOR = "#e8ecdb"; // Parchment
const BG_COLOR = "#014d4e";    // Deep Teal
const ACCENT_COLOR = "#ed1b24"; // Monopoly Red
const PIECE_COLOR = "#00ff00" //Piece Colour
const TEXT_COLOR = "#1a1a1a";

// The path corners (Diamond/Square shape)
const BOARD_SIZE = 12;
const PATH_POINTS = [
  new THREE.Vector3(-BOARD_SIZE, 0, -BOARD_SIZE), // Start (Top Left)
  new THREE.Vector3(BOARD_SIZE, 0, -BOARD_SIZE),  // Corner 1 (Top Right)
  new THREE.Vector3(BOARD_SIZE, 0, BOARD_SIZE),   // Corner 2 (Bottom Right)
  new THREE.Vector3(-BOARD_SIZE, 0, BOARD_SIZE),  // Corner 3 (Bottom Left)
  new THREE.Vector3(-BOARD_SIZE, 0, -BOARD_SIZE), // Loop back
];

/**
 * COMPONENT: 3D Token & Camera Controller
 */
const GameController = () => {
  const scroll = useScroll();
  const tokenRef = useRef<THREE.Group>(null!);
  const [activeStage, setActiveStage] = useState(0);

  // Create a smooth path from the points
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(PATH_POINTS, true, "catmullrom", 0.05),
    []
  );

  useFrame((state) => {
    // 1. Get Scroll Progress (0 to 1)
    // We limit it slightly so it doesn't loop weirdly at the very end if not desired
    const t = scroll.offset;

    // 2. Move Token
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    if (tokenRef.current) {
      // Smoothly interpolate position for less jitter
      tokenRef.current.position.lerp(point, 0.1);
      // Make token face direction of travel
      const lookAtPos = point.clone().add(tangent);
      tokenRef.current.lookAt(lookAtPos);
    }

    // 3. Move Camera (Isometric Follow)
    // We maintain a fixed offset from the token
    const isoOffset = new THREE.Vector3(20, 20, 20);
    const camPos = point.clone().add(isoOffset);
    state.camera.position.lerp(camPos, 0.05); // Smooth camera follow
    state.camera.lookAt(point); // Always look at token

    // 4. Update UI State based on scroll percentage
    if (t < 0.1) setActiveStage(0);      // Start
    else if (t < 0.35) setActiveStage(1); // Side 1
    else if (t < 0.60) setActiveStage(2); // Side 2
    else if (t < 0.85) setActiveStage(3); // Side 3
    else setActiveStage(4);               // End
  });

  return (
    <>
      {/* THE PLAYER TOKEN */}
      {/* Inside GameController */}
      <group ref={tokenRef} position={[0, 1, 0]}>
        <Float speed={5} rotationIntensity={0.2} floatIntensity={0.5}>

          {/* Body: Casts shadow AND Receives shadow (from head) */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0, 1, 3, 4]} />
            <meshStandardMaterial color={PIECE_COLOR} roughness={0.3} />
          </mesh>

          {/* Head: Casts shadow AND Receives shadow (from other lights?) */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.6]} />
            <meshStandardMaterial color="white" />
          </mesh>

        </Float>
      </group>

      {/* STAGE DATA REVEALS (Placed at corners/sides) */}
      {/* <InfoCard 
        position={[0, 2, -BOARD_SIZE]} 
        title="STARTUP STREET" 
        text="20+ Top Startups Pitching" 
        visible={activeStage === 1} 
      />
      <InfoCard 
        position={[BOARD_SIZE, 2, 0]} 
        title="AMBITION AVENUE" 
        text="Keynote: CEO of TechFlow" 
        visible={activeStage === 2} 
      />
      <InfoCard 
        position={[0, 2, BOARD_SIZE]} 
        title="JUNR 500" 
        text="Investment Simulation" 
        visible={activeStage === 3} 
      />
      <InfoCard 
        position={[-BOARD_SIZE, 2, 0]} 
        title="GRAND FINALE" 
        text="Jan 10-11, 2026" 
        visible={activeStage === 4} 
      /> */}
    </>
  );
};

/**
 * COMPONENT: The Board Environment
 */
/**
 * COMPONENT: The Board Environment (Data Driven)
 */
const Board = () => {
  const tiles: React.ReactNode[] = [];

  // Logic: We have 4 sides. We need to distribute the array items along the 4 vectors.
  // Total items = BOARD_DATA.length.
  // We assume the data is ordered: Corner 1 -> Side 1 -> Corner 2 -> Side 2...

  // NOTE: Adjust this logic if your JSON length changes. 
  // Currently designed for 4 Corners + 5 tiles per side = 24 items total.
  // If BOARD_DATA has different length, math needs update.
  const tilesPerSide = Math.floor(BOARD_DATA.length / 4);

  BOARD_DATA.forEach((item, index) => {
    // 1. Determine which "Side" (0-3) and progress (alpha) this tile belongs to
    const sideIndex = Math.floor(index / tilesPerSide); // 0, 1, 2, or 3
    const indexInSide = index % tilesPerSide;
    const alpha = indexInSide / tilesPerSide; // 0.0 to 1.0

    // 2. Get Start and End Points for this side
    const start = PATH_POINTS[sideIndex];
    // Use modulo to wrap around to point 0 for the last side
    const end = PATH_POINTS[(sideIndex + 1) % PATH_POINTS.length];

    // 3. Interpolate Position
    const x = THREE.MathUtils.lerp(start.x, end.x, alpha);
    const z = THREE.MathUtils.lerp(start.z, end.z, alpha);

    // 4. Determine Rotation (to face center)
    // Simple logic: Rotate 90 deg based on side
    let rotationY = 0;
    if (sideIndex === 0) rotationY = 0;           // Top side
    else if (sideIndex === 1) rotationY = 0; // Right side
    else if (sideIndex === 2) rotationY = -Math.PI;   // Bottom side
    else if (sideIndex === 3) rotationY = Math.PI / 2;  // Left side

    tiles.push(
      <Tile
        key={item.id}
        position={[x, 0, z]}
        rotationY={rotationY}
        data={item}
      />
    );
  });

  return (
    <group>
      {tiles}
      {/* Central Park Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[BOARD_SIZE * 1.8, BOARD_SIZE * 1.8]} />
        <meshStandardMaterial color="#026b6d" />
      </mesh>
      <Text
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={3}
        color="#013d3e"
      >
        E-WEEKEND
      </Text>
    </group>
  )
}

/**
 * COMPONENT: Individual Tile with Text
 */
const Tile = ({ position, rotationY, data }: { position: [number, number, number], rotationY: number, data: any }) => {
  const isCorner = data.type === "CORNER";

  // FIX: Determine if text needs to be flipped to be readable
  // If the tile is on the "bottom" or "left" relative to camera, the text might be upside down.
  // We check the rotationY passed from the parent. 
  // -Math.PI is the bottom side, Math.PI/2 is the left side (approx).
  // You might need to tweak these specific conditions based on your exact camera angle,
  // but usually rotating the text by Math.PI (180 deg) on the Z-axis fixes "upside down" text.

  // Let's create a specific text rotation.
  // We keep the "Board Rotation" (rotationY) for the block, but counter-rotate the text if needed.

  // Logic: "Is this tile on the opposite side of the board?" 
  // If rotationY is -Math.PI (Side 2/Bottom) or close to it, flip the text.
  const isOppositeSide = Math.abs(rotationY) > 2; // -Math.PI is ~ -3.14
  const textRotationZ = isOppositeSide ? Math.PI : 0;
  // Or simply always force text to face "Down" relative to the tile's local space?
  // Actually, the easiest fix is to rotate the text container so it always faces the camera.
  // But purely 180 flip is safer for the board look.

  return (
    <group position={position} rotation={[0, rotationY, 0]}>

      {/* 1. Base Block */}
      <RoundedBox args={[3.8, 0.5, 3.8]} radius={0.1} smoothness={4} receiveShadow>
        <meshStandardMaterial color={isCorner ? "#d1d5db" : "#e8ecdb"} />
      </RoundedBox>

      {/* 2. Color Strip (Only for Properties) */}
      {!isCorner && data.type !== "CHANCE" && (
        <mesh position={[0, 0.26, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 1]} />
          <meshStandardMaterial color={data.color} />
        </mesh>
      )}

      {/* 3. Text Name */}
      {/* FIX APPLIED HERE: Added rotation={[... , textRotationZ]} */}
      <group
        position={[0, 0.26, isCorner ? 0 : -0.5]}
        rotation={[-Math.PI / 2, 0, isOppositeSide ? Math.PI : 0]} // Flip 180 if on bottom side
      >
        <Text
          fontSize={0.4}
          color="black"
          maxWidth={3.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {data.name}
        </Text>
      </group>

      {/* Price Text */}
      {!isCorner && (
        <group
          position={[0, 0.26, 0.5]}
          rotation={[-Math.PI / 2, 0, isOppositeSide ? Math.PI : 0]} // Apply same flip
        >
          <Text
            fontSize={0.25}
            color="gray"
            anchorX="center"
            anchorY="middle"
          >
            $200
          </Text>
        </group>
      )}
    </group>
  );
};



/**
 * COMPONENT: Floating Info Cards (HTML)
 */
const InfoCard = ({ position, title, text, visible }: { position: [number, number, number], title: string, text: string, visible: boolean }) => {
  return (
    <Html position={position} center distanceFactor={12} zIndexRange={[100, 0]} style={{
      transition: 'all 0.5s ease-in-out',
      opacity: visible ? 1 : 0,
      transform: `scale(${visible ? 1 : 0.5}) translate3d(0, ${visible ? 0 : '20px'}, 0)`,
      pointerEvents: visible ? 'auto' : 'none'
    }}>
    </Html>
  );
};

const BOARD_DATA = [
  // --- SIDE 1 (Bottom to Top-Right) ---
  { id: "start", name: "GO", type: "CORNER", color: "#C0C0C0" }, // Corner 1
  { id: "t1", name: "Alpha One", type: "PROPERTY", color: "#8B4513" },
  { id: "t2", name: "Beta Two", type: "PROPERTY", color: "#8B4513" },
  { id: "t3", name: "Chance", type: "CHANCE", color: "#FFFFFF" },
  { id: "t4", name: "Gamma Three", type: "PROPERTY", color: "#87CEEB" },
  { id: "t5", name: "Delta Four", type: "PROPERTY", color: "#87CEEB" },

  // --- SIDE 2 ---
  { id: "jail", name: "JAIL", type: "CORNER", color: "#C0C0C0" }, // Corner 2
  { id: "t6", name: "Epsilon", type: "PROPERTY", color: "#FF007F" },
  { id: "t7", name: "Electric Co", type: "UTILITY", color: "#FFFFFF" },
  { id: "t8", name: "Zeta Six", type: "PROPERTY", color: "#FF007F" },
  { id: "t9", name: "Eta Seven", type: "PROPERTY", color: "#FFA500" },
  { id: "t10", name: "Theta Eight", type: "PROPERTY", color: "#FFA500" },

  // --- SIDE 3 ---
  { id: "park", name: "FREE PARKING", type: "CORNER", color: "#C0C0C0" }, // Corner 3
  { id: "t11", name: "Iota Nine", type: "PROPERTY", color: "#FF0000" },
  { id: "t12", name: "Kappa Ten", type: "PROPERTY", color: "#FF0000" },
  { id: "t13", name: "Chest", type: "CHANCE", color: "#FFFFFF" },
  { id: "t14", name: "Lambda 11", type: "PROPERTY", color: "#FFFF00" },
  { id: "t15", name: "Mu 12", type: "PROPERTY", color: "#FFFF00" },

  // --- SIDE 4 ---
  { id: "goto", name: "GO TO JAIL", type: "CORNER", color: "#C0C0C0" }, // Corner 4
  { id: "t16", name: "Nu 13", type: "PROPERTY", color: "#008000" },
  { id: "t17", name: "Xi 14", type: "PROPERTY", color: "#008000" },
  { id: "t18", name: "Chest", type: "CHANCE", color: "#FFFFFF" },
  { id: "t19", name: "Omicron 15", type: "PROPERTY", color: "#0000FF" },
  { id: "t20", name: "Pi 16", type: "PROPERTY", color: "#0000FF" },
];


/**
 * MAIN PAGE COMPONENT
 */
export default function MonopolyPage() {
  return (
    <div className="h-screen w-full relative bg-[#014d4e] overflow-hidden">

      {/* Hint UI */}
      <div className="absolute top-10 left-0 right-0 z-10 text-center pointer-events-none">
        <h1 className="text-white text-4xl font-bold drop-shadow-md">E WEEKEND 2025</h1>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        {/* Cinematic Isometric Camera */}
        <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={65} near={-50} far={200} />

        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[-10, 10, 5]}
          intensity={1.2}
          castShadow // <--- CRITICAL
          shadow-mapSize={[2048, 2048]} // Higher res shadow
          shadow-camera-left={-50}      // Expand shadow area
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.00001}
        />

        {/* The Scroll Logic Wrapper */}
        <ScrollControls pages={6} damping={0.2}>
          <Board />
          <GameController />
        </ScrollControls>
      </Canvas>

      {/* CSS for custom fonts if needed, though three/drei Text handles the 3D text */}
      <style jsx global>{`
        body { margin: 0; background: #014d4e; }
      `}</style>
    </div>
  );
}
