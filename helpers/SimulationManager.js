import { Car } from "../classes/Car.js";
import { NeuralNetwork } from "../classes/NeuralNetwork.js";

export class SimulationManager {
    constructor(canvas, obstacleManager, populationSize, eliteCount, speed, mutationRate) {
        this.canvas = canvas;
        this.obstacleManager = obstacleManager;
        this.populationSize = populationSize;
        this.eliteCount = eliteCount;
        this.speed = speed;
        this.mutationRate = mutationRate;

        this.generation = 1; // keep track of generations
        this.CAR_WIDTH = 30;
        this.CAR_HEIGHT = 50;

        this.cars = [];
        this.deadCars = [];
        this.distanceTraveled = 0; // Total distance traveled this generation
        this.isEvolving = false; // Flag for generation transition delay
        // Track generation statistics
        this.generationStats = []; // Array of {generation, bestFitness, distanceTraveled}

        this.spawnInitialPopulation();
    }

    spawnInitialPopulation() {
        for (let i = 0; i < this.populationSize; i++) {
            // Randomly position each car within the middle 50% of the canvas width
            const middle50PercentStart = this.canvas.width * 0.25; // 25% from left edge
            const middle50PercentEnd = this.canvas.width * 0.75;   // 75% from left edge
            const randomX = middle50PercentStart + Math.random() * (middle50PercentEnd - middle50PercentStart);
            
            this.cars.push(new Car(
                this.canvas.width/2,
                this.CAR_WIDTH,
                this.CAR_HEIGHT,
                this.canvas.width,
                this.speed,
                this.generation
            ));
        }
    }

    update() {
        // Skip updates during evolution or delay
        if (this.isEvolving) return;

        // update obstacles
        this.obstacleManager.updateAll(this.getAliveCars());

        // Update living cars and track max fitness
        for (const car of this.cars) {
            if (car.alive) {
                car.update(this.obstacleManager.getObstacles());
            }
        }

        // Increment overall distance if at least one car is alive
        if (this.cars.some(car => car.alive)) {
            this.distanceTraveled += this.speed;
        }

        // Check if all cars are dead
        const allDead = this.cars.every(car => !car.alive);
        if (allDead && !this.isEvolving) {
            this.isEvolving = true;
            
            setTimeout(() => {
                this.evolveNextGeneration();
                this.isEvolving = false;
            }, 1000);
        }
    }

    draw(ctx) {
        // Draw obstacles first (so they appear behind cars)
        this.obstacleManager.drawAll(ctx);
        
        // Draw all alive cars
        for (const car of this.cars) {
            if (car.alive) {
                car.draw(ctx);
            }
        }

        // Draw stats overlay
        this.drawStats(ctx);

        // Draw generation transition message if in delay
        if (this.isEvolving) {
            ctx.save();
            
            // Semi-transparent background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Text style
            ctx.fillStyle = "white";
            ctx.font = "24px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Draw message
            const message = `Generation ${this.generation} Complete`;
            const subMessage = `Best Distance: ${Math.floor(this.distanceTraveled)}`;
            ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);
            ctx.fillText(subMessage, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            ctx.restore();
        }
    }

    drawStats(ctx) {
        ctx.save();
        
        // Set up text style
        ctx.fillStyle = "white";
        ctx.font = "16px monospace";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        
        // Draw generation number (top-left)
        ctx.textAlign = "left";
        ctx.fillText(`Generation: ${this.generation}`, 10, 30);
        
        // Draw current distance traveled
        ctx.fillText(`Distance: ${Math.floor(this.distanceTraveled)}`, 10, 55);
        
        // Draw alive cars count
        const aliveCount = this.cars.filter(car => car.alive).length;
        ctx.fillText(`Cars Alive: ${aliveCount}/${this.populationSize}`, 10, 80);
        
        ctx.restore();
    }

    evolveNextGeneration() {
        this.cars.sort((a, b) => b.fitness - a.fitness); // sort by fitness
        const elites = this.cars.slice(0, this.eliteCount); // get best cars

        // Print the best car's neural network
        console.log(`\n=== Best Car from Generation ${this.generation} ===`);
        elites[0].brain.printNetwork();

        // Track generation statistics before resetting
        const averageDistance = this.cars.reduce((sum, car) => sum + car.fitness, 0) / this.cars.length;
        this.generationStats.push({
            generation: this.generation,
            averageDistance: Math.floor(averageDistance)
        });

        const newCars = [];
        const nextGen = this.generation + 1;

        // Step 1: Carry over elites without mutation
        for (const elite of elites) {
            const clone = elite.clone();
            clone.generation = nextGen;
            newCars.push(clone);
        }

        // Step 2: Add mutations of elite cars to fill remaining population
        while (newCars.length < this.populationSize) {
            const parent = elites[Math.floor(Math.random() * elites.length)];
            const clone = parent.clone();
            clone.brain.mutate(this.mutationRate);
            clone.generation = nextGen;
            newCars.push(clone);
            
            if (newCars.length < this.populationSize) {
                // Add a completely random car for diversity
                const middle50PercentStart = this.canvas.width * 0.25;
                const middle50PercentEnd = this.canvas.width * 0.75;
                const randomX = middle50PercentStart + Math.random() * (middle50PercentEnd - middle50PercentStart);

                const randomCar = new Car(
                    randomX,  // Use random position instead of center
                    this.CAR_WIDTH,
                    this.CAR_HEIGHT, 
                    this.canvas.width,
                    this.speed,
                    nextGen
                );
                newCars.push(randomCar);
            }
        }
        console.log(`Mutation rate: ${this.mutationRate}`);

        // Reset for new generation
        this.cars = newCars;
        this.deadCars = [];
        this.distanceTraveled = 0;
        this.generation++;

        // Reset obstacles to prevent spawn killing
        this.obstacleManager.reset();
    }

    getAliveCars() {
        return this.cars.filter(car => car.alive);
    }

    getAllCars() {
        return this.cars;
    }

    /**
     * Returns the generation statistics for graphing
     * @returns {Array} Array of generation data objects
     */
    getGenerationStats() {
        return this.generationStats;
    }
}
