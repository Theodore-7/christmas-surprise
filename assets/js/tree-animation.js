document.addEventListener('DOMContentLoaded', function() {
    new SpiralTree();
});

class SpiralTree {
    constructor() {
        this.canvas = document.getElementById('tree-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.heartEl = document.getElementById('love-heart');
        this.particles = [];
        this.width = 0;
        this.height = 0;
        this.dpr = window.devicePixelRatio || 1;
        
        // Tree configuration
        this.treeBaseY = 0; // Set in resize
        this.treeHeight = 500;
        this.baseRadius = 150;
        this.maxParticles = 500;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        // Size the canvas to cover the area where we want the tree
        // We want the tree centered at bottom
        const containerHeight = window.innerHeight;
        const containerWidth = Math.min(800, window.innerWidth); // 增加最大宽度限制
        
        this.canvas.style.width = `${containerWidth}px`;
        this.canvas.style.height = `${containerHeight}px`; // Full height to allow particles to rise
        
        this.canvas.width = containerWidth * this.dpr;
        this.canvas.height = containerHeight * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        
        this.width = containerWidth;
        this.height = containerHeight;
        
        // Adjust tree param based on screen size
        // 放大圣诞树，并确保不与顶部重叠
        // 顶部文字横幅约80px，预留安全距离
        const topSafeMargin = 140; 
        const bottomSafeMargin = 20;
        
        // 计算可用高度
        const availableHeight = this.height - topSafeMargin - bottomSafeMargin;
        
        this.treeHeight = Math.min(700, availableHeight);
        this.baseRadius = Math.min(220, this.width * 0.35);
        
        // 将树底定位在页面底部附近
        this.treeBaseY = this.height - bottomSafeMargin; 
        this.positionHeart();
    }

    createParticle() {
        if (this.particles.length >= this.maxParticles) return;

        // Random starting angle
        const angle = Math.random() * Math.PI * 2;
        // Start at the bottom
        const y = this.treeBaseY;
        const speed = 1 + Math.random() * 2;
        
        // Color palette
        const type = Math.random();
        let color, size, glow;
        
        if (type > 0.9) { // Lights
            const lightColors = ['#f1c40f', '#e74c3c', '#3498db', '#9b59b6'];
            color = lightColors[Math.floor(Math.random() * lightColors.length)];
            size = 2 + Math.random() * 2;
            glow = 15;
        } else { // Leaves
            const green = Math.floor(Math.random() * 100 + 100);
            color = `rgba(0, ${green}, 0, ${0.5 + Math.random() * 0.5})`;
            size = 1 + Math.random() * 2;
            glow = 0;
        }

        this.particles.push({
            angle: angle,
            y: y,
            radius: this.baseRadius,
            speed: speed,
            color: color,
            size: size,
            glow: glow,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.05 + Math.random() * 0.05
        });
    }

    drawStar() {
        const topY = this.treeBaseY - this.treeHeight;
        const cx = this.width / 2;
        const cy = topY;
        const spikes = 5;
        const outerRadius = 35; // 稍微放大星星
        const innerRadius = 15;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(cx, cy);
        // this.ctx.rotate(-Math.PI / 2); // 移除旋转，让星星摆正
        
        // Glowing effect
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = "gold";
        this.ctx.fillStyle = "#FFD700"; // 更亮的金色

        for (let i = 0; i < spikes; i++) {
            this.ctx.lineTo(0, 0 - outerRadius);
            this.ctx.rotate(Math.PI / spikes);
            this.ctx.lineTo(0, 0 - innerRadius);
            this.ctx.rotate(Math.PI / spikes);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.positionHeart();
        
        // Add new particles
        for(let i=0; i<5; i++) this.createParticle();

        // Sort particles by Y so we draw back to front (though for additive blending it matters less)
        // For 3D feel, sorting helps if we use opacity
        this.particles.sort((a, b) => a.y - b.y);

        this.ctx.globalCompositeOperation = 'lighter'; // Glowing effect

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Move particle up
            p.y -= p.speed;
            
            // Calculate progress (0 at bottom, 1 at top)
            const progress = (this.treeBaseY - p.y) / this.treeHeight;
            
            // If particle goes above tree top, remove it
            if (progress > 1) {
                this.particles.splice(i, 1);
                continue;
            }

            // Spiral logic
            // Radius decreases as we go up
            const currentRadius = this.baseRadius * (1 - progress);
            // Angle increases (spin)
            p.angle += 0.05; // Spin speed
            p.wobble += p.wobbleSpeed;

            // Calculate x position
            const x = this.width / 2 + Math.cos(p.angle) * currentRadius;
            // Add some wobble to y to make it organic
            const drawY = p.y + Math.sin(p.wobble) * 5;

            this.ctx.beginPath();
            this.ctx.arc(x, drawY, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            
            // 性能优化：移除大量粒子的shadowBlur，仅保留composite lighter带来的发光感
            // shadowBlur在Canvas中非常消耗性能
            this.ctx.shadowBlur = 3;
            
            this.ctx.fill();
        }
        
        this.ctx.globalCompositeOperation = 'source-over'; // Reset
        
        // Draw the star at the top
        this.drawStar();

        requestAnimationFrame(() => this.animate());
    }
    
    positionHeart() {
        if (!this.heartEl) return;
        const topY = this.treeBaseY - this.treeHeight;
        const cx = this.width / 2;
        let hy = topY - 90;
        if (hy < 140) hy = 140;
        this.heartEl.style.left = cx + 'px';
        this.heartEl.style.top = hy + 'px';
    }
}
