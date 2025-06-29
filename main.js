import { SimulationManager } from './helpers/SimulationManager.js';
import { StatisticsManager } from './helpers/StatisticsManager.js';
import { SimulationState } from './helpers/SimulationState.js';
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
const PARENT_COUNT = 10;

// Simulation state management
const simState = new SimulationState();
let simManager = null;
let statsManager = null;

// DOM elements
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const configModal = document.getElementById('configModal');
const obstacleCountInput = document.getElementById('obstacleCount');
const carCountInput = document.getElementById('carCount');
const mutationRateInput = document.getElementById('mutationRate');
const mutationRateValue = document.getElementById('mutationRateValue');
const startSimulationBtn = document.getElementById('startSimulationBtn');

// Event listeners
startPauseBtn.addEventListener('click', toggleSimulation);
resetBtn.addEventListener('click', resetSimulation);
startSimulationBtn.addEventListener('click', startSimulation);
mutationRateInput.addEventListener('input', updateMutationRateDisplay);

// Initialize simulation
function initializeSimulation() {
    if (simState.isFirstLoad || !simState.isConfigured) {
        showConfigModal();
    } else {
        createSimulation();
    }
}

function showConfigModal() {
    configModal.style.display = 'block';
    startPauseBtn.disabled = true;
    resetBtn.disabled = true;
}

function startSimulation() {
    const obstacleCount = parseInt(obstacleCountInput.value);
    const carCount = parseInt(carCountInput.value);
    const mutationRate = parseFloat(mutationRateInput.value);
    
    if (obstacleCount < 1 || carCount < 10) {
        alert('Please enter valid values: Obstacles >= 1, Cars >= 10');
        return;
    }
    
    simState.configure(obstacleCount, carCount, mutationRate);
    configModal.style.display = 'none';
    createSimulation();
    startPauseBtn.disabled = false;
    resetBtn.disabled = false;
}

function createSimulation() {
    const obstacleManager = new ObstacleManager(canvas, simState.obstacleCount, SPEED);
    simManager = new SimulationManager(canvas, obstacleManager, simState.carCount, PARENT_COUNT, SPEED, simState.mutationRate);
    statsManager = new StatisticsManager(simManager);
}

function toggleSimulation() {
    if (simState.isRunning) {
        simState.pause();
        startPauseBtn.textContent = 'Start';
    } else {
        simState.start();
        startPauseBtn.textContent = 'Pause';
    }
}

function resetSimulation() {
    simState.reset();
    simManager = null;
    statsManager = null;
    showConfigModal();
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateRoadLines(SPEED, canvas.height);
    drawRoadLines(ctx, canvas.width);

    if (simState.isRunning && simManager) {
        simManager.update();
    }
    
    if (simManager) {
        simManager.draw(ctx);
    }

    requestAnimationFrame(animate);
}

// Start the application
initializeSimulation();
animate();

// Update mutation rate display
function updateMutationRateDisplay() {
    mutationRateValue.textContent = parseFloat(mutationRateInput.value).toFixed(2);
}
