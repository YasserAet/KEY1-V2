"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Headphones, X, RotateCcw, Home, ArrowRight, Users, Bed, Bath, Smartphone } from "lucide-react"
import { APARTMENT_TYPES, APARTMENT_PANORAMAS } from "../app/apartment-types"

// Custom hook to detect mobile devices
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any
      "a-sky": any
      "a-camera": any
      "a-cursor": any
      "a-sphere": any
      "a-text": any
      "a-box": any
      "a-entity": any
      "a-assets": any
      "a-image": any
      "a-ring": any
      "a-plane": any
      "a-light": any
    }
  }
}

declare global {
  interface Window {
    AFRAME: any
    navigateToRoom?: (roomId: string) => void
    backToSelection?: () => void
  }
}

type ViewMode = "selection" | "tour"

export default function Component() {
  const isMobile = useMobileDetection()
  const [viewMode, setViewMode] = useState<ViewMode>("selection")
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [isVRMode, setIsVRMode] = useState(false)
  const [aframeLoaded, setAframeLoaded] = useState(false)
  const [vrSupported, setVrSupported] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const sceneRef = useRef<any>(null)
  const skyRef = useRef<any>(null)

  // Calculate derived state early
  const currentApartment = selectedApartment ? APARTMENT_TYPES.find((apt) => apt.id === selectedApartment) : null
  const currentRooms = selectedApartment
    ? APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS]
    : []
  const currentRoom = currentRooms[currentRoomIndex]

  useEffect(() => {
    // Load A-Frame dynamically
    if (typeof window !== "undefined" && !window.AFRAME) {
      const script = document.createElement("script")
      script.src = "https://aframe.io/releases/1.4.0/aframe.min.js"
      script.onload = () => {
        setAframeLoaded(true)
        checkVRSupport()
        setupAFrameComponents()
      }
      document.head.appendChild(script)
    } else if (window.AFRAME) {
      setAframeLoaded(true)
      checkVRSupport()
      setupAFrameComponents()
    }
  }, [])

  // Global navigation functions
  useEffect(() => {
    window.navigateToRoom = (roomId: string) => {
      console.log("Navigating to room:", roomId)
      if (!selectedApartment) return
      const rooms = APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS]
      const newRoomIndex = rooms.findIndex((room) => room.id === roomId)
      console.log("Found room index:", newRoomIndex, "for room:", roomId)
      if (newRoomIndex !== -1) {
        setCurrentRoomIndex(newRoomIndex)
      }
    }

    window.backToSelection = () => {
      setViewMode("selection")
      setSelectedApartment(null)
      setCurrentRoomIndex(0)
    }

    return () => {
      delete window.navigateToRoom
      delete window.backToSelection
    }
  }, [selectedApartment])

  // Update sky texture when room changes
  useEffect(() => {
    if (viewMode === "tour" && selectedApartment && skyRef.current) {
      const currentRoom = APARTMENT_PANORAMAS[selectedApartment as keyof typeof APARTMENT_PANORAMAS][currentRoomIndex]

      // Force texture update by directly setting the src attribute
      if (currentRoom) {
        console.log("Updating sky texture to:", currentRoom.id)

        // Create a new image element to ensure proper loading
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          if (skyRef.current) {
            // Set the src directly to the URL instead of using the asset reference
            skyRef.current.setAttribute("src", currentRoom.url)
            console.log("Sky texture updated successfully")
          }
        }
        img.onerror = (err) => {
          console.error("Failed to load panorama image:", err)
        }
        img.src = currentRoom.url
      }
    }
  }, [viewMode, selectedApartment, currentRoomIndex])

  const backToSelection = () => {
    setViewMode("selection")
    setSelectedApartment(null)
    setCurrentRoomIndex(0)
  }

  const selectApartment = (apartmentId: string) => {
    setSelectedApartment(apartmentId)
    setCurrentRoomIndex(0)
    setViewMode("tour")
  }

  // Reset view when room changes
  useEffect(() => {
    if (viewMode === "tour" && aframeLoaded) {
      // Longer delay to ensure A-Frame scene is fully ready
      const timer = setTimeout(() => {
        resetView()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currentRoomIndex, selectedApartment, viewMode, aframeLoaded])

  // Debug logging
  useEffect(() => {
    console.log("Current room changed:", currentRoom?.id, "Index:", currentRoomIndex)
    console.log(
      "Available rooms:",
      currentRooms.map((r) => r.id),
    )
  }, [currentRoomIndex, currentRoom, currentRooms])

  const checkVRSupport = async () => {
    if (navigator.xr) {
      try {
        const isSupported = await navigator.xr.isSessionSupported("immersive-vr")
        setVrSupported(isSupported)
      } catch (error) {
        console.log("VR not supported:", error)
        setVrSupported(false)
      }
    } else {
      setVrSupported(false)
    }
  }

  const setupAFrameComponents = () => {
    if (!window.AFRAME) return

    // Register back to selection component
    if (!window.AFRAME.components["back-to-selection"]) {
      window.AFRAME.registerComponent("back-to-selection", {
        init: function () {
          this.el.addEventListener("click", () => {
            if (window.backToSelection) {
              window.backToSelection()
            }
          })
        },
      })
    }

    // Register hover effects
    if (!window.AFRAME.components["cursor-listener"]) {
      window.AFRAME.registerComponent("cursor-listener", {
        init: function () {
          this.el.addEventListener("mouseenter", function (this: any) {
            this.setAttribute("animation__hoverscale", "property: scale; to: 1.1 1.1 1.1; dur: 200; easing: easeOutBack")
            this.setAttribute(
              "animation__hoveremissive",
              "property: material.emissiveIntensity; to: 1.5; dur: 200; easing: easeOutQuart",
            )
          })

          this.el.addEventListener("mouseleave", function (this: any) {
            this.setAttribute("animation__hoverscale", "property: scale; to: 1 1 1; dur: 150; easing: easeInBack")
            this.setAttribute(
              "animation__hoveremissive",
              "property: material.emissiveIntensity; to: 0.8; dur: 150; easing: easeInQuart",
            )
          })
        },
      })
    }

    // VR mode detection
    if (!window.AFRAME.components["vr-mode-listener"]) {
      window.AFRAME.registerComponent("vr-mode-listener", {
        init: function () {
          this.el.addEventListener("enter-vr", () => {
            setIsVRMode(true)
          })
          this.el.addEventListener("exit-vr", () => {
            setIsVRMode(false)
          })
        },
      })
    }

    // Register navigate-to-room component
    if (!window.AFRAME.components["navigate-to-room"]) {
      window.AFRAME.registerComponent("navigate-to-room", {
        schema: {
          roomId: { type: "string" },
        },
        init: function () {
          this.el.addEventListener("click", () => {
            console.log("Hotspot clicked:", this.data.roomId)
            if (window.navigateToRoom) {
              window.navigateToRoom(this.data.roomId)
            }
          })
        },
      })
    }

    // Register asset-loaded component
    if (!window.AFRAME.components["asset-loaded"]) {
      window.AFRAME.registerComponent("asset-loaded", {
        init: function () {
          this.el.addEventListener("loaded", () => {
            console.log("All assets loaded successfully")
            setAssetsLoaded(true)
          })
        },
      })
    }

    // Register exit-vr-button component
    if (!window.AFRAME.components["exit-vr-button"]) {
      window.AFRAME.registerComponent("exit-vr-button", {
        init: function () {
          this.el.addEventListener("click", () => {
            if (sceneRef.current && sceneRef.current.exitVR) {
              sceneRef.current.exitVR()
            }
          })
        },
      })
    }
  }

  const enterVR = async () => {
    if (!sceneRef.current) return

    try {
      if (sceneRef.current.enterVR) {
        await sceneRef.current.enterVR()
      } else {
        alert("VR not available. Please connect a VR headset and try again.")
      }
    } catch (error) {
      console.error("Failed to enter VR:", error)
      alert("Failed to enter VR mode. Make sure your VR headset is connected and WebXR is enabled.")
    }
  }

  const exitVR = () => {
    if (sceneRef.current && sceneRef.current.exitVR) {
      sceneRef.current.exitVR()
    }
  }

  const resetView = () => {
    if (sceneRef.current) {
      const camera = sceneRef.current.querySelector("[camera]")
      if (camera) {
        // Reset both position and rotation
        camera.setAttribute("position", "0 1.6 0")
        camera.setAttribute("rotation", "0 0 0")
        
        console.log("Camera view reset successfully")
      } else {
        console.log("Camera element not found")
      }
    } else {
      console.log("Scene reference not available")
    }
  }

  // Preload all panorama images
  const preloadImages = () => {
    return (
      <>
        {Object.entries(APARTMENT_PANORAMAS).map(([aptType, rooms]) =>
          rooms.map((room) => (
            <img
              key={`preload-${aptType}-${room.id}`}
              src={room.url || "/placeholder.svg"}
              style={{ display: "none" }}
              alt=""
              onLoad={() => console.log(`Preloaded: ${room.id}`)}
              onError={() => console.error(`Failed to preload: ${room.id}`)}
            />
          ))
        )}
      </>
    )
  }

  // Show mobile unsupported message
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] via-[#0F5D52] to-[#134E44] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <Smartphone className="w-16 h-16 text-[#2DD4BF] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4 font-montserrat">Mobile Not Supported</h1>
            </div>
            
            <div className="space-y-4 text-[#2DD4BF]/90 font-montserrat">
              <p className="text-lg">
                This VR Panorama Tour requires a desktop or laptop computer for the best experience.
              </p>
              
              <div className="bg-[#0B4D43]/30 rounded-xl p-4 text-sm">
                <h3 className="font-semibold text-white mb-2">Why desktop only?</h3>
                <ul className="text-left space-y-1">
                  <li>• VR headset compatibility</li>
                  <li>• Better performance for 3D rendering</li>
                  <li>• Full keyboard and mouse controls</li>
                  <li>• Larger screen for immersive experience</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#2DD4BF]/70">
                Please visit this page on a desktop computer to experience the full virtual tour.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] via-[#0F5D52] to-[#134E44] relative overflow-hidden">
      {/* Preload images */}
      {preloadImages()}

      {/* Load Montserrat font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* UI Selection Mode */}
      {viewMode === "selection" && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="relative z-10 p-8 pt-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 font-montserrat">Virtual Tours</h1>
                <p className="text-xl text-[#2DD4BF]/80 font-montserrat">Experience immersive 360° tours with VR support

</p>
              </div>
            </div>
          </div>

          {/* Apartment Selection Cards */}
          <div className="flex-1 px-8 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {APARTMENT_TYPES.map((apartment, index) => (
                  <Card
                    key={apartment.id}
                    className="group cursor-pointer transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl overflow-hidden hover:border-[#2DD4BF]/60 hover:bg-[#0B4D43]/30 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => selectApartment(apartment.id)}
                  >
                    <div className="relative">
                      {/* Thumbnail Image */}
                      <div className="aspect-video overflow-hidden rounded-xl">
                        <img
                          src={apartment.thumbnail || "/placeholder.svg?height=300&width=400"}
                          alt={apartment.name}
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                        />
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl transition-opacity duration-300 group-hover:opacity-80" />

                      {/* Apartment Type Badge */}
                      {/* <div className="absolute top-4 left-4">
                        <span className="bg-[#2DD4BF] text-[#0B4D43] px-3 py-1 rounded-full text-sm font-semibold font-montserrat transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                          Premium
                        </span>
                      </div> */}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2 font-montserrat transition-all duration-300 group-hover:text-[#2DD4BF]">{apartment.name}</h3>
                          <p className="text-[#2DD4BF]/80 font-montserrat transition-all duration-300 group-hover:text-[#2DD4BF]">{apartment.description}</p>
                        </div>
                      </div>

                      {/* Features */}
                      {/* <div className="flex items-center gap-4 mb-6 text-[#2DD4BF]/80">
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Bed className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Lavender" ? "1 Bed" : apartment.id === "Terracotta" ? "1 Bed" : "2 Bed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Bath className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Limelight" ? "2 Bath" : "1 Bath"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105">
                          <Users className="w-4 h-4 transition-all duration-300 group-hover:text-[#2DD4BF]" />
                          <span className="text-sm font-montserrat">
                            {apartment.id === "Limelight" ? "4 People" : "2 People"}
                          </span>
                        </div>
                      </div> */}

                      {/* Action Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] border-0 rounded-xl py-3 font-semibold font-montserrat transition-all duration-500 ease-out group-hover:shadow-lg group-hover:scale-105 transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          selectApartment(apartment.id)
                        }}
                      >
                        <span className="transition-all duration-300 group-hover:translate-x-1">Start Virtual Tour</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <div className="p-8 text-center">
            <p className="text-[#2DD4BF]/60 font-montserrat">Experience immersive 360° tours with VR support</p>
          </div> */}
        </div>
      )}

      {/* VR Tour Mode */}
      {viewMode === "tour" && (
        <>
          {/* Modern Header */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-60 pl-10 pr-10">
            <div className="flex justify-between items-start">
              {/* Current Info */}
              <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:bg-[#0B4D43]/30 hover:border-[#2DD4BF]/50 hover:shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-1 font-montserrat transition-all duration-300 hover:text-[#2DD4BF]">{currentApartment?.name}</h1>
                <p className="text-[#2DD4BF]/80 text-sm mb-2 font-montserrat transition-all duration-300 hover:text-[#2DD4BF]">{currentRoom?.title}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse transition-all duration-300 hover:scale-125"></div>
                  <span className="text-white/70 text-xs font-medium font-montserrat transition-all duration-300 hover:text-white">
                    Room {currentRoomIndex + 1} of {currentRooms.length}
                  </span>
                </div>
              </div>

              {/* VR Button */}
              {/* <Button
                onClick={enterVR}
                disabled={!aframeLoaded || !vrSupported}
                className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] border-0 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-montserrat font-semibold transform"
              >
                <Headphones className="w-5 h-5 mr-2 transition-all duration-300 group-hover:rotate-12" />
                {vrSupported ? "Enter VR" : "VR Unavailable"}
              </Button> */}
            </div>
          </div>

          {/* Modern Control Panel - Always visible */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:bg-[#0B4D43]/30 hover:border-[#2DD4BF]/50 hover:shadow-2xl">
              <div className="flex items-center justify-between">
                {/* Navigation Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={backToSelection}
                    className="text-white hover:bg-[#2DD4BF]/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:text-[#2DD4BF] transform"
                  >
                    <Home className="w-5 h-5 transition-all duration-300 group-hover:rotate-12" />
                  </Button>

                  <div className="flex items-center gap-2 px-4">
                    {currentRooms.map((room, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentRoomIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ease-out transform hover:scale-125 ${
                          index === currentRoomIndex 
                            ? "bg-[#2DD4BF] w-6 shadow-lg shadow-[#2DD4BF]/50" 
                            : "bg-white/40 hover:bg-[#2DD4BF]/80 hover:shadow-md"
                        }`}
                        title={room.title}
                      />
                    ))}
                  </div>
                </div>

                {/* Utility Controls */}
                {/* <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetView}
                    className="text-white hover:bg-[#2DD4BF]/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:text-[#2DD4BF] transform"
                  >
                    <RotateCcw className="w-4 h-4 transition-all duration-300 hover:rotate-180" />
                  </Button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Exit VR Button */}
          {isVRMode && (
            <div className="absolute top-6 right-6 z-30">
              <Button
                onClick={exitVR}
                className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white border-0 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-3xl font-montserrat font-semibold transform group"
                size="lg"
              >
                <X className="w-6 h-6 mr-2 transition-all duration-300 group-hover:rotate-90" />
                Exit VR
              </Button>
            </div>
          )}

          {/* A-Frame Scene */}
          {aframeLoaded && (
            <a-scene
              loading-screen="enabled: false"
              ref={sceneRef}
              embedded
              style={{ height: "100vh", width: "100vw" }}
              vr-mode-ui="enabled: true"
              device-orientation-permission-ui="enabled: true"
              background="color: #000"
              renderer="antialias: true; colorManagement: true; sortObjects: true"
              webxr="optionalFeatures: local-floor,hand-tracking; referenceSpaceType: local-floor"
              vr-mode-listener
            >
              <a-assets asset-loaded>
                {/* Load ALL panorama images upfront */}
                {Object.entries(APARTMENT_PANORAMAS).map(([aptType, rooms]) =>
                  rooms.map((room) => (
                    <img
                      key={`${aptType}-${room.id}`}
                      id={`${aptType}-${room.id}`}
                      src={room.url || "/placeholder.svg"}
                      crossOrigin="anonymous"
                    />
                  ))
                )}
              </a-assets>

              {/* 360 Panorama Sky */}
              <a-sky ref={skyRef} src={currentRoom?.url} rotation="0 -90 0" material="side: back" />

              {/* Exit VR Button */}
              <a-entity position="0 4 -2">
                <a-plane
                  width="0.6"
                  height="0.2"
                  color="#EF4444"
                  material="emissive: #EF4444; emissiveIntensity: 0.8"
                  class="clickable"
                  exit-vr-button
                  cursor-listener
                  text="value: Exit VR; align: center; color: #fff; width: 2"
                  position="0 0 0"
                ></a-plane>
              </a-entity>

              {/* Home Button - Top Center */}
              <a-entity position="0 3 -2">
                <a-sphere
                  radius="0.3"
                  color="#ffffff"
                  material="emissive: #ffffff; emissiveIntensity: 0.8; metalness: 0.2; roughness: 0.2"
                  back-to-selection
                  cursor-listener
                  class="clickable"
                  animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear"
                />

                <a-text
                  position="0 -0.6 0"
                  value="HOME"
                  align="center"
                  color="#ffffff"
                  font="Montserrat"
                  width="8"
                  weight="600"
                  background="color: rgba(0,0,0,0.7); padding: 0.2 0.4; borderRadius: 0.1"
                  material="transparent: true; opacity: 0.9"
                  look-at="[camera]"
                />
              </a-entity>

              {/* Navigation Controls in VR */}
              <a-entity position="0 1.6 0">
                {/* Room Navigation Hotspots with permanent titles */}
                {currentRoom?.hotspots &&
                  currentRoom.hotspots.map((hotspot, index) => (
                    <a-entity key={`${hotspot.roomId}-${index}`}>
                      {/* Teal hotspot sphere */}
                      <a-sphere
                        position={hotspot.position}
                        radius="0.15"
                        color="#2DD4BF"
                        material="emissive: #2DD4BF; emissiveIntensity: 0.8; transparent: false; opacity: 1.0; metalness: 0.3; roughness: 0.3"
                        animation="property: material.emissiveIntensity; to: 1.5; dir: alternate; dur: 1500; loop: true; easing: easeInOutSine"
                        cursor-listener
                        class="clickable"
                        navigate-to-room={`roomId: ${hotspot.roomId}`}
                      />

                      {/* Permanent title above hotspot */}
                      <a-text
                        position={`${hotspot.position.split(" ")[0]} ${Number.parseFloat(hotspot.position.split(" ")[1]) + 0.5} ${hotspot.position.split(" ")[2]}`}
                        value={hotspot.label}
                        align="center"
                        color="#ffffff"
                        font="Montserrat"
                        width="6"
                        weight="500"
                        background="color: rgba(11,77,67,0.9); padding: 0.2 0.4; borderRadius: 0.1"
                        material="transparent: true; opacity: 0.95"
                        scale="0.9 0.9 0.9"
                        look-at="[camera]"
                      />
                    </a-entity>
                  ))}
              </a-entity>

              {/* Camera with cursor */}
              <a-camera
                look-controls="enabled: true; pointerLockEnabled: false; minPitch: -30; maxPitch: 30"
                wasd-controls="enabled: false"
                position="0 1.6 0"
                fov="80"
                movement-controls="enabled: false"
                static-body
              >
                <a-cursor
                  position="0 0 -1"
                  geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
                  material="color: #2DD4BF; shader: flat; opacity: 0.9"
                  animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
                  animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
                  raycaster="objects: .clickable; far: 20"
                  cursor="fuse: true; fuseTimeout: 1500"
                />
              </a-camera>

              {/* VR Controllers */}
              {isVRMode && (
                <>
                  <a-entity
                    id="leftController"
                    laser-controls="hand: left"
                    raycaster="objects: .clickable; far: 20"
                    line="color: #2DD4BF; opacity: 0.8"
                  />
                  <a-entity
                    id="rightController"
                    laser-controls="hand: right"
                    raycaster="objects: .clickable; far: 20"
                    line="color: #2DD4BF; opacity: 0.8"
                  />
                </>
              )}

              {/* Enhanced Lighting */}
              <a-light type="ambient" color="#0B4D43" intensity="0.3" />
              <a-light type="directional" position="0 2 1" color="#2DD4BF" intensity="0.4" />
            </a-scene>
          )}
        </>
      )}

      {!aframeLoaded && viewMode === "tour" && (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#2DD4BF]/50 rounded-full animate-ping mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">Loading VR Experience</h2>
            <p className="text-[#2DD4BF]/80 font-montserrat">Preparing your virtual tour...</p>
          </div>
        </div>
      )}
    </div>
  )
}