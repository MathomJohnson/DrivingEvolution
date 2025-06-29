import { Obstacle } from "../classes/Obstacle.js";

export class ObstacleManager {
    constructor(canvas, obstacleCount = 5, speed) {
        this.canvas = canvas;
        this.count = obstacleCount;
        this.speed = speed;
        this.width = 40;
        this.height = 15;
        this.obstacles = [];

        this.initializeObstacles();
    }

    initializeObstacles() {
        this.obstacles = [];
        // Add moving obstacles
        for (let i = 0; i < this.count; i++) {
            const x = this.getRandomX();
            const y = -i * 200;  // Space them out vertically above the screen
            this.obstacles.push(new Obstacle(x, y, this.width, this.height, this.speed));
        }

        // Manually add sides of the road as obstacles
        this.obstacles.push(new Obstacle(0, this.canvas.height / 2, 10, this.canvas.height, 0)); // left wall
        this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height / 2, 10, this.canvas.height, 0)); // right wall
    }

    getRandomX() {
        // Allow obstacles to spawn partially outside the road bounds so that
        // "side hugging" cars cannot exploit a gap next to the walls. An
        // obstacle's center can be anywhere from -width/2 to
        // canvas.width + width/2 which means it may overlap the wall by up to
        // half of its width but will never be completely outside the canvas.
        const minX = -this.width / 2;
        const maxX = this.canvas.width + this.width / 2;
        return minX + Math.random() * (maxX - minX);
    }

    updateAll(cars) {
        for (const obs of this.obstacles) {
            obs.update();

            if (obs.y - obs.height / 2 > this.canvas.height) {
                obs.y = -this.height;
                obs.x = this.getRandomX();
            }

            for (const car of cars) {
                if (car.alive && obs.collidesWith(car)) {
                    car.alive = false;
                }
            }
        }
    }

    drawAll(ctx) {
        for (const obs of this.obstacles) {
            obs.draw(ctx);
        }
    }

    getObstacles() {
        return this.obstacles;
    }

    // Reset all moving obstacles to starting positions
    reset() {
        // Keep the last two obstacles (walls) and reset the moving ones
        const walls = this.obstacles.slice(-2);
        this.obstacles = [];
        
        // Reinitialize moving obstacles
        for (let i = 0; i < this.count; i++) {
            const x = this.getRandomX();
            const y = -i * 200;  // Space them out vertically above the screen
            this.obstacles.push(new Obstacle(x, y, this.width, this.height, this.speed));
        }
        
        // Add back the walls
        this.obstacles.push(...walls);
    }

    /**
     * Update the number of obstacles and rebuild them.
     * @param {number} count - New obstacle count
     */
    setCount(count) {
        this.count = count;
        this.initializeObstacles();
    }
}
