export class SimulationState {
    constructor() {
        this.isRunning = false;
        this.isConfigured = false;
        this.obstacleCount = 8;
        this.carCount = 50;
        this.mutationRate = 0.2;
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

    configure(obstacleCount, carCount, mutationRate) {
        this.obstacleCount = obstacleCount;
        this.carCount = carCount;
        this.mutationRate = mutationRate;
        this.isConfigured = true;
    }
} 