import { Ray } from './Ray.js';
import { NeuralNetwork } from './NeuralNetwork.js';

export class Car {
    constructor(x, width, height, canvasWidth, speed, generation = 1) {
        this.x = x;
        this.y = 800 * 0.8;  // Will be set in draw() based on canvas height
        // Width and height of the car
        this.width = width;
        this.height = height;

        this.canvasWidth = canvasWidth;

        // Penalty multiplier applied when the car strays from the road center
        this.centerPenaltyMultiplier = 0.1; // Math.random() * 0.5 + 0.5;
        // Penalty multiplier when the forward ray detects a nearby obstacle
        this.proximityPenaltyMultiplier = 0.8;

        // Horizontal movement speed of the car
        this.speed = speed;
        this.generation = generation;
        // Whether the car has hit an obstacle or not
        this.alive = true;
        // Fitness value used for evolution (includes penalties)
        this.fitness = 0;

        // Initialize rays
        this.numRays = 7;
        this.raySpread = Math.PI / 2; // 90 degrees field of view
        this.rayLength = 250;
        this.rays = [];

        // Create rays with initial angles
        const mid = (this.numRays - 1) / 2;
        for (let i = 0; i < this.numRays; i++) {
            const offset = ((i - mid) / mid) * (this.raySpread / 2);
            this.rays.push(new Ray(this.x, this.y, offset, this.rayLength));
        }

        // Neural network for decision making
        this.brain = new NeuralNetwork();
    }
  
    /**
     * Updates the rays based on the car's current position
     * @param { Obstacle[] } obstacles
     */
    updateRays(obstacles) {
        if (!this.y) return; // Skip if y position not set yet
        
        for (const ray of this.rays) {
            ray.cast(this.x, this.y, obstacles);
        }
    }
      
    /**
     * Called by the animation loop in main.js.
     * Uses the neural network output to move the car left or right.
     * Eliminates the car if it collides with an obstacle.
     * @param { Obstacle[] } obstacles
     * @returns None
     */
    update(obstacles) {
        if (!this.alive) return;

        // Cast rays and compute intersections
        this.updateRays(obstacles);

        // 3. Normalize ray distances and add hit flags for each ray
        const inputs = this.rays.map(ray => {
            if (ray.hitPoint === null) {
                return 0; // No obstacle detected
            } else {
                // 1.0 = obstacle at max distance, 2.0 = obstacle touching car
                return 1.0 + (1.0 - ray.distance / ray.maxLength);
            }
        });

        // const inputs = this.rays.map(ray => {
        //     if (ray.hitPoint === null) {
        //         return 0;
        //     } else {
        //         const normalizedDistance = ray.distance / ray.maxLength;
        //         // Returns: min=1.0 (when obstacle at max distance), max=4.48 (when obstacle touches car)
        //         return Math.exp(1.5 * (1 - normalizedDistance));
        //     }
        // });


        // Use neural network output to determine horizontal movement
        const deltaX = this.brain.predict(inputs) * this.speed;
        this.x += deltaX;

        // 6. Update fitness (distance traveled) and apply penalty for
        // drifting away from the road center
        this.fitness += this.speed;

        const centerX = this.canvasWidth / 2;
        const distanceFromCenter = Math.abs(this.x - centerX);
        const normalized = distanceFromCenter / centerX; // 0 at center, 1 at edge
        this.fitness -= normalized * this.centerPenaltyMultiplier * this.speed;

        // Penalize if the forward-facing ray detects an obstacle too close
        const middleIndex = Math.floor(this.rays.length / 2);
        const middleRay = this.rays[middleIndex];
        if (middleRay.distance < this.rayLength * 0.75) {
            const penalty = this.proximityPenaltyMultiplier * this.speed;
            this.fitness -= penalty;
        }
    }
  
    /**
     * Called by the animation loop in main.js
     * Draws the car on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @returns None
     */
    draw(ctx) {
        if (!this.alive) return;

        this.y = ctx.canvas.height * 0.8; // Update the stored y position

        // Draw rays first (in world space, before car transformations)
        for (const ray of this.rays) {
            ray.draw(ctx);
        }

        // Draw fitness score above car (in world space, before transformations)
        ctx.save();
        ctx.font = "12px monospace";
        const fitnessText = Math.floor(this.fitness).toString();
        const textWidth = ctx.measureText(fitnessText).width;
        
        // Draw background rectangle for better readability
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(
            this.x - textWidth/2 - 2,  // x
            this.y - this.height/2 - 20,  // y (above car)
            textWidth + 4,  // width
            16  // height
        );
        
        // Draw fitness text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            fitnessText,
            this.x,
            this.y - this.height/2 - 12
        );
        ctx.restore();

        // Save the current canvas state before transformations
        ctx.save();
        
        // Move canvas origin to car's position
        ctx.translate(this.x, this.y);

        // Set car color
        ctx.fillStyle = "blue";
        
        // Draw car centered on origin (accounting for car dimensions)
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Restore canvas state to before transformations
        ctx.restore();
    }

    /**
     * Creates a deep clone of this car, including its neural network.
     * Used during evolution to preserve elite behavior.
     * @returns {Car} A new Car object with cloned brain.
     */
    clone() {
        const clone = new Car(
            this.canvasWidth / 2,
            this.width,
            this.height,
            this.canvasWidth,
            this.speed,
            this.generation
        );
        clone.alive = true;
        clone.brain = this.brain.clone();
        clone.fitness = 0; // Reset fitness for new generation
        return clone;
    }

    getAdaptiveMutationRate() {
        const baseRate = 0.3;
        const decayFactor = 0.9;
        const decayRate = Math.max(0.1, baseRate * Math.pow(decayFactor, this.generation - 1));
        console.log(`Mutation decay rate: ${decayRate.toFixed(4)} (gen ${this.generation})`);
        return decayRate;
    }

}
  
  