"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GARMENT, HAIR_MATERIALS, SKIN_MATERIALS, SOURCES, meshName, type Outfit, type Part, type Source } from "@/lib/style/avatar"

const PARTS: Part[] = ["head", "body", "legs", "feet"]
type Loaded = { scenes: Map<Source, THREE.Object3D>; mixers: THREE.AnimationMixer[] }

// Every material is cloned per mesh on load, with its original colour kept, so recolouring one piece never
// leaks into another file's piece that happened to share a material name.
function meshesOf(o: THREE.Object3D | undefined) {
  const out: THREE.Mesh[] = []
  o?.traverse((c) => { if ((c as THREE.Mesh).isMesh) out.push(c as THREE.Mesh) })
  return out
}
function paint(mesh: THREE.Mesh, names: string[], hex?: string) {
  const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[]
  let first = true
  for (const m of mats) {
    if (!names.includes(m.name)) continue
    if (!hex) m.color.copy(m.userData.base as THREE.Color)
    else {
      m.color.set(hex)
      if (!first) m.color.offsetHSL(0, 0, 0.08) // second tone of a two-tone garment, a shade lighter
      first = false
    }
  }
}

export function StyleAvatar({ outfit, className = "" }: { outfit: Outfit; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const loaded = useRef<Loaded | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, 2.2))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(2, 4, 3)
    scene.add(key)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2.15 // spin around, don't flip over

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(size)
    ro.observe(el)
    size()

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    let raf = 0, dead = false
    Promise.all(SOURCES.map((s) => loader.loadAsync(`/style/avatar/${s}.glb`).then((g) => [s, g] as const)))
      .then((all) => {
        if (dead) return
        const scenes = new Map<Source, THREE.Object3D>()
        const mixers: THREE.AnimationMixer[] = []
        for (const [s, g] of all) {
          for (const m of meshesOf(g.scene)) {
            m.frustumCulled = false // skinned meshes move outside their bind-pose bounds
            const mats = (Array.isArray(m.material) ? m.material : [m.material]).map((x) => {
              const c = (x as THREE.MeshStandardMaterial).clone()
              c.userData.base = c.color.clone()
              return c
            })
            m.material = Array.isArray(m.material) ? mats : mats[0]
          }
          // the blazer torso doubles as every jacket, so drop its tie: colour it like the shirt under it
          // (three.js splits multi-material meshes, so the tie and shirt are sibling meshes)
          const torso = meshesOf(g.scene.getObjectByName(meshName(s, "body"))).map((m) => m.material as THREE.MeshStandardMaterial)
          const shirt = torso.find((x) => x.name === "White"), tie = torso.find((x) => x.name === "Tie")
          if (shirt && tie) { tie.color.copy(shirt.color); tie.userData.base = shirt.color.clone() }
          const mixer = new THREE.AnimationMixer(g.scene)
          const idle = g.animations.find((a) => a.name.endsWith("Idle"))
          if (idle) mixer.clipAction(idle).play()
          mixers.push(mixer)
          scenes.set(s, g.scene)
          scene.add(g.scene)
        }
        // frame the whole body from the first file
        const b = new THREE.Box3().setFromObject(all[0][1].scene)
        const c = b.getCenter(new THREE.Vector3()), h = b.max.y - b.min.y
        controls.target.copy(c)
        camera.position.set(c.x, c.y + h * 0.05, c.z + h * 2.2)
        controls.minDistance = h * 1.2
        controls.maxDistance = h * 3.5
        loaded.current = { scenes, mixers }
        setReady(true)
      })
      .catch(() => !dead && setFailed(true))

    let last = performance.now()
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const tick = () => {
      const now = performance.now(), dt = (now - last) / 1000
      last = now
      if (!still) loaded.current?.mixers.forEach((m) => m.update(dt)) // same dt for all = parts stay in sync
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      loaded.current = null
    }
  }, [])

  // dress the avatar: show one source per part, then colour garments, hair and skin
  useEffect(() => {
    const l = loaded.current
    if (!l) return
    for (const [s, root] of l.scenes) {
      for (const p of PARTS) {
        const node = root.getObjectByName(meshName(s, p))
        if (!node) continue
        node.visible = outfit[p] === s
        if (!node.visible) continue
        for (const m of meshesOf(node)) {
          if (p === "head") paint(m, HAIR_MATERIALS, outfit.colors.hair)
          else paint(m, GARMENT[p][s] ?? [], outfit.colors[p])
          paint(m, SKIN_MATERIALS, outfit.colors.skin)
        }
      }
    }
  }, [outfit, ready])

  return (
    <div ref={box} className={`relative touch-none ${className}`} role="img" aria-label="3D model wearing your picked look. Drag to turn it around.">
      {!ready && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
          {failed ? "The 3D model couldn't load. Try refreshing the page." : "Loading the 3D model…"}
        </p>
      )}
    </div>
  )
}
