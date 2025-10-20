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
        // Horizontal movement speed of the car
        this.speed = speed;
        this.speedMultiplier = 1.2;
        this.generation = generation;
        // Whether the car has hit an obstacle or not
        this.alive = true;
        // Fitness value used for evolution (includes penalties)
        this.fitness = 0;
        // Initialize rays
        this.numRays = 5;
        this.raySpread = (60 * Math.PI) / 180; // 60 degrees field of view
        this.rayLength = 250;
        this.rays = [];

        // Create rays starting from the back of the car
        const mid = (this.numRays - 1) / 2;
        for (let i = 0; i < this.numRays; i++) {
            const offset = ((i - mid) / mid) * (this.raySpread / 2);
            this.rays.push(new Ray(this.x, this.y + this.height / 2 + 2, offset, this.rayLength));
        }

        // Neural network for decision making
        this.brain = new NeuralNetwork(this.numRays);
    }
  
    /**
     * Updates the rays based on the car's current position
     * @param { Obstacle[] } obstacles
     */
    updateRays(obstacles) {
        if (!this.y) return; // Skip if y position not set yet
        
        // Update rays from the back of the car
        for (const ray of this.rays) {
            ray.cast(this.x, this.y + this.height / 2 - 2, obstacles);
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

        // Normalize ray distances and add hit flags for each ray
        const inputs = this.rays.map(ray => {
            if (ray.hitPoint === null) {
                return -2; // No obstacle detected
            } else {
                // 1.0 = obstacle at max distance, 7.39 = obstacle touching car
                return Math.exp(2 * (1.0 - ray.distance / ray.maxLength)); 
            }
        });

        // Use neural network output to determine horizontal movement
        const deltaX = this.brain.predict(inputs) * this.speed * this.speedMultiplier;
        this.x += deltaX;

        // Update fitness (distance traveled)
        this.fitness += this.speed * this.speedMultiplier;
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
        // Save the current canvas state before transformations
        ctx.save();
        // Move canvas origin to car's position
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "blue";
        // Draw car centered on origin (accounting for car dimensions)
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        // Restore canvas state to before transformations
        ctx.restore();
    }

    /**
     * Returns the world coordinates of the car's four corners
     * accounting for its current rotation.
     * @returns {{x:number, y:number}[]} Array of 4 corner points
     */
    getCorners() {
        const w2 = this.width / 2;
        const h2 = this.height / 2;
        const sin = Math.sin(this.angle);
        const cos = Math.cos(this.angle);

        const local = [
            { x: -w2, y: -h2 },
            { x:  w2, y: -h2 },
            { x:  w2, y:  h2 },
            { x: -w2, y:  h2 }
        ];

        return local.map(p => ({
            x: this.x + p.x * cos - p.y * sin,
            y: this.y + p.x * sin + p.y * cos
        }));
    }

    /**
     * Creates a deep clone of this car, including its neural network.
     * Used during evolution to preserve elite behavior.
     * @returns {Car} A new Car object with cloned brain.
     */
    clone() {
        // Randomly position the car within the middle 50% of the canvas width
        const middle50PercentStart = this.canvasWidth * 0.25; // 25% from left edge
        const middle50PercentEnd = this.canvasWidth * 0.75;   // 75% from left edge
        const randomX = middle50PercentStart + Math.random() * (middle50PercentEnd - middle50PercentStart);
        
        const clone = new Car(
            randomX,  // Use random position instead of center
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

}
  
  