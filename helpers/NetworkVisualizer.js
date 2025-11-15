/**
 * NetworkVisualizer - Visualizes a neural network's structure and activations
 * Displays neurons, connections, weights, and activations in real-time
 */
export class NetworkVisualizer {
    /**
     * Creates a new network visualizer
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     * @param {Object} config - Configuration options
     */
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Configuration with defaults
        this.config = {
            nodeRadius: config.nodeRadius || 12,
            layerSpacing: config.layerSpacing || 140,
            nodeSpacing: config.nodeSpacing || 50,
            showWeights: config.showWeights !== undefined ? config.showWeights : true,
            showValues: config.showValues !== undefined ? config.showValues : false,
            maxWeightThickness: config.maxWeightThickness || 3,
            minWeightThickness: config.minWeightThickness || 0.3,
            fontSize: config.fontSize || 11,
            labelFontSize: config.labelFontSize || 12,
            padding: config.padding || 40
        };

        this.setupCanvas();
    }

    /**
     * Sets up the canvas with proper dimensions
     */
    setupCanvas() {
        // Set canvas size
        this.canvas.width = 700;
        this.canvas.height = 400;
    }

    /**
     * Main drawing method - renders the entire network
     * @param {NeuralNetwork} network - The neural network to visualize
     * @param {string[]} inputLabels - Labels for input neurons
     * @param {string[]} outputLabels - Labels for output neurons
     */
    draw(network, inputLabels = [], outputLabels = []) {
        if (!network) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const layerSizes = network.getLayerSizes();
        const weights = network.getWeights();
        const activations = network.getActivations();

        if (!activations || activations.length === 0) {
            this.drawNoDataMessage();
            return;
        }

        // Calculate node positions for all layers
        const nodePositions = this.calculateNodePositions(layerSizes);

        // Draw connections first (so they appear behind nodes)
        if (this.config.showWeights) {
            this.drawAllConnections(nodePositions, weights);
        }

        // Draw all nodes
        this.drawAllNodes(nodePositions, activations);

        // Draw labels
        this.drawLabels(nodePositions, layerSizes, inputLabels, outputLabels);

        // Draw legend
        this.drawLegend();
    }

    /**
     * Calculates the x,y positions for all nodes in the network
     * @param {number[]} layerSizes - Array of neuron counts per layer
     * @returns {Array<Array<{x: number, y: number}>>} 2D array of positions
     */
    calculateNodePositions(layerSizes) {
        const positions = [];
        const maxNodesInLayer = Math.max(...layerSizes);
        const totalWidth = this.canvas.width - 2 * this.config.padding;
        const totalHeight = this.canvas.height - 2 * this.config.padding;

        // Calculate spacing based on number of layers
        const layerSpacing = totalWidth / (layerSizes.length - 1 || 1);

        layerSizes.forEach((nodeCount, layerIndex) => {
            const layerPositions = [];
            const x = this.config.padding + layerIndex * layerSpacing;

            // Vertically center this layer
            const layerHeight = (nodeCount - 1) * this.config.nodeSpacing;
            const startY = (this.canvas.height - layerHeight) / 2;

            for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
                const y = startY + nodeIndex * this.config.nodeSpacing;
                layerPositions.push({ x, y });
            }

            positions.push(layerPositions);
        });

        return positions;
    }

    /**
     * Draws all connections between layers
     * @param {Array} nodePositions - Positions of all nodes
     * @param {number[][][]} weights - Weight matrices for each layer connection
     */
    drawAllConnections(nodePositions, weights) {
        for (let layer = 0; layer < weights.length; layer++) {
            const fromPositions = nodePositions[layer];
            const toPositions = nodePositions[layer + 1];
            const weightMatrix = weights[layer];

            this.drawConnections(fromPositions, toPositions, weightMatrix);
        }
    }

    /**
     * Draws connections between two layers
     * @param {Array} fromPositions - Source layer node positions
     * @param {Array} toPositions - Target layer node positions
     * @param {number[][]} weightMatrix - Weights connecting the layers
     */
    drawConnections(fromPositions, toPositions, weightMatrix) {
        // Draw connections from each source to each target
        weightMatrix.forEach((neuronWeights, toIndex) => {
            const toPos = toPositions[toIndex];

            neuronWeights.forEach((weight, fromIndex) => {
                const fromPos = fromPositions[fromIndex];
                this.drawConnection(fromPos, toPos, weight);
            });
        });
    }

    /**
     * Draws a single connection line
     * @param {Object} from - Starting position {x, y}
     * @param {Object} to - Ending position {x, y}
     * @param {number} weight - Weight value (-1 to 1)
     */
    drawConnection(from, to, weight) {
        const absWeight = Math.abs(weight);

        // Map weight to line thickness
        const thickness = this.config.minWeightThickness +
            absWeight * (this.config.maxWeightThickness - this.config.minWeightThickness);

        // Color based on sign: blue for positive, orange for negative
        const alpha = 0.3 + absWeight * 0.5; // More opacity for stronger weights
        const color = weight >= 0
            ? `rgba(100, 150, 255, ${alpha})`
            : `rgba(255, 140, 50, ${alpha})`;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }

    /**
     * Draws all nodes across all layers
     * @param {Array} nodePositions - Positions of all nodes
     * @param {number[][]} activations - Activation values for each layer
     */
    drawAllNodes(nodePositions, activations) {
        nodePositions.forEach((layerPositions, layerIndex) => {
            const layerActivations = activations[layerIndex] || [];

            layerPositions.forEach((pos, nodeIndex) => {
                const activation = layerActivations[nodeIndex] || 0;
                this.drawNode(pos.x, pos.y, activation);
            });
        });
    }

    /**
     * Draws a single neuron node
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} activation - Activation value (typically -1 to 1 for tanh)
     */
    drawNode(x, y, activation) {
        const radius = this.config.nodeRadius;

        // Map activation to color
        // Positive = green, negative = red, zero = gray
        let color;
        const intensity = Math.min(Math.abs(activation), 1);

        if (activation > 0) {
            // Green for positive activation
            const greenIntensity = Math.floor(100 + intensity * 155);
            color = `rgb(50, ${greenIntensity}, 50)`;
        } else if (activation < 0) {
            // Red for negative activation
            const redIntensity = Math.floor(100 + intensity * 155);
            color = `rgb(${redIntensity}, 50, 50)`;
        } else {
            // Gray for zero
            color = 'rgb(150, 150, 150)';
        }

        // Draw node circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Optionally show activation value
        if (this.config.showValues) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(activation.toFixed(2), x, y);
        }
    }

    /**
     * Draws labels for input and output layers
     * @param {Array} nodePositions - All node positions
     * @param {number[]} layerSizes - Sizes of each layer
     * @param {string[]} inputLabels - Labels for input neurons
     * @param {string[]} outputLabels - Labels for output neurons
     */
    drawLabels(nodePositions, layerSizes, inputLabels, outputLabels) {
        this.ctx.font = `${this.config.labelFontSize}px Arial`;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        // Input layer labels (left side)
        if (inputLabels.length > 0 && nodePositions[0]) {
            this.ctx.textAlign = 'right';
            nodePositions[0].forEach((pos, i) => {
                if (inputLabels[i]) {
                    this.ctx.fillText(
                        inputLabels[i],
                        pos.x - this.config.nodeRadius - 8,
                        pos.y + 1
                    );
                }
            });
        }

        // Output layer labels (right side)
        const outputLayerIndex = nodePositions.length - 1;
        if (outputLabels.length > 0 && nodePositions[outputLayerIndex]) {
            this.ctx.textAlign = 'left';
            nodePositions[outputLayerIndex].forEach((pos, i) => {
                if (outputLabels[i]) {
                    this.ctx.fillText(
                        outputLabels[i],
                        pos.x + this.config.nodeRadius + 8,
                        pos.y + 1
                    );
                }
            });
        }

        // Layer type labels (top)
        this.ctx.textAlign = 'center';
        this.ctx.font = `bold ${this.config.labelFontSize}px Arial`;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

        nodePositions.forEach((layerPos, i) => {
            let label = '';
            if (i === 0) label = 'Input';
            else if (i === nodePositions.length - 1) label = 'Output';
            else label = `Hidden ${i}`;

            if (layerPos[0]) {
                this.ctx.fillText(label, layerPos[0].x, 20);
            }
        });
    }

    /**
     * Draws a legend explaining the color scheme
     */
    drawLegend() {
        const legendX = 10;
        const legendY = this.canvas.height - 90;
        const lineHeight = 18;

        this.ctx.font = 'bold 11px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Legend:', legendX, legendY);

        this.ctx.font = '10px Arial';

        // Neuron colors
        this.ctx.fillStyle = 'rgb(50, 200, 50)';
        this.ctx.fillText('● Positive Activation', legendX, legendY + lineHeight);

        this.ctx.fillStyle = 'rgb(200, 50, 50)';
        this.ctx.fillText('● Negative Activation', legendX, legendY + lineHeight * 2);

        // Weight colors
        this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(legendX, legendY + lineHeight * 3 + 5);
        this.ctx.lineTo(legendX + 15, legendY + lineHeight * 3 + 5);
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('Positive Weight', legendX + 20, legendY + lineHeight * 3 + 8);

        this.ctx.strokeStyle = 'rgba(255, 140, 50, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(legendX, legendY + lineHeight * 4 + 5);
        this.ctx.lineTo(legendX + 15, legendY + lineHeight * 4 + 5);
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('Negative Weight', legendX + 20, legendY + lineHeight * 4 + 8);
    }

    /**
     * Draws a message when no data is available
     */
    drawNoDataMessage() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            'No network data available yet',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        this.ctx.fillText(
            'Start the simulation to see the neural network',
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
    }

    /**
     * Updates configuration options
     * @param {Object} newConfig - Configuration updates
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
