// components/vr-tour/VR360TourViewer.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

import { Headset, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Hotspot {
  position: [number, number, number]
  targetIndex: number
  label: string
}

interface PanoramaLocation {
  id: string
  url: string
  title: string
  hotspots?: Hotspot[]
}

interface VR360TourViewerProps {
  panoramas: PanoramaLocation[]
  initialPanoramaIndex?: number
  enableControls?: boolean
  height?: string
  width?: string
  onPanoramaChange?: (index: number) => void
  className?: string
}

export function VR360TourViewer({
  panoramas,
  initialPanoramaIndex = 0,
  enableControls = true,
  height = "500px",
  width = "100%",
  onPanoramaChange,
  className = ""
}: VR360TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const hotspotGroupRef = useRef<THREE.Group | null>(null)
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null)
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map())
  const preloadQueue = useRef<string[]>([])

  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(initialPanoramaIndex)
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [isInVR, setIsInVR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hoveredHotspot, setHoveredHotspot] = useState<number | null>(null)
  const [controllerActive, setControllerActive] = useState(false)

  // Initialize scene, camera, renderer, etc.
  useEffect(() => {
    if (!containerRef.current || panoramas.length === 0) return

    console.log("Initializing VR 360 Tour Viewer")
    
    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    cameraRef.current = camera
    camera.position.set(0, 0, 0)
    camera.layers.enable(1) // For UI elements
    
    // Create renderer with WebXR support
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.xr.enabled = true
    rendererRef.current = renderer
    
    // Check if VR is supported
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setIsVRSupported(supported)
          if (supported) {
            // Add VR button
            const vrButton = VRButton.createButton(renderer)
            vrButton.style.position = 'absolute'
            vrButton.style.bottom = '20px'
            vrButton.style.right = '20px'
            vrButton.style.zIndex = '100'
            vrButton.style.background = '#0b4d43'
            vrButton.style.color = 'white'
            vrButton.style.border = 'none'
            vrButton.style.borderRadius = '4px'
            vrButton.style.padding = '12px 20px'
            vrButton.style.fontFamily = 'system-ui, sans-serif'
            vrButton.style.cursor = 'pointer'
            containerRef.current?.appendChild(vrButton)
            
            // VR session change events
            renderer.xr.addEventListener('sessionstart', () => {
              console.log("VR session started")
              setIsInVR(true)
              setupVRControllers()
            })
            
            renderer.xr.addEventListener('sessionend', () => {
              console.log("VR session ended")
              setIsInVR(false)
            })
          }
        })
        .catch((err: unknown) => {
          console.error("Error checking VR support:", err)
          setIsVRSupported(false)
        })
    }
    
    // Configure container and renderer
    const container = containerRef.current
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    
    // Set up orbit controls for desktop viewing
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    textureLoaderRef.current = textureLoader
    
    // Create sphere geometry for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Flip inside out
    
    // Create material (initially without texture)
    const material = new THREE.MeshBasicMaterial({
      color: 0x222222,
      side: THREE.BackSide
    })
    materialRef.current = material
    
    // Create panorama sphere
    const sphere = new THREE.Mesh(geometry, material)
    sphere.name = "panoramaSphere"
    sphereRef.current = sphere
    scene.add(sphere)
    
    // Create group for hotspots
    const hotspotGroup = new THREE.Group()
    hotspotGroup.name = "hotspotGroup"
    hotspotGroupRef.current = hotspotGroup
    scene.add(hotspotGroup)
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      
      rendererRef.current.setSize(width, height)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (!rendererRef.current.xr.isPresenting) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }
    }
    
    // Start XR animation loop
    rendererRef.current.setAnimationLoop(animate)
    
    // Setup raycaster for hotspot interaction
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    
    const onPointerMove = (event: MouseEvent) => {
      if (!containerRef.current || isInVR) return
      
      const rect = containerRef.current.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      checkHotspotIntersection(raycaster, pointer)
    }
    
    const onPointerClick = (event: MouseEvent) => {
      if (!containerRef.current || isInVR) return
      
      const rect = containerRef.current.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      handleHotspotClick(raycaster, pointer)
    }
    
    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('click', onPointerClick)
    
    // Cleanup
    return () => {
      console.log("Cleaning up VR 360 Tour Viewer")
      
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('click', onPointerClick)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        
        // Remove VR button if it exists
        const vrButton = containerRef.current.querySelector('button')
        if (vrButton) {
          containerRef.current.removeChild(vrButton)
        }
      }
      
      // Dispose of Three.js resources
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      if (sphereRef.current && sphereRef.current.geometry) {
        sphereRef.current.geometry.dispose()
      }
      
      if (materialRef.current) {
        if (materialRef.current.map) {
          materialRef.current.map.dispose()
        }
        materialRef.current.dispose()
      }
      
      // Clear texture cache
      textureCache.current.forEach(texture => {
        texture.dispose()
      })
      textureCache.current.clear()
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Function to check if a hotspot is being hovered
  const checkHotspotIntersection = useCallback((raycaster: THREE.Raycaster, pointer: THREE.Vector2) => {
    if (!sceneRef.current || !cameraRef.current || !hotspotGroupRef.current) return
    
    raycaster.setFromCamera(pointer, cameraRef.current)
    
    const intersects = raycaster.intersectObjects(hotspotGroupRef.current.children)
    
    if (intersects.length > 0) {
      const hotspotMesh = intersects[0].object as THREE.Mesh
      setHoveredHotspot(parseInt(hotspotMesh.userData.index))
      document.body.style.cursor = 'pointer'
    } else {
      setHoveredHotspot(null)
      document.body.style.cursor = 'default'
    }
  }, [])

  // Function to handle hotspot clicks
  const handleHotspotClick = useCallback((raycaster: THREE.Raycaster, pointer: THREE.Vector2) => {
    if (!sceneRef.current || !cameraRef.current || !hotspotGroupRef.current) return
    
    raycaster.setFromCamera(pointer, cameraRef.current)
    
    const intersects = raycaster.intersectObjects(hotspotGroupRef.current.children)
    
    if (intersects.length > 0) {
      const hotspotMesh = intersects[0].object as THREE.Mesh
      const targetIndex = hotspotMesh.userData.targetIndex
      
      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < panoramas.length) {
        setCurrentPanoramaIndex(targetIndex)
      }
    }
  }, [panoramas.length])

  // Setup VR controllers
  const setupVRControllers = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current) return
    
    console.log("Setting up VR controllers")
    
    const controllerModelFactory = new XRControllerModelFactory()
    
    // Controller 1
    const controller1 = rendererRef.current.xr.getController(0)
    controller1.addEventListener('connected', () => {
      setControllerActive(true)
    })
    controller1.addEventListener('disconnected', () => {
      setControllerActive(false)
    })
    
    controller1.addEventListener('selectstart', handleControllerSelect)
    controller1.addEventListener('selectend', handleControllerSelectEnd)
    sceneRef.current.add(controller1)
    
    // Controller 1 Grip
    const controllerGrip1 = rendererRef.current.xr.getControllerGrip(0)
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
    sceneRef.current.add(controllerGrip1)
    
    // Controller 2
    const controller2 = rendererRef.current.xr.getController(1)
    controller2.addEventListener('selectstart', handleControllerSelect)
    controller2.addEventListener('selectend', handleControllerSelectEnd)
    sceneRef.current.add(controller2)
    
    // Controller 2 Grip
    const controllerGrip2 = rendererRef.current.xr.getControllerGrip(1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
    sceneRef.current.add(controllerGrip2)
    
    // Add controller ray for visualization
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -5], 3))
    
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      blending: THREE.AdditiveBlending
    })
    
    const line = new THREE.Line(geometry, material)
    line.name = 'line'
    line.scale.z = 5
    
    controller1.add(line.clone())
    controller2.add(line.clone())
  }, [])

  // Handle controller selection
  const handleControllerSelect = useCallback((event: any) => {
    if (!sceneRef.current || !hotspotGroupRef.current) return
    
    const controller = event.target
    const tempMatrix = new THREE.Matrix4()
    const raycaster = new THREE.Raycaster()
    
    tempMatrix.identity().extractRotation(controller.matrixWorld)
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)
    
    const intersects = raycaster.intersectObjects(hotspotGroupRef.current.children)
    
    if (intersects.length > 0) {
      const hotspotMesh = intersects[0].object as THREE.Mesh
      const targetIndex = hotspotMesh.userData.targetIndex
      
      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < panoramas.length) {
        setCurrentPanoramaIndex(targetIndex)
      }
    }
  }, [panoramas.length])

  // Handle controller selection end
  const handleControllerSelectEnd = useCallback(() => {
    // Handle if needed
  }, [])

  // Load panorama texture and update scene
  const loadPanorama = useCallback(async (index: number) => {
    if (!materialRef.current || !textureLoaderRef.current || index < 0 || index >= panoramas.length) {
      return
    }
    
    const panorama = panoramas[index]
    
    setIsLoading(true)
    setLoadingProgress(0)
    
    try {
      // Use cached texture if available
      if (textureCache.current.has(panorama.url)) {
        console.log(`Using cached texture for ${panorama.url}`)
        const texture = textureCache.current.get(panorama.url)!
        updatePanoramaTexture(texture)
        return
      }
      
      // Load new texture
      console.log(`Loading texture: ${panorama.url}`)
      
      const loadTexture = () => {
        return new Promise<THREE.Texture>((resolve, reject) => {
          textureLoaderRef.current!.load(
            panorama.url,
            (texture) => {
              // Configure texture for best quality
              texture.minFilter = THREE.LinearFilter
              texture.generateMipmaps = false
              texture.colorSpace = THREE.SRGBColorSpace
              
              // Cache the texture
              textureCache.current.set(panorama.url, texture)
              
              resolve(texture)
            },
            (progress) => {
              if (progress.lengthComputable) {
                const percent = Math.round((progress.loaded / progress.total) * 100)
                setLoadingProgress(percent)
              }
            },
            (error) => {
              if (error instanceof Error) {
                console.error(`Error loading panorama texture: ${error.message}`)
              } else {
                console.error(`Error loading panorama texture: ${String(error)}`)
              }
              reject(error)
            }
          )
        })
      }
      
      const texture = await loadTexture()
      updatePanoramaTexture(texture)
      
      // Preload adjacent panoramas
      preloadAdjacentPanoramas(index)
      
    } catch (err) {
      console.error("Failed to load panorama:", err)
      setError(`Failed to load panorama: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }, [panoramas])

  // Update the panorama texture and create hotspots
  const updatePanoramaTexture = useCallback((texture: THREE.Texture) => {
    if (!materialRef.current) return
    
    // Apply texture to material
    materialRef.current.map = texture
    materialRef.current.needsUpdate = true
    
    // Update hotspots
    updateHotspots(currentPanoramaIndex)
    
    setIsLoading(false)
  }, [currentPanoramaIndex])

  // Update hotspots for the current panorama
  const updateHotspots = useCallback((index: number) => {
    if (!hotspotGroupRef.current || !sceneRef.current) return
    
    // Remove existing hotspots
    while (hotspotGroupRef.current.children.length > 0) {
      const child = hotspotGroupRef.current.children[0]
      hotspotGroupRef.current.remove(child)
      
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    }
    
    // Create new hotspots
    const panorama = panoramas[index]
    if (!panorama.hotspots) return
    
    panorama.hotspots.forEach((hotspot, i) => {
      // Create hotspot geometry
      const geometry = new THREE.SphereGeometry(10, 16, 16)
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7
      })
      
      const hotspotMesh = new THREE.Mesh(geometry, material)
      hotspotMesh.position.set(...hotspot.position)
      hotspotMesh.name = `hotspot-${i}`
      hotspotMesh.userData = {
        index: i,
        targetIndex: hotspot.targetIndex,
        label: hotspot.label
      }
      
      // Make hotspots visible through walls
      hotspotMesh.renderOrder = 999
      hotspotMesh.material.depthTest = false
      
      // Add to hotspot group
      if (hotspotGroupRef.current) {
        hotspotGroupRef.current.add(hotspotMesh)
      }
      
      // Create text label
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const context = canvas.getContext('2d')!
      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = 'white'
      context.font = '24px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(hotspot.label, canvas.width / 2, canvas.height / 2)
      
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
      
      const labelGeometry = new THREE.PlaneGeometry(30, 15)
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial)
      labelMesh.position.copy(hotspotMesh.position)
      labelMesh.position.y += 15
      labelMesh.renderOrder = 1000
      
      // Make label face the camera
      labelMesh.onBeforeRender = (renderer, scene, camera) => {
        labelMesh.lookAt(camera.position)
      }
      
      if (hotspotGroupRef.current) {
        hotspotGroupRef.current.add(labelMesh)
      }
    })
  }, [panoramas])

  // Preload adjacent panoramas for smoother transitions
  const preloadAdjacentPanoramas = useCallback((currentIndex: number) => {
    if (!textureLoaderRef.current) return
    
    // Clear previous preload queue
    preloadQueue.current = []
    
    // Add adjacent panoramas to queue
    const nextIndex = (currentIndex + 1) % panoramas.length
    const prevIndex = (currentIndex - 1 + panoramas.length) % panoramas.length
    
    // Add to queue if not already cached
    if (!textureCache.current.has(panoramas[nextIndex].url)) {
      preloadQueue.current.push(panoramas[nextIndex].url)
    }
    
    if (!textureCache.current.has(panoramas[prevIndex].url)) {
      preloadQueue.current.push(panoramas[prevIndex].url)
    }
    
    // Preload hotspot target panoramas
    const currentPanorama = panoramas[currentIndex]
    if (currentPanorama.hotspots) {
      currentPanorama.hotspots.forEach(hotspot => {
        const targetUrl = panoramas[hotspot.targetIndex]?.url
        if (targetUrl && !textureCache.current.has(targetUrl)) {
          preloadQueue.current.push(targetUrl)
        }
      })
    }
    
    // Start preloading
    preloadNextInQueue()
  }, [panoramas])

  // Preload the next texture in the queue
  const preloadNextInQueue = useCallback(() => {
    if (!textureLoaderRef.current || preloadQueue.current.length === 0) return
    
    const url = preloadQueue.current[0]
    
    // Skip if already cached
    if (textureCache.current.has(url)) {
      preloadQueue.current.shift()
      preloadNextInQueue()
      return
    }
    
    console.log(`Preloading texture: ${url}`)
    
    textureLoaderRef.current.load(
      url,
      (texture) => {
        // Configure texture
        texture.minFilter = THREE.LinearFilter
        texture.generateMipmaps = false
        texture.colorSpace = THREE.SRGBColorSpace
        
        // Cache the texture
        textureCache.current.set(url, texture)
        
        // Remove from queue and load next
        preloadQueue.current.shift()
        preloadNextInQueue()
      },
      undefined,
      (error) => {
        console.error(`Error preloading texture ${url}:`, error)
        preloadQueue.current.shift()
        preloadNextInQueue()
      }
    )
  }, [])

  // Effect to load panorama when index changes
  useEffect(() => {
    loadPanorama(currentPanoramaIndex)
    
    // Notify parent component
    if (onPanoramaChange) {
      onPanoramaChange(currentPanoramaIndex)
    }
  }, [currentPanoramaIndex, loadPanorama, onPanoramaChange])

  // Navigate to next panorama
  const goToNextPanorama = useCallback(() => {
    setCurrentPanoramaIndex((prevIndex) => (prevIndex + 1) % panoramas.length)
  }, [panoramas.length])

  // Navigate to previous panorama
  const goToPrevPanorama = useCallback(() => {
    setCurrentPanoramaIndex((prevIndex) => (prevIndex - 1 + panoramas.length) % panoramas.length)
  }, [panoramas.length])

  return (
    <div className={`vr-tour-container relative ${className}`}>
      <div
        ref={containerRef}
        className="vr-scene-container relative overflow-hidden rounded-lg"
        style={{ width, height }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
            <div className="text-white text-sm">{loadingProgress}%</div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-red-900/90 text-white p-4 rounded-md max-w-xs">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error}</p>
              <button 
                className="mt-3 bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded text-sm"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation controls - only when not in VR mode */}
        {enableControls && panoramas.length > 1 && !isInVR && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            <button
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors shadow-lg"
              onClick={goToPrevPanorama}
              aria-label="Previous panorama"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="bg-black/60 text-white px-3 py-1 rounded-full flex items-center text-sm">
              {currentPanoramaIndex + 1} / {panoramas.length}
            </div>
            
            <button
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors shadow-lg"
              onClick={goToNextPanorama}
              aria-label="Next panorama"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Panorama title */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-md text-center max-w-xs z-10">
          {panoramas[currentPanoramaIndex]?.title || `Panorama ${currentPanoramaIndex + 1}`}
        </div>
        
        {/* VR availability indicator */}
        {isVRSupported && !isInVR && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded flex items-center text-xs z-10">
            <Headset className="h-3 w-3 mr-1" />
            <span>VR Ready</span>
          </div>
        )}
      </div>
    </div>
  )
}