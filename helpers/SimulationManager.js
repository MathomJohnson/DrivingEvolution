import { Car } from "../classes/Car.js";

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
        this.CAR_HEIGHT = 60;

        this.cars = [];
        this.deadCars = [];
        this.maxFitness = 0;  // Track best fitness in current generation
        this.distanceTraveled = 0; // Total distance traveled this generation
        this.isEvolving = false; // Flag for generation transition delay

        this.spawnInitialPopulation();
    }

    spawnInitialPopulation() {
        for (let i = 0; i < this.populationSize; i++) {
            this.cars.push(new Car(
                this.canvas.width / 2,  // x
                this.CAR_WIDTH,         // width           
                this.CAR_HEIGHT,        // height
                this.canvas.width,      // canvasWidth
                this.speed              // speed
            ));
        }
    }

    update() {
        // Skip updates during evolution or delay
        if (this.isEvolving) return;

        // update obstacles
        this.obstacleManager.updateAll(this.getAliveCars());
        this.obstacleManager.drawAll(this.canvas.getContext("2d")); // simplify later, ctx should be passed in

        // Update living cars and track max fitness
        for (const car of this.cars) {
            if (car.alive) {
                car.update(this.obstacleManager.getObstacles());
                this.maxFitness = Math.max(this.maxFitness, car.fitness);
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

    evolveNextGeneration() {
        this.cars.sort((a, b) => b.fitness - a.fitness); // sort by fitness
        const elites = this.cars.slice(0, this.eliteCount); // get best cars
        
        // Print the best car's neural network
        console.log(`\n=== Best Car from Generation ${this.generation} ===`);
        console.log(`Fitness: ${Math.floor(elites[0].fitness)}`);
        console.log(`Distance: ${Math.floor(this.distanceTraveled)}`);
        elites[0].brain.printNetwork();
        
        const newCars = [];

        // Add unmutated elites
        for (const elite of elites) {
            const clonedCar = elite.clone();
            newCars.push(clonedCar);
        }

        // Add mutated children of elites
        const childrenPerElite = Math.floor((this.populationSize - this.eliteCount) / this.eliteCount);
        for (const elite of elites) {
            for (let i = 0; i < childrenPerElite; i++) {
                const child = elite.clone();
                child.brain.mutate(this.mutationRate);
                newCars.push(child);
            }
        }

        // Fill any remaining slots with new random cars
        while (newCars.length < this.populationSize) {
            newCars.push(new Car(
                this.canvas.width / 2,
                this.CAR_WIDTH,
                this.CAR_HEIGHT,
                this.canvas.width,
                this.speed
            ));
        }

        // Reset for new generation
        this.cars = newCars;
        this.deadCars = [];
        this.maxFitness = 0;
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
}
