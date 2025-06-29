import { SimulationManager } from './helpers/SimulationManager.js';
import { StatisticsManager } from './helpers/StatisticsManager.js';
import { initRoadLines, updateRoadLines, drawRoadLines } from './helpers/roadLines.js';
import { ObstacleManager } from './helpers/ObstacleManager.js';

// Get canvas and context
const canvas = document.getElementById('canvas');
canvas.width = 600;
canvas.height = 800;
const ctx = canvas.getContext('2d');

// Initialize road lines once
initRoadLines(canvas.height);

// Constants
const SPEED = 1;
const PARENT_COUNT = 10;
const MUTATION_RATE = 0.2;

let simManager = null;
let statsManager = null;
let running = false;
let animationId = null;

function initSimulation(obstacleCount, carCount) {
  const obstacleManager = new ObstacleManager(canvas, obstacleCount, SPEED);
  simManager = new SimulationManager(
    canvas,
    obstacleManager,
    carCount,
    PARENT_COUNT,
    SPEED,
    MUTATION_RATE
  );

  if (statsManager) {
    statsManager.setSimulationManager(simManager);
  } else {
    statsManager = new StatisticsManager(simManager);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateRoadLines(SPEED, canvas.height);
  drawRoadLines(ctx, canvas.width);

  simManager.update();
  simManager.draw(ctx);

  if (running) {
    animationId = requestAnimationFrame(animate);
  }
}

function startLoop() {
  if (!running) {
    running = true;
    document.getElementById('toggleSim').textContent = 'Pause';
    animationId = requestAnimationFrame(animate);
  }
}

function pauseLoop() {
  if (running) {
    running = false;
    document.getElementById('toggleSim').textContent = 'Start';
    cancelAnimationFrame(animationId);
  }
}

// UI wiring
document.getElementById('toggleSim').addEventListener('click', () => {
  if (running) {
    pauseLoop();
  } else {
    startLoop();
  }
});

document.getElementById('resetSim').addEventListener('click', () => {
  pauseLoop();
  document.getElementById('configModal').style.display = 'block';
});

document.getElementById('startSim').addEventListener('click', () => {
  const obstacleCount = parseInt(document.getElementById('obstacleCount').value, 10);
  const carCount = parseInt(document.getElementById('carCount').value, 10);

  if (simManager) {
    simManager.reset(carCount, obstacleCount);
    statsManager.setSimulationManager(simManager);
  } else {
    initSimulation(obstacleCount, carCount);
  }

  document.getElementById('configModal').style.display = 'none';
  startLoop();
});

// Show configuration modal on first load
document.getElementById('configModal').style.display = 'block';
