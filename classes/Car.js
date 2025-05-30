import { Ray } from './Ray.js';
import { NeuralNetwork } from './NeuralNetwork.js';

export class Car {
    constructor(x, width, height, canvas, speed) {
        // Position of the car
        this.x = x;
        this.y = canvas.height * 0.8;
        // Width and height of the car
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        // Current angle of the car, affects how quickly the car shifts left or right
        this.angle = 0;
        // Maximum angle change per update
        this.maxSteer = 0.02;
        // Affects how quickly the car shifts left or right along with angle
        this.speed = speed;
        this.alive = true;
        // How far the car has traveled
        this.fitness = 0;

        // Initialize rays
        this.numRays = 7;
        this.raySpread = Math.PI / 2; // 90 degrees field of view
        this.rayLength = 200;
        this.rays = [];

        // Initialize ray angles
        const mid = (this.numRays - 1) / 2;
        for (let i = 0; i < this.numRays; i++) {
            const offset = ((i - mid) / mid) * (this.raySpread / 2);
            this.rays.push(new Ray(this.x, this.y, offset, this.rayLength));
        }

        // brain outputs steering angle
        this.brain = new NeuralNetwork();
    }
  
    /**
     * Updates the rays based on the car's angle
     * @param { Obstacle[] } obstacles 
     */
    updateRays(obstacles) {        
        for (const ray of this.rays) {
            ray.cast(this.x, this.y, obstacles); // computes ray's intersection with closest obstacle
        }
    }
      
    /**
     * Uses randomness to update the car's angle
     * Updates the car's x position based on its current angle and speed
     * @param { Obstacle[] } obstacles 
     * @returns None
     */
    update(obstacles) {
        if (!this.alive) return;

        // Update ray angles based on current car angle
        for (const ray of this.rays) {
            ray.angle = this.angle + ray.baseAngle;
        }

        // Cast rays and compute intersections
        this.updateRays(obstacles);

        // Normalize ray distances and for NN input
        const inputs = this.rays.map(ray => ray.distance / ray.maxLength); // values in [0,1]

        // Predict steering using NN
        const steerDelta = this.brain.predict(inputs) * this.maxSteer; // output [-maxSteer, maxSteer]

        // Update car angle and position, with clamping
        const newAngle = this.angle + steerDelta;
        // Clamp angle between -π/2 and π/2 (90 degrees)
        this.angle = Math.max(-Math.PI/2, Math.min(Math.PI/2, newAngle));
        // Move car left or right based on its angle and speed
        this.x += Math.sin(this.angle) * this.speed;

        // Accumulate fitness (distance traveled)
        this.fitness += this.speed;
    }
  
    draw(ctx) {
        if (!this.alive) return;

        // Draw rays
        for (const ray of this.rays) {
            ray.draw(ctx);
        }

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
            this.canvas.width / 2,
            this.width,
            this.height,
            this.canvas,
            this.speed
        );
        clone.alive = true;
        clone.brain = this.brain.clone();
        clone.angle = 0; // Reset angle
        clone.fitness = 0; // Reset fitness
        return clone;
    }
}
  
  