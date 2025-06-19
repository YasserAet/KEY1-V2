"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useState, useCallback, useEffect } from "react"
import * as THREE from "three"
import { XR, VRButton, Controllers, Hands, useXR } from "@react-three/xr"
import { Text, Box, Sphere } from "@react-three/drei"
import { SPACE_DATA, FLOORS, Room } from "./data"
import { BuildingModelLoader } from "./building-model-loader"
import { EnhancedLighting } from "./enhanced-lighting"
import { EnhancedEnvironment } from "./enhanced-environment"

interface VRBuildingViewerProps {
  currentFloor: number
  onFloorChange: (floor: number) => void
  onFlatClick: (flat: Room) => void
  favoriteRooms: Room[]
  onLoadingComplete: () => void
}

// VR Floor Control Component
function VRFloorControls({ 
  currentFloor, 
  onFloorChange, 
  totalFloors 
}: {
  currentFloor: number
  onFloorChange: (floor: number) => void
  totalFloors: number
}) {
  const controlsRef = useRef<THREE.Group>(null)
  const { player } = useXR()
  
  // Position controls in front of the user
  useFrame(() => {
    if (controlsRef.current && player) {
      const playerPosition = player.position
      const playerRotation = player.rotation
      
      // Position controls 2 meters in front of the player at chest height
      const offset = new THREE.Vector3(0, -0.5, -2)
      offset.applyQuaternion(player.quaternion)
      
      controlsRef.current.position.copy(playerPosition).add(offset)
      controlsRef.current.lookAt(playerPosition)
    }
  })

  return (
    <group ref={controlsRef}>
      {/* Floor indicator panel */}
      <Box args={[1.5, 0.8, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0b4d43" opacity={0.9} transparent />
      </Box>
      
      {/* Current floor text */}
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Floor {currentFloor + 1}
      </Text>
      
      {/* Floor navigation buttons */}
      <group position={[-0.4, -0.2, 0.06]}>
        <Box 
          args={[0.25, 0.25, 0.05]}
          onClick={() => currentFloor > -1 && onFloorChange(currentFloor - 1)}
        >
          <meshStandardMaterial color={currentFloor > -1 ? "#22c55e" : "#6b7280"} />
        </Box>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ↓
        </Text>
      </group>
      
      <group position={[0.4, -0.2, 0.06]}>
        <Box 
          args={[0.25, 0.25, 0.05]}
          onClick={() => currentFloor < totalFloors - 1 && onFloorChange(currentFloor + 1)}
        >
          <meshStandardMaterial color={currentFloor < totalFloors - 1 ? "#22c55e" : "#6b7280"} />
        </Box>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ↑
        </Text>
      </group>
    </group>
  )
}

// VR Room Information Panel
function VRRoomInfo({ 
  room, 
  position 
}: {
  room: Room | null
  position: [number, number, number]
}) {
  if (!room) return null

  return (
    <group position={position}>
      {/* Info panel background */}
      <Box args={[2, 1.2, 0.1]}>
        <meshStandardMaterial color="#1f2937" opacity={0.95} transparent />
      </Box>
      
      {/* Room title */}
      <Text
        position={[0, 0.4, 0.06]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {room.name}
      </Text>
      
      {/* Room details */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.08}
        color="#d1d5db"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {room.type} • {room.size}
      </Text>
      
      {/* Price */}
      <Text
        position={[0, -0.1, 0.06]}
        fontSize={0.1}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        ${room.price?.toLocaleString()}/month
      </Text>
      
      {/* Features */}
      <Text
        position={[0, -0.35, 0.06]}
        fontSize={0.06}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {room.features?.slice(0, 3).join(" • ")}
      </Text>
    </group>
  )
}

// VR Teleport Points
function VRTeleportPoints() {
  const teleportPoints = [
    { position: [15, 0, 15], label: "Overview" },
    { position: [8, 0, 8], label: "Close View" },
    { position: [-8, 0, 8], label: "Side View" },
    { position: [0, 0, 20], label: "Front View" },
  ]

  return (
    <>
      {teleportPoints.map((point, index) => (
        <group key={index} position={point.position}>
          {/* Teleport marker */}
          <Sphere args={[0.3]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color="#3b82f6" opacity={0.7} transparent />
          </Sphere>
          
          {/* Teleport label */}
          <Text
            position={[0, 1, 0]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {point.label}
          </Text>
        </group>
      ))}
    </>
  )
}

// Main VR Building Viewer Component
export function VRBuildingViewer({
  currentFloor,
  onFloorChange,
  onFlatClick,
  favoriteRooms,
  onLoadingComplete
}: VRBuildingViewerProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [hoveredFlat, setHoveredFlat] = useState<Room | null>(null)
  const totalFloors = FLOORS.length
  const isDayMode = true

  const handleFlatClick = useCallback((flat: Room) => {
    setSelectedRoom(flat)
    onFlatClick(flat)
  }, [onFlatClick])

  const handleFlatHover = useCallback((flat: Room) => {
    setHoveredFlat(flat)
  }, [])

  const handleFlatUnhover = useCallback(() => {
    setHoveredFlat(null)
  }, [])

  return (
    <>
      {/* VR Controllers and Hands */}
      <Controllers />
      <Hands />
      
      {/* Enhanced Lighting for VR */}
      <EnhancedLighting isDayMode={isDayMode} />
      <EnhancedEnvironment isDayMode={isDayMode} />
      
      {/* Building Model */}
      <BuildingModelLoader
        currentFloor={currentFloor}
        onLoadingComplete={onLoadingComplete}
        onFlatClick={handleFlatClick}
        onFlatHover={handleFlatHover}
        onFlatUnhover={handleFlatUnhover}
        favoriteRooms={favoriteRooms}
      />
      
      {/* VR Floor Controls */}
      <VRFloorControls
        currentFloor={currentFloor}
        onFloorChange={onFloorChange}
        totalFloors={totalFloors}
      />
      
      {/* VR Room Information Panel */}
      {(selectedRoom || hoveredFlat) && (
        <VRRoomInfo
          room={selectedRoom || hoveredFlat}
          position={[0, 3, -3]}
        />
      )}
      
      {/* VR Teleport Points */}
      <VRTeleportPoints />
      
      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d3748" opacity={0.3} transparent />
      </mesh>
    </>
  )
}

