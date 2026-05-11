/** Assumed viewing distance per SKILL.md baseline spec (cm) */
export const VIEWING_DISTANCE_CM = 40

/** Reference CSS pixel density (standard web DPI) */
const CSS_DPI = 96

/** CSS pixels per centimetre at reference density */
const PX_PER_CM_CSS = CSS_DPI / 2.54

/**
 * CSS pixels per degree of visual angle at the assumed viewing distance.
 * ppd = viewing_distance_cm × (dpi/2.54) × tan(1°)
 * ≈ 26.4 CSS px/° at 40 cm, 96 dpi.
 */
export const PX_PER_DEG_CSS = VIEWING_DISTANCE_CM * PX_PER_CM_CSS * Math.tan(Math.PI / 180)

/** Protocol version this code implements — must match SKILL.md frontmatter */
export const PROTOCOL_VERSION = '0.1.0'

/** Minimum gap between sessions in milliseconds (SKILL.md safety stop) */
export const MIN_SESSION_GAP_MS = 30 * 60 * 1000
