/**
 * Appearance switches that change how the app *looks* rather than what it does.
 *
 * Flip these to false and every screen falls back to the plain card treatment —
 * no other edits needed, nothing else reads these values.
 */

/**
 * Event cards render artwork behind their content:
 *   - Local        a blurred, darkened crop of the Ticketmaster promo image
 *   - Connections  generated artwork keyed to the activity and city
 *
 * Set to false for flat cards everywhere.
 */
export const EVENT_CARD_BACKDROPS = true;

/** How hard the scrim over backdrop artwork is; higher hides more of it. */
export const BACKDROP_SCRIM_OPACITY = 0.72;

/** Blur strength for remote event photos, 0-100. */
export const BACKDROP_BLUR_INTENSITY = 38;
