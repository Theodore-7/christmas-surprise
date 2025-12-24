document.addEventListener('DOMContentLoaded', function () {
    new ThreeTree();
});

class ThreeTree {
    constructor() {
        this.canvas = document.getElementById('tree-canvas');
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        // ✅ 用于 dt 增量旋转（解决“转一圈反向回去”的视觉问题）
        this.clock = new THREE.Clock();

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.width = 0;
        this.height = 0;

        this.camera = null;
        this.points = null;

        this.starPivot = null;
        this.starObj = null;

        this.banner = document.getElementById('particle-banner');
        this.card = document.getElementById('christmas-card');
        this.sprite = null;

        // ✅ 累积角度（严格单调，永不反向）
        this.treeAngle = 0;

        // 灯光只影响星体（PointsMaterial 不受灯光影响）
        this.ambient = new THREE.AmbientLight(0xffffff, 0.55);
        this.scene.add(this.ambient);

        this.starLight = new THREE.PointLight(0xffd38a, 1.1, 260, 2.0);
        this.scene.add(this.starLight);

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createTree();
        this.animate();
    }

    resize() {
        const h = window.innerHeight;
        const w = Math.min(1000, window.innerWidth);

        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
        this.renderer.setSize(w, h, false);

        this.width = w;
        this.height = h;

        const bannerH = this.banner ? this.banner.offsetHeight : 100;
        const bottomMargin = 10;
        const topMargin = bannerH + 20;
        const avail = Math.max(320, this.height - topMargin - bottomMargin);

        const fov = 45;
        const aspect = w / h;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
        this.camera.position.set(0, avail * 0.002, 175);
        this.camera.lookAt(0, 0, 0);

        this.group.position.set(0, -avail * 0.004, 0);
    }

