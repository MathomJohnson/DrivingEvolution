import { Car } from "../classes/Car.js";

export class SimulationManager {
    constructor(canvas, obstacleManager, populationSize = 70, eliteCount = 10) {
        this.canvas = canvas;
        this.obstacleManager = obstacleManager;
        this.populationSize = populationSize;
        this.eliteCount = eliteCount;
        this.generation = 1;
        this.cars = [];
        this.deadCars = [];
        this.maxFitness = 0;  // Track best fitness in current generation

        // Debug flag
        this.isEvolving = false;
        this.evolutionDelay = false;  // Flag for generation transition delay

        this.spawnInitialPopulation();
    }

    spawnInitialPopulation() {
        this.cars = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.cars.push(new Car(
                this.canvas.width / 2,  // x
                30,                     // width
                60,                     // height
                this.canvas.width,      // canvasWidth
                1                       // speed
            ));
        }
        this.deadCars = [];
        this.maxFitness = 0;
        console.log("hi");
        console.log("Initial brain: ", this.cars[0].brain.weights_ih, this.cars[0].brain.bias_h, this.cars[0].brain.weights_ho, this.cars[0].brain.bias_o);
    }

    update() {
        // Skip updates during evolution or delay
        if (this.isEvolving || this.evolutionDelay) return;


        // update obstacles
        this.obstacleManager.updateAll(this.getAliveCars());
        this.obstacleManager.drawAll(this.canvas.getContext("2d")); // simplify later, ctx should be passed in

        // Update living cars and track max fitness
        this.maxFitness = 0;
        for (const car of this.cars) {
            if (car.alive) {
                // update ray values
                car.update(this.obstacleManager.getObstacles());
                this.maxFitness = Math.max(this.maxFitness, car.fitness);
            }
        }

        // Check if all cars are dead
        const allDead = this.cars.every(car => !car.alive);
        if (allDead && !this.isEvolving && !this.evolutionDelay) {
            this.evolutionDelay = true;
            
            setTimeout(() => {
                this.isEvolving = true;
                this.evolutionDelay = false;
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
        if (this.evolutionDelay) {
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
            const subMessage = `Best Distance: ${Math.floor(this.maxFitness)}`;
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
        
        // Draw current max fitness
        ctx.fillText(`Distance: ${Math.floor(this.maxFitness)}`, 10, 55);
        
        // Draw alive cars count
        const aliveCount = this.cars.filter(car => car.alive).length;
        ctx.fillText(`Cars Alive: ${aliveCount}/${this.populationSize}`, 10, 80);
        
        ctx.restore();
    }

    evolveNextGeneration() {
        this.cars.sort((a, b) => b.fitness - a.fitness);
        const elites = this.cars.slice(0, this.eliteCount);
        const newCars = [];

        // Add unmutated elites
        for (const elite of elites) {
            const clonedCar = elite.clone();
            console.log("New elite car alive status:", clonedCar.alive);
            newCars.push(clonedCar);
        }

        // Add mutated children of elites
        const childrenPerElite = Math.floor((this.populationSize - this.eliteCount) / this.eliteCount);
        console.log("1");
        for (const elite of elites) {
            console.log("2");
            for (let i = 0; i < childrenPerElite; i++) {
                console.log("About to clone elite");
                const child = elite.clone();
                child.brain.mutate(0.1); // 10% mutation rate
                newCars.push(child);
            }
        }

        // Fill any remaining slots with new random cars
        while (newCars.length < this.populationSize) {
            console.log("3");
            newCars.push(new Car(
                this.canvas.width / 2,
                30,
                60,
                this.canvas.width,
                1
            ));
        }

        // Reset for new generation
        this.cars = newCars;
        this.deadCars = [];
        this.maxFitness = 0;
        this.generation++;

        console.log("New brain: ", this.cars[0].brain.weights_ih, this.cars[0].brain.bias_h, this.cars[0].brain.weights_ho, this.cars[0].brain.bias_o);
        
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
