import { SimulationManager } from './helpers/SimulationManager.js';
import { StatisticsManager } from './helpers/StatisticsManager.js';
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

// Initialize road lines
initRoadLines(canvas.height);

// Define constants
const SPEED = 1;
const NUM_OBSTACLES = 10;
const POPULATION_SIZE = 100;
const PARENT_COUNT = 10;
const MUTATION_RATE = 0.2;

const simManager = new SimulationManager(canvas, new ObstacleManager(canvas, NUM_OBSTACLES, SPEED), 
  POPULATION_SIZE, PARENT_COUNT, SPEED, MUTATION_RATE);

// Initialize statistics manager
const statsManager = new StatisticsManager(simManager);

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