    createTree() {
        // 清理旧的
        if (this.points) {
            this.group.remove(this.points);
            this.points.geometry.dispose();
            this.points.material.dispose();
            this.points = null;
        }
        if (this.starPivot) {
            this.group.remove(this.starPivot);
            this.starPivot.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
            this.starPivot = null;
            this.starObj = null;
        }

        if (!this.sprite) this.sprite = this.createParticleTexture();

        const spiralCount = 4500;
        const coneCount = 5000;
        const total = spiralCount + coneCount;

        const positions = new Float32Array(total * 3);
        const colors = new Float32Array(total * 3);

        const baseColors = [
            new THREE.Color(0xf1c40f),
            new THREE.Color(0xe74c3c),
            new THREE.Color(0x2ecc71),
            new THREE.Color(0x3498db),
            new THREE.Color(0x9b59b6)
        ];

        const heightUnits = 110;
        const treeWidth = 40;

        let idx = 0;

        // Spiral
        for (let i = 0; i < spiralCount; i++) {
            const t = i / spiralCount;
            const y = t * heightUnits;
            const angle = t * Math.PI * 20 + Math.random() * Math.PI * 0.25;
            const radius = (1 - t) * treeWidth * (0.9 + Math.random() * 0.2);

            positions[idx] = Math.cos(angle) * radius;
            positions[idx + 1] = y;
            positions[idx + 2] = Math.sin(angle) * radius;

            const c = baseColors[Math.floor(Math.random() * baseColors.length)];
            colors[idx] = c.r * (0.6 + 0.2 * Math.random());
            colors[idx + 1] = c.g * (0.6 + 0.2 * Math.random());
            colors[idx + 2] = c.b * (0.6 + 0.2 * Math.random());
            idx += 3;
        }

        // Cone
        const maxRadius = treeWidth * 0.7;
        for (let i = 0; i < coneCount; i++) {
            const t = i / coneCount;
            const y = t * heightUnits;
            const radius = (1 - t) * maxRadius * (0.9 + Math.random() * 0.15);
            const angle = Math.random() * Math.PI * 2;

            positions[idx] = Math.cos(angle) * radius;
            positions[idx + 1] = y;
            positions[idx + 2] = Math.sin(angle) * radius;

            const c = baseColors[Math.floor(Math.random() * baseColors.length)];
            colors[idx] = c.r * (0.5 + 0.3 * Math.random());
            colors[idx + 1] = c.g * (0.5 + 0.3 * Math.random());
            colors[idx + 2] = c.b * (0.5 + 0.3 * Math.random());
            idx += 3;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: this.sprite,
            alphaTest: 0.1,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(geometry, material);
        this.points.position.y = -heightUnits * 0.6;
        this.group.add(this.points);

        // ===== ⭐ Star =====
        const topY = this.points.position.y + heightUnits;

        this.starPivot = new THREE.Object3D();

        // ✅（你之前要求）拉开一点距离：紧挨但不重合
        this.starPivot.position.set(0, topY + 5.6, 0);

        // ✅ 3D 星体（顶角朝上 + 挤出厚度 + 描边 + 光晕）
        this.starObj = this.createStarObject3D({
            outer: 5.4,
            inner: 2.35,
            depth: 1.25
        });

        this.starPivot.add(this.starObj);
        this.group.add(this.starPivot);

        // 重置角度，避免重建后角度突变
        this.treeAngle = 0;
        this.clock.getDelta(); // flush
    }

    animate() {
        const dt = this.clock.getDelta();

        // ✅ 速度：与原先 t*0.12 对齐，但用 dt 累积
        const speed = 0.12;
        this.treeAngle += dt * speed;

        if (this.points) {
            // 树自转：严格单向递增（不会“转一圈又反向回去”）
            this.points.rotation.y = this.treeAngle;

            const t = this.clock.elapsedTime; // 只用于呼吸闪烁等
            const s = 1 + Math.sin(t * 1.1) * 0.015;
            this.points.scale.set(s, s, s);
        }

        if (this.starPivot && this.starObj) {
            // 星星跟随树转（方向一致、单调）
            this.starPivot.rotation.y = this.treeAngle;

            // ✅ 始终保持直立：禁止任何倾斜与倒转
            // 关键：starObj 不做 Z 自旋，不做 X 倾斜，顶角永远竖直向上
            this.starObj.rotation.set(0, 0, 0);

            // 轻微“呼吸”缩放（不改变姿态）
            const t = this.clock.elapsedTime;
            const twinkle = 1 + Math.sin(t * 2.0) * 0.05;
            this.starObj.scale.set(twinkle, twinkle, twinkle);

            // 同步点光源位置
            this.starLight.position.copy(this.starPivot.getWorldPosition(new THREE.Vector3()));
            this.starLight.position.y += 2.0;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    createParticleTexture() {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
        g.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    createGlowTexture() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

        g.addColorStop(0.0, 'rgba(255, 233, 170, 0.95)');
        g.addColorStop(0.25, 'rgba(255, 220, 120, 0.55)');
        g.addColorStop(0.55, 'rgba(255, 205, 90, 0.20)');
        g.addColorStop(1.0, 'rgba(255, 205, 90, 0.0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    /**
     * ⭐ 3D 星体对象（Group）
     * ✅ 保证：固定一个顶角永远在 +Y（竖直朝上），不会生成倒星
     */
    createStarObject3D({ outer, inner, depth }) {
        const group = new THREE.Group();

        // —— 1) 2D 星形：从 +Y 顶点开始（关键修复：顶角朝上）
        const spikes = 5;
        const step = Math.PI / spikes;

        // ✅ 这里必须是 +Math.PI/2 才是 (0, +outer)
        let rot = Math.PI / 2;

        const shape = new THREE.Shape();
        shape.moveTo(Math.cos(rot) * outer, Math.sin(rot) * outer);

        // 采用“内点/外点交替”且不重复首点的稳定写法
        for (let i = 0; i < spikes; i++) {
            rot += step;
            shape.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);

            rot += step;
            shape.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
        }
        shape.closePath();

        // —— 2) 挤出为 3D
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness: depth * 0.32,
            bevelSize: depth * 0.28,
            bevelSegments: 2,
            curveSegments: 12
        });
        geo.center();

        // —— 3) 材质：柔金 + 轻微自发光
        const starMat = new THREE.MeshStandardMaterial({
            color: 0xffd56b,
            emissive: 0xffc24a,
            emissiveIntensity: 0.45,
            roughness: 0.45,
            metalness: 0.35,
            transparent: true,
            opacity: 0.98
        });

        const starMesh = new THREE.Mesh(geo, starMat);
        starMesh.renderOrder = 999;
        starMesh.material.depthTest = false;
        starMesh.material.depthWrite = false;
        group.add(starMesh);

        // —— 4) 描边
        const edges = new THREE.EdgesGeometry(geo, 25);
        const edgeMat = new THREE.LineBasicMaterial({
            color: 0xfff1b0,
            transparent: true,
            opacity: 0.55,
            depthTest: false
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        edgeLines.renderOrder = 1000;
        group.add(edgeLines);

        // —— 5) 光晕（sprite 始终朝相机是正常的，它不改变星体的“顶角朝上”）
        const glowTex = this.createGlowTexture();
        const glowMat = new THREE.SpriteMaterial({
            map: glowTex,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });
        const glow = new THREE.Sprite(glowMat);
        glow.scale.set(22, 22, 1);
        glow.position.set(0, 0, -depth * 0.6);
        glow.renderOrder = 998;
        group.add(glow);

        // ✅ 初始姿态：直立
        group.rotation.set(0, 0, 0);

        return group;
    }
}
