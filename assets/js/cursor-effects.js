document.addEventListener('DOMContentLoaded', function() {
    new SantaCursor();
});

class SantaCursor {
    constructor() {
        this.cursor = document.getElementById('santa-cursor');
        this.cursor.style.display = 'block'; // 显示自定义光标
        this.lastX = 0;
        this.lastY = 0;
        this.bannerHeight = 0;
        this.init();
    }

    init() {
        // 确保图片加载完成后再显示
        const img = new Image();
        img.src = 'assets/images/christmas-cursor.png';
        img.onload = () => {
            this.cursor.style.display = 'block';
        };

        // 获取横幅高度
        const banner = document.getElementById('particle-banner');
        if (banner) {
            this.bannerHeight = banner.offsetHeight;
        }

        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';

            // 计算移动速度，只有当移动速度超过阈值时才产生星星
            const dx = e.movementX || (e.clientX - this.lastX);
            const dy = e.movementY || (e.clientY - this.lastY);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 仅在横幅区域以下产生星星
            // 移除过度节流，恢复流畅的星星特效
            if (distance > 1 && e.clientY > this.bannerHeight) {
                this.createStar(e.clientX, e.clientY);
            }
            
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
    }

    createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'cursor-star';

        // 设置起始位置
        star.style.left = x + 'px';
        star.style.top = y + 'px';

        // 计算随机结束位置，模拟扩散效果
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30; // 扩散距离
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        // 将结束位置传递给CSS动画
        star.style.setProperty('--end-x', endX + 'px');
        star.style.setProperty('--end-y', endY + 'px');

        document.body.appendChild(star);

        // 动画结束后移除元素
        setTimeout(() => {
            star.remove();
        }, 1000);
    }
}