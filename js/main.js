/* js/main.js */

// ==========================================
// 1. Web Audio API Sound Synthesizer (Magical & Local)
// ==========================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.bgmInterval = null;
        this.isPlayingAmbient = false;
        this.nodes = [];
        this.bgmAudio = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Sparkling magical wind chime sound (Pentatonic Scale)
    playChime() {
        this.init();
        const now = this.ctx.currentTime;
        // Pentatonic C major notes: C5, E5, G5, A5, C6
        const freqs = [523.25, 659.25, 783.99, 880.00, 1046.50];
        
        // Play 4 notes in rapid succession for a sweeping sparkle effect
        for (let i = 0; i < 4; i++) {
            const time = now + i * 0.08;
            const freq = freqs[Math.floor(Math.random() * freqs.length)];
            this.synthBell(freq, time);
        }
    }

    synthBell(freq, startTime) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Triangle wave for soft flute-like bell sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Add a high overtone for sparkling metallic sheen
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.01, startTime); // Slightly out of tune for shimmer
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
        
        overtoneGain.gain.setValueAtTime(0, startTime);
        overtoneGain.gain.linearRampToValueAtTime(0.04, startTime + 0.005);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        
        gain.connect(this.ctx.destination);
        overtoneGain.connect(this.ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 1.3);
        overtone.start(startTime);
        overtone.stop(startTime + 0.6);
    }

    // Locked spring "boing" sound
    playLocked() {
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        // Exponentially slide frequency downwards for a cartoon "boing"
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Play cheerful royalty-free MP3 BGM (Funny Adventures!)
    startAmbient() {
        if (this.isPlayingAmbient) return;
        this.isPlayingAmbient = true;
        
        if (!this.bgmAudio) {
            this.bgmAudio = new Audio("./assets/audio/funny-adventures.mp3");
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0;
        }
        
        this.bgmAudio.play().then(() => {
            let vol = 0;
            const interval = setInterval(() => {
                if (!this.isPlayingAmbient || !this.bgmAudio) {
                    clearInterval(interval);
                    return;
                }
                vol += 0.04;
                if (vol >= 0.3) {
                    vol = 0.3;
                    clearInterval(interval);
                }
                this.bgmAudio.volume = vol;
            }, 100);
        }).catch(e => {
            console.log("Main BGM autoplay prevented.", e);
        });
    }

    stopAmbient() {
        this.isPlayingAmbient = false;
        if (this.bgmAudio) {
            let vol = this.bgmAudio.volume;
            const interval = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0 || !this.bgmAudio) {
                    clearInterval(interval);
                    if (this.bgmAudio) {
                        this.bgmAudio.pause();
                        this.bgmAudio.currentTime = 0;
                    }
                    return;
                }
                this.bgmAudio.volume = vol;
            }, 80);
        }
    }
}

const synth = new SoundSynth();

// ==========================================
// 2. Interactive Theme Switcher (Day/Night 들판)
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const moonFace = document.getElementById('moon-face');

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('blog_theme', theme);
    
    if (theme === 'night') {
        moonFace.textContent = '🌙';
        moonFace.style.transform = 'rotate(-15deg) scale(1.1)';
    } else {
        moonFace.textContent = '☀️';
        moonFace.style.transform = 'rotate(0deg) scale(1)';
    }
}

// Initial theme setup
const savedTheme = localStorage.getItem('blog_theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    synth.playChime();
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'night' ? 'light' : 'night';
    applyTheme(newTheme);
});


// ==========================================
// 3. Audio Controller (BGM ON/OFF)
// ==========================================
const audioToggle = document.getElementById('audio-toggle');
const audioIconOn = document.getElementById('audio-icon-on');
const audioIconOff = document.getElementById('audio-icon-off');

let isMusicPlaying = false;

audioToggle.addEventListener('click', () => {
    isMusicPlaying = !isMusicPlaying;
    
    if (isMusicPlaying) {
        audioIconOn.style.display = 'block';
        audioIconOff.style.display = 'none';
        audioToggle.style.borderColor = 'var(--accent-color)';
        synth.startAmbient();
        synth.playChime();
    } else {
        audioIconOn.style.display = 'none';
        audioIconOff.style.display = 'block';
        audioToggle.style.borderColor = 'var(--border-color)';
        synth.stopAmbient();
    }
});


