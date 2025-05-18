// Define constants at the top (export if needed elsewhere)
export const lineSpacing = 100;
export const dashHeight = 40;
export const dashWidth = 8;

// Initialize roadLines array
export let roadLines = [];

// Initialize road lines (call this once at startup)
export function initRoadLines(canvasHeight) {
  for (let i = 0; i < canvasHeight / lineSpacing + 2; i++) {
    roadLines.push(i * lineSpacing);
  }
}

// Update road lines (call in game loop)
export function updateRoadLines(SPEED, canvasHeight) {
  for (let i = 0; i < roadLines.length; i++) {
    roadLines[i] += SPEED;

    if (roadLines[i] > canvasHeight) {
      const maxY = Math.min(...roadLines);
      roadLines[i] = maxY - lineSpacing;
    }
  }
}

// Draw road lines (call in render loop)
export function drawRoadLines(ctx, canvasWidth) {
  const centerX = canvasWidth / 2;

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = dashWidth;

  for (let y of roadLines) {
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + dashHeight);
    ctx.stroke();
  }
}