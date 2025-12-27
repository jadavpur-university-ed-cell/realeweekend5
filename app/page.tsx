"use client";

import React, { useMemo, useRef, useState, createContext, useContext } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ScrollControls,
  useScroll,
  OrthographicCamera,
  Text,
  RoundedBox,
  Float,
} from "@react-three/drei";
import Image from "next/image";

/**
 * STATE MANAGEMENT
 * Simple Context to share state between the 3D world and the 2D UI Overlay.
 */
const GameContext = createContext<{
  activeCorner: number | null;
  setActiveCorner: (idx: number | null) => void;
}>({
  activeCorner: 0,
  setActiveCorner: () => {},
});

const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCorner, setActiveCorner] = useState<number | null>(0);
  return (
    <GameContext.Provider value={{ activeCorner, setActiveCorner }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * CONFIGURATION & DATA
 */
const BOARD_SIZE = 12;
const PATH_POINTS = [
  new THREE.Vector3(-BOARD_SIZE, 0, -BOARD_SIZE), // Start (Top Left)
  new THREE.Vector3(BOARD_SIZE, 0, -BOARD_SIZE),  // Corner 1 (Top Right)
  new THREE.Vector3(BOARD_SIZE, 0, BOARD_SIZE),   // Corner 2 (Bottom Right)
  new THREE.Vector3(-BOARD_SIZE, 0, BOARD_SIZE),  // Corner 3 (Bottom Left)
  new THREE.Vector3(-BOARD_SIZE, 0, -BOARD_SIZE), // Loop back
];

// Calculate precise initial camera position to center the "GO" block immediately
// Start Point (-12, 0, -12) + Offset (20, 20, 20) = (8, 20, 8)
const INITIAL_CAM_POS: [number, number, number] = [8, 20, 8];

/**
 * COMPONENT: 3D Token & Camera Controller
 */
const GameController = () => {
  const scroll = useScroll();
  const tokenRef = useRef<THREE.Group>(null!);
  const { setActiveCorner } = useContext(GameContext);
  
  // Keep track of last index to avoid unnecessary re-renders
  const lastFound = useRef<number | null>(0);

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(PATH_POINTS, true, "catmullrom", 0.05),
    []
  );

  useFrame((state) => {
    const t = scroll.offset;

    // 1. Movement Logic
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    
    if (tokenRef.current) {
      tokenRef.current.position.lerp(point, 0.1);
      const lookAtPos = point.clone().add(tangent);
      tokenRef.current.lookAt(lookAtPos);
    }

    // 2. Camera Logic
    // We maintain the same offset used in initial calculation
    const isoOffset = new THREE.Vector3(20, 20, 20); 
    const camPos = point.clone().add(isoOffset);
    
    // Lerp camera for smooth tracking
    state.camera.position.lerp(camPos, 0.05);
    state.camera.lookAt(point);

    // 3. Corner Detection Logic
    const threshold = 0.05; 
    let found = null;

    // 0.0 = Start; 0.25 = C1; 0.5 = C2; 0.75 = C3; ~1.0 = Start
    if (t < 0.05) found = 0; 
    else if (Math.abs(t - 0.25) < threshold) found = 1;
    else if (Math.abs(t - 0.50) < threshold) found = 2;
    else if (Math.abs(t - 0.75) < threshold) found = 3;
    else if (t > 0.95) found = 0; // Wrap around to Start

    // Update Context only if changed
    if (found !== lastFound.current) {
        lastFound.current = found;
        setActiveCorner(found);
    }
  });

  return (
    <group ref={tokenRef} position={PATH_POINTS[0]}>
      <Float speed={5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
             <cylinderGeometry args={[0, 1, 3, 4]} />
             <meshStandardMaterial color="#00ff00" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
             <sphereGeometry args={[0.6]} />
             <meshStandardMaterial color="white" />
        </mesh>
      </Float>
    </group>
  );
};

/**
 * COMPONENT: 2D UI Overlay (Outside Canvas)
 * This ensures modals stay fixed on screen and don't move with the board.
 */
/**
 * COMPONENT: 2D UI Overlay (Fixed for Mobile & Ghosting)
 */
const UIOverlay = () => {
  const { activeCorner } = useContext(GameContext);
  
  // LOGIC FIX: Prevent "Register" modal from flashing when scrolling between corners.
  // We memorize the last valid corner data. If activeCorner is null (scrolling),
  // we keep showing the old data while it fades out.
  const lastValidIndex = useRef<number>(0);
  if (activeCorner !== null) {
    lastValidIndex.current = activeCorner;
  }
  
  const data = CORNER_CONTENT[lastValidIndex.current];
  const isVisible = activeCorner !== null;

  if (!data) return null;

  const renderContent = () => {
    switch (data.type) {
      case "HERO":
        return (
          // RESPONSIVE FIX: w-[90vw] for mobile, max-w-3xl for desktop
          <div className="w-[90vw] max-w-3xl text-center pointer-events-auto p-4">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-300 mb-2 drop-shadow-lg">
              {data.title}
            </h1>
            <p className="text-lg md:text-2xl text-white font-light mb-2">{data.date}</p>
            <p className="text-sm md:text-base text-gray-300 mb-8">{data.subtitle}</p>
            <button className="px-6 py-2 md:px-8 md:py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full text-base md:text-lg transition-transform hover:scale-105 shadow-lg shadow-green-500/50 cursor-pointer">
              {data.buttonText}
            </button>
            <div className="mt-8 md:mt-12 animate-bounce text-white/50 text-xs md:text-sm pointer-events-none">
              ↓ Scroll to Explore ↓
            </div>
          </div>
        );

      case "CAROUSEL":
        return (
          // RESPONSIVE FIX: w-full on mobile, fixed width on desktop
          <div className="w-[90vw] md:w-[30rem] pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b border-white/20 pb-4">
              {data.title}
            </h2>
            {/* Added touch-pan-x for better mobile scrolling */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar touch-pan-x">
              {data.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="min-w-[200px] md:min-w-[220px] bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 snap-center hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "SCHEDULE":
        return (
          <div className="w-[90vw] md:w-[25rem] pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-right">
              {data.title}
            </h2>
            <div className="space-y-4">
              {data.schedule?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/10 pb-2"
                >
                  <span className="text-green-400 font-mono text-sm md:text-base">
                    {item.time}
                  </span>
                  <span className="text-white font-medium text-sm md:text-base text-right">
                    {item.event}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "GALLERY":
        return (
          <div className="w-[90vw] md:w-auto text-center pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.title}
            </h2>
            {/* RESPONSIVE FIX: 1 column on mobile, 3 on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full md:w-24 h-32 md:h-24 bg-gray-700/50 rounded-lg animate-pulse border border-white/10"
                ></div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      // CENTERED POSITIONING (No full screen cover)
      className={`fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Background container for the modal content */}
      <div className="bg-[#014d4e]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-4 md:p-8">
         {renderContent()}
      </div>
    </div>
  );
};

/**
 * COMPONENT: The Board Environment
 */
const Board = () => {
  const tiles: React.ReactNode[] = [];
  const tilesPerSide = Math.floor(BOARD_DATA.length / 4);

  BOARD_DATA.forEach((item, index) => {
    const sideIndex = Math.floor(index / tilesPerSide);
    const indexInSide = index % tilesPerSide;
    const alpha = indexInSide / tilesPerSide;

    const start = PATH_POINTS[sideIndex];
    const end = PATH_POINTS[(sideIndex + 1) % PATH_POINTS.length];

    const x = THREE.MathUtils.lerp(start.x, end.x, alpha);
    const z = THREE.MathUtils.lerp(start.z, end.z, alpha);

    let rotationY = 0;
    if (sideIndex === 0) rotationY = 0;           
    else if (sideIndex === 1) rotationY = 0; 
    else if (sideIndex === 2) rotationY = -Math.PI;   
    else if (sideIndex === 3) rotationY = Math.PI / 2;  

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

const Tile = ({ position, rotationY, data }: { position: [number, number, number], rotationY: number, data: any }) => {
  const isCorner = data.type === "CORNER";
  // Flip text if on bottom side
  const isOppositeSide = Math.abs(rotationY) > 2; 

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[3.8, 0.5, 3.8]} radius={0.1} smoothness={4} receiveShadow>
        <meshStandardMaterial color={isCorner ? "#d1d5db" : "#e8ecdb"} />
      </RoundedBox>

      {!isCorner && data.type !== "CHANCE" && (
        <mesh position={[0, 0.26, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 1]} />
          <meshStandardMaterial color={data.color} />
        </mesh>
      )}

      <group
        position={[0, 0.26, isCorner ? 0 : -0.5]}
        rotation={[-Math.PI / 2, 0, isOppositeSide ? Math.PI : 0]}
      >
        <Text
          fontSize={0.4}
          color="black"
          maxWidth={3.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {data.name}
        </Text>
      </group>

      {!isCorner && (
        <group
          position={[0, 0.26, 0.5]}
          rotation={[-Math.PI / 2, 0, isOppositeSide ? Math.PI : 0]}
        >
          <Text fontSize={0.25} color="gray" anchorX="center" anchorY="middle">
            $200
          </Text>
        </group>
      )}
    </group>
  );
};


// --- DATA DEFINITIONS ---
const BOARD_DATA = [
  // Side 1
  { id: "start", name: "GO", type: "CORNER", color: "#C0C0C0" },
  { id: "t1", name: "Alpha One", type: "PROPERTY", color: "#8B4513" },
  { id: "t2", name: "Beta Two", type: "PROPERTY", color: "#8B4513" },
  { id: "t3", name: "Chance", type: "CHANCE", color: "#FFFFFF" },
  { id: "t4", name: "Gamma Three", type: "PROPERTY", color: "#87CEEB" },
  { id: "t5", name: "Delta Four", type: "PROPERTY", color: "#87CEEB" },
  // Side 2
  { id: "jail", name: "JAIL", type: "CORNER", color: "#C0C0C0" },
  { id: "t6", name: "Epsilon", type: "PROPERTY", color: "#FF007F" },
  { id: "t7", name: "Electric Co", type: "UTILITY", color: "#FFFFFF" },
  { id: "t8", name: "Zeta Six", type: "PROPERTY", color: "#FF007F" },
  { id: "t9", name: "Eta Seven", type: "PROPERTY", color: "#FFA500" },
  { id: "t10", name: "Theta Eight", type: "PROPERTY", color: "#FFA500" },
  // Side 3
  { id: "park", name: "FREE PARKING", type: "CORNER", color: "#C0C0C0" },
  { id: "t11", name: "Iota Nine", type: "PROPERTY", color: "#FF0000" },
  { id: "t12", name: "Kappa Ten", type: "PROPERTY", color: "#FF0000" },
  { id: "t13", name: "Chest", type: "CHANCE", color: "#FFFFFF" },
  { id: "t14", name: "Lambda 11", type: "PROPERTY", color: "#FFFF00" },
  { id: "t15", name: "Mu 12", type: "PROPERTY", color: "#FFFF00" },
  // Side 4
  { id: "goto", name: "GO TO JAIL", type: "CORNER", color: "#C0C0C0" },
  { id: "t16", name: "Nu 13", type: "PROPERTY", color: "#008000" },
  { id: "t17", name: "Xi 14", type: "PROPERTY", color: "#008000" },
  { id: "t18", name: "Chest", type: "CHANCE", color: "#FFFFFF" },
  { id: "t19", name: "Omicron 15", type: "PROPERTY", color: "#0000FF" },
  { id: "t20", name: "Pi 16", type: "PROPERTY", color: "#0000FF" },
];

const CORNER_CONTENT = [
  {
    id: "welcome",
    type: "HERO",
    title: "E-WEEKEND 2025",
    date: "Feb 14-16, 2025",
    subtitle: "The Largest Entrepreneurship Summit",
    buttonText: "Register Now",
  },
  {
    id: "events",
    type: "CAROUSEL",
    title: "FLAGSHIP EVENTS",
    items: [
      { name: "Technokraft", desc: "even I don't know what happens here" },
      { name: "Pitchgenix", desc: "Pitch your idea to top VCs" },
      { name: "Data Binge", desc: "you do data analysis, duh" },
      { name: "Corporate Devs", desc: "People come together to chat" },
    ]
  },
  {
    id: "schedule",
    type: "SCHEDULE",
    title: "EVENT TIMELINE",
    schedule: [
      { time: "Day 1", event: "Opening Ceremony & Keynote" },
      { time: "Day 2", event: "Competitions & Workshops" },
      { time: "Day 3", event: "Grand Finale & Networking" },
    ]
  },
  {
    id: "gallery",
    type: "GALLERY",
    title: "PAST HIGHLIGHTS",
    images: [] 
  }
];


/**
 * MAIN PAGE COMPONENT
 */
export default function MonopolyPage() {
  return (
    <GameProvider>
        <div className="h-screen w-full flex items-center justify-center bg-[#014d4e] overflow-hidden">
            {/* 2D UI Layer (Fixed) */}
            <UIOverlay />

            <div className="absolute top-10 left-180 right-0 z-10 text-center pointer-events-none">
                <Image src = {"/logo/logo.png"} height={100} width={100} alt = {'Logo'} />
            </div>

            <Canvas shadows dpr={[1, 2]}>
                {/* 
                  CRITICAL FIX: 
                  Initial position set to [8, 20, 8].
                  This is exactly PATH_POINTS[0] + [20,20,20].
                  The view will be perfectly centered on the GO block on load.
                */}
                <OrthographicCamera makeDefault position={INITIAL_CAM_POS} zoom={65} near={-50} far={200} />

                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[-10, 10, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                    shadow-bias={-0.00001}
                />

                <ScrollControls pages={6} damping={0.2}>
                    <Board />
                    <GameController />
                </ScrollControls>
            </Canvas>

            <style jsx global>{`
                body { margin: 0; background: #014d4e; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    </GameProvider>
  );
}
