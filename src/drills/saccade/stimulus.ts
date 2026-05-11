import { PX_PER_DEG_CSS } from '../../lib/constants'
import type { SloanLetter } from './config'

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): void {
  ctx.fillStyle = 'rgb(245,245,245)'
  ctx.fillRect(0, 0, canvasW, canvasH)
}

export function drawFixationCross(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  dpr: number,
): void {
  clearCanvas(ctx, canvasW, canvasH)
  const cx = canvasW / 2
  const cy = canvasH / 2
  const arm = 10 * dpr
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
 * Renders the Sloan letter triplet at the specified eccentricity.
 * Letters are drawn in a monospace font sized to letterSizeDeg.
 */
export function drawTriplet(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  eccentricityDeg: number,
  side: 'left' | 'right',
  flankerA: SloanLetter,
  target: SloanLetter,
  flankerB: SloanLetter,
  spacingDeg: number,
  letterSizeDeg: number,
  dpr: number,
): void {
  clearCanvas(ctx, canvasW, canvasH)

  const pxPerDeg = PX_PER_DEG_CSS * dpr
  const letterPx = Math.max(16 * dpr, Math.round(letterSizeDeg * pxPerDeg))
  const spacingPx = Math.round(spacingDeg * pxPerDeg)
  const eccentPx = Math.round(eccentricityDeg * pxPerDeg)

  const cx = canvasW / 2 + (side === 'right' ? eccentPx : -eccentPx)
  const cy = canvasH / 2

  ctx.font = `bold ${letterPx}px "Courier New", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#1e293b'

  ctx.fillText(flankerA, cx - spacingPx, cy)
  ctx.fillText(target, cx, cy)
  ctx.fillText(flankerB, cx + spacingPx, cy)
}

export function drawMask(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  eccentricityDeg: number,
  side: 'left' | 'right',
  dpr: number,
): void {
  const pxPerDeg = PX_PER_DEG_CSS * dpr
  const eccentPx = Math.round(eccentricityDeg * pxPerDeg)
  const cx = canvasW / 2 + (side === 'right' ? eccentPx : -eccentPx)
  const cy = canvasH / 2

  ctx.font = `bold ${22 * dpr}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#64748b'
  ctx.fillText('###', cx, cy)
}
