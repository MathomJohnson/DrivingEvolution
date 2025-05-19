// import { Car } from "./classes/Car.js";
import { SimulationManager } from './helpers/SimulationManager.js';
import {
    initRoadLines,
    updateRoadLines,
    drawRoadLines,
  } from './helpers/roadLines.js';
import { ObstacleManager } from './helpers/ObstacleManager.js';
// import { CarManager } from './helpers/CarManager.js';

// Get canvas and context
const canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 800;
const ctx = canvas.getContext("2d");

// Initialize road lines
initRoadLines(canvas.height);

// Defines the speed of cars, road lines, and obstacles
const SPEED = 1;

// Initialize managers
// const carManager = new CarManager(canvas, 10, SPEED);
const obstacleManager = new ObstacleManager(canvas, 4, SPEED);
const simManager = new SimulationManager(canvas, obstacleManager);

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateRoadLines(SPEED, canvas.height);
    drawRoadLines(ctx, canvas.width);

    obstacleManager.updateAll(simManager.getAliveCars());
    obstacleManager.drawAll(ctx);
  
    // carManager.updateAll(obstacleManager.getObstacles());
    // carManager.drawAll(ctx);
    simManager.update();
    simManager.draw(ctx);
  
    requestAnimationFrame(animate);
}

animate();
