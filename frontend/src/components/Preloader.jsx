import { useEffect, useRef } from 'react'

export default function Preloader({ onComplete }) {
  const stageRef = useRef(null)
  const canvasRefs = useRef([])
  const scanlineRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    let W = window.innerWidth
    let H = window.innerHeight
    let cx = W / 2
    let cy = H / 2

    const contexts = canvasRefs.current.map((canvas) => canvas?.getContext('2d') ?? null)
    const [g0, g1, g2, g3, g4] = contexts
    let rafId = 0

    const setCanvasSize = () => {
      W = window.innerWidth
      H = window.innerHeight
      cx = W / 2
      cy = H / 2
      canvasRefs.current.forEach((canvas) => {
        if (!canvas) return
        canvas.width = W
        canvas.height = H
      })
    }
    setCanvasSize()

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.013,
      vy: Math.random() * 0.2 + 0.04,
    }))
    const distantStars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 0.7 + 0.1,
      a: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.1 + 0.015,
    }))
    const noisePoints = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      a: Math.random() * 0.25 + 0.06,
    }))
    const energySparks = Array.from({ length: 42 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * 140 + 50,
      sp: Math.random() * 0.04 + 0.01,
      size: Math.random() * 2.5 + 0.7,
      alpha: Math.random() * 0.5 + 0.2,
    }))
    const backgroundOrbs = Array.from({ length: 5 }, (_, i) => ({
      ox: Math.random() * W,
      oy: Math.random() * H,
      r: 170 + i * 28 + Math.random() * 60,
      speed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
      col: i % 2 === 0 ? '0,210,255' : '124,58,237',
      alpha: 0.07 + Math.random() * 0.06,
    }))

    const streams = Array.from({ length: 22 }, (_, i) => ({
      x: 20 + (i * (W - 40)) / 21,
      y: Math.random() * H,
      len: Math.floor(Math.random() * 10 + 4),
      speed: Math.random() * 1.6 + 0.7,
      chars: Array.from({ length: 15 }, () => String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))),
    }))

    const particles = []
    const rings = []
    const orbitTrails = [[], []]
    const ORBIT_TRAIL_MAX = 80

    const SC = 2.4
    const pt = (x, y) => [x * SC + (cx - 128), y * SC + (cy - 102)]
    const getSegs = () => [
      [pt(0, 85), pt(0, 0)],
      [pt(0, 0), pt(24, 46)],
      [pt(24, 46), pt(48, 0)],
      [pt(48, 0), pt(48, 85)],
      [pt(62, 0), pt(107, 0)],
      [pt(84.5, 0), pt(84.5, 85)],
    ]
    const segCols = ['#00d4ff', '#00d4ff', '#7c3aed', '#7c3aed', '#00ffcc', '#00ffcc']

    const spawnP = (x, y, col, n = 7) => {
      for (let i = 0; i < n; i += 1) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * 4 + 0.5
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          col,
          r: Math.random() * 3 + 0.5,
          trail: [],
        })
      }
    }

    const updateP = () => {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.trail.push([p.x, p.y])
        if (p.trail.length > 8) p.trail.shift()
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.09
        p.vx *= 0.93
        p.life -= 0.032
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        if (p.trail.length > 1) {
          g2.beginPath()
          g2.moveTo(p.trail[0][0], p.trail[0][1])
          p.trail.forEach((t) => g2.lineTo(t[0], t[1]))
          g2.strokeStyle = p.col
          g2.lineWidth = 0.7
          g2.globalAlpha = p.life * 0.28
          g2.stroke()
          g2.globalAlpha = 1
        }
        g2.beginPath()
        g2.arc(p.x, p.y, p.r * Math.max(p.life, 0), 0, Math.PI * 2)
        g2.fillStyle = p.col
        g2.globalAlpha = Math.min(p.life, 1)
        g2.fill()
        g2.globalAlpha = 1
      }
    }

    const spawnR = (x, y, col) => {
      rings.push({ x, y, r: 0, col, alpha: 0.85 })
    }
    const updateR = () => {
      for (let i = rings.length - 1; i >= 0; i -= 1) {
        const r = rings[i]
        r.r += 2.8
        r.alpha -= 0.017
        if (r.alpha <= 0) {
          rings.splice(i, 1)
          continue
        }
        g2.beginPath()
        g2.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        g2.strokeStyle = r.col
        g2.lineWidth = 1.1
        g2.globalAlpha = r.alpha * 0.45
        g2.stroke()
        g2.globalAlpha = 1
      }
    }

    const getCircuits = () => [
      { pts: [pt(-10, 42), pt(-34, 42), pt(-34, 10), pt(-58, 10)], col: 'rgba(0,210,255,0.22)' },
      { pts: [pt(58, 42), pt(34, 42), pt(34, 66), pt(16, 66)], col: 'rgba(124,58,237,0.22)' },
      { pts: [pt(117, 0), pt(138, 0), pt(138, -22), pt(162, -22)], col: 'rgba(0,255,204,0.22)' },
      { pts: [pt(84.5, 95), pt(84.5, 110), pt(58, 110)], col: 'rgba(0,255,204,0.18)' },
      { pts: [pt(0, -10), pt(0, -30), pt(-24, -30)], col: 'rgba(0,210,255,0.16)' },
      { pts: [pt(48, -10), pt(48, -32), pt(70, -32), pt(70, -48)], col: 'rgba(124,58,237,0.18)' },
    ]

    const drawGrid = (a) => {
      g0.clearRect(0, 0, W, H)
      const driftX = Math.sin(frame * 0.01) * 10
      const driftY = Math.cos(frame * 0.012) * 10
      g0.strokeStyle = `rgba(0,70,110,${a * 0.3})`
      g0.lineWidth = 0.35
      for (let i = 0; i <= W; i += 40) {
        g0.beginPath()
        g0.moveTo(i + driftX, 0)
        g0.lineTo(i + driftX, H)
        g0.stroke()
      }
      for (let j = 0; j <= H; j += 40) {
        g0.beginPath()
        g0.moveTo(0, j + driftY)
        g0.lineTo(W, j + driftY)
        g0.stroke()
      }
      g0.strokeStyle = `rgba(0,200,255,${a * 0.08})`
      g0.lineWidth = 0.5
      g0.beginPath()
      g0.moveTo(cx, 0)
      g0.lineTo(cx, H)
      g0.stroke()
      g0.beginPath()
      g0.moveTo(0, cy)
      g0.lineTo(W, cy)
      g0.stroke()
      const b = 36
      const t = 10
      const ca = a * 0.5
      ;[
        [b, b],
        [W - b, b],
        [b, H - b],
        [W - b, H - b],
      ].forEach(([bx, by]) => {
        const sx = bx < cx ? 1 : -1
        const sy = by < cy ? 1 : -1
        g0.strokeStyle = `rgba(0,200,255,${ca})`
        g0.lineWidth = 0.9
        g0.beginPath()
        g0.moveTo(bx + sx * t, by)
        g0.lineTo(bx, by)
        g0.lineTo(bx, by + sy * t)
        g0.stroke()
      })
    }

    const drawStars = () => {
      g1.clearRect(0, 0, W, H)
      distantStars.forEach((s) => {
        s.y += s.vy
        if (s.y > H) s.y = -2
        g1.beginPath()
        g1.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        g1.fillStyle = `rgba(100,145,255,${s.a})`
        g1.fill()
      })
      stars.forEach((s) => {
        s.a += s.da
        s.y += s.vy
        if (s.a < 0 || s.a > 1) s.da *= -1
        if (s.y > H) s.y = 0
        g1.beginPath()
        g1.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        g1.fillStyle = `rgba(140,185,255,${s.a * 0.4})`
        g1.fill()
      })
    }

    const drawAtmosphere = () => {
      const bg = g0.createRadialGradient(cx, cy, 50, cx, cy, Math.max(W, H) * 0.72)
      bg.addColorStop(0, 'rgba(0,28,48,0.42)')
      bg.addColorStop(0.5, 'rgba(2,10,22,0.3)')
      bg.addColorStop(1, 'rgba(0,0,0,0.82)')
      g0.fillStyle = bg
      g0.fillRect(0, 0, W, H)

      const bandY = cy + Math.sin(frame * 0.013) * 40
      const band = g0.createLinearGradient(0, bandY - 100, 0, bandY + 100)
      band.addColorStop(0, 'rgba(0,0,0,0)')
      band.addColorStop(0.5, 'rgba(0,190,255,0.06)')
      band.addColorStop(1, 'rgba(0,0,0,0)')
      g0.fillStyle = band
      g0.fillRect(0, bandY - 110, W, 220)

      // Animated nebula-like background blobs for depth.
      backgroundOrbs.forEach((orb, i) => {
        const nx = orb.ox + Math.cos(frame * orb.speed + orb.phase) * (44 + i * 8)
        const ny = orb.oy + Math.sin(frame * orb.speed * 0.8 + orb.phase) * (30 + i * 6)
        const grad = g0.createRadialGradient(nx, ny, 10, nx, ny, orb.r)
        grad.addColorStop(0, `rgba(${orb.col},${orb.alpha})`)
        grad.addColorStop(0.5, `rgba(${orb.col},${orb.alpha * 0.45})`)
        grad.addColorStop(1, `rgba(${orb.col},0)`)
        g0.fillStyle = grad
        g0.beginPath()
        g0.arc(nx, ny, orb.r, 0, Math.PI * 2)
        g0.fill()
      })

      // Rotating wide light sweeps to avoid static background feel.
      const sweepCenterX = cx
      const sweepCenterY = cy
      ;[
        { ang: frame * 0.01, col: 'rgba(0,220,255,0.05)' },
        { ang: -frame * 0.007 + Math.PI * 0.35, col: 'rgba(124,58,237,0.04)' },
      ].forEach((sweep) => {
        g0.save()
        g0.translate(sweepCenterX, sweepCenterY)
        g0.rotate(sweep.ang)
        const lg = g0.createLinearGradient(-W * 0.4, 0, W * 0.4, 0)
        lg.addColorStop(0, 'rgba(0,0,0,0)')
        lg.addColorStop(0.5, sweep.col)
        lg.addColorStop(1, 'rgba(0,0,0,0)')
        g0.fillStyle = lg
        g0.fillRect(-W * 0.45, -H * 0.08, W * 0.9, H * 0.16)
        g0.restore()
      })
    }

    const drawHudFx = (intensity) => {
      const center = pt(53.5, 42)
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07)
      g4.save()
      for (let i = 0; i < 3; i += 1) {
        const rr = 120 + i * 26 + Math.sin(frame * 0.03 + i) * 2.5
        g4.beginPath()
        g4.arc(center[0], center[1], rr, frame * 0.01 + i, frame * 0.01 + i + Math.PI * 1.15)
        g4.strokeStyle = i % 2 === 0 ? 'rgba(0,220,255,0.35)' : 'rgba(124,58,237,0.32)'
        g4.lineWidth = 1.1
        g4.globalAlpha = intensity * (0.55 + pulse * 0.25)
        g4.stroke()
      }
      for (let i = 0; i < noisePoints.length; i += 1) {
        const n = noisePoints[i]
        n.x += Math.sin(frame * 0.004 + i) * 0.04
        n.y += Math.cos(frame * 0.003 + i) * 0.04
        g4.fillStyle = `rgba(150,200,255,${n.a * intensity})`
        g4.fillRect(n.x, n.y, 1, 1)
      }
      g4.restore()
    }

    const drawReactorSweep = (intensity) => {
      const center = pt(53.5, 42)
      const beamA = frame * 0.045
      const beamB = beamA + Math.PI * 0.66
      const drawBeam = (ang, col, alpha) => {
        const grad = g4.createRadialGradient(center[0], center[1], 0, center[0], center[1], 240)
        grad.addColorStop(0, `${col}${Math.floor((alpha * 255)).toString(16).padStart(2, '0')}`)
        grad.addColorStop(0.4, `${col}${Math.floor((alpha * 80)).toString(16).padStart(2, '0')}`)
        grad.addColorStop(1, `${col}00`)
        g4.save()
        g4.translate(center[0], center[1])
        g4.rotate(ang)
        g4.beginPath()
        g4.moveTo(0, 0)
        g4.arc(0, 0, 240, -0.11, 0.11)
        g4.closePath()
        g4.fillStyle = grad
        g4.globalAlpha = intensity
        g4.fill()
        g4.restore()
      }
      drawBeam(beamA, '#00d4ff', 0.35)
      drawBeam(beamB, '#ff4d73', 0.26)
    }

    const drawEnergySparks = (intensity) => {
      const center = pt(53.5, 42)
      energySparks.forEach((s, i) => {
        s.a += s.sp * (i % 2 === 0 ? 1 : -1)
        s.r += Math.sin(frame * 0.03 + i) * 0.25
        const x = center[0] + Math.cos(s.a) * s.r
        const y = center[1] + Math.sin(s.a) * s.r
        g4.beginPath()
        g4.arc(x, y, s.size, 0, Math.PI * 2)
        g4.fillStyle = i % 3 === 0 ? 'rgba(255,77,115,0.9)' : 'rgba(0,212,255,0.9)'
        g4.globalAlpha = s.alpha * intensity
        g4.fill()
      })
      g4.globalAlpha = 1
    }

    const drawStreams = (a) => {
      if (a <= 0) return
      streams.forEach((s) => {
        s.y += s.speed
        if (s.y > H + 200) s.y = -100
        for (let i = 0; i < s.len; i += 1) {
          const fy = s.y - i * 15
          if (fy < 0 || fy > H) continue
          const br = i === 0 ? 1 : (1 - i / s.len) * 0.4
          g1.font = `${i === 0 ? 12 : 10}px 'Courier New'`
          g1.fillStyle = `rgba(0,${175 + Math.floor(br * 80)},${200 + Math.floor(br * 55)},${br * a * 0.5})`
          g1.fillText(s.chars[i % s.chars.length], s.x, fy)
          if (Math.random() < 0.04) s.chars[i % s.chars.length] = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))
        }
      })
    }

    const drawCircuits = (a) => {
      if (a <= 0) return
      getCircuits().forEach((c) => {
        g3.beginPath()
        g3.moveTo(c.pts[0][0], c.pts[0][1])
        c.pts.forEach((p) => g3.lineTo(p[0], p[1]))
        g3.strokeStyle = c.col
        g3.lineWidth = 0.75
        g3.globalAlpha = a
        g3.stroke()
        g3.globalAlpha = 1
        const last = c.pts[c.pts.length - 1]
        g3.beginPath()
        g3.arc(last[0], last[1], 2, 0, Math.PI * 2)
        g3.fillStyle = c.col
        g3.globalAlpha = a
        g3.fill()
        g3.globalAlpha = 1
      })
    }

    const drawNodes = (drawnLen) => {
      let acc = 0
      const segs = getSegs()
      const slens = segs.map((seg) => {
        let l = 0
        for (let i = 1; i < seg.length; i += 1) l += Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1])
        return l
      })
      segs.forEach((seg, i) => {
        if (drawnLen >= acc) {
          g3.beginPath()
          g3.arc(seg[0][0], seg[0][1], 3, 0, Math.PI * 2)
          g3.fillStyle = 'rgba(0,210,255,0.85)'
          g3.fill()
          g3.beginPath()
          g3.arc(seg[0][0], seg[0][1], 6, 0, Math.PI * 2)
          g3.strokeStyle = 'rgba(0,210,255,0.25)'
          g3.lineWidth = 0.75
          g3.stroke()
        }
        acc += slens[i]
      })
    }

    const renderStroke = (path, col, fr) => {
      const fl = 0.92 + 0.08 * Math.sin(fr * 0.65)
      g2.save()
      g2.lineCap = 'round'
      g2.lineJoin = 'round'
      g2.strokeStyle = col
      g2.lineWidth = 30
      g2.globalAlpha = 0.028 * fl
      g2.stroke(path)
      g2.lineWidth = 18
      g2.globalAlpha = 0.065 * fl
      g2.stroke(path)
      g2.lineWidth = 9
      g2.globalAlpha = 0.14 * fl
      g2.stroke(path)
      g2.lineWidth = 4
      g2.globalAlpha = 0.34 * fl
      g2.stroke(path)
      g2.strokeStyle = '#ffffff'
      g2.lineWidth = 1.7
      g2.globalAlpha = 0.95 * fl
      g2.stroke(path)
      g2.restore()
    }

    let orbitT = 0
    let frame = 0
    let phase = 'orbitIntro'
    let drawn = 0
    let finalOrbitT = 0
    let exitA = 1
    let circuitA = 0
    let ringCooldown = 0
    let streamA = 0
    let holdTimer = 0

    const getSegMeta = () => {
      const segs = getSegs()
      const slens = segs.map((arr) => {
        let l = 0
        for (let i = 1; i < arr.length; i += 1) l += Math.hypot(arr[i][0] - arr[i - 1][0], arr[i][1] - arr[i - 1][1])
        return l
      })
      const totLen = slens.reduce((a, b) => a + b, 0)
      return { segs, slens, totLen, fullPaths: segs.map((arr) => {
        const p = new Path2D()
        p.moveTo(arr[0][0], arr[0][1])
        for (let i = 1; i < arr.length; i += 1) p.lineTo(arr[i][0], arr[i][1])
        return p
      }) }
    }

    const getPartialPath = (segs, slens, si, frac) => {
      const a = segs[si]
      const p = new Path2D()
      p.moveTo(a[0][0], a[0][1])
      let rem = frac * slens[si]
      let prev = a[0]
      for (let i = 1; i < a.length; i += 1) {
        const d = Math.hypot(a[i][0] - prev[0], a[i][1] - prev[1])
        if (rem <= 0) break
        if (rem < d) {
          const t = rem / d
          p.lineTo(prev[0] + (a[i][0] - prev[0]) * t, prev[1] + (a[i][1] - prev[1]) * t)
          break
        }
        p.lineTo(a[i][0], a[i][1])
        rem -= d
        prev = a[i]
      }
      return p
    }

    const getTipPt = (segs, slens, si, frac) => {
      const a = segs[si]
      let rem = frac * slens[si]
      let prev = a[0]
      for (let i = 1; i < a.length; i += 1) {
        const d = Math.hypot(a[i][0] - prev[0], a[i][1] - prev[1])
        if (rem <= d) {
          const t = rem / d
          return [prev[0] + (a[i][0] - prev[0]) * t, prev[1] + (a[i][1] - prev[1]) * t]
        }
        rem -= d
        prev = a[i]
      }
      return a[a.length - 1]
    }

    const drawOrbitLines = (t, intro = true) => {
      const center = pt(53.5, 42)
      // Keep orbit outside MT bounds so lines circle around the logo.
      const baseR = intro ? 230 - t * 22 : 196 + 10 * Math.sin(frame * 0.05)
      const rotSpeed = intro ? 0.11 : 0.17
      const gapAngle = Math.PI * 0.92
      const angles = [frame * rotSpeed, frame * rotSpeed + gapAngle]
      g4.clearRect(0, 0, W, H)
      g4.beginPath()
      g4.arc(center[0], center[1], baseR - 10, 0, Math.PI * 2)
      g4.strokeStyle = 'rgba(0,220,255,0.14)'
      g4.lineWidth = 2.2
      g4.setLineDash([6, 8])
      g4.globalAlpha = intro ? 0.7 : 0.45
      g4.stroke()
      g4.setLineDash([])
      g4.globalAlpha = 1
      angles.forEach((ang, idx) => {
        const lineRadius = idx === 0 ? baseR : baseR - 30
        const tipX = center[0] + Math.cos(ang) * lineRadius
        const tipY = center[1] + Math.sin(ang) * lineRadius
        orbitTrails[idx].push([tipX, tipY])
        if (orbitTrails[idx].length > ORBIT_TRAIL_MAX) orbitTrails[idx].shift()
        const col = idx === 0 ? '#00d4ff' : '#7c3aed'
        const trail = orbitTrails[idx]
        if (trail.length > 1) {
          g4.beginPath()
          g4.moveTo(trail[0][0], trail[0][1])
          trail.forEach((p) => g4.lineTo(p[0], p[1]))
          g4.strokeStyle = col
          g4.lineCap = 'round'
          g4.lineJoin = 'round'
          g4.lineWidth = intro ? 4.5 : 3.5
          g4.globalAlpha = intro ? 0.3 : 0.22
          g4.stroke()
          g4.globalAlpha = 1
        }
        const tangent = [-Math.sin(ang), Math.cos(ang)]
        const segLen = intro ? 46 : 38
        const x1 = tipX - tangent[0] * segLen * 0.5
        const y1 = tipY - tangent[1] * segLen * 0.5
        const x2 = tipX + tangent[0] * segLen * 0.5
        const y2 = tipY + tangent[1] * segLen * 0.5
        g4.beginPath()
        g4.moveTo(x1, y1)
        g4.lineTo(x2, y2)
        g4.strokeStyle = col
        g4.lineWidth = intro ? 4.4 : 3.2
        g4.globalAlpha = 0.9
        g4.stroke()
        g4.globalAlpha = 1
        g4.beginPath()
        g4.arc(tipX, tipY, 3.4, 0, Math.PI * 2)
        g4.fillStyle = '#fff'
        g4.fill()
        if (frame % 3 === 0) spawnP(tipX, tipY, col, intro ? 3 : 2)
      })
      if (frame % 16 === 0) spawnR(center[0], center[1], 'rgba(0,220,255,0.45)')
    }

    const loop = () => {
      rafId = requestAnimationFrame(loop)
      frame += 1

      if (stageRef.current) {
        stageRef.current.classList.toggle('preloader-reveal', phase === 'drawing')
      }

      drawStars()
      drawAtmosphere()
      drawGrid(Math.min(frame / 100, 0.85))

      if (phase === 'orbitIntro') {
        orbitT = Math.min(orbitT + 1 / 130, 1)
        g2.clearRect(0, 0, W, H)
        g3.clearRect(0, 0, W, H)
        drawOrbitLines(orbitT, true)
        drawReactorSweep(0.55)
        drawEnergySparks(0.6)
        drawHudFx(0.65)
        updateP()
        updateR()
        if (orbitT >= 1) phase = 'drawing'
      } else if (phase === 'drawing') {
        const { segs, slens, totLen, fullPaths } = getSegMeta()
        const SPEED = totLen / 145
        drawn = Math.min(drawn + SPEED, totLen)
        circuitA = Math.min(circuitA + 0.009, 1)
        g2.clearRect(0, 0, W, H)
        g3.clearRect(0, 0, W, H)
        drawOrbitLines(0.8, false)
        drawReactorSweep(0.74)
        drawEnergySparks(0.78)
        drawHudFx(0.75)
        drawCircuits(circuitA)
        let acc = 0
        for (let i = 0; i < segs.length; i += 1) {
          const se = acc + slens[i]
          const col = segCols[i]
          if (drawn >= se) {
            renderStroke(fullPaths[i], col, frame)
          } else if (drawn > acc) {
            const frac = (drawn - acc) / slens[i]
            renderStroke(getPartialPath(segs, slens, i, frac), col, frame)
            const tip = getTipPt(segs, slens, i, frac)
            if (frame % 2 === 0) spawnP(tip[0], tip[1], col, 5)
            ringCooldown += 1
            if (ringCooldown > 8) {
              spawnR(tip[0], tip[1], col)
              ringCooldown = 0
            }
            const pulse = 0.65 + 0.35 * Math.sin(frame * 0.5)
            g2.save()
            ;[
              [24, 0.04],
              [15, 0.09],
              [8, 0.18],
              [4, 0.5],
            ].forEach(([lr, la]) => {
              g2.beginPath()
              g2.arc(tip[0], tip[1], lr * pulse, 0, Math.PI * 2)
              g2.fillStyle = col
              g2.globalAlpha = la
              g2.fill()
            })
            g2.beginPath()
            g2.arc(tip[0], tip[1], 2.5, 0, Math.PI * 2)
            g2.fillStyle = '#fff'
            g2.globalAlpha = 1
            g2.fill()
            g2.restore()
          }
          acc = se
        }
        updateP()
        updateR()
        drawNodes(drawn)
        if (drawn >= totLen) {
          phase = 'finalOrbit'
          holdTimer = frame
          const lastTip = getTipPt(segs, slens, segs.length - 1, 1)
          spawnP(lastTip[0], lastTip[1], '#00ffcc', 25)
          spawnR(pt(53.5, 42)[0], pt(53.5, 42)[1], 'rgba(0,220,255,0.7)')
        }
      } else if (phase === 'finalOrbit') {
        const { fullPaths, totLen } = getSegMeta()
        g2.clearRect(0, 0, W, H)
        g3.clearRect(0, 0, W, H)
        finalOrbitT = Math.min(finalOrbitT + 1 / 130, 1)
        streamA = Math.min(streamA + 1 / 80, 1)
        drawStreams(streamA)
        drawOrbitLines(0.85, false)
        drawReactorSweep(0.85)
        drawEnergySparks(0.9)
        drawHudFx(0.9)
        drawCircuits(1)
        const breathe = 0.85 + 0.15 * Math.sin(frame * 0.08)
        fullPaths.forEach((path, i) => {
          const col = segCols[i]
          g2.save()
          g2.lineCap = 'round'
          g2.lineJoin = 'round'
          g2.strokeStyle = col
          g2.lineWidth = 28 * breathe
          g2.globalAlpha = 0.04
          g2.stroke(path)
          g2.lineWidth = 16 * breathe
          g2.globalAlpha = 0.1
          g2.stroke(path)
          g2.lineWidth = 6
          g2.globalAlpha = 0.22
          g2.stroke(path)
          g2.strokeStyle = '#fff'
          g2.lineWidth = 1.7
          g2.globalAlpha = 0.9
          g2.stroke(path)
          g2.restore()
        })
        updateP()
        updateR()
        drawNodes(totLen)
        if (frame % 45 === 0) spawnR(pt(53.5, 42)[0], pt(53.5, 42)[1], 'rgba(0,200,255,0.45)')
        if (finalOrbitT >= 1 && frame - holdTimer > 130) phase = 'exit'
      } else if (phase === 'exit') {
        const { fullPaths } = getSegMeta()
        exitA = Math.max(exitA - 0.015, 0)
        g2.clearRect(0, 0, W, H)
        g3.clearRect(0, 0, W, H)
        drawOrbitLines(0.85, false)
        drawReactorSweep(exitA * 0.9)
        drawEnergySparks(exitA * 0.95)
        drawHudFx(exitA * 0.9)
        drawCircuits(exitA)
        drawStreams(exitA * 0.7)
        fullPaths.forEach((path, i) => {
          g2.save()
          g2.lineCap = 'round'
          g2.lineJoin = 'round'
          g2.strokeStyle = segCols[i]
          g2.lineWidth = 14
          g2.globalAlpha = 0.07 * exitA
          g2.stroke(path)
          g2.strokeStyle = '#fff'
          g2.lineWidth = 1.7
          g2.globalAlpha = exitA * 0.88
          g2.stroke(path)
          g2.restore()
        })
        updateP()
        updateR()
        canvasRefs.current.forEach((canvas) => {
          if (canvas) canvas.style.opacity = String(exitA)
        })
        if (scanlineRef.current) scanlineRef.current.style.opacity = String(exitA)
        if (scanlineRef.current) {
          const flick = 0.75 + 0.25 * Math.abs(Math.sin(frame * 0.2))
          scanlineRef.current.style.transform = `translateY(${Math.sin(frame * 0.04) * 1.5}px)`
          scanlineRef.current.style.filter = `blur(${0.6 + Math.abs(Math.sin(frame * 0.12)) * 0.8}px)`
          scanlineRef.current.style.opacity = String(exitA * flick)
        }
        if (exitA <= 0 && !doneRef.current) {
          doneRef.current = true
          if (typeof onComplete === 'function') onComplete()
        }
      }
    }

    const handleResize = () => {
      setCanvasSize()
    }

    window.addEventListener('resize', handleResize)
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [onComplete])

  return (
    <div ref={stageRef} id="stage" className="preloader-stage preloader">
      <div className="preloader-aurora" />
      <div className="preloader-beam preloader-beam-cyan" />
      <div className="preloader-beam preloader-beam-violet" />
      <div className="energy-core" />
      <div className="ring ring-outer" />
      <div className="ring ring-inner" />
      <div className="logo" aria-hidden="true" />
      <div className="preloader-grid-overlay" />
      <div className="preloader-noise" />
      <div className="preloader-chroma-edge" />
      {[0, 1, 2, 3, 4].map((z, i) => (
        <canvas
          key={z}
          id={`c${z}`}
          ref={(el) => {
            canvasRefs.current[i] = el
          }}
          className={`preloader-canvas preloader-canvas-${z}`}
        />
      ))}
      <div ref={scanlineRef} id="scanline" className="preloader-scanline" />
    </div>
  )
}
