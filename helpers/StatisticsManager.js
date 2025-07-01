export class StatisticsManager {
    constructor(simulationManager) {
        this.simulationManager = simulationManager;
        this.modal = document.getElementById('statsModal');
        this.statsButton = document.getElementById('statsButton');
        this.closeButton = document.getElementById('closeModal');
        this.graphCanvas = document.getElementById('graphCanvas');
        this.graphCtx = this.graphCanvas.getContext('2d');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Open modal
        this.statsButton.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.add('show');
        this.drawGraph();
    }

    closeModal() {
        this.modal.classList.remove('show');
    }

    drawGraph() {
        const stats = this.simulationManager.getGenerationStats();
        if (stats.length === 0) {
            this.drawEmptyGraph();
            return;
        }

        const ctx = this.graphCtx;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;
        const padding = 60;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Find data ranges
        const maxGeneration = Math.max(...stats.map(s => s.generation));
        const maxAverageDistance = Math.max(...stats.map(s => s.averageDistance));

        // Draw grid
        this.drawGrid(ctx, width, height, padding, maxGeneration, maxAverageDistance);

        // Draw axes
        this.drawAxes(ctx, width, height, padding, maxGeneration, maxAverageDistance);

        // Draw data points and lines
        this.drawDataLines(ctx, width, height, padding, stats, maxGeneration, maxAverageDistance);

        // Draw legend
        this.drawLegend(ctx, width, height);
    }

    drawEmptyGraph() {
        const ctx = this.graphCtx;
        const width = this.graphCanvas.width;
        const height = this.graphCanvas.height;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#666';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data available yet', width / 2, height / 2);
        ctx.font = '14px Arial';
        ctx.fillText('Complete at least one generation to see statistics', width / 2, height / 2 + 30);
    }

    drawGrid(ctx, width, height, padding, maxGen, maxValue) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let i = 0; i <= maxGen; i++) {
            const x = padding + (i / maxGen) * (width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Horizontal grid lines
        const gridLines = 10;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * (height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
    }

    drawAxes(ctx, width, height, padding, maxGen, maxValue) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ccc';
        ctx.font = '12px Arial';

        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // X-axis labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= maxGen; i += Math.max(1, Math.floor(maxGen / 10))) {
            const x = padding + (i / maxGen) * (width - 2 * padding);
            ctx.fillText(i.toString(), x, height - padding + 20);
        }

        // Y-axis labels
        ctx.textAlign = 'right';
        const gridLines = 10;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * (height - 2 * padding);
            const value = Math.floor((maxValue * (gridLines - i)) / gridLines);
            ctx.fillText(value.toString(), padding - 10, y + 4);
        }

        // Axis titles
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generation', width / 2, height - 10);
        
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Average Distance', 0, 0);
        ctx.restore();
    }

    drawDataLines(ctx, width, height, padding, stats, maxGen, maxValue) {
        if (stats.length < 2) return;

        // Draw distance line
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < stats.length; i++) {
            const stat = stats[i];
            const x = padding + (stat.generation / maxGen) * (width - 2 * padding);
            const y = padding + ((maxValue - stat.averageDistance) / maxValue) * (height - 2 * padding);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw data points
        for (const stat of stats) {
            const x = padding + (stat.generation / maxGen) * (width - 2 * padding);
            
            // Distance point
            const y = padding + ((maxValue - stat.averageDistance) / maxValue) * (height - 2 * padding);
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    drawLegend(ctx, width, height) {
        const legendX = width - 150;
        const legendY = 80;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(legendX - 10, legendY - 10, 140, 30);
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        // Average distance legend
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(legendX, legendY, 15, 3);
        ctx.fillStyle = '#fff';
        ctx.fillText('Average Distance', legendX + 20, legendY + 8);
    }
} 