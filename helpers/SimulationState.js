export class SimulationState {
    constructor() {
        this.isRunning = false;
        this.isConfigured = false;
        this.obstacleCount = 8;
        this.carCount = 50;
        this.parentCount = 10;
        this.mutationRate = 0.2;
        this.mutationMagnitude = 0.15;
        this.isFirstLoad = true;
    }

    start() {
        this.isRunning = true;
    }

    pause() {
        this.isRunning = false;
    }

    reset() {
        this.isRunning = false;
        this.isConfigured = false;
        this.isFirstLoad = false;
    }

    configure(obstacleCount, carCount, parentCount, mutationRate, mutationMagnitude) {
        this.obstacleCount = obstacleCount;
        this.carCount = carCount;
        this.parentCount = parentCount;
        this.mutationRate = mutationRate;
        this.mutationMagnitude = mutationMagnitude;
        this.isConfigured = true;
    }
} 