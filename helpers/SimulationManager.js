import { Car } from "../classes/Car.js";

export class SimulationManager {
    constructor(canvas, obstacleManager, populationSize = 50, eliteCount = 5) {
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
                40,                     // width
                70,                     // height
                this.canvas.width,      // canvasWidth
                1                       // speed
            ));
        }
        this.deadCars = [];
        this.maxFitness = 0;
        console.log(`Spawned initial population of ${this.populationSize} cars`);
    }

    update() {
        // Skip updates during evolution or delay
        if (this.isEvolving || this.evolutionDelay) return;

        // Update living cars and track max fitness
        this.maxFitness = 0;
        for (const car of this.cars) {
            if (car.alive) {
                car.update(this.obstacleManager.getObstacles());
                this.maxFitness = Math.max(this.maxFitness, car.fitness);
                if (!car.alive) {
                    console.log(`Car died with fitness: ${car.fitness}`);
                    this.deadCars.push(car);
                }
            }
        }

        // Check if all cars are dead
        const allDead = this.cars.every(car => !car.alive);
        if (allDead && !this.isEvolving && !this.evolutionDelay) {
            this.evolutionDelay = true;
            console.log(`All cars dead in generation ${this.generation}, waiting 1 second...`);
            
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
        // Sort by fitness and get elites
        this.deadCars.sort((a, b) => b.fitness - a.fitness);
        console.log(`Top 3 fitness scores:`, 
            this.deadCars.slice(0, 3).map(car => car.fitness));

        const elites = this.deadCars.slice(0, this.eliteCount);
        const newCars = [];

        // Add unmutated elites
        for (const elite of elites) {
            newCars.push(elite.clone());
        }

        // Add mutated children of elites
        const childrenPerElite = Math.floor((this.populationSize - this.eliteCount) / this.eliteCount);
        for (const elite of elites) {
            for (let i = 0; i < childrenPerElite; i++) {
                const child = elite.clone();
                child.brain.mutate(0.35); // 35% mutation rate
                newCars.push(child);
            }
        }

        // Fill any remaining slots with new random cars
        while (newCars.length < this.populationSize) {
            newCars.push(new Car(
                this.canvas.width / 2,
                40,
                70,
                this.canvas.width,
                1
            ));
        }

        // Reset for new generation
        this.cars = newCars;
        this.deadCars = [];
        this.maxFitness = 0;
        this.generation++;
        
        // Reset obstacles to prevent spawn killing
        this.obstacleManager.reset();
        
        console.log(`Starting generation ${this.generation} with ${this.cars.length} cars`);
    }

    getAliveCars() {
        return this.cars.filter(car => car.alive);
    }

    getAllCars() {
        return this.cars;
    }
}
