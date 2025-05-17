import { Car } from "./classes/Car.js";

// Get canvas and context
const canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 800;
const ctx = canvas.getContext("2d");

const SPEED = 2;
const NUM_CARS = 30;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 70;

// Define cars
const cars = [];
for (let i = 0; i < NUM_CARS; i++) {
    cars.push(new Car(canvas.width / 2, CAR_WIDTH, CAR_HEIGHT, canvas.width, SPEED));
}


// Define road lines
const lineSpacing = 100;
const dashHeight = 40;
const dashWidth = 8;

let roadLines = [];

for (let i = 0; i < canvas.height / lineSpacing + 2; i++) {
  roadLines.push(i * lineSpacing);
}

function updateRoadLines() {
  for (let i = 0; i < roadLines.length; i++) {
    roadLines[i] += SPEED;

    if (roadLines[i] > canvas.height) {
      // Find current highest visible line (smallest y)
      const maxY = Math.min(...roadLines);
      roadLines[i] = maxY - lineSpacing;
    }
  }
}

function drawRoadLines(ctx) {
  const centerX = canvas.width / 2;

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = dashWidth;

  for (let y of roadLines) {
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + dashHeight);
    ctx.stroke();
  }
}




// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateRoadLines();
    drawRoadLines(ctx);
  
    // Update and draw all cars
    for (const car of cars) {
        car.update();
        car.draw(ctx);
    }
  
    requestAnimationFrame(animate);
}

animate();
