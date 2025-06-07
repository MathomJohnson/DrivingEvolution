export class Ray {
    constructor(originX, originY, baseAngle, maxLength = 200) {
      this.originX = originX;
      this.originY = originY;
      this.baseAngle = baseAngle; // base angle relative to car's forward direction
      this.angle = baseAngle; // current absolute angle (will be updated with car's angle)
      this.maxLength = maxLength;
  
      this.endX = originX;
      this.endY = originY;
  
      this.hitPoint = null; // [x, y]
      this.distance = maxLength; // distance to the closest obstacle
    }
  
    /**
     * Recomputes the ray's intersection with the closest obstacle (if any).
     * Updates endpoint and hit data.
     * @param {number} originX - X position of the ray origin (usually car.x)
     * @param {number} originY - Y position of the ray origin (usually car.y)
     * @param {Obstacle[]} obstacles - List of obstacles to check against
     */
    cast(originX, originY, obstacles) {
      this.originX = originX;
      this.originY = originY;
  
      let closestPoint = null;
      let minDist = this.maxLength;
  
      const rayDx = Math.sin(this.angle);
      const rayDy = -Math.cos(this.angle); // y-axis is downward
  
      const rayEndX = originX + rayDx * this.maxLength;
      const rayEndY = originY + rayDy * this.maxLength;
  
      for (const obs of obstacles) {
        const edges = this.getEdgesOfRect(obs);
        for (const [p1, p2] of edges) {
          const hit = this.getIntersection(
            [originX, originY],
            [rayEndX, rayEndY],
            p1,
            p2
          );
          if (hit) {
            const dx = hit[0] - originX;
            const dy = hit[1] - originY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              closestPoint = hit;
            }
          }
        }
      }
  
      this.hitPoint = closestPoint;
      this.distance = minDist;
  
      this.endX = closestPoint ? closestPoint[0] : rayEndX;
      this.endY = closestPoint ? closestPoint[1] : rayEndY;
    }
  
    /**
     * Draws the ray and its hit point to the canvas.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     */
    draw(ctx) {
        ctx.strokeStyle = "rgba(0, 255, 0, 0.3)"; // semi-transparent green
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.originX, this.originY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    
        if (this.hitPoint) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(this.hitPoint[0], this.hitPoint[1], 3, 0, 2 * Math.PI);
            ctx.fill();
        } 

        // Draw distance value
        // ctx.fillStyle = "white";
        // ctx.font = "12px monospace";
        // const labelX = this.endX;
        // const labelY = this.endY;

        // const normalized = (this.distance / this.maxLength).toFixed(2);
        // ctx.fillText(normalized, labelX + 5, labelY - 5);
    }
  
    /**
     * Returns the four edge segments of a rectangle as [start, end] point pairs.
     * @param {Obstacle} rect - Obstacle rectangle
     * @returns {Array} List of 4 edge line segments (top, right, bottom, left)
     */
    getEdgesOfRect(rect) {
      const x1 = rect.x - rect.width / 2;
      const y1 = rect.y - rect.height / 2;
      const x2 = rect.x + rect.width / 2;
      const y2 = rect.y + rect.height / 2;
  
      return [
        [[x1, y1], [x2, y1]], // top
        [[x2, y1], [x2, y2]], // right
        [[x2, y2], [x1, y2]], // bottom
        [[x1, y2], [x1, y1]]  // left
      ];
    }
  
    /**
     * Computes the intersection point of two lines (a1–a2 and b1–b2), if any.
     * Returns [x, y] if the lines intersect within their segments, else null.
     * @param {[x, y]} a1 - Start of ray
     * @param {[x, y]} a2 - End of ray
     * @param {[x, y]} b1 - Start of edge
     * @param {[x, y]} b2 - End of edge
     * @returns {[x, y] | null} Intersection point, or null if no intersection
     */
    getIntersection(a1, a2, b1, b2) {
      const [x1, y1] = a1;
      const [x2, y2] = a2;
      const [x3, y3] = b1;
      const [x4, y4] = b2;
  
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (denom === 0) return null;
  
      const px =
        ((x1 * y2 - y1 * x2) * (x3 - x4) -
         (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
      const py =
        ((x1 * y2 - y1 * x2) * (y3 - y4) -
         (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
  
      // Check if intersection is within both segments
      if (
        this.pointOnSegment(px, py, x1, y1, x2, y2) &&
        this.pointOnSegment(px, py, x3, y3, x4, y4)
      ) {
        return [px, py];
      }
      return null;
    }
  
    // Returns true if the point (px, py) lies within the segment (x1, y1)-(x2, y2).
    pointOnSegment(px, py, x1, y1, x2, y2) {
      return (
        px >= Math.min(x1, x2) &&
        px <= Math.max(x1, x2) &&
        py >= Math.min(y1, y2) &&
        py <= Math.max(y1, y2)
      );
    }
  }
  