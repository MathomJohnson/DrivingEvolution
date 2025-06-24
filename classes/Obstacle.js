export class Obstacle {
    constructor(x, y, width, height, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
  
    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
  
    /**
     * Check if the obstacle collides with the car
     * @param {Car object} car 
     * @returns True if the obstacle collides with the car, false otherwise
     */
    collidesWith(car) {
        //const y = car.y ?? ctx.canvas.height * 0.8; // fixed y draw position
        return (
            this.y + this.height / 2 > car.y - car.height / 2 &&
            this.y - this.height / 2 < car.y + car.height / 2 &&
            this.x + this.width / 2 > car.x - car.width / 2 &&
            this.x - this.width / 2 < car.x + car.width / 2
        );
    }
}
  