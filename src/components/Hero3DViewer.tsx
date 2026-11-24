import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Layers, RotateCw, Box, Sparkles } from 'lucide-react'

type HeroModelId = 'dock' | 'hex' | 'coupler'
type SlicerMode = 'solid' | 'wireframe'

interface FilamentPreset {
  id: string
  name: string
  hex: string
  swatchClass: string
}

const HERO_FILAMENTS: FilamentPreset[] = [
  { id: 'cyan', name: 'Electric Cyan', hex: '#06b6d4', swatchClass: 'bg-cyan-500' },
  { id: 'iron', name: 'Iron Grey', hex: '#52525b', swatchClass: 'bg-zinc-600' },
  { id: 'fuchsia', name: 'Signature Fuchsia', hex: '#db2777', swatchClass: 'bg-pink-600' },
  { id: 'yellow', name: 'Workshop Yellow', hex: '#eab308', swatchClass: 'bg-yellow-500' },
  { id: 'obsidian', name: 'Matte Obsidian', hex: '#27272a', swatchClass: 'bg-zinc-800' },
]

const HERO_MODELS: { id: HeroModelId; label: string; spec: string }[] = [
  { id: 'dock', label: 'Dual Dock', spec: '±0.15mm Detent' },
  { id: 'hex', label: 'Hex Grid', spec: 'Modular Snap' },
  { id: 'coupler', label: 'Stepped Coupler', spec: 'Airtight Taper' },
]

function buildModelGeometry(modelId: HeroModelId, material: THREE.Material, edgeMaterial: THREE.LineBasicMaterial): THREE.Group {
  const group = new THREE.Group()

  const addMesh = (geo: THREE.BufferGeometry, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.castShadow = true
    mesh.receiveShadow = true

    const edges = new THREE.EdgesGeometry(geo, 28)
    const line = new THREE.LineSegments(edges, edgeMaterial)
    mesh.add(line)

    group.add(mesh)
    return mesh
  }

  if (modelId === 'dock') {
    // Precision Backplate
    const backplateGeo = new THREE.BoxGeometry(3.2, 1.35, 0.24)
    addMesh(backplateGeo, [0, 0.72, -0.55])

    // Top & Bottom Chamfered Reinforcing Ribs
    const ribGeo = new THREE.BoxGeometry(3.2, 0.14, 0.36)
    addMesh(ribGeo, [0, 1.32, -0.49])
    addMesh(ribGeo, [0, 0.12, -0.49])

    // Countersunk Screw Bosses
    const bossGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 24)
    addMesh(bossGeo, [-1.25, 0.72, -0.53], [Math.PI / 2, 0, 0])
    addMesh(bossGeo, [1.25, 0.72, -0.53], [Math.PI / 2, 0, 0])

    // Twin Quick-Release Cylindrical Docking Collars
    const collarGeo = new THREE.CylinderGeometry(0.46, 0.5, 0.62, 32, 1, false)
    const innerRingGeo = new THREE.TorusGeometry(0.38, 0.06, 12, 32)
    const armGeo = new THREE.BoxGeometry(0.55, 0.42, 0.75)

    // Left Collar Assembly
    addMesh(armGeo, [-0.72, 0.68, -0.15])
    addMesh(collarGeo, [-0.72, 0.68, 0.35], [Math.PI / 2, 0, 0])
    addMesh(innerRingGeo, [-0.72, 0.68, 0.66])

    // Right Collar Assembly
    addMesh(armGeo, [0.72, 0.68, -0.15])
    addMesh(collarGeo, [0.72, 0.68, 0.35], [Math.PI / 2, 0, 0])
    addMesh(innerRingGeo, [0.72, 0.68, 0.66])
  } else if (modelId === 'hex') {
    // Interlocking 3-cell Honeycomb Modular Tray Cluster
    const hexPositions: [number, number][] = [
      [0, 0],
      [-1.12, 0.65],
      [1.12, 0.65],
      [0, 1.3],
    ]
    hexPositions.forEach(([x, z], idx) => {
      const outerGeo = new THREE.CylinderGeometry(0.66, 0.62, 0.56 + (idx === 0 ? 0.14 : 0), 6)
      addMesh(outerGeo, [x, 0.32 + (idx === 0 ? 0.07 : 0), z - 0.65])
      const rimGeo = new THREE.CylinderGeometry(0.69, 0.69, 0.08, 6)
      addMesh(rimGeo, [x, 0.58 + (idx === 0 ? 0.14 : 0), z - 0.65])
    })
  } else {
    // Stepped Universal Shop-Vac Coupler
    const tiers: [number, number, number, number][] = [
      [0.88, 0.92, 0.55, 0.28],
      [0.74, 0.78, 0.52, 0.80],
      [0.60, 0.64, 0.50, 1.30],
      [0.48, 0.50, 0.45, 1.76],
    ]
    tiers.forEach(([rTop, rBot, h, y]) => {
      const tierGeo = new THREE.CylinderGeometry(rTop, rBot, h, 36)
      addMesh(tierGeo, [0, y, 0])
      const collarRing = new THREE.TorusGeometry(rBot + 0.02, 0.035, 10, 36)
      addMesh(collarRing, [0, y - h / 2 + 0.04, 0], [Math.PI / 2, 0, 0])
    })
  }

  // Center the group nicely above the build plate
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.position.x = -center.x
  group.position.z = -center.z
  group.position.y = -box.min.y + 0.04

  return group
}

