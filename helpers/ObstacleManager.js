import { Obstacle } from "../classes/Obstacle.js";

export class ObstacleManager {
    constructor(canvas, obstacleCount, speed) {
        this.canvas = canvas;
        this.count = obstacleCount;
        this.speed = speed;
        this.width = 50;
        this.height = 30;
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
        this.obstacles.push(new Obstacle(1, this.canvas.height / 2, 10, this.canvas.height, 0)); // left wall
        this.obstacles.push(new Obstacle(this.canvas.width - 1, this.canvas.height / 2, 10, this.canvas.height, 0)); // right wall
    }

    getRandomX() {
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
}
