document.addEventListener('DOMContentLoaded', function() {
    new ParticleTextBanner();
});

class ParticleTextBanner {
    constructor() {
        this.canvas = document.getElementById('particle-banner');
        this.ctx = this.canvas.getContext('2d');
        this.text = "圣诞快乐！我最爱的猫！Merry Christmas! My Love!";
        this.particles = [];
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.dpr = window.devicePixelRatio || 1;
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createParticlesFromText();
        this.bindEvents();
        this.animate();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        // Re-create particles on resize
        this.createParticlesFromText();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Only update if mouse is near/inside the banner area to save resources
            if (e.clientY <= rect.bottom + 100) {
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            } else {
                this.mouseX = -1000;
                this.mouseY = -1000;
            }
        });
    }

    createParticlesFromText() {
        this.particles = [];
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Text styling - 放大字体
        const fontSize = Math.min(45, height * 0.7);
        this.ctx.font = `bold ${fontSize}px 'Microsoft YaHei', 'STHeiti', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw text to extract data
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.text, width / 2, height / 2);

        // Get image data (needs to be from the scaled context size, but we need to map back to logical coords)
        // Note: getImageData returns data in device pixels
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        this.ctx.clearRect(0, 0, width, height);

        // Sampling step - adjust based on DPR to keep density consistent
        // 性能优化：适当增加步长，减少粒子总数，避免卡顿
        const step = Math.floor(2 * this.dpr); 
        
        for (let y = 0; y < this.canvas.height; y += step) {
            for (let x = 0; x < this.canvas.width; x += step) {
                const index = (y * this.canvas.width + x) * 4;
                if (data[index + 3] > 128) {
                    // Convert back to logical pixels for the particle object
                    const logicalX = x / this.dpr;
                    const logicalY = y / this.dpr;
                    
                    this.particles.push({
                        x: logicalX,
                        y: logicalY,
                        originalX: logicalX,
                        originalY: logicalY,
                        vx: 0,
                        vy: 0,
                        radius: Math.random() * 1.2 + 0.6, // 调整粒子大小
                        color: `hsl(${Math.random() * 40 + 10}, 100%, 75%)`, // Gold/Orange hues
                        density: Math.random() * 20 + 1
                    });
                }
            }
        }
    }

    animate() {
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;

        this.ctx.clearRect(0, 0, width, height);

        // Subtle background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Mouse interaction config
        const mouseRadius = 60; // Reduced radius to minimize conflict
        const mousePower = 10;  // Force multiplier

        this.particles.forEach(p => {
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            // Max distance, past that the force is 0
            let force = (mouseRadius - distance) / mouseRadius;

            // If we are close enough, push particles away
            if (force < 0) force = 0;

            const directionX = forceDirectionX * force * mousePower;
            const directionY = forceDirectionY * force * mousePower;

            p.vx -= directionX;
            p.vy -= directionY;

            // Return to origin
            const returnSpeed = 0.05; // Snappier return
            if (p.x !== p.originalX) {
                let dx = p.x - p.originalX;
                p.vx -= dx * returnSpeed;
            }
            if (p.y !== p.originalY) {
                let dy = p.y - p.originalY;
                p.vy -= dy * returnSpeed;
            }

            // Friction
            p.vx *= 0.9;
            p.vy *= 0.9;

            p.x += p.vx;
            p.y += p.vy;

            // Draw
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}
