export class Car {
    constructor(x, width, height, canvasWidth, speed) {
        this.x = x;
        // Width and height of the car
        this.width = width;
        this.height = height;

        this.canvasWidth = canvasWidth;

        // Current angle of the car, affects how quickly the car shifts left or right
        this.angle = 0;
        // Maximum angle change per update
        this.maxSteer = 0.02;
        // Affects how quickly the car shifts left or right along with angle
        this.speed = speed;
        // Whether the car has hit an obstacle or not
        this.alive = true;
    }
  
    /**
     * Called by the animation loop in main.js
     * Uses randomness to update the car's angle
     * Updates the car's x position based on its current angle and speed
     * Eliminates the car if it goes off-screen (left or right)
     * @returns None
     */
    update() {
        if (!this.alive) return;

        // Apply random steering (simulate NN output for now)
        const steerDelta = (Math.random() - 0.5) * this.maxSteer * 2; // result [-this.maxSteer, +this.maxSteer]
        this.angle += steerDelta;
  
        // Compute side drift based on current angle
        this.x += Math.sin(this.angle) * this.speed;
  
        // Eliminate car if it goes off-screen (left or right)
        const leftEdge = this.x - this.width / 2;
        const rightEdge = this.x + this.width / 2;

        if (leftEdge < 0 || rightEdge > this.canvasWidth) {
            this.alive = false;
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

        const y = ctx.canvas.height * 0.8; // always draw at 80% height

        // Save the current canvas state before transformations
        ctx.save();
        
        // Move canvas origin to car's position
        ctx.translate(this.x, y);
        
        // Rotate canvas by car's current angle
        ctx.rotate(this.angle);

        // Set car color
        ctx.fillStyle = "blue";
        
        // Draw car centered on origin (accounting for car dimensions)
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Restore canvas state to before transformations
        ctx.restore();
    }
}
  
  