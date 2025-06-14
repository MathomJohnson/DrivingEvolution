import { Ray } from './Ray.js';
import { NeuralNetwork } from './NeuralNetwork.js';

export class Car {
    constructor(x, width, height, canvasWidth, speed) {
        this.x = x;
        this.y = 800 * 0.8;  // Will be set in draw() based on canvas height
        // Width and height of the car
        this.width = width;
        this.height = height;

        this.canvasWidth = canvasWidth;

        // Penalty multiplier applied when the car strays from the road center
        // Randomized on creation but preserved when cloning
        this.centerPenaltyMultiplier = 0.85; // Math.random() * 0.5 + 0.5;

        // Current angle of the car, affects how quickly the car shifts left or right
        this.angle = 0;
        // Maximum angle change per update
        this.maxSteer = 0.02;
        // Affects how quickly the car shifts left or right along with angle
        this.speed = speed;
        // Whether the car has hit an obstacle or not
        this.alive = true;
        // Fitness value used for evolution (includes penalties)
        this.fitness = 0;

        // Initialize rays
        this.numRays = 7;
        this.raySpread = Math.PI / 2; // 90 degrees field of view
        this.rayLength = 200;
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
     * Updates the rays based on the car's angle
     * @param { Obstacle[] } obstacles 
     */
    updateRays(obstacles) {
        if (!this.y) return; // Skip if y position not set yet
        
        for (const ray of this.rays) {
            ray.cast(this.x, this.y, obstacles);
        }
    }
      
    /**
     * Called by the animation loop in main.js
     * Uses randomness to update the car's angle
     * Updates the car's x position based on its current angle and speed
     * Eliminates the car if it goes off-screen (left or right)
     * @param { Obstacle[] } obstacles 
     * @returns None
     */
    update(obstacles) {
        if (!this.alive) return;

        // 1. Update ray angles based on current car angle
        for (const ray of this.rays) {
            ray.angle = this.angle + ray.baseAngle;
        }

        // 2. Cast rays and compute intersections
        this.updateRays(obstacles);

        // 3. Normalize ray distances and feed into NN
        const inputs = this.rays.map(ray => ray.distance / ray.maxLength); // values in [0,1]

        // 4. Predict steering using NN
        const steerDelta = this.brain.predict(inputs) * this.maxSteer; // output [-maxSteer, maxSteer]

        // 5. Update car angle and position, with clamping
        const newAngle = this.angle + steerDelta;
        // Clamp angle between -π/2 and π/2 (90 degrees)
        this.angle = Math.max(-Math.PI/2, Math.min(Math.PI/2, newAngle));
        this.x += Math.sin(this.angle) * this.speed;

        // 6. Update fitness (distance traveled) and apply penalty for
        // drifting away from the road center
        this.fitness += this.speed;

        const centerX = this.canvasWidth / 2;
        const distanceFromCenter = Math.abs(this.x - centerX);
        const normalized = distanceFromCenter / centerX; // 0 at center, 1 at edge
        this.fitness -= normalized * this.centerPenaltyMultiplier * this.speed;
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
        
        // Rotate canvas by car's current angle
        ctx.rotate(this.angle);

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
            this.speed
        );
        // clone.centerPenaltyMultiplier = this.centerPenaltyMultiplier;
        clone.alive = true;
        //console.log("Cloning brain");
        clone.brain = this.brain.clone();
        clone.angle = 0; // Reset angle for new generation
        clone.fitness = 0; // Reset fitness for new generation
        return clone;
    }
}
  
  