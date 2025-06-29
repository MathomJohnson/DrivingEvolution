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
        this.maxFitness = 0;  // Track best fitness in current generation
        this.distanceTraveled = 0; // Total distance traveled this generation
        this.isEvolving = false; // Flag for generation transition delay

        // Memory queue for storing past successful cars
        this.memoryQueue = [];
        this.memoryQueueCapacity = 50;
        this.memoryQueueAddChance = 0.1; // 10% chance to add a dead car to memory
        this.memoryQueueSelectionCount = 20; // Number of cars to select from memory
        this.processedCars = new Set(); // Track which cars have been processed for memory

        // Track generation statistics
        this.generationStats = []; // Array of {generation, bestFitness, distanceTraveled}

        this.spawnInitialPopulation();
    }

    spawnInitialPopulation() {
        for (let i = 0; i < this.populationSize; i++) {
            this.cars.push(new Car(
                this.canvas.width / 2,  // x
                this.CAR_WIDTH,         // width
                this.CAR_HEIGHT,        // height
                this.canvas.width,      // canvasWidth
                this.speed,             // speed
                this.generation         // generation
            ));
        }
    }

    update() {
        // Skip updates during evolution or delay
        if (this.isEvolving) return;

        // update obstacles
        this.obstacleManager.updateAll(this.getAliveCars());
        this.obstacleManager.drawAll(this.canvas.getContext("2d"));

        // Update living cars and track max fitness
        for (const car of this.cars) {
            if (car.alive) {
                car.update(this.obstacleManager.getObstacles());
                this.maxFitness = Math.max(this.maxFitness, car.fitness);
            } else if (!this.processedCars.has(car) && Math.random() < this.memoryQueueAddChance) {
                // Add car to memory queue with 10% chance when it dies
                this.addToMemoryQueue(car);
                this.processedCars.add(car); // Mark as processed to avoid duplicate entries
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

    /**
     * Adds a car to the memory queue, maintaining the queue's capacity
     * @param {Car} car - The car to add to the memory queue
     */
    addToMemoryQueue(car) {
        // Add the car to the queue
        this.memoryQueue.push(car.clone());
        
        // If queue exceeds capacity, remove the oldest car
        if (this.memoryQueue.length > this.memoryQueueCapacity) {
            this.memoryQueue.shift();
        }
    }

    evolveNextGeneration() {
        this.cars.sort((a, b) => b.fitness - a.fitness); // sort by fitness
        const elites = this.cars.slice(0, this.eliteCount); // get best cars

        // Print the best car's neural network
        console.log(`\n=== Best Car from Generation ${this.generation} ===`);
        elites[0].brain.printNetwork();

        // Track generation statistics before resetting
        this.generationStats.push({
            generation: this.generation,
            bestFitness: Math.floor(this.maxFitness),
            distanceTraveled: Math.floor(this.distanceTraveled)
        });

        const newCars = [];
        const nextGen = this.generation + 1;

        // Step 1: Carry over elites without mutation
        for (const elite of elites) {
            const clone = elite.clone();
            clone.generation = nextGen;
            newCars.push(clone);
        }

        // Step 2: Select and mutate cars from memory queue
        if (this.memoryQueue.length > 0) {
            // Randomly select cars from memory queue
            const selectedCount = Math.min(this.memoryQueueSelectionCount, this.memoryQueue.length);
            for (let i = 0; i < selectedCount; i++) {
                // Pick a random car from the memory queue
                const randomIndex = Math.floor(Math.random() * this.memoryQueue.length);
                const selectedCar = this.memoryQueue[randomIndex];
                
                // Create mutated version of selected car
                const clone = selectedCar.clone();
                clone.brain.mutate(this.mutationRate);
                clone.generation = nextGen;
                newCars.push(clone);
            }
        }

        // Step 3: Add mutations of elite cars to fill remaining population
        while (newCars.length < this.populationSize) {
            const parent = elites[Math.floor(Math.random() * elites.length)];
            const clone = parent.clone();
            clone.brain.mutate(this.mutationRate);
            clone.generation = nextGen;
            newCars.push(clone);
        }
        console.log(`Mutation rate: ${this.mutationRate}`);

        // Reset for new generation
        this.cars = newCars;
        this.deadCars = [];
        this.maxFitness = 0;
        this.distanceTraveled = 0;
        this.generation++;
        this.processedCars.clear(); // Clear the set of processed cars for the new generation

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
