import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'

import { GLYPHS, sampleGlyph } from './glyphs'

const GLYPH_POINTS = 2400
const STAR_POINTS = 1300
const GLYPH_SPREAD = 8.4
const HOLD_MS = 2600
const MORPH_MS = 1500

const glyphVertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixel;
  uniform vec3 uFromColor;
  uniform vec3 uToColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float stagger = aSeed * 0.34;
    float d = clamp((uProgress - stagger) / 0.66, 0.0, 1.0);
    d = d * d * (3.0 - 2.0 * d);

    vec3 pos = mix(aFrom, aTo, d);
    float burst = sin(d * 3.14159265);
    pos += aScatter * burst;

    float wobble = sin(uTime * 0.9 + aSeed * 12.566);
    pos.z += wobble * 0.2;
    pos.x += sin(uTime * 0.35 + aSeed * 6.283) * 0.04;

    vColor = mix(uFromColor, uToColor, d);
    vAlpha = 0.6 + 0.4 * (0.5 + 0.5 * wobble);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPixel * (1.0 + burst * 0.7) * (58.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const starVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aScale;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixel;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.08 + aSeed * 6.283) * 0.7;
    pos.x += cos(uTime * 0.06 + aSeed * 6.283) * 0.7;

    float pulse = 0.5 + 0.5 * sin(uTime * (0.5 + aSeed * 2.0) + aSeed * 25.0);
    vColor = aColor;
    vAlpha = 0.25 + 0.75 * pulse * pulse;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPixel * aScale * (46.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const dotFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uSoftness;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, uSoftness, r);
    gl_FragColor = vec4(vColor, pow(core, 1.8) * vAlpha * uOpacity);
  }