// ==========================================
// 4. Background Particle Engine (Canvas)
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Day particles: Soft watercolor cherry blossoms / leaves
class Petal {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = 6 + Math.random() * 8;
        this.speedY = 1 + Math.random() * 1.5;
        this.speedX = -0.5 + Math.random() * 1;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = -0.02 + Math.random() * 0.04;
        // Warm watercolor hues: soft peach, light lavender, pastel rose
        const hues = [340, 350, 10, 270, 80]; // pinks, peaches, soft purples, spring greens
        this.hue = hues[Math.floor(Math.random() * hues.length)];
        this.opacity = 0.3 + Math.random() * 0.4;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 30) * 0.3; // Swing side-to-side
        this.angle += this.spin;
        
        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        // Draw an organic leaf/petal shape
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 85%, ${this.opacity})`;
        ctx.fill();
        
        // Soft watercolor outline
        ctx.strokeStyle = `hsla(${this.hue}, 40%, 75%, ${this.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

// Night particles: Glowing fireflies
class FireflyParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Initialize anywhere on load
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = 2 + Math.random() * 3;
        this.speedY = -(0.3 + Math.random() * 0.6);
        this.speedX = -0.4 + Math.random() * 0.8;
        this.opacity = 0;
        this.maxOpacity = 0.5 + Math.random() * 0.5;
        this.glowCycle = Math.random() * Math.PI * 2;
        this.glowSpeed = 0.01 + Math.random() * 0.03;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 20) * 0.2;
        
        this.glowCycle += this.glowSpeed;
        this.opacity = (Math.sin(this.glowCycle) + 1) / 2 * this.maxOpacity;
        
        if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Magical fluorescent lime-green glow
        const glowColor = `rgba(197, 225, 165, ${this.opacity})`;
        const outerGlow = `rgba(197, 225, 165, 0)`;
        
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
        grad.addColorStop(0, glowColor);
        grad.addColorStop(0.3, glowColor);
        grad.addColorStop(1, outerGlow);
        
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
}

// Night shooting stars
class ShootingStar {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width * 0.8;
        this.y = Math.random() * canvas.height * 0.4;
        this.len = 40 + Math.random() * 60;
        this.speed = 10 + Math.random() * 15;
        this.dx = this.speed;
        this.dy = this.speed * 0.5; // diagonal fall
        this.opacity = 0;
        this.active = false;
        this.cooldown = 200 + Math.random() * 400; // Time between shooting stars
    }
    
    update() {
        if (!this.active) {
            this.cooldown--;
            if (this.cooldown <= 0) {
                this.active = true;
                this.opacity = 1;
            }
            return;
        }
        
        this.x += this.dx;
        this.y += this.dy;
        this.opacity -= 0.03;
        
        if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 249, 196, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y - this.len * 0.5);
        ctx.stroke();
        ctx.restore();
    }
}

// Initialize particles
for (let i = 0; i < 25; i++) {
    particles.push(new Petal());
}
for (let i = 0; i < 20; i++) {
    stars.push(new FireflyParticle());
}
const shootingStar = new ShootingStar();

// Mouse tracking for subtle "watercolor ripple" hover
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const theme = document.body.getAttribute('data-theme') || 'light';
    
    if (theme === 'light') {
        // Day - update & draw petals
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    } else {
        // Night - update & draw fireflies and shooting stars
        stars.forEach(s => {
            s.update();
            s.draw();
        });
        shootingStar.update();
        shootingStar.draw();
    }
    
    // Draw subtle magical glow around cursor
    if (mouse.x !== null) {
        ctx.save();
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
        const glowColor = theme === 'light' 
            ? 'rgba(255, 235, 204, 0.12)' 
            : 'rgba(197, 225, 165, 0.08)';
        grad.addColorStop(0, glowColor);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    requestAnimationFrame(animate);
}
animate();


// ==========================================
// 5. Grid Navigation & Wiggle for Locked Cards
// ==========================================
const ttougiCard = document.getElementById('card-ttougi');
const snailCard = document.getElementById('card-snail');
const lockedCards = document.querySelectorAll('.card.locked');

ttougiCard.addEventListener('click', () => {
    synth.playChime();
    // Add page transition effect
    document.body.style.opacity = 0;
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        window.location.href = 'detail.html';
    }, 450);
});

