// // components/premium-building-viewer/vr-controllers.tsx
// "use client"

// import { useXR } from '@react-three/xr'
// import { useFrame } from '@react-three/fiber'
// import { useState, useEffect } from 'react'
// import * as THREE from 'three'

// export function VRControllers({ onFlatClick }: { onFlatClick: (obj: THREE.Object3D) => void }) {
//   const { session, controllers } = useXR()
//   const leftController = controllers.find((c) => c.inputSource.handedness === 'left')
//   const rightController = controllers.find((c) => c.inputSource.handedness === 'right')
  
//   // Skip if not in VR mode
//   if (!session) return null
  
//   return (
//     <>
//       {leftController && (
//         <primitive 
//           object={leftController.controller} 
//           dispose={null}
//         />
//       )}
      
//       {rightController && (
//         <primitive 
//           object={rightController.controller} 
//           dispose={null}
//         />
//       )}
      
//       {/* Teleportation ray from right controller */}
//       {rightController && (
//         <TeleportationRay controller={rightController} />
//       )}
      
//       {/* Selection ray from left controller */}
//       {leftController && (
//         <SelectionRay controller={leftController} onFlatClick={onFlatClick} />
//       )}
//     </>
//   )
// }

// // Teleportation Ray for movement
// function TeleportationRay({ controller }: { controller: any }) {
//   // Teleportation implementation here
//   return (
//     <mesh>
//       {/* Teleportation ray visualization */}
//     </mesh>
//   )
// }

// // Selection Ray for clicking flats
// function SelectionRay(props: { controller: any, onFlatClick: (obj: THREE.Object3D) => void }) {
//   const { controller, onFlatClick } = props;
//   useFrame(({ raycaster, scene }) => {
//     if (controller) {
//       // Set raycaster from controller
//       const tempMatrix = new THREE.Matrix4()
//       tempMatrix.identity().extractRotation(controller.controller.matrixWorld)
      
//       raycaster.ray.origin.setFromMatrixPosition(controller.controller.matrixWorld)
//       raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)
      
//       // Test intersections with clickable objects
//       const intersects = raycaster.intersectObjects(scene.children, true)
      
//       // Handle intersections - similar to your mouse click logic
//       if (intersects.length > 0 && controller.inputSource.gamepad?.buttons[0].pressed) {
//         // Find clickable object in intersection path
//         for (const intersect of intersects) {
//           let current = intersect.object
//           let depth = 0
          
//           while (current && current !== scene && depth < 10) {
//             if (current.userData.clickable === true && 
//                 current.userData.type === 'plan' && 
//                 current.userData.hoverable === true) {
//               onFlatClick(current)
//               break
//             }
//             if (!current.parent) break
//             current = current.parent
//             depth++
//           }
//         }
//       }
//     }
//   })
  
//   return null
// }