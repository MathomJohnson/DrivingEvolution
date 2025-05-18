import { Car } from "../classes/Car.js";

export class CarManager {
    constructor(canvas, carCount = 30, speed) {
        this.canvas = canvas;
        this.count = carCount;
        this.speed = speed;
        this.width = 40;
        this.height = 70;
        this.cars = [];

        // Initialize cars
        for (let i = 0; i < this.count; i++) {
            this.cars.push(
                new Car(
                    canvas.width / 2,  // start in middle
                    this.width,
                    this.height,
                    canvas.width,
                    speed
                )
            );
        }
    }

    updateAll(obstacles) {
        for (const car of this.cars) {
            car.update(obstacles);
        }
    }

    drawAll(ctx) {
        for (const car of this.cars) {
            car.draw(ctx);
        }
    }

    // Getter to expose cars array for obstacle collision detection
    getCars() {
        return this.cars;
    }
} 