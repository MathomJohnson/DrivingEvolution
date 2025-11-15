import { SimulationManager } from './helpers/SimulationManager.js';
import { StatisticsManager } from './helpers/StatisticsManager.js';
import { SimulationState } from './helpers/SimulationState.js';
import {
    initRoadLines,
    updateRoadLines,
    drawRoadLines,
} from './helpers/roadLines.js';
import { ObstacleManager } from './helpers/ObstacleManager.js';
import { NetworkVisualizer } from './helpers/NetworkVisualizer.js';

// Get canvas and context
const canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 800;
const ctx = canvas.getContext("2d");

// Initialize road lines
initRoadLines(canvas.height);

// Initialize Neural Network Visualizer
const visualizerCanvas = document.getElementById('nn-visualizer');
const networkVisualizer = new NetworkVisualizer(visualizerCanvas);
let visualizerEnabled = true;
let selectedCarMode = 'best'; // 'best', 'worst', 'random'

// Define constants
const SPEED = 1;

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
const parentCountInput = document.getElementById('parentCount');
const mutationRateInput = document.getElementById('mutationRate');
const mutationMagnitudeInput = document.getElementById('mutationMagnitude');
const obstacleCountValue = document.getElementById('obstacleCountValue');
const carCountValue = document.getElementById('carCountValue');
const parentCountValue = document.getElementById('parentCountValue');
const mutationRateValue = document.getElementById('mutationRateValue');
const mutationMagnitudeValue = document.getElementById('mutationMagnitudeValue');
const startSimulationBtn = document.getElementById('startSimulationBtn');
const infoButton = document.getElementById('infoButton');
const infoModal = document.getElementById('infoModal');
const closeInfoModal = document.getElementById('closeInfoModal');

// Visualizer DOM elements
const visualizerContainer = document.getElementById('visualizer-container');
const toggleVisualizerBtn = document.getElementById('toggleVisualizer');
const carSelector = document.getElementById('carSelector');
const showWeightsCheckbox = document.getElementById('showWeights');
const showValuesCheckbox = document.getElementById('showValues');

// Event listeners
startPauseBtn.addEventListener('click', toggleSimulation);
resetBtn.addEventListener('click', resetSimulation);
startSimulationBtn.addEventListener('click', startSimulation);
obstacleCountInput.addEventListener('input', updateObstacleCountDisplay);
carCountInput.addEventListener('input', updateCarCountDisplay);
parentCountInput.addEventListener('input', updateParentCountDisplay);
mutationRateInput.addEventListener('input', updateMutationRateDisplay);
mutationMagnitudeInput.addEventListener('input', updateMutationMagnitudeDisplay);
infoButton.addEventListener('click', showInfoModal);
closeInfoModal.addEventListener('click', hideInfoModal);

// Visualizer event listeners
toggleVisualizerBtn.addEventListener('click', toggleVisualizer);
carSelector.addEventListener('change', (e) => {
    selectedCarMode = e.target.value;
});
showWeightsCheckbox.addEventListener('change', (e) => {
    networkVisualizer.updateConfig({ showWeights: e.target.checked });
});
showValuesCheckbox.addEventListener('change', (e) => {
    networkVisualizer.updateConfig({ showValues: e.target.checked });
});

// Initialize simulation
function initializeSimulation() {
    if (simState.isFirstLoad || !simState.isConfigured) {
        showConfigModal();
    } else {
        createSimulation();
    }
}

function showConfigModal() {
    configModal.classList.add('show');
    startPauseBtn.disabled = true;
    resetBtn.disabled = true;
}

function startSimulation() {
    const obstacleCount = parseInt(obstacleCountInput.value);
    const carCount = parseInt(carCountInput.value);
    let parentCount = parseInt(parentCountInput.value);
    const mutationRate = parseFloat(mutationRateInput.value);
    const mutationMagnitude = parseFloat(mutationMagnitudeInput.value);
    
    // Ensure parent count doesn't exceed car count
    if (parentCount > carCount) {
        parentCount = carCount;
        parentCountInput.value = carCount;
        parentCountValue.textContent = carCount;
    }
    
    simState.configure(obstacleCount, carCount, parentCount, mutationRate, mutationMagnitude);
    configModal.classList.remove('show');
    createSimulation();
    startPauseBtn.disabled = false;
    resetBtn.disabled = false;
}