export function Hero3DViewer({ onQuickCustomize }: { onQuickCustomize?: () => void }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [activeModel, setActiveModel] = useState<HeroModelId>('dock')
  const [activeFilament, setActiveFilament] = useState<FilamentPreset>(HERO_FILAMENTS[0])
  const [slicerMode, setSlicerMode] = useState<SlicerMode>('solid')
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  // Refs for live updates without tearing down WebGL context
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const edgeMaterialRef = useRef<THREE.LineBasicMaterial | null>(null)
  const modelGroupRef = useRef<THREE.Group | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const scanPlaneRef = useRef<THREE.Mesh | null>(null)
  const autoRotateRef = useRef(isAutoRotate)
  const slicerModeRef = useRef(slicerMode)

  useEffect(() => {
    autoRotateRef.current = isAutoRotate
  }, [isAutoRotate])

  useEffect(() => {
    slicerModeRef.current = slicerMode
    if (materialRef.current && edgeMaterialRef.current) {
      if (slicerMode === 'wireframe') {
        materialRef.current.wireframe = true
        materialRef.current.opacity = 0.45
        materialRef.current.transparent = true
        edgeMaterialRef.current.opacity = 0.85
      } else {
        materialRef.current.wireframe = false
        materialRef.current.opacity = 1
        materialRef.current.transparent = false
        edgeMaterialRef.current.opacity = 0.22
      }
      materialRef.current.needsUpdate = true
    }
    if (scanPlaneRef.current) {
      scanPlaneRef.current.visible = slicerMode === 'wireframe'
    }
  }, [slicerMode])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(activeFilament.hex)
      materialRef.current.emissive.set(slicerMode === 'wireframe' ? activeFilament.hex : '#000000')
      materialRef.current.emissiveIntensity = slicerMode === 'wireframe' ? 0.25 : 0
    }
    if (edgeMaterialRef.current) {
      edgeMaterialRef.current.color.set(slicerMode === 'wireframe' ? '#22d3ee' : '#ffffff')
    }
  }, [activeFilament, slicerMode])

  // Rebuild geometry when switching 3D part
  useEffect(() => {
    if (!sceneRef.current || !materialRef.current || !edgeMaterialRef.current) return
    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current)
      modelGroupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose()
        }
      })
    }
    const nextGroup = buildModelGeometry(activeModel, materialRef.current, edgeMaterialRef.current)
    modelGroupRef.current = nextGroup
    sceneRef.current.add(nextGroup)
  }, [activeModel])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const width = container.clientWidth || 500
    const height = container.clientHeight || 400

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(3.8, 2.9, 4.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enableZoom = true
    controls.minDistance = 2.6
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controls.target.set(0, 0.85, 0)

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
    keyLight.position.set(5, 8, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.1)
    rimLight.position.set(-5, 4, -4)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight(0xa855f7, 0.8, 12)
    fillLight.position.set(3, 1.5, -3)
    scene.add(fillLight)

    // PEI Build Plate & Precision Grid
    const plateGeo = new THREE.BoxGeometry(5.2, 0.06, 5.2)
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.75,
      metalness: 0.25,
    })
    const plate = new THREE.Mesh(plateGeo, plateMat)
    plate.position.y = -0.03
    plate.receiveShadow = true
    scene.add(plate)

    const grid = new THREE.GridHelper(5.0, 20, 0x06b6d4, 0x27272a)
    grid.position.y = 0.005
    scene.add(grid)

    // Outer Cyan Calibration Border
    const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.22, 0.07, 5.22))
    const borderMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.35 })
    const border = new THREE.LineSegments(borderGeo, borderMat)
    border.position.y = -0.03
    scene.add(border)

    // Slicer Z-Layer Scan Plane
    const scanGeo = new THREE.PlaneGeometry(4.4, 4.4)
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const scanPlane = new THREE.Mesh(scanGeo, scanMat)
    scanPlane.rotation.x = Math.PI / 2
    scanPlane.position.y = 0.8
    scanPlane.visible = slicerModeRef.current === 'wireframe'
    scanPlaneRef.current = scanPlane
    scene.add(scanPlane)

    // Filament Material
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(HERO_FILAMENTS[0].hex),
      roughness: 0.36,
      metalness: 0.08,
      clearcoat: 0.18,
      clearcoatRoughness: 0.35,
    })
    materialRef.current = material

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
    })
    edgeMaterialRef.current = edgeMaterial

    // Initial 3D Part
    const initialGroup = buildModelGeometry('dock', material, edgeMaterial)
    modelGroupRef.current = initialGroup
    scene.add(initialGroup)

    // Animation Loop
    let frameId = 0
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      if (autoRotateRef.current && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.0045
      }
      if (scanPlaneRef.current && scanPlaneRef.current.visible) {
        scanPlaneRef.current.position.y = 0.9 + Math.sin(elapsed * 2.2) * 0.8
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const h = entry.contentRect.height
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      plateGeo.dispose()
      plateMat.dispose()
      borderGeo.dispose()
      borderMat.dispose()
      scanGeo.dispose()
      scanMat.dispose()
      material.dispose()
      edgeMaterial.dispose()
      if (modelGroupRef.current) {
        modelGroupRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
            obj.geometry.dispose()
          }
        })
      }
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  const currentModelInfo = HERO_MODELS.find((m) => m.id === activeModel)!

  return (
    <div className="relative flex flex-col rounded-2xl border border-zinc-700/80 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Interactive HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800/90 bg-zinc-900/80">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Select 3D preview model">
          {HERO_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={activeModel === m.id}
              onClick={() => setActiveModel(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeModel === m.id
                  ? 'bg-cyan-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wireframe / Solid Slicer Toggle */}
          <button
            type="button"
            onClick={() => setSlicerMode(slicerMode === 'solid' ? 'wireframe' : 'solid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
              slicerMode === 'wireframe'
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Toggle between Solid Print and Slicer Toolpath mode"
          >
            {slicerMode === 'wireframe' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                <span>Slicer View</span>
              </>
            ) : (
              <>
                <Box className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Solid Print</span>
              </>
            )}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            aria-label={isAutoRotate ? 'Pause rotation' : 'Resume rotation'}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isAutoRotate
                ? 'bg-zinc-800 border-zinc-700 text-cyan-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={isAutoRotate ? 'Pause auto-orbit' : 'Resume auto-orbit'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Viewport */}
      <div className="relative h-[300px] sm:h-[360px] w-full cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full" />

        {/* Corner Telemetry Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/85 border border-zinc-700/80 text-[10px] font-mono font-semibold text-cyan-300 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            {currentModelInfo.spec} • 0.18mm Layer
          </span>
        </div>

        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-medium text-zinc-400 backdrop-blur-xs">
            Drag to orbit • Scroll to zoom
          </span>
        </div>
      </div>

      {/* Bottom Live Filament Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-zinc-800/90 bg-zinc-900/90">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Filament:
          </span>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Preview filament color">
            {HERO_FILAMENTS.map((fil) => {
              const isSelected = activeFilament.id === fil.id
              return (
                <button
                  key={fil.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={fil.name}
                  title={fil.name}
                  onClick={() => setActiveFilament(fil)}
                  className={`w-5 h-5 rounded-full ${fil.swatchClass} transition-transform cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                      : 'opacity-75 hover:opacity-100 hover:scale-105'
                  }`}
                />
              )
            })}
          </div>
          <span className="text-xs font-semibold text-zinc-200 hidden sm:inline">
            {activeFilament.name}
          </span>
        </div>

        {onQuickCustomize && (
          <button
            type="button"
            onClick={onQuickCustomize}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Customize This Part →</span>
          </button>
        )}
      </div>
    </div>
  )
}
