export class Obstacle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed; // downward speed
    }
  
    update() {
        this.y += this.speed;
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
        const carCorners = car.getCorners();
        const obsCorners = this.getCorners();

        const axes = [
            { x: Math.cos(car.angle), y: Math.sin(car.angle) }, // car width axis
            { x: -Math.sin(car.angle), y: Math.cos(car.angle) }, // car height axis
            { x: 1, y: 0 },
            { x: 0, y: 1 }
        ];

        for (const axis of axes) {
            const [cMin, cMax] = this.project(carCorners, axis);
            const [oMin, oMax] = this.project(obsCorners, axis);
            if (cMax < oMin || oMax < cMin) {
                return false; // Separated along this axis
            }
        }
        return true;
    }

    getCorners() {
        const x1 = this.x - this.width / 2;
        const x2 = this.x + this.width / 2;
        const y1 = this.y - this.height / 2;
        const y2 = this.y + this.height / 2;
        return [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
        ];
    }

    project(points, axis) {
        let min = points[0].x * axis.x + points[0].y * axis.y;
        let max = min;
        for (const p of points.slice(1)) {
            const val = p.x * axis.x + p.y * axis.y;
            if (val < min) min = val;
            if (val > max) max = val;
        }
        return [min, max];
    }
}
  