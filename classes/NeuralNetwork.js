export class NeuralNetwork {
    constructor() {
        this.inputSize = 7;
        this.hiddenSize = 3;
        this.outputSize = 1;
    
        // Initialize weights (hidden layer: 3x7)
        this.weights_ih = Array.from({ length: this.hiddenSize }, () =>
          Array.from({ length: this.inputSize }, () => this.randomWeight())
        );
    
        // Initialize biases for hidden layer (3)
        this.bias_h = Array.from({ length: this.hiddenSize }, () => this.randomWeight());
    
        // Initialize weights from hidden to output (1x3)
        this.weights_ho = Array.from({ length: this.hiddenSize }, () => this.randomWeight());
    
        // Initialize output bias (scalar)
        this.bias_o = this.randomWeight();
    }
  
    /**
     * Performs a forward pass through the network.
     * @param {number[]} inputs - Array of 7 normalized ray distances.
     * @returns {number} Output between -1 and 1 representing steering delta.
     */
    predict(inputs) {
        if (inputs.length !== this.inputSize) {
            throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
        }

        // Compute hidden layer activations
        const hidden = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.bias_h[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += this.weights_ih[i][j] * inputs[j];
            }
            hidden[i] = this.tanh(sum);
        }

        // Compute output layer
        let output = this.bias_o;
        for (let i = 0; i < this.hiddenSize; i++) {
            output += this.weights_ho[i] * hidden[i];
        }

        return this.tanh(output);
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
        const clone = new NeuralNetwork();
        clone.weights_ih = this.weights_ih.map(row => [...row]);
        clone.bias_h = [...this.bias_h];
        clone.weights_ho = [...this.weights_ho];
        clone.bias_o = this.bias_o;
        return clone;
    }
    
    /**
     * Applies mutation to all weights and biases in the network.
     * Each value has a chance (rate) to be altered slightly.
     * @param {number} rate - Mutation probability (e.g. 0.1 for 10% chance per value)
     */
    mutate(rate) {
        const mutateValue = v =>
        Math.random() < rate ? v + (Math.random() * 2 - 1) * 0.1 : v; // Gives a random number in the range [–0.1, +0.1]
    
        this.weights_ih = this.weights_ih.map(row => row.map(mutateValue));
        this.bias_h = this.bias_h.map(mutateValue);
        this.weights_ho = this.weights_ho.map(mutateValue);
        this.bias_o = mutateValue(this.bias_o);
    }
}
  