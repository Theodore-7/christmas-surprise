document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有组件
    const bgMusic = new BackgroundMusic();
    const christmasCard = new ChristmasCard();

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