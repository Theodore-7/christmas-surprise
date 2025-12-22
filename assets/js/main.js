document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有组件
    const bgMusic = new BackgroundMusic();
    const christmasCard = new ChristmasCard();
    const hearts = new HeartAvatars();

    // 为页面添加一个点击监听器来触发音乐播放
    document.body.addEventListener('click', function() {
        bgMusic.play();
    }, { once: true }); // 只执行一次
});

class BackgroundMusic {
    constructor() {
        this.audio = document.getElementById('bg-music');
        this.played = false;
    }

    play() {
        if (!this.played && this.audio) {
            this.audio.play()
                .then(() => {
                    console.log("背景音乐开始播放");
                    this.played = true;
                })
                .catch(error => {
                    console.error("背景音乐播放失败:", error);
                    // Autoplay policy可能阻止自动播放，这是正常现象
                });
        }
    }
}

class HeartAvatars {
    constructor() {
        this.container = document.getElementById('heart-avatars');
        this.banner = document.getElementById('particle-banner');
        this.positions = [];
        this.count = 6; // 少量显示
        this.init();
    }

    init() {
        if (!this.container) return;
        this.calculatePositions();
        this.renderHearts();
        window.addEventListener('resize', () => {
            this.calculatePositions();
            this.renderHearts();
        });
    }

    calculatePositions() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const bannerH = this.banner ? this.banner.offsetHeight : 80;
        const topStart = bannerH + 10;
        const topEnd = Math.min(h * 0.45, bannerH + 220);

        const cols = this.count;
        this.positions = [];
        for (let i = 0; i < cols; i++) {
            const x = ((i + 0.5) / cols) * w; // 均匀分布
            const y = topStart + ((i % 2 === 0) ? (topEnd - topStart) * 0.3 : (topEnd - topStart) * 0.7);
            this.positions.push({ x, y });
        }
    }

    renderHearts() {
        this.container.innerHTML = '';
        this.positions.forEach((pos, idx) => {
            const el = document.createElement('div');
            el.className = 'heart-avatar ' + (idx % 2 === 0 ? 'my' : 'cat');
            el.style.left = `${pos.x - 60}px`; // 半宽居中
            el.style.top = `${pos.y - 50}px`;  // 半高居中
            el.style.animationDelay = `${(idx % 3) * 2}s`; // 交错淡入淡出
            this.container.appendChild(el);
        });
    }
}

class ChristmasCard {
    constructor() {
        this.card = document.getElementById('christmas-card');
        this.cardContent = document.getElementById('card-content');
        this.overlay = document.getElementById('card-overlay');
        this.closeButton = document.querySelector('.close-card');

        this.card.addEventListener('click', () => this.openCard());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) { // 确保点击的是overlay本身，而不是内部内容
                this.closeCard();
            }
        });
        this.closeButton.addEventListener('click', () => this.closeCard());
    }

    openCard() {
        this.overlay.classList.add('active');
        // 稍微延迟一下再添加content的active类，以配合overlay的显示
        setTimeout(() => {
            this.cardContent.classList.add('active');
        }, 50);
    }

    closeCard() {
        this.cardContent.classList.remove('active');
        // 等待content的关闭动画结束后再隐藏overlay
        setTimeout(() => {
            this.overlay.classList.remove('active');
        }, 400); // 与CSS中的transition duration一致
    }
}
