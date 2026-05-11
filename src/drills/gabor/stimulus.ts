import { PX_PER_DEG_CSS } from '../../lib/constants'
import type { SpatialFreq } from './config'

/**
 * Renders a Gabor patch using putImageData (bypasses ctx transforms).
 * cxPhys/cyPhys are physical pixel coordinates (already DPR-scaled).
 *
 * G(dx,dy) = 128 × (1 + contrast × exp(−r²/2σ²) × cos(2πf·xr + φ))
 * where xr = −dx·sin(θ) + dy·cos(θ) projects onto the grating axis.
 */
export function drawGabor(
  ctx: CanvasRenderingContext2D,
  cxPhys: number,
  cyPhys: number,
  spatialFreqCpd: SpatialFreq,
  orientationRad: number,
  contrast: number,
  phase: number,
  dpr: number,
): void {
  const cyclesPerPxPhys = spatialFreqCpd / (PX_PER_DEG_CSS * dpr)
  const periodPhys = 1 / cyclesPerPxPhys
  const sigma = periodPhys
  const halfSize = Math.ceil(3 * sigma)
  const size = halfSize * 2 + 1

  const imageData = ctx.createImageData(size, size)
  const sinO = Math.sin(orientationRad)
  const cosO = Math.cos(orientationRad)
  const twoSigmaSq = 2 * sigma * sigma
  const twoPiF = 2 * Math.PI * cyclesPerPxPhys

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - halfSize
      const dy = py - halfSize
      const r2 = (dx * dx + dy * dy) / twoSigmaSq
      const xr = -dx * sinO + dy * cosO
      const val = 128 * (1 + contrast * Math.exp(-r2) * Math.cos(twoPiF * xr + phase))
      const v = Math.max(0, Math.min(255, Math.round(val)))
      const idx = (py * size + px) * 4
      imageData.data[idx] = v
      imageData.data[idx + 1] = v
      imageData.data[idx + 2] = v
      imageData.data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, Math.round(cxPhys) - halfSize, Math.round(cyPhys) - halfSize)
}

/** Fills the canvas with mid-gray (128,128,128) and draws a fixation cross. */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  dpr: number,
): void {
  ctx.fillStyle = 'rgb(128,128,128)'
  ctx.fillRect(0, 0, canvasW, canvasH)

  const cx = canvasW / 2
  const cy = canvasH / 2
  const arm = 8 * dpr
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2 * dpr
  ctx.beginPath()
  ctx.moveTo(cx - arm, cy)
  ctx.lineTo(cx + arm, cy)
  ctx.moveTo(cx, cy - arm)
  ctx.lineTo(cx, cy + arm)
  ctx.stroke()
}

/**
 * Draws target + collinear flanker pair.
 * Flankers are placed along the bar axis (collinear per Polat et al.).
 */
export function drawGaborScene(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  spatialFreqCpd: SpatialFreq,
  orientationRad: number,
  targetContrast: number,
  flankerContrast: number,
  separationLambda: number,
  targetPresent: boolean,
  dpr: number,
): void {
  drawBackground(ctx, canvasW, canvasH, dpr)

  const cxPhys = Math.round(canvasW / 2)
  const cyPhys = Math.round(canvasH / 2)
  const lambdaPx = (PX_PER_DEG_CSS * dpr) / spatialFreqCpd
  const sepPhys = separationLambda * lambdaPx

  const cosO = Math.cos(orientationRad)
  const sinO = Math.sin(orientationRad)
  const phase = Math.random() * 2 * Math.PI

  drawGabor(
    ctx,
    cxPhys + Math.round(cosO * sepPhys),
    cyPhys + Math.round(sinO * sepPhys),
    spatialFreqCpd,
    orientationRad,
    flankerContrast,
    phase,
    dpr,
  )
  drawGabor(
    ctx,
    cxPhys - Math.round(cosO * sepPhys),
    cyPhys - Math.round(sinO * sepPhys),
    spatialFreqCpd,
    orientationRad,
    flankerContrast,
    phase,
    dpr,
  )

  if (targetPresent) {
    drawGabor(ctx, cxPhys, cyPhys, spatialFreqCpd, orientationRad, targetContrast, phase, dpr)
  }
}
