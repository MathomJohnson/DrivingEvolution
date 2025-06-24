import { Obstacle } from "../classes/Obstacle.js";

export class ObstacleManager {
    constructor(canvas, obstacleCount = 5) {
        this.canvas = canvas;
        this.count = obstacleCount;
        // Use square obstacles inside the arena
        this.width = 40;
        this.height = 40;
        this.obstacles = [];

        this.initializeObstacles();
    }

    initializeObstacles() {
        this.obstacles = [];

        for (let i = 0; i < this.count; i++) {
            const x = Math.random() * (this.canvas.width - this.width) + this.width / 2;
            const y = Math.random() * (this.canvas.height - this.height) + this.height / 2;
            this.obstacles.push(new Obstacle(x, y, this.width, this.height));
        }

        // Arena walls
        this.obstacles.push(new Obstacle(this.canvas.width / 2, 5, this.canvas.width, 10)); // top
        this.obstacles.push(new Obstacle(this.canvas.width / 2, this.canvas.height - 5, this.canvas.width, 10)); // bottom
        this.obstacles.push(new Obstacle(5, this.canvas.height / 2, 10, this.canvas.height)); // left
        this.obstacles.push(new Obstacle(this.canvas.width - 5, this.canvas.height / 2, 10, this.canvas.height)); // right
    }


    updateAll(cars) {
        for (const obs of this.obstacles) {
            obs.update();

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

    // Reset obstacles for new generation
    reset() {
        this.initializeObstacles();
    }
}
