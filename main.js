import { SimulationManager } from './helpers/SimulationManager.js';
import {
    initRoadLines,
    updateRoadLines,
    drawRoadLines,
  } from './helpers/roadLines.js';
import { ObstacleManager } from './helpers/ObstacleManager.js';

// Get canvas and context
const canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 800;
const ctx = canvas.getContext("2d");

const statsBtn = document.getElementById('stats-btn');
const statsModal = document.getElementById('stats-modal');
const statsCanvas = document.getElementById('stats-canvas');
const statsCtx = statsCanvas.getContext('2d');
const statsData = [];

function drawStatsGraph() {
    statsCtx.clearRect(0, 0, statsCanvas.width, statsCanvas.height);
    if (statsData.length === 0) return;

    const padding = 30;
    const maxGen = Math.max(...statsData.map(d => d.generation));
    const maxDist = Math.max(...statsData.map(d => d.distance));

    statsCtx.strokeStyle = '#fff';
    statsCtx.beginPath();
    statsCtx.moveTo(padding, padding);
    statsCtx.lineTo(padding, statsCanvas.height - padding);
    statsCtx.lineTo(statsCanvas.width - padding, statsCanvas.height - padding);
    statsCtx.stroke();

    statsCtx.fillStyle = '#fff';
    statsCtx.font = '12px monospace';
    statsCtx.textAlign = 'center';
    statsCtx.fillText('Generation', statsCanvas.width / 2, statsCanvas.height - 10);
    statsCtx.save();
    statsCtx.translate(10, statsCanvas.height / 2);
    statsCtx.rotate(-Math.PI / 2);
    statsCtx.fillText('Distance', 0, 0);
    statsCtx.restore();

    statsCtx.strokeStyle = 'cyan';
    statsCtx.beginPath();
    statsData.forEach((d, i) => {
        const x = padding + ((d.generation - 1) / Math.max(1, maxGen - 1)) * (statsCanvas.width - 2 * padding);
        const y = (statsCanvas.height - padding) - (d.distance / Math.max(1, maxDist)) * (statsCanvas.height - 2 * padding);
        if (i === 0) statsCtx.moveTo(x, y); else statsCtx.lineTo(x, y);
    });
    statsCtx.stroke();
}

function handleGenerationComplete(gen, dist) {
    statsData.push({ generation: gen, distance: dist });
    drawStatsGraph();
}

statsBtn.addEventListener('click', () => {
    const visible = statsModal.style.display === 'flex';
    statsModal.style.display = visible ? 'none' : 'flex';
    if (!visible) drawStatsGraph();
});

statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) statsModal.style.display = 'none';
});

// Initialize road lines
initRoadLines(canvas.height);

// Define constants
const SPEED = 1;
const NUM_OBSTACLES = 10;
const POPULATION_SIZE = 75;
const PARENT_COUNT = 10;
const MUTATION_RATE = 0.2;

const simManager = new SimulationManager(
  canvas,
  new ObstacleManager(canvas, NUM_OBSTACLES, SPEED),
  POPULATION_SIZE,
  PARENT_COUNT,
  SPEED,
  MUTATION_RATE,
  handleGenerationComplete
);

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateRoadLines(SPEED, canvas.height);
    drawRoadLines(ctx, canvas.width);
  
    simManager.update();
    simManager.draw(ctx);
  
    requestAnimationFrame(animate);
}

animate();