`

function cssColor(name: string, fallback: string): Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return new Color(raw || fallback)
}

function scatterFor(seed: number): [number, number, number] {
  const a = seed * Math.PI * 2
  const r = 0.5 + seed * 0.75
  return [Math.cos(a) * r, Math.sin(a * 1.7) * r, (seed - 0.5) * 2.4]
}

export interface HeroScene {
  dispose: () => void
}

export function createHeroScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
): HeroScene {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(dpr)

  const scene = new Scene()
  const camera = new PerspectiveCamera(46, 1, 0.1, 120)
  camera.position.set(0, 0, 15)

  const world = new Group()
  scene.add(world)

  // ---- glyph cloud -------------------------------------------------------
  const clouds = GLYPHS.map((glyph) => {
    const flat = sampleGlyph(glyph, GLYPH_POINTS)
    const arr = new Float32Array(GLYPH_POINTS * 3)
    for (let i = 0; i < GLYPH_POINTS; i++) {
      const [x, y] = flat[i]
      arr[i * 3] = x * GLYPH_SPREAD
      arr[i * 3 + 1] = y * GLYPH_SPREAD
      arr[i * 3 + 2] = Math.sin(x * 7.0) * Math.cos(y * 7.0) * 0.55
    }
    return arr
  })

  const seeds = new Float32Array(GLYPH_POINTS)
  const scatter = new Float32Array(GLYPH_POINTS * 3)
  for (let i = 0; i < GLYPH_POINTS; i++) {
    const s = (i * 0.61803398875) % 1
    seeds[i] = s
    const [sx, sy, sz] = scatterFor(s)
    scatter[i * 3] = sx
    scatter[i * 3 + 1] = sy
    scatter[i * 3 + 2] = sz
  }

  const glyphGeo = new BufferGeometry()
  const fromAttr = new BufferAttribute(clouds[0].slice(), 3)
  const toAttr = new BufferAttribute(clouds[1].slice(), 3)
  glyphGeo.setAttribute('position', fromAttr)
  glyphGeo.setAttribute('aFrom', fromAttr)
  glyphGeo.setAttribute('aTo', toAttr)
  glyphGeo.setAttribute('aScatter', new BufferAttribute(scatter, 3))
  glyphGeo.setAttribute('aSeed', new BufferAttribute(seeds, 1))

  const glyphMat = new ShaderMaterial({
    vertexShader: glyphVertex,
    fragmentShader: dotFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixel: { value: dpr },
      uOpacity: { value: 1 },
      uSoftness: { value: 0.2 },
      uFromColor: { value: new Color('#24b1b1') },
      uToColor: { value: new Color('#24b1b1') },
    },
  })

  const glyphPoints = new Points(glyphGeo, glyphMat)
  glyphPoints.frustumCulled = false
  world.add(glyphPoints)

  // ---- starfield ---------------------------------------------------------
  const starPos = new Float32Array(STAR_POINTS * 3)
  const starColor = new Float32Array(STAR_POINTS * 3)
  const starScale = new Float32Array(STAR_POINTS)
  const starSeed = new Float32Array(STAR_POINTS)
  const accentShare = new Uint8Array(STAR_POINTS)

  for (let i = 0; i < STAR_POINTS; i++) {
    const radius = 10 + Math.random() * 26
    const angle = Math.random() * Math.PI * 2
    starPos[i * 3] = Math.cos(angle) * radius * 0.9
    starPos[i * 3 + 1] = Math.sin(angle) * radius * 0.62
    starPos[i * 3 + 2] = -34 + Math.random() * 40
    starScale[i] = 0.5 + Math.random() * Math.random() * 3.4
    starSeed[i] = Math.random()
    accentShare[i] = Math.random() < 0.3 ? 1 : 0
  }

  const starGeo = new BufferGeometry()
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3))
  const starColorAttr = new BufferAttribute(starColor, 3)
  starGeo.setAttribute('aColor', starColorAttr)
  starGeo.setAttribute('aScale', new BufferAttribute(starScale, 1))
  starGeo.setAttribute('aSeed', new BufferAttribute(starSeed, 1))

  const starMat = new ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: dotFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPixel: { value: dpr },
      uOpacity: { value: 1 },
      uSoftness: { value: 0.0 },
    },
  })

  const starPoints = new Points(starGeo, starMat)
  starPoints.frustumCulled = false
  world.add(starPoints)

  // ---- theme -------------------------------------------------------------
  const glyphColors = GLYPHS.map(() => new Color())
  let light = false
  let narrow = false

  function applyOpacity() {
    glyphMat.uniforms.uOpacity.value = (light ? 0.92 : 1) * (narrow ? 0.7 : 1)
    starMat.uniforms.uOpacity.value = light ? 0.55 : 0.85
  }

  function readTheme() {
    const isLight = document.documentElement.classList.contains('light')

    GLYPHS.forEach((glyph, i) => {
      glyphColors[i].copy(cssColor(glyph.colorVar, '#24b1b1'))
    })

    const accent = cssColor('--accent', '#24b1b1')
    const neutral = isLight
      ? cssColor('--muted-foreground', '#5b647a')
      : cssColor('--foreground', '#e8edf7')

    for (let i = 0; i < STAR_POINTS; i++) {
      const c = accentShare[i] ? accent : neutral
      starColor[i * 3] = c.r
      starColor[i * 3 + 1] = c.g
      starColor[i * 3 + 2] = c.b
    }
    starColorAttr.needsUpdate = true

    const blending = isLight ? NormalBlending : AdditiveBlending
    glyphMat.blending = blending
    starMat.blending = blending
    light = isLight
    applyOpacity()
    glyphMat.uniforms.uFromColor.value.copy(glyphColors[fromIndex])
    glyphMat.uniforms.uToColor.value.copy(glyphColors[toIndex])
    if (reduced) repaint()
  }

  // ---- morph timeline ----------------------------------------------------
  let fromIndex = 0
  let toIndex = 1
  let phaseStart = 0
  let morphing = false

  function advance(now: number) {
    if (morphing) {
      const t = (now - phaseStart) / MORPH_MS
      if (t >= 1) {
        morphing = false
        phaseStart = now
        glyphMat.uniforms.uProgress.value = 0
        fromIndex = toIndex
        toIndex = (toIndex + 1) % GLYPHS.length
        fromAttr.array.set(clouds[fromIndex])
        fromAttr.needsUpdate = true
        toAttr.array.set(clouds[toIndex])
        toAttr.needsUpdate = true
        glyphMat.uniforms.uFromColor.value.copy(glyphColors[fromIndex])
        glyphMat.uniforms.uToColor.value.copy(glyphColors[toIndex])
      } else {
        glyphMat.uniforms.uProgress.value = t
      }
      return
    }
    if (now - phaseStart >= HOLD_MS) {
      morphing = true
      phaseStart = now
    }
  }

  // ---- interaction -------------------------------------------------------
  let pointerX = 0
  let pointerY = 0
  let targetX = 0
  let targetY = 0

  function onPointerMove(event: PointerEvent) {
    const rect = container.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    targetX = Math.max(-1.5, Math.min(1.5, x))
    targetY = Math.max(-1.5, Math.min(1.5, y))
  }

  // ---- sizing ------------------------------------------------------------
  function resize() {
    const { clientWidth, clientHeight } = container
    if (!clientWidth || !clientHeight) return
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    narrow = clientWidth < 768
    camera.position.z = narrow ? 20 : 15
    glyphPoints.position.x = narrow ? 0 : 4.2
    glyphPoints.position.y = narrow ? -6.6 : 0.3
    glyphPoints.scale.setScalar(narrow ? 0.62 : 1)
    glyphPoints.rotation.y = Math.atan2(
      -glyphPoints.position.x,
      camera.position.z,
    )
    applyOpacity()
    camera.updateProjectionMatrix()
    if (reduced) repaint()
  }

  // ---- loop --------------------------------------------------------------
  let frame = 0
  let visible = true
  const start = performance.now()
  phaseStart = start

  function render(now: number) {
    const elapsed = (now - start) / 1000
    glyphMat.uniforms.uTime.value = elapsed
    starMat.uniforms.uTime.value = elapsed

    pointerX += (targetX - pointerX) * 0.045
    pointerY += (targetY - pointerY) * 0.045
    world.rotation.y = pointerX * 0.22 + Math.sin(elapsed * 0.12) * 0.05
    world.rotation.x = -pointerY * 0.16 + Math.sin(elapsed * 0.1) * 0.03
    starPoints.rotation.z = elapsed * 0.008

    advance(now)
    renderer.render(scene, camera)
  }

  function repaint() {
    renderer.render(scene, camera)
  }

  function loop(now: number) {
    frame = requestAnimationFrame(loop)
    if (!visible) return
    render(now)
  }

  const themeObserver = new MutationObserver(readTheme)
  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && !document.hidden
    },
    { threshold: 0 },
  )

  function onVisibility() {
    visible = !document.hidden
  }

  readTheme()
  resize()

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  resizeObserver.observe(container)

  if (reduced) {
    render(start)
  } else {
    intersectionObserver.observe(container)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    frame = requestAnimationFrame(loop)
  }

  return {
    dispose() {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      glyphGeo.dispose()
      starGeo.dispose()
      glyphMat.dispose()
      starMat.dispose()
      renderer.dispose()
    },
  }
}
