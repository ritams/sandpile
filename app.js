class Sandpile {
    constructor(height, width, maxCapacity = 4) {
        this.height = height;
        this.width = width;
        this.maxCapacity = maxCapacity;
        this.grid = Array.from({ length: width }, () => Array(height).fill(0));
        this.unstablePoints = new Set();
        this.canvas = document.getElementById('sandpile-canvas');
        this.context = this.canvas.getContext('2d');
        this.cellSize = this.canvas.width / this.width; // Adjust cell size based on canvas width
        this.isAnimating = false;
        this.speed = 10; // Default speed
        this.animationFrame = null;
        this.isAddingGrains = false; // Flag to control grain addition
    }

    addGrain() {
        let xIndex = Math.floor(this.width / 2);
        let yIndex = Math.floor(this.height / 2);

        this.grid[xIndex][yIndex] += 1;
        if (this.grid[xIndex][yIndex] >= this.maxCapacity) {
            this.unstablePoints.add(`${xIndex},${yIndex}`);
        }
    }

    animateGrainAddition() {
        // Animation loop for adding grains
        if (this.isAddingGrains) {
            this.addGrain();
            this.renderGrid()

            setTimeout(() => {
                requestAnimationFrame(this.animateGrainAddition.bind(this));
            }, this.speed);

            if (!this.isAnimating) {
                this.isAnimating = true;
                this.animateToppling();
            }
        }
    }

    animateToppling() {
        const animate = () => {
            if (this.unstablePoints.size === 0) {
                this.isAnimating = false;
                cancelAnimationFrame(this.animationFrame);
                return;
            }

            let unstableArray = Array.from(this.unstablePoints);
            let [xIndex, yIndex] = unstableArray[0].split(',').map(Number);
            this.unstablePoints.delete(`${xIndex},${yIndex}`);

            this.grid[xIndex][yIndex] -= this.maxCapacity;

            let neighbors = [
                [xIndex + 1, yIndex], [xIndex - 1, yIndex],
                [xIndex, yIndex + 1], [xIndex, yIndex - 1]
            ];

            for (let [x, y] of neighbors) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.grid[x][y] += 1;
                    if (this.grid[x][y] >= this.maxCapacity) {
                        this.unstablePoints.add(`${x},${y}`);
                    }
                }
            }

            this.renderGrid();
            setTimeout(() => {
                this.animationFrame = requestAnimationFrame(animate);
            }, this.speed); // Use speed to control animation rate
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    renderGrid() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let grainCount = this.grid[x][y];
                this.context.fillStyle = this.getColor(grainCount);
                this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    getColor(grainCount) {
        switch (grainCount) {
            case 0: return 'white';
            case 1: return 'green';
            case 2: return 'blue';
            case 3: return 'red';
            default: return 'purple';
        }
    }

    resetGrid(newHeight, newWidth) {
        this.height = newHeight;
        this.width = newWidth;
        this.grid = Array.from({ length: newWidth }, () => Array(newHeight).fill(0));
        this.cellSize = this.canvas.width / this.width; // Adjust cell size based on new grid size
        this.unstablePoints.clear();
        this.renderGrid();
    }
}

// Initialize Sandpile
let sandpile = new Sandpile(101, 101);


// Play/Pause Button Logic
const playPauseBtn = document.getElementById('play-pause-btn');
let isPlaying = true;
sandpile.isAddingGrains = true;
sandpile.animateGrainAddition();
playPauseBtn.textContent = 'Pause';

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        sandpile.isAddingGrains = false;
        playPauseBtn.textContent = 'Play';
    } else {
        sandpile.isAddingGrains = true;
        sandpile.animateGrainAddition();
        playPauseBtn.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
});


// Grid Size Slider Logic
const gridSizeSlider = document.getElementById('grid-size-slider');
const gridSizeValue = document.getElementById('grid-size-value');

gridSizeSlider.addEventListener('input', (event) => {
    const newSize = parseInt(event.target.value);
    gridSizeValue.textContent = newSize;
    sandpile.resetGrid(newSize, newSize);
});

// Speed Slider Logic
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

speedSlider.addEventListener('input', (event) => {
    const newSpeed = parseInt(event.target.value);
    speedValue.textContent = newSpeed;
    sandpile.speed = newSpeed;
});
