"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture, Html } from "@react-three/drei";
import { Suspense } from "react";
import { MapPin, RotateCw, Map, Eye, Info, Clock, Building, ShoppingBag, Book, Hospital, Landmark, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vector3, Spherical, MathUtils } from "three";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Import both landmarks and pins data
import landmarksData from "@/public/nearby-landmaks.json";
import pinsData from "@/public/pins.json";

import Loading from "../loading"; // Add this import at the top
import { color } from "framer-motion";

// Add this hook near the top of your file
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Update the CameraPositionTracker component to match pin positioning
function CameraPositionTracker({ onPositionUpdate }: { onPositionUpdate?: (position: { yaw: number; pitch: number }) => void }) {
  const { camera } = useThree();
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  useFrame(() => {
    const direction = new Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    
    const spherical = new Spherical();
    spherical.setFromVector3(direction);
    
    // Convert to match the pin coordinate system
    const yawDegrees = (360 - MathUtils.radToDeg(spherical.theta)) % 360;
    const pitchDegrees = MathUtils.radToDeg(Math.PI/2 - spherical.phi);
    
    if (Math.abs(yaw - yawDegrees) > 0.1 || Math.abs(pitch - pitchDegrees) > 0.1) {
      setYaw(Number(yawDegrees.toFixed(1)));
      setPitch(Number(pitchDegrees.toFixed(1)));
      
      if (onPositionUpdate) {
        onPositionUpdate({yaw: yawDegrees, pitch: pitchDegrees});
      }
    }
  });

  return null;
}

