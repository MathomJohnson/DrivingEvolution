## Driving Evolution

A lightweight, browser-based simulation that demonstrates how simple neural networks can learn to drive using an evolutionary process. Cars sense their environment with ray sensors, make steering decisions with a small feed‑forward neural network, and improve over generations through elitism and mutation.

### Demo
- Watch the overview video: [YouTube demonstration](https://youtu.be/d9TAtKHgxTw)

### Features
- Neural-network controlled cars with 5 forward-facing ray sensors
- Evolutionary loop with elitism and mutation across generations
- Moving obstacles and road boundary collisions
- Real-time HUD (generation, distance, alive count)
- Configuration modal for population and mutation parameters
- Statistics modal with a graph of average distance per generation

### How it works (high level)
- Cars cast 5 rays to measure obstacle proximity; distances are normalized.
- A compact neural network (inputs: 5, hidden: 3→2, output: 1) outputs steering in \[-1, 1].
- Fitness is proportional to distance traveled before collision.
- After all cars die, the next generation is created via:
  - Elitism: best performers are cloned directly
  - Mutation: clones of elites are randomly perturbed
  - Occasional random newcomers for diversity

## Getting Started

This is a static web app (no build step). Because ES modules are used (`type="module"`), run it from a local web server (not `file://`).

### Quick run options
- VS Code: Use the “Live Server” extension and open `index.html`.
- Python 3: `python -m http.server 8000` then open `http://localhost:8000/`.
- Node.js (npx): `npx http-server -p 8000 | cat` and open `http://localhost:8000/`.

### Manual steps
1. Clone or download this repository.
2. Start a local static server from the project root.
3. Open `http://localhost:<port>/` and load `index.html`.

## Usage

1. On first load, the configuration modal appears. Adjust parameters:
   - Number of Obstacles (default 7–8)
   - Number of Cars (population size)
   - Parent Count (elites carried over)
   - Mutation Rate (0–1)
   - Mutation Magnitude (0–0.5)
2. Click “Start Simulation”.
3. Use controls:
   - Start/Pause: toggles simulation
   - Reset: reconfigure and restart
   - ℹ️ Info: opens a primer on concepts and tips
   - 📊 Stats: opens a graph of average distance per generation

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

## Development

- Tweak behavior in `classes/` and `helpers/`.
- UI and layout live in `index.html` and `style.css`.
- The stats graph reads data from `SimulationManager.getGenerationStats()`.

## License

Add a license file (e.g., MIT) to clarify reuse. If you already have a preferred license, add `LICENSE` at the repo root and update this section.


