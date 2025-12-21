document.addEventListener('DOMContentLoaded', function() {
    new ChristmasSnow();
});

class ChristmasSnow {
    constructor() {
        this.container = document.getElementById('snow-container');
        this.snowflakes = [];
        this.createSnowflakes();
        this.animate();
    }

    createSnowflakes() {
        const numFlakes = 200; // 雪花数量
        for (let i = 0; i < numFlakes; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';

            // 随机初始位置和大小
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.top = '-10px'; // 从屏幕顶部开始下落
            const size = 4 + Math.random() * 6; // 4px 到 10px
            flake.style.width = size + 'px';
            flake.style.height = size + 'px';
            flake.style.opacity = 0.5 + Math.random() * 0.5; // 0.5 到 1.0

            // 随机动画持续时间和延迟
            const duration = 5 + Math.random() * 10; // 5s 到 15s
            const delay = Math.random() * 5; // 0s 到 5s
            flake.style.animationDuration = duration + 's';
            flake.style.animationDelay = delay + 's';

            this.container.appendChild(flake);
            this.snowflakes.push({
                element: flake,
                baseLeft: parseFloat(flake.style.left),
                speed: 0.5 + Math.random() * 0.5 // 垂直下落速度
            });
        }
    }

    animate() {
        // 这里的animate主要是为了处理可能需要JS干预的复杂动画
        // 当前使用CSS动画已足够，所以只需一个空的requestAnimationFrame保持流畅
        requestAnimationFrame(() => this.animate());
    }
}