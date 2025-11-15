## Driving Evolution

A lightweight, browser-based simulation that demonstrates how simple neural networks can learn to drive using an evolutionary process. Cars sense their environment with ray sensors, make steering decisions with a small feed‑forward neural network, and improve over generations through elitism and mutation.

### Demo
- Try it out [here](https://driving-evolution.vercel.app/)
- Watch the overview video: [YouTube demonstration](https://youtu.be/d9TAtKHgxTw)

### Features
- Neural-network controlled cars with 5 forward-facing ray sensors
- Evolutionary loop with elitism and mutation across generations
- Moving obstacles and road boundary collisions
- Real-time HUD (generation, distance, alive count)
- Configuration modal for population and mutation parameters
- Statistics modal with a graph of average distance per generation
- **Neural Network Visualizer** - Real-time visualization of network structure, activations, and weights

### How it works (high level)
- Cars cast 5 rays to measure obstacle proximity; distances are normalized.
- A compact neural network (inputs: 5, hidden: 3→2, output: 1) outputs steering in \[-1, 1].
- Fitness is proportional to distance traveled before collision.
- After all cars die, the next generation is created via:
  - Elitism: best performers are cloned directly
  - Mutation: clones of elites are randomly perturbed
  - Occasional random newcomers for diversity

## Usage

1. On first load, the configuration modal appears. Adjust parameters:
   - Number of Obstacles (default 7–8)
   - Number of Cars (population size)
   - Parent Count (elites carried over)
   - Mutation Rate (0–1)
   - Mutation Magnitude (0–0.5)
2. Click "Start Simulation".
3. Use controls:
   - Start/Pause: toggles simulation
   - Reset: reconfigure and restart
   - ℹ️ Info: opens a primer on concepts and tips
   - 📊 Stats: opens a graph of average distance per generation

### Neural Network Visualizer

The visualizer appears in the bottom-right corner during simulation and shows:
- **Neurons**: Color-coded by activation (green = positive, red = negative, intensity = magnitude)
- **Connections**: Lines between neurons (blue = positive weight, orange = negative weight, thickness = strength)
- **Labels**: Input sensors (Ray L2, L1, C, R1, R2) and output (Steering)
- **Legend**: Color scheme explanation

**Controls:**
- **Hide/Show**: Toggle visualizer visibility
- **Car selector**: Choose which car's brain to display (Best, Worst, or Random)
- **Show Weights**: Toggle connection visualization
- **Show Values**: Display numeric activation values on neurons

## Project Structure

```
DrivingEvolution/
  index.html          # Canvas, modals, and controls
  style.css           # UI and canvas styling
  main.js             # App bootstrap, loop, UI wiring
  helpers/
    SimulationManager.js   # Population lifecycle, evolution, rendering HUD
    StatisticsManager.js   # Modal and canvas-based stats graph
    SimulationState.js     # Run/config state machine
    ObstacleManager.js     # Spawning, updating, drawing obstacles and walls
    NetworkVisualizer.js   # Real-time neural network visualization
    roadLines.js           # Center line animation
  classes/
    Car.js                 # Car entity, sensor rays, fitness, drawing
    NeuralNetwork.js       # Feed-forward NN, predict/clone/mutate/crossover
    Obstacle.js            # Obstacle entity and collision
    Ray.js                 # Ray casting against rectangles
```

## Technical Notes

- Neural network: tanh activations, output in \[-1, 1] maps to horizontal movement.
- Sensors: 5 rays spanning a ~60° field; exponential scaling improves near-field sensitivity.
- Fitness: cumulative distance while alive; collisions end the car’s run.
- Evolution: elites cloned directly; additional population filled by mutated clones and some random cars.