// Update the Hotspot component with smoother animations
function Hotspot({ position, title, description, color = "#ff4000", category, duration, lineHeight = 6, durationMinutes }: { position: [number, number, number]; title: string; description: string; color?: string; category: string; duration?: string; lineHeight?: number; durationMinutes?: number }) {
  const [hovered, setHovered] = useState(false);
  const lineRef = useRef<THREE.Mesh | null>(null);
  const dotRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const isMobile = useIsMobile();
  
  // Track animation progress for smoother transitions
  const animationProgress = useRef(0);
  const lastHoverState = useRef(false);

  // Smoother animation with easing
  useFrame((state, delta) => {
    // Update animation progress with easing
    if (hovered !== lastHoverState.current) {
      lastHoverState.current = hovered;
    }
    
    // Target value based on hover state
    const targetProgress = hovered ? 1 : 0;
    
    // Smooth animation with easing
    animationProgress.current += (targetProgress - animationProgress.current) * delta * 3.5;
    
    // Apply smooth animations to the dot
    if (dotRef.current) {
      // Base scale with smooth transition
      const baseScale = 1 + animationProgress.current * 0.3;
      // Add subtle pulsing effect
      const pulseEffect = hovered ? Math.sin(state.clock.elapsedTime * 3) * 0.08 : 0;
      dotRef.current.scale.setScalar(baseScale + pulseEffect);
      
      // Smooth color transition
      if (dotRef.current.material instanceof THREE.MeshStandardMaterial) {
        // Interpolate between original color and white
        dotRef.current.material.emissiveIntensity = 0.8 + animationProgress.current * 1.2;
        
        // Subtle material changes
        dotRef.current.material.metalness = 0.5 + animationProgress.current * 0.3;
        dotRef.current.material.roughness = 0.2 - animationProgress.current * 0.1;
      }
    }
    
    // Apply smooth floating animation
    if (groupRef.current) {
      // Smooth floating with subtle bounce
      const floatHeight = animationProgress.current * 0.15;
      const bounce = hovered ? Math.sin(state.clock.elapsedTime * 1.5) * 0.03 : 0;
      groupRef.current.position.y = floatHeight + bounce;
      
      // Add subtle tilt when hovered
      const tiltAmount = animationProgress.current * 0.05;
      groupRef.current.rotation.x = tiltAmount * Math.sin(state.clock.elapsedTime * 0.8);
      groupRef.current.rotation.z = tiltAmount * Math.cos(state.clock.elapsedTime * 0.6);
    }
    
    // Animate line glow
    if (lineRef.current && lineRef.current.material instanceof THREE.MeshStandardMaterial) {
      lineRef.current.material.emissiveIntensity = 0.5 + animationProgress.current * 1.5;
    }
  });

  const { icon: CategoryIcon, bgColor } = getCategoryStyle(category as keyof typeof styles, color);

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Line pointer with gradient effect - using dynamic height */}
        <mesh ref={lineRef}>
          <cylinderGeometry args={[0.12, 0.12, lineHeight, 8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.5} 
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Glowing core with dynamic height */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, lineHeight, 8]} />
          <meshStandardMaterial 
            color="white" 
            emissive="white"
            emissiveIntensity={hovered ? 3 : 1.5} 
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Large arrow head at bottom */}
        <mesh position={[0, -lineHeight/2 - 0.3, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.6, 1.2, 8]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.5} 
          />
        </mesh>
        
        {/* Dot at the top of line */}
        <mesh ref={dotRef} position={[0, lineHeight/2 + 0.15, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial 
            color={hovered ? "white" : color}
            emissive={hovered ? "white" : color}
            emissiveIntensity={hovered ? 2 : 0.8}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        
        {/* SMALLER TITLE WITH SMOOTHER ANIMATIONS */}
        <Html position={[0, lineHeight/2 + 1.2, 0]} center zIndexRange={[0, 10]}>
          <div 
            className={`
              bg-black/80 text-white 
              ${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} 
              rounded-md whitespace-nowrap font-medium shadow-lg border border-white/20 
              transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer flex items-center gap-1
              ${hovered ? (isMobile ? 'scale-105' : 'scale-110') : (isMobile ? 'scale-100' : 'scale-100')}
            `}
            style={{
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
              boxShadow: `0 0 ${hovered ? '20px' : '10px'} ${color}40, 0 0 ${hovered ? '10px' : '5px'} ${color}20`,
              transform: `scale(${hovered ? (isMobile ? 1.05 : 1.1) : 1}) translateY(${hovered ? -2 : 0}px)`,
              opacity: hovered ? 1 : 0.9,
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span className={`${isMobile ? 'p-0.5' : 'p-0.5'} rounded-full text-white`} style={{backgroundColor: bgColor}}>
              <CategoryIcon className={isMobile ? "h-2 w-2" : "h-2.5 w-2.5"} />
            </span>
            {title}
            {/* Smaller timing badge */}
            {durationMinutes !== undefined && durationMinutes !== null && (
              <span className={`${isMobile ? 'text-[8px] px-1 py-0' : 'text-[10px] px-1.5 py-0'} bg-white/20 rounded-full flex items-center ml-1`}>
                <Clock className={isMobile ? "h-1.5 w-1.5 mr-0.5" : "h-2 w-2 mr-0.5"} />
                {durationMinutes} min
              </span>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}

// Update KeyBuildingHotspot similarly with smoother animations
function KeyBuildingHotspot({ position, title, description, lineHeight = 10 }: { position: [number, number, number]; title: string; description: string; lineHeight?: number }) {
  const [hovered, setHovered] = useState(false);
  const lineRef = useRef<THREE.Mesh | null>(null);
  const dotRef = useRef<THREE.Mesh | null>(null);
  const arrowRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Mesh | null>(null);
  const time = useRef(0);
  const isMobile = useIsMobile();
  
  // Track animation progress for smoother transitions
  const animationProgress = useRef(0);
  const lastHoverState = useRef(false);
  
  // Enhanced animation with smoother transitions
  useFrame((state, delta) => {
    time.current += delta;
    
    // Update animation progress with easing
    if (hovered !== lastHoverState.current) {
      lastHoverState.current = hovered;
    }
    
    // Target value based on hover state
    const targetProgress = hovered ? 1 : 0;
    
    // Smooth animation with easing
    animationProgress.current += (targetProgress - animationProgress.current) * delta * 3;
    
    // Smoother pulsing effect
    const pulseFactor = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    
    // Always animate, with enhanced hover effects
    if (dotRef.current) {
      // Base animation
      const baseScale = 0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Add hover enhancement
      const hoverBoost = animationProgress.current * 0.3;
      dotRef.current.scale.setScalar(baseScale + hoverBoost);
      
      if (dotRef.current.material instanceof THREE.MeshStandardMaterial) {
        dotRef.current.material.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3 + animationProgress.current * 0.5;
      }
    }
    
    // Animated line with smoother glow
    if (lineRef.current && lineRef.current.material instanceof THREE.MeshStandardMaterial) {
      lineRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.3 + animationProgress.current * 0.7;
    }
    
    // Smoother floating animation
    if (groupRef.current) {
      // Base floating motion
      const baseFloat = Math.sin(state.clock.elapsedTime) * 0.2;
      // Enhanced when hovered
      const hoverFloat = animationProgress.current * 0.2;
      groupRef.current.position.y = baseFloat + hoverFloat;
      
      // Add subtle rotation when hovered
      const rotationAmount = animationProgress.current * 0.03;
      groupRef.current.rotation.x = rotationAmount * Math.sin(state.clock.elapsedTime * 0.7);
      groupRef.current.rotation.z = rotationAmount * Math.cos(state.clock.elapsedTime * 0.5);
    }
    
    // Rotating arrow with speed variation
    if (arrowRef.current) {
      const baseSpeed = delta * 2;
      const boostSpeed = animationProgress.current * delta * 1.5;
      arrowRef.current.rotation.y += baseSpeed + boostSpeed;
    }
  });
  
  // Special color for KEY building
  const primaryColor = "#FFD700"; // Gold
  const secondaryColor = "#FF0000"; // Red for contrast
  
  return (
    <group position={position}>
      {/* Main animated structure - using custom line height */}
      <group ref={groupRef}>
        {/* Main line */}
        <mesh ref={lineRef}>
          <cylinderGeometry args={[0.15, 0.15, lineHeight, 8]} />
          <meshStandardMaterial 
            color={primaryColor} 
            emissive={primaryColor}
            emissiveIntensity={2} 
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Glowing core */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, lineHeight, 8]} />
          <meshStandardMaterial 
            color="white" 
            emissive="white"
            emissiveIntensity={3} 
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Large animated arrow head at bottom */}
        <group position={[0, -lineHeight/2 - 0.3, 0]} rotation={[Math.PI, 0, 0]}>
          <mesh ref={arrowRef}>
            <coneGeometry args={[0.8, 1.5, 8]} />
            <meshStandardMaterial 
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
        
        {/* Outer glow ring */}
        <mesh position={[0, lineHeight/2 + 0.15, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.7, 0.15, 16, 32]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Main dot at the top of line */}
        <mesh ref={dotRef} position={[0, lineHeight/2 + 0.15, 0]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={2}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        
        {/* SMALLER KEY BUILDING TITLE WITH SMOOTHER ANIMATIONS */}
        <Html position={[0, lineHeight/2 + 1.5, 0]} center zIndexRange={[0, 50]}>
          <div className="animate-pulse">
            <div 
              className={`
                bg-yellow-500 text-black 
                ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} 
                rounded-md whitespace-nowrap font-bold shadow-lg 
                border-2 border-yellow-300 transform transition-all duration-500 
                cursor-pointer flex items-center gap-1
                ${isMobile ? 'scale-105' : 'scale-115'}
              `}
              style={{
                textShadow: "0 0 5px rgba(255,255,255,0.8)",
                boxShadow: "0 0 30px #FFD700, 0 0 15px rgba(255,215,0,0.5)",
                transform: `scale(${hovered ? (isMobile ? 1.1 : 1.2) : (isMobile ? 1.05 : 1.15)}) translateY(${hovered ? -3 : 0}px)`,
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <span className={`${isMobile ? 'p-0.5' : 'p-0.5'} rounded-full bg-orange-500 text-white`}>
                <HardHat className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </span>
              <span className="uppercase tracking-wider">
                {isMobile ? title : `⚡ ${title} ⚡`}
              </span>
            </div>
            
            <div className="mt-1.5 text-center">
              <span className={`bg-black/90 text-white ${isMobile ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]'} rounded-full font-medium shadow-lg animate-bounce inline-block`}>
                Project Location
              </span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// Function to get category style
const styles = {
  shopping: { icon: ShoppingBag, bgColor: "#00a0ff" },
  education: { icon: Book, bgColor: "#9c00ff" },
  healthcare: { icon: Hospital, bgColor: "#ff4000" },
  infrastructure: { icon: Building, bgColor: "#ffb400" },
  leisure: { icon: Landmark, bgColor: "#00c04d" },
  finance: { icon: MapPin, bgColor: "#ff8800" },
  masjid: { icon: Landmark, bgColor: "#00aa66" },
  default: { icon: MapPin, bgColor: "#cccccc" }
};

function getCategoryStyle(category: keyof typeof styles, defaultColor: string) {
  return styles[category] || styles.default;
}

// Update the PanoramaSphere component to include proximity detection
function PanoramaSphere({ hotspots }: { hotspots: Array<{ id: string; title: string; description: string; yaw: number; pitch: number; category: string; duration?: string; durationMinutes?: number; lineHeight?: number }> }) {
  const texture = useTexture("/Panorama.jpg");
  const { scene } = useThree();

  // Process hotspots to avoid overlapping titles
  const processedHotspots = useMemo(() => {
    // Clone original hotspots
    const processed = [...hotspots];

    // Create spatial map to identify proximity
    const spatialGroups = [];
    const visited = new Set();

    // First pass: find clusters of nearby pins
    for (let i = 0; i < processed.length; i++) {
      if (visited.has(i)) continue;

      const current = processed[i];
      const cluster = [i];
      visited.add(i);

      // Find other pins close to this one
      for (let j = 0; j < processed.length; j++) {
        if (i === j || visited.has(j)) continue;

        const other = processed[j];

        // Calculate angular distance
        const yawDiff = Math.abs(current.yaw - other.yaw);
        const minYawDiff = Math.min(yawDiff, 360 - yawDiff); // Handle wraparound
        const pitchDiff = Math.abs(current.pitch - other.pitch);

        // If pins are close to each other (within 15 degrees)
        if (minYawDiff < 15 && pitchDiff < 10) {
          cluster.push(j);
          visited.add(j);
        }
      }

      if (cluster.length > 1) {
        spatialGroups.push(cluster);
      }
    }

    // Second pass: adjust line heights for clustered pins
    spatialGroups.forEach((group) => {
      // Sort by pitch to stagger from top to bottom
      group.sort((a, b) => processed[b].pitch - processed[a].pitch);

      // Assign varying line heights to group members
      group.forEach((index, i) => {
        // Alternate between short and long lines
        const baseHeight = 6; // Default
        let heightAdjustment = 0;

        if (i % 3 === 0) {
          // First pin: shorter
          heightAdjustment = -1.5;
        } else if (i % 3 === 1) {
          // Second pin: longer
          heightAdjustment = 2.5;
        } else {
          // Third pin: much longer
          heightAdjustment = 5;
        }

        // Set custom line height and vertical offset
        processed[index] = {
          ...processed[index],
          lineHeight: baseHeight + heightAdjustment,
        };
      });
    });

    // Always make KEY 1 BUILDING prominent
    const keyBuildingIndex = processed.findIndex((h) => h.title === "KEY 1 BUILDING");
    if (keyBuildingIndex !== -1) {
      processed[keyBuildingIndex].lineHeight = 10; // Extra tall
    }

    return processed;
  }, [hotspots]);

  return (
    <>
      {/* Panorama sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={texture} side={2} />
      </mesh>

      {/* Render hotspots with adjusted heights */}
      {processedHotspots.map((hotspot) => {
        if (hotspot.title === "KEY 1 BUILDING") {
          return (
            <KeyBuildingHotspot
              key={hotspot.id}
              position={sphericalToCartesian(hotspot.yaw, hotspot.pitch, 49)}
              title={hotspot.title}
              description={hotspot.description}
              lineHeight={hotspot.lineHeight || 10}
            />
          );
        }

        return (
          <Hotspot
            key={hotspot.id}
            position={sphericalToCartesian(hotspot.yaw, hotspot.pitch, 49)}
            title={hotspot.title}
            description={hotspot.description}
            color={getCategoryStyle(hotspot.category as keyof typeof styles, typeof color === "string" ? color : "#cccccc").bgColor}
            category={hotspot.category}
            duration={hotspot.duration}
            lineHeight={hotspot.lineHeight || 6}
            durationMinutes={hotspot.durationMinutes}
          />
        );
      })}
    </>
  );
}

export default function MapPage() {
  const [activeView, setActiveView] = useState("3d");
  const [yawValue, setYawValue] = useState(0);
  const [pitchValue, setPitchValue] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);

  // Add background fix for map page - CHANGED TO GREEN
  useEffect(() => {
    // Apply background fix on mount
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #__next, #__next > div, main, [data-nextjs-scroll-focus-boundary] {
        background-color: #0b4d43 !important;
      }
    `;
    document.head.appendChild(style);
    
    document.documentElement.style.cssText = "background-color: #0b4d43 !important";
    document.body.style.cssText = "background-color: #0b4d43 !important";
    
    // Mark page as loaded
    setPageLoaded(true);
    
    return () => {
      document.head.removeChild(style);
      document.documentElement.style.cssText = "";
      document.body.style.cssText = "";
    };
  }, []);

  // Wait for full page load (all resources)
  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);
    if (document.readyState === "complete") {
      setPageLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Handle position updates from the tracker
  const handlePositionUpdate = (position: { yaw: number; pitch: number }) => {
    setYawValue(position.yaw);
    setPitchValue(position.pitch);
  };
  
  // Function to copy current position values
  const copyPositionToClipboard = () => {
    const positionText = `"New Pin": {"yaw": ${Math.round(yawValue)}, "pitch": ${Math.round(pitchValue)}}`;
    navigator.clipboard.writeText(positionText);
    
    setCopyMessage("Copied!");
    setTimeout(() => setCopyMessage(""), 2000);
  };
  
  // Function to normalize text for comparison
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .trim();
  };
  
  // Create a hotspots array that only includes landmarks with matching pins
  const hotspots: Array<{
    id: string;
    title: string;
    description: string;
    yaw: number;
    pitch: number;
    category: string;
    duration?: string;
    durationMinutes?: number;
    lineHeight?: number;
    arabicTitle?: string;
  }> = [];
  
  // First, add all landmarks that have a matching pin
  landmarksData.landmarks.forEach((landmark, index) => {
    // Find a matching pin by comparing normalized names
    const pinEntry = Object.entries(pinsData).find(([pinName]) => {
      const normalizedPinName = normalizeText(pinName);
      const normalizedLandmarkName = normalizeText(landmark.nameEnglish);
      
      // Check for partial match (if pin name contains landmark name or vice versa)
      return normalizedPinName.includes(normalizedLandmarkName) || 
             normalizedLandmarkName.includes(normalizedPinName);
    });
    
    // If a match is found, add it to the hotspots
    if (pinEntry) {
      const [pinName, coordinates] = pinEntry;
      
      // Create formatted description
      const description = `${landmark.nameEnglish} (${landmark.nameArabic})${landmark.durationInMinutes ? ` is approximately ${landmark.durationInMinutes} minutes from the residential tower.` : ''}`;
      
      hotspots.push({
        id: `landmark-${index}`,
        title: landmark.nameEnglish,
        arabicTitle: landmark.nameArabic,
        description: description,
        yaw: coordinates.yaw,
        pitch: coordinates.pitch,
        category: landmark.category,
        duration: landmark.duration ?? undefined,
        durationMinutes: landmark.durationInMinutes ?? undefined
      });
    }
  });

  // Then, add any pins that don't have a matching landmark
  Object.entries(pinsData).forEach(([pinName, coordinates], index) => {
    // Check if this pin was already added (by checking if any hotspot has the same yaw/pitch)
    const alreadyAdded = hotspots.some(
      hotspot => Math.abs(hotspot.yaw - coordinates.yaw) < 0.1 && 
                 Math.abs(hotspot.pitch - coordinates.pitch) < 0.1
    );
    
    if (!alreadyAdded) {
      // Determine a reasonable category based on name
      let category = 'default';
      if (pinName.toLowerCase().includes('mosque') || pinName.toLowerCase().includes('masjid')) {
        category = 'masjid';
      } else if (pinName.toLowerCase().includes('mall') || pinName.toLowerCase().includes('shop')) {
        category = 'shopping';
      } else if (pinName.toLowerCase().includes('hospital')) {
        category = 'healthcare';
      } else if (pinName.toLowerCase().includes('school') || pinName.toLowerCase().includes('college')) {
        category = 'education';
      } else if (pinName.toLowerCase().includes('bank')) {
        category = 'finance';
      }
      
      hotspots.push({
        id: `pin-${index}`,
        title: pinName,
        description: `${pinName} is located nearby.`,
        yaw: coordinates.yaw,
        pitch: coordinates.pitch,
        category: category
      });
    }
  });

  // Show loading page until everything is loaded
  if (!pageLoaded) {
    return <Loading />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Add background overlay for non-3D views - CHANGED TO GREEN */}
      {activeView !== "3d" && (
        <div className="fixed inset-0 bg-[#0b4d43] -z-10"></div>
      )}
      
      {/* Move tabs navigation to bottom center for better aesthetics */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-[100] rounded-full overflow-hidden">
        <Tabs defaultValue="3d" value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-black/80 backdrop-blur-sm shadow-xl border border-emerald-500/50 p-0.5 sm:p-1">
            <TabsTrigger 
              value="3d" 
              className="flex items-center justify-center gap-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-3 py-1 text-xs sm:text-sm min-w-[80px] sm:min-w-[90px]"
            >
              <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">3D</span>
            </TabsTrigger>
            <TabsTrigger 
              value="street" 
              className="flex items-center justify-center gap-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-3 py-1 text-xs sm:text-sm min-w-[80px] sm:min-w-[90px]"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Street</span>
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center justify-center gap-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-3 py-1 text-xs sm:text-sm min-w-[80px] sm:min-w-[90px]"
            >
              <Map className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Map</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3D Panorama View with imported landmarks */}
      {activeView === "3d" && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-black/20 to-transparent"></div>
          <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} className="w-full h-full">
            <Suspense fallback={null}>
              {/* Add ambient light to make hotspots visible */}
              <ambientLight intensity={0.5} />
              
              {/* Add directional light for better shading */}
              <directionalLight position={[0, 10, 5]} intensity={1} />
              
              <PanoramaSphere hotspots={hotspots} />
              <OrbitControls 
                enableZoom={false}
                enablePan={false}
                rotateSpeed={-0.5}
                minPolarAngle={Math.PI * 0.1}
                maxPolarAngle={Math.PI/2 + MathUtils.degToRad(-15)} // Limit pitch to -24 degrees
              />
              
              <CameraPositionTracker onPositionUpdate={handlePositionUpdate} />
              
              {/* Add Bloom Effect for glowing materials */}
              <EffectComposer>
                <Bloom 
                  luminanceThreshold={0.2} 
                  luminanceSmoothing={0.9} 
                  intensity={0.8}
                />
              </EffectComposer>
            </Suspense>
          </Canvas>
          
          {/* Hide landmarks panel on mobile, show on medium screens and up */}
          {/* <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-lg max-w-[200px] hidden md:block">
            <h3 className="text-sm font-bold mb-2">Nearby Landmarks ({hotspots.length})</h3>
            <div className="flex flex-col gap-2 text-xs">
              {['shopping', 'education', 'healthcare', 'infrastructure', 'leisure', 'finance', 'masjid'].map(cat => {
                const { icon: Icon, bgColor } = getCategoryStyle(cat as keyof typeof styles, "#cccccc");
                const count = hotspots.filter(h => h.category === cat).length;
                if (count === 0) return null;
                
                return (
                  <div key={cat} className="flex items-center">
                    <span className="p-1 rounded-full text-white mr-1" style={{backgroundColor: bgColor}}>
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="capitalize">{cat} ({count})</span>
                  </div>
                );
              })}
            </div>
          </div> */}
        </>
      )}

      {/* Street View - Added pointer-events handling */}
      {activeView === "street" && (
        <div className="w-full h-full bg-[#0b4d43]">
          {/* Menu button protection overlay */}
          <div className="fixed top-0 right-0 w-16 h-16 z-[9999] pointer-events-none" />
          
          <div className="w-full h-full md:pt-24 md:max-w-7xl md:mx-auto md:h-[calc(100vh-96px)]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!4v1711541520021!6m8!1m7!1sCAoSK0FGMVFpcFA2SHpxblRxX3Y0YUpLOEFKbkhtT2dZR0c0WUpvRXo4SXYyT0U.!2m2!1d23.55712347216705!2d58.402560573914975!3f180!4f0!5f0.7820865974627469"
              className="w-full h-full border-0 md:rounded-xl shadow-lg"
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}

      {/* Map View - Added pointer-events handling */}
      {activeView === "map" && (
        <div className="w-full h-full bg-[#0b4d43]">
          {/* Menu button protection overlay */}
          <div className="fixed top-0 right-0 w-16 h-16 z-[9999] pointer-events-none" />
          
          <div className="w-full h-full md:pt-24 md:max-w-7xl md:mx-auto md:h-[calc(100vh-96px)]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d58.402560573914975!3d23.55712347216705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzI1LjYiTiA1OMKwMjQnMDkuMiJF!5e1!3m2!1sen!2som!4v1616613838404!5m2!1sen!2som"
              className="w-full h-full border-0 md:rounded-xl shadow-lg"
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated helper function to maintain consistency with pin data
function sphericalToCartesian(yaw: number, pitch: number, radius: number): [number, number, number] {
  // Convert from degrees to radians
  const yawRad = MathUtils.degToRad((360 - yaw) % 360);
  const pitchRad = MathUtils.degToRad(pitch);
  
  const spherical = new Spherical(
    radius,
    Math.PI/2 - pitchRad,
    yawRad
  );
  
  const cartesian = new Vector3();
  cartesian.setFromSpherical(spherical);
  
  return cartesian.toArray();
}

// For better glow on structure models
// newMat.emissive = new THREE.Color(0xffffff);
// newMat.emissiveIntensity = 0.3; // Increased from 0.15

// For more prominent hover effect
// newMat.emissive = new THREE.Color(0x8cedaf);
// newMat.emissiveIntensity = 1.0; // Increased from 0.5