import { Obstacle } from "../classes/Obstacle.js";

export class ObstacleManager {
    constructor(canvas, obstacleCount = 5, speed) {
        this.canvas = canvas;
        this.count = obstacleCount;
        this.speed = speed;
        this.width = 40;
        this.height = 15;
        this.obstacles = [];

        for (let i = 0; i < this.count; i++) {
            const x = this.getRandomX();
            const y = -i * 200;
            this.obstacles.push(new Obstacle(x, y, this.width, this.height, this.speed));
        }
    }

    getRandomX() {
        const margin = 40;
        return margin + Math.random() * (this.canvas.width - 2 * margin);
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
}
