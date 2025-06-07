export class NeuralNetwork {
    /**
     * Creates a feed forward neural network.
     * @param {number} inputSize  Number of input neurons.
     * @param {number[]} hiddenSizes Array specifying the neuron count for each hidden layer.
     * @param {number} outputSize Number of output neurons.
     */
    constructor(inputSize = 7, hiddenSizes = [10, 5], outputSize = 1) {
        this.inputSize = inputSize;
        this.hiddenSizes = hiddenSizes;
        this.outputSize = outputSize;

        this.layerSizes = [inputSize, ...hiddenSizes, outputSize];

        // Initialize weights and biases for each layer pair
        this.weights = [];
        this.biases = [];
        for (let i = 0; i < this.layerSizes.length - 1; i++) {
            const rows = this.layerSizes[i + 1];
            const cols = this.layerSizes[i];
            const weightMatrix = Array.from({ length: rows }, () =>
                Array.from({ length: cols }, () => this.randomWeight())
            );
            const biasVector = Array.from({ length: rows }, () => this.randomWeight());
            this.weights.push(weightMatrix);
            this.biases.push(biasVector);
        }
    }
  
    /**
     * Performs a forward pass through the network.
     * @param {number[]} inputs - Normalized sensor values.
     * @returns {number} Output between -1 and 1 representing steering delta.
     */
    predict(inputs) {
        if (inputs.length !== this.inputSize) {
            throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
        }

        let activations = inputs;
        for (let layer = 0; layer < this.weights.length; layer++) {
            const next = [];
            const weights = this.weights[layer];
            const biases = this.biases[layer];

            for (let i = 0; i < weights.length; i++) {
                let sum = biases[i];
                for (let j = 0; j < weights[i].length; j++) {
                    sum += weights[i][j] * activations[j];
                }
                next[i] = this.tanh(sum);
            }
            activations = next;
        }

        return activations[0];
    }

    // Simple tanh activation function
    tanh(x) {
        return Math.tanh(x);
    }

    // Returns a random weight between -1 and 1
    randomWeight() {
        return Math.random() * 2 - 1;
    }

    /**
     * Creates a deep clone of this neural network.
     * @returns {NeuralNetwork} A new identical neural network object.
     */
    clone() {
        const clone = new NeuralNetwork(this.inputSize, [...this.hiddenSizes], this.outputSize);
        clone.weights = this.weights.map(layer => layer.map(row => [...row]));
        clone.biases = this.biases.map(layer => [...layer]);
        return clone;
    }
    
    /**
     * Applies mutation to all weights and biases in the network.
     * Each value has a chance (rate) to be altered slightly.
     * @param {number} rate - Mutation probability (e.g. 0.1 for 10% chance per value)
     */
    mutate(rate) {
        const mutateValue = v =>
            Math.random() < rate ? v + (Math.random() * 2 - 1) * 0.08 : v;

        this.weights = this.weights.map(layer =>
            layer.map(row => row.map(mutateValue))
        );
        this.biases = this.biases.map(layer => layer.map(mutateValue));
    }
}
  