// Isometric coordinate utilities

export const CELL_WIDTH = 80;
export const CELL_HEIGHT = 40;

/**
 * Check if a point is inside a diamond shape
 * Diamond equation: |x - cx|/halfWidth + |y - cy|/halfHeight <= 1
 */
export function isPointInDiamond(
  pointX: number,
  pointY: number,
  width: number,
  height: number
): boolean {
  const cx = width / 2;
  const cy = height / 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const normalizedX = Math.abs(pointX - cx) / halfWidth;
  const normalizedY = Math.abs(pointY - cy) / halfHeight;

  return normalizedX + normalizedY <= 1;
}

/**
 * Convert screen coordinates to isometric grid position
 */
export function screenToIso(
  screenX: number,
  screenY: number,
  offsetX: number = 0,
  offsetY: number = 0
): { x: number; y: number } {
  // Adjust for offset
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;

  // Inverse isometric transformation
  const isoX = (adjustedX / (CELL_WIDTH / 2) + adjustedY / (CELL_HEIGHT / 2)) / 2;
  const isoY = (adjustedY / (CELL_HEIGHT / 2) - adjustedX / (CELL_WIDTH / 2)) / 2;

  return { x: Math.floor(isoX), y: Math.floor(isoY) };
}

/**
 * Convert isometric grid position to screen coordinates
 */
export function isoToScreen(
  isoX: number,
  isoY: number
): { x: number; y: number } {
  const screenX = (isoX - isoY) * (CELL_WIDTH / 2);
  const screenY = (isoX + isoY) * (CELL_HEIGHT / 2);
  return { x: screenX, y: screenY };
}

/**
 * Get the cell at a given screen position within the farm grid
 */
export function getCellAtScreenPosition(
  screenX: number,
  screenY: number,
  gridSize: number,
  containerOffsetX: number = 0,
  containerOffsetY: number = 0
): { x: number; y: number } | null {
  const iso = screenToIso(screenX, screenY, containerOffsetX, containerOffsetY);

  // Check if within grid bounds
  if (iso.x >= 0 && iso.x < gridSize && iso.y >= 0 && iso.y < gridSize) {
    return iso;
  }

  return null;
}

/**
 * Calculate the bounding box of a cell for click detection
 */
export function getCellBounds(
  cellX: number,
  cellY: number
): { left: number; top: number; width: number; height: number } {
  const screen = isoToScreen(cellX, cellY);
  return {
    left: screen.x,
    top: screen.y,
    width: CELL_WIDTH,
    height: CELL_HEIGHT * 2, // Include space for crop
  };
}