function createSimulation() {
    const obstacleManager = new ObstacleManager(canvas, simState.obstacleCount, SPEED);
    simManager = new SimulationManager(canvas, obstacleManager, simState.carCount, simState.parentCount, SPEED, simState.mutationRate, simState.mutationMagnitude);
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
    startPauseBtn.textContent = 'Start';
    showConfigModal();
}

// Visualizer functions
function toggleVisualizer() {
    visualizerEnabled = !visualizerEnabled;
    if (visualizerEnabled) {
        visualizerContainer.classList.remove('hidden');
        toggleVisualizerBtn.textContent = 'Hide';
    } else {
        visualizerContainer.classList.add('hidden');
        toggleVisualizerBtn.textContent = 'Show';
    }
}

function getSelectedCar() {
    if (!simManager || !simManager.cars || simManager.cars.length === 0) {
        return null;
    }

    const cars = simManager.cars;

    switch (selectedCarMode) {
        case 'best':
            // Find car with highest fitness (distance traveled)
            return cars.reduce((best, car) =>
                car.fitness > best.fitness ? car : best
            );

        case 'worst':
            // Find car with lowest fitness among alive cars, or any car if all dead
            const aliveCars = cars.filter(car => car.alive);
            const carsToCheck = aliveCars.length > 0 ? aliveCars : cars;
            return carsToCheck.reduce((worst, car) =>
                car.fitness < worst.fitness ? car : worst
            );

        case 'random':
            // Pick a random alive car, or any random car if all dead
            const aliveRandomCars = cars.filter(car => car.alive);
            const randomPool = aliveRandomCars.length > 0 ? aliveRandomCars : cars;
            return randomPool[Math.floor(Math.random() * randomPool.length)];

        default:
            return cars[0];
    }
}

function updateVisualizer() {
    const selectedCar = getSelectedCar();
    if (!selectedCar || !selectedCar.brain) {
        return;
    }

    const inputLabels = ['Ray L2', 'Ray L1', 'Ray C', 'Ray R1', 'Ray R2'];
    const outputLabels = ['Steering'];

    networkVisualizer.draw(selectedCar.brain, inputLabels, outputLabels);
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only update road lines if simulation is running
    if (simState.isRunning) {
        updateRoadLines(SPEED, canvas.height);
    }
    drawRoadLines(ctx, canvas.width);

    if (simState.isRunning && simManager) {
        simManager.update();
    }

    // Always draw the simulation (cars and obstacles) even when paused
    if (simManager) {
        simManager.draw(ctx);
    }

    // Update neural network visualizer
    if (visualizerEnabled && simManager) {
        updateVisualizer();
    }

    requestAnimationFrame(animate);
}

// Update mutation rate display
function updateMutationRateDisplay() {
    mutationRateValue.textContent = parseFloat(mutationRateInput.value).toFixed(2);
}

// Update obstacle count display
function updateObstacleCountDisplay() {
    obstacleCountValue.textContent = obstacleCountInput.value;
}

// Update parent count display
function updateParentCountDisplay() {
    parentCountValue.textContent = parentCountInput.value;
}

// Update car count display and adjust parent count max
function updateCarCountDisplay() {
    carCountValue.textContent = carCountInput.value;
    
    // Update parent count max to be capped at car count
    const carCount = parseInt(carCountInput.value);
    parentCountInput.max = carCount;
    
    // If current parent count exceeds new car count, adjust it
    if (parseInt(parentCountInput.value) > carCount) {
        parentCountInput.value = carCount;
        parentCountValue.textContent = carCount;
    }
}

// Update mutation magnitude display
function updateMutationMagnitudeDisplay() {
    mutationMagnitudeValue.textContent = parseFloat(mutationMagnitudeInput.value).toFixed(2);
}

function showInfoModal() {
    infoModal.classList.add('show');
}

function hideInfoModal() {
    infoModal.classList.remove('show');
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === infoModal) {
        hideInfoModal();
    }
});

// Start the application
initializeSimulation();
animate();