if (snailCard) {
    snailCard.addEventListener('click', () => {
        synth.playChime();
        // Add page transition effect
        document.body.style.opacity = 0;
        document.body.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            window.location.href = 'snail-detail.html';
        }, 450);
    });
}

lockedCards.forEach(card => {
    card.addEventListener('click', (e) => {
        synth.playLocked();
        // Trigger wiggling
        card.classList.remove('shake');
        void card.offsetWidth; // Trigger reflow to restart CSS animation
        card.style.animation = 'gentleShake 0.4s ease';
        
        // Temporary bubble showing "COMING SOON"
        const nameEl = card.querySelector('.card-name');
        const origName = nameEl.textContent;
        nameEl.textContent = "조금만 기다려주세요!🔒";
        nameEl.style.color = "var(--text-secondary)";
        nameEl.style.fontSize = "1.1rem";
        
        setTimeout(() => {
            nameEl.textContent = origName;
            nameEl.style.color = "var(--text-primary)";
            nameEl.style.fontSize = "1.4rem";
            card.style.animation = '';
        }, 1500);
    });
});


// ==========================================
// 6. Horangi's Memorial Grave & Flower-Laying Interaction
// ==========================================
const tombTrigger = document.getElementById('tomb-trigger');
const memorialModal = document.getElementById('memorial-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const flowerCounter = document.getElementById('flower-counter');
const flowerOptions = document.querySelectorAll('.flower-option');

// Load flowers count
let flowerCount = parseInt(localStorage.getItem('horangi_flowers') || '0');
flowerCounter.textContent = flowerCount;

tombTrigger.addEventListener('click', () => {
    synth.playChime();
    document.body.style.opacity = 0;
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        window.location.href = 'horangi-forest.html';
    }, 450);
});

modalCloseBtn.addEventListener('click', () => {
    memorialModal.classList.remove('active');
});

// Close modal if clicked outside
memorialModal.addEventListener('click', (e) => {
    if (e.target === memorialModal) {
        memorialModal.classList.remove('active');
    }
});

// Create a layered flower garden zone in the modal
const modalContainer = memorialModal.querySelector('.modal-card');
const flowerGraveLayer = document.createElement('div');
flowerGraveLayer.className = 'tomb-flower-layer';
modalContainer.appendChild(flowerGraveLayer);

// Render flowers that were placed previously
function renderHistoricalFlowers() {
    flowerGraveLayer.innerHTML = '';
    const displayedCount = Math.min(flowerCount, 25); // Limit screen clutter
    const flowerTypes = ['🌼', '💮', '🌸'];
    
    for (let i = 0; i < displayedCount; i++) {
        const emoji = flowerTypes[i % 3];
        createVisualFlower(emoji, true);
    }
}

// Generate falling flower visual effect
function createVisualFlower(emoji, immediate = false) {
    const flower = document.createElement('span');
    flower.className = 'placed-flower-svg';
    flower.textContent = emoji;
    flower.style.fontSize = '1.3rem';
    
    const randomRotation = -20 + Math.random() * 40;
    const randomLeft = 10 + Math.random() * 80;
    flower.style.setProperty('--rot', `${randomRotation}deg`);
    flower.style.position = 'absolute';
    flower.style.left = `${randomLeft}%`;
    
    if (immediate) {
        flower.style.animation = 'none';
        flower.style.transform = `translateY(0) rotate(${randomRotation}deg)`;
        flowerGraveLayer.appendChild(flower);
    } else {
        flowerGraveLayer.appendChild(flower);
        // Animate count rising
        let count = parseInt(flowerCounter.textContent);
        flowerCounter.textContent = count + 1;
    }
}

flowerOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        synth.playChime();
        const emoji = opt.querySelector('.flower-emoji').textContent;
        
        // Add to storage
        flowerCount++;
        localStorage.setItem('horangi_flowers', flowerCount);
        
        // Visual drop animation
        createVisualFlower(emoji, false);
        
        // Subtle button push feedback
        opt.style.transform = 'scale(0.95)';
        setTimeout(() => {
            opt.style.transform = '';
        }, 150);

        // Flash green border on success
        opt.style.borderColor = 'var(--accent-color)';
        setTimeout(() => {
            opt.style.borderColor = 'var(--border-color)';
        }, 800);
    });
});

