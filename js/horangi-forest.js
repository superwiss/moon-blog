/* js/horangi-forest.js */

const reincarnatedImg = new Image();
reincarnatedImg.src = "./assets/images/horangi_reincarnation.png";

// Dynamic background transparency processor (color keying)
let transparentReincarnatedCanvas = null;

function processImageTransparency(img) {
    if (transparentReincarnatedCanvas) return transparentReincarnatedCanvas;
    if (!img.complete || img.naturalWidth === 0) return null;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    const width = tempCanvas.width;
    const height = tempCanvas.height;
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Add corners to queue
    const corners = [
        [0, 0],
        [width - 1, 0],
        [0, height - 1],
        [width - 1, height - 1]
    ];
    for (const [cx, cy] of corners) {
        const idx = cy * width + cx;
        visited[idx] = 1;
        queue.push([cx, cy]);
    }

    const isWhite = (r, g, b, a) => {
        if (a === 0) return true;
        return r > 230 && g > 230 && b > 230; // Close to white threshold
    };

    let head = 0;
    while (head < queue.length) {
        const [cx, cy] = queue[head++];
        const idx = (cy * width + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (isWhite(r, g, b, a)) {
            data[idx + 3] = 0; // Make transparent

            const neighbors = [
                [cx - 1, cy],
                [cx + 1, cy],
                [cx, cy - 1],
                [cx, cy + 1]
            ];
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx;
                    if (visited[nIdx] === 0) {
                        visited[nIdx] = 1;
                        queue.push([nx, ny]);
                    }
                }
            }
        }
    }

    tempCtx.putImageData(imgData, 0, 0);
    transparentReincarnatedCanvas = tempCanvas;
    return tempCanvas;
}

// ==========================================
// 1. Web Audio API Sound Synthesizer (Magical & Local)
// ==========================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.bgmInterval = null;
        this.isPlayingBGM = false;
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

    // Magical chime for buttons
    playChime() {
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        for (let i = 0; i < 3; i++) {
            const time = now + i * 0.08;
            const freq = freqs[Math.floor(Math.random() * freqs.length)];
            this.synthTone(freq, 0.12, 0.5, time, 'sine');
        }
    }

    // Heavy mysterious chime for transition
    playChimeLow() {
        this.init();
        const now = this.ctx.currentTime;
        this.synthTone(196.00, 0.15, 1.5, now, 'triangle'); // G3
        this.synthTone(293.66, 0.1, 1.2, now + 0.1, 'sine'); // D4
        this.synthTone(392.00, 0.08, 1.0, now + 0.2, 'sine'); // G4
    }

    // Cute FM "chomp chomp" sound for feeding
    playEat() {
        this.init();
        const now = this.ctx.currentTime;
        
        for (let i = 0; i < 3; i++) {
            const time = now + i * 0.15;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(70, time + 0.1);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.2, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.15);
        }
    }

    // Sparkling bell arpeggio for playing
    playPlay() {
        this.init();
        const now = this.ctx.currentTime;
        const scale = [587.33, 659.25, 783.99, 880.00, 987.77, 1174.66]; // D5, E5, G5, A5, B5, D6
        
        for (let i = 0; i < 5; i++) {
            const time = now + i * 0.1;
            const freq = scale[i % scale.length];
            this.synthTone(freq, 0.08, 0.8, time, 'sine');
            
            // Sparkling high harmonics
            this.synthTone(freq * 2.01, 0.03, 0.3, time, 'sine');
        }
    }

    // Soft sweep and pop for sweep cleaning
    playSweep() {
        this.init();
        const now = this.ctx.currentTime;
        
        // Noise buffer sweep
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.2);
        
        // High sparkling bell chime at completion
        setTimeout(() => {
            this.synthTone(1567.98, 0.08, 0.6, this.ctx.currentTime, 'sine'); // G6
        }, 120);
    }

    // Large sweeping fanfare for Level Up/Evolution
    playLevelUp() {
        this.init();
        const now = this.ctx.currentTime;
        const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 chord glissando
        
        chord.forEach((freq, idx) => {
            const time = now + idx * 0.08;
            this.synthTone(freq, 0.12, 1.2, time, 'triangle');
            this.synthTone(freq * 1.5, 0.05, 0.8, time + 0.02, 'sine');
            this.synthTone(freq * 2, 0.03, 0.5, time + 0.04, 'sine');
        });
        
        // Final massive climax chord
        setTimeout(() => {
            const climaxTime = this.ctx.currentTime;
            this.synthTone(523.25, 0.2, 2.0, climaxTime, 'triangle');
            this.synthTone(783.99, 0.15, 2.0, climaxTime, 'sine');
            this.synthTone(1046.50, 0.12, 2.5, climaxTime, 'sine');
            this.synthTone(1318.51, 0.1, 2.2, climaxTime, 'sine');
        }, 600);
    }

    // Helper to synthesize a simple FM bell/pluck tone
    synthTone(freq, volume, duration, startTime, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }

    // Play cheerful royalty-free MP3 BGM (Ukulele Trip!)
    startAmbientBGM() {
        if (this.isPlayingBGM) return;
        this.isPlayingBGM = true;
        
        if (!this.bgmAudio) {
            this.bgmAudio = new Audio("./assets/audio/ukulele-trip.mp3");
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0;
        }
        
        this.bgmAudio.play().then(() => {
            let vol = 0;
            const interval = setInterval(() => {
                if (!this.isPlayingBGM || !this.bgmAudio) {
                    clearInterval(interval);
                    return;
                }
                vol += 0.04;
                if (vol >= 0.35) {
                    vol = 0.35;
                    clearInterval(interval);
                }
                this.bgmAudio.volume = vol;
            }, 100);
        }).catch(e => {
            console.log("BGM autoplay prevented.", e);
        });
    }

    stopAmbientBGM() {
        this.isPlayingBGM = false;
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
// 2. Tamagotchi State & LocalStorage Bindings
// ==========================================
const DEFAULT_STATE = {
    level: 1,
    xp: 0,
    hunger: 60,
    happy: 60,
    clean: 100,
    stage: 1, // 1: Seed 🥚, 2: Worm 🐛, 3: Fairy 🧚, 4: Butterfly 🦋, 5: Reincarnated Spirit 👧✨
    unlockedSprouts: false
};

let state = { ...DEFAULT_STATE };

function loadState() {
    const saved = localStorage.getItem('horangi_tamagotchi_data');
    if (saved) {
        try {
            state = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        } catch(e) {
            state = { ...DEFAULT_STATE };
        }
    } else {
        state = { ...DEFAULT_STATE };
    }
    updateGaugesUI();
}

function saveState() {
    localStorage.setItem('horangi_tamagotchi_data', JSON.stringify(state));
}

function updateGaugesUI() {
    // If in final stage 5, lock all stats to 100% (peaceful eternity)
    if (state.stage === 5) {
        state.hunger = 100;
        state.happy = 100;
        state.clean = 100;
        state.xp = 0;
    }

    // Limits
    state.hunger = Math.max(0, Math.min(100, state.hunger));
    state.happy = Math.max(0, Math.min(100, state.happy));
    state.clean = Math.max(0, Math.min(100, state.clean));
    
    // Update labels
    document.getElementById('hunger-val').textContent = `${Math.round(state.hunger)}%`;
    document.getElementById('happy-val').textContent = `${Math.round(state.happy)}%`;
    document.getElementById('clean-val').textContent = `${Math.round(state.clean)}%`;
    
    // Update Bar Widths
    document.getElementById('gauge-hunger').style.width = `${state.hunger}%`;
    document.getElementById('gauge-happy').style.width = `${state.happy}%`;
    document.getElementById('gauge-clean').style.width = `${state.clean}%`;
    
    // Colors based on health
    document.getElementById('gauge-hunger').style.background = state.hunger < 25 ? '#ef5350' : '#a5d6a7';
    document.getElementById('gauge-happy').style.background = state.happy < 25 ? '#ef5350' : '#ffb74d';
    document.getElementById('gauge-clean').style.background = state.clean < 25 ? '#ef5350' : '#81c784';
    
    // Update XP
    if (state.stage === 5) {
        document.getElementById('xp-val').textContent = `MAX`;
        document.getElementById('gauge-xp').style.width = `100%`;
    } else {
        const maxXp = getXpLimit(state.stage);
        document.getElementById('xp-val').textContent = `${state.xp}/${maxXp}`;
        document.getElementById('gauge-xp').style.width = `${(state.xp / maxXp) * 100}%`;
    }
    
    // Update Level badge
    document.getElementById('spirit-level-val').textContent = state.level;
    
    // Update Stage Badge
    const stageDetails = getStageDetails(state.stage);
    document.getElementById('spirit-emoji').textContent = stageDetails.emoji;
    document.getElementById('spirit-stage-text').textContent = stageDetails.name;
}

function getXpLimit(stage) {
    if (stage === 1) return 100;
    if (stage === 2) return 200;
    if (stage === 3) return 300;
    if (stage === 4) return 400; // 400 XP to evolve from Butterfly to Reincarnation யோஜியா!
    return 999; // Final stage cap
}

function getStageDetails(stage) {
    switch (stage) {
        case 1: return { name: "빛 방울 알", emoji: "🥚", scale: 1.0 };
        case 2: return { name: "꼬물 애벌레", emoji: "🐛", scale: 1.1 };
        case 3: return { name: "영혼 요정", emoji: "🧚", scale: 1.25 };
        case 4: return { name: "은하 나비", emoji: "🦋", scale: 1.4 };
        case 5: return { name: "수호 요정 환생", emoji: "👧✨", scale: 0.55 }; // child drawing!
        default: return { name: "아기 영혼", emoji: "🥚", scale: 1.0 };
    }
}

// ==========================================
// 3. Dynamic Dialogue Speech Bubble Quotes
// ==========================================
const FEED_QUOTES = [
    "우와! 이슬 상추 진짜 싱싱하고 시원해! 사각사각! 🥬",
    "냠냠! 은하 잎사귀를 먹으니 몸이 별빛으로 채워지는 것 같아! ✨🍃",
    "와아! 달빛 열매는 새콤달콤 꿀맛이야! 너무 행복해! 🍓",
    "루시야, 밥 챙겨줘서 너무너무 고마워! 배가 든든해! 💚"
];

const PLAY_QUOTES = [
    "아하하! 깃털 간지럼 짱 간지러워! 꼬물꼬물~ 🪶💫",
    "딩동댕동~ 오르골 소리가 꼭 하늘나라 멜로디 같아! 🔔🎶",
    "루시랑 은하수 위에서 댄스 댄스! 한 바퀴 회전 덤블링! 💫🕺",
    "루시와 노는 시간이 하루 중 가장 짜릿하고 신나! 🎈⭐"
];

const CLEAN_QUOTES = [
    "스윽스윽! 슬픔 먼지가 싹 사라지니 마음이 깃털처럼 가벼워! 🧹✨",
    "우와! 숲 속이 온통 반짝반짝 빛나게 맑아졌어! 퐁퐁! 💖",
    "어둠을 몰아내 줘서 고마워 루시야. 이제 내 발등이 투명해질 정도로 맑아! 🧹",
    "정화 요정 루시 만세! 숲에 초록 꽃들이 돋아날 것 같아! 🌟"
];

const ANGRY_QUOTES = [
    "루시야... 나 조금 배가 고파서 몸이 투명해지려고 해... 🥬",
    "요즘 놀아주지 않아서 마음속에 슬픈 구름방울이 쌓였나 봐... 🎈",
    "어두운 슬픔 먼지들이 나를 덮으려 해. 🧹 빗자루로 정화해 줄래?"
];

const LEVEL_UP_QUOTES = [
    "우와앗! 내 몸속에서 엄청 따뜻하고 찬란한 별빛 마법이 부글부글 끓어올라!! ✨",
    "보여, 루시야? 내 날개가 파르르 펄럭이며 더 넓은 하늘을 부르고 있어! 🦋🧚",
    "사랑을 듬뿍 받아 드디어 성장에 성공했어! 루시 요정 최고! 💖✨",
    "루시야! 네가 날 위해 그려준 바로 그 모습이야! 너무 마음에 들어, 항상 함께할게! 👧✨💚"
];

function setDialogue(text) {
    const bubble = document.getElementById('speech-bubble');
    bubble.style.transform = 'scale(0.95)';
    bubble.style.opacity = '0.5';
    
    setTimeout(() => {
        bubble.textContent = text;
        bubble.style.transform = 'scale(1)';
        bubble.style.opacity = '1';
    }, 150);
}

// ==========================================
// 4. Procedural Interactive Canvas Engine
// ==========================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth = 0;
let canvasHeight = 0;

let vTime = 0;
let spiritX = 0;
let spiritY = 0;
let spiritTargetX = 0;
let spiritTargetY = 0;

let isEating = false;
let eatingProgress = 0;
let currentFoodItem = null;

let isPlaying = false;
let playProgress = 0;
let currentPlayItem = null;
let playSpinAngle = 0;

let particles = [];
let darkDusts = [];

let isSweepingActive = false;

let mouseX = null;
let mouseY = null;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    if (spiritX === 0) {
        spiritX = canvasWidth / 2;
        spiritY = canvasHeight / 2 + 10;
        spiritTargetX = spiritX;
        spiritTargetY = spiritY;
    }
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

// Particle Generator
class VisualParticle {
    constructor(x, y, color, type = 'star') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type; // 'star', 'heart', 'glow', 'leaf', 'dust'
        this.size = 2 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.8;
        this.gravity = type === 'leaf' ? 0.05 : -0.02;
        this.opacity = 1;
        this.life = 0.015 + Math.random() * 0.02;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.opacity -= this.life;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        if (this.type === 'star') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'heart') {
            ctx.font = `${this.size * 2}px sans-serif`;
            ctx.fillText('💖', this.x, this.y);
        } else if (this.type === 'leaf') {
            ctx.font = `${this.size * 2}px sans-serif`;
            ctx.fillText('🍃', this.x, this.y);
        } else if (this.type === 'dust') {
            ctx.fillStyle = 'rgba(60,50,55,0.7)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Generate Dark Sadness Dust in Canvas
function spawnDarkDust() {
    if (state.stage >= 4) return; // Butterfly and Reincarnated Spirit have zero sadness!
    
    if (darkDusts.length < 5 && Math.random() > 0.4) {
        // Spawn coordinates away from edges
        const dx = 40 + Math.random() * (canvasWidth - 80);
        const dy = 60 + Math.random() * (canvasHeight - 120);
        
        darkDusts.push({
            id: Date.now() + Math.random(),
            x: dx,
            y: dy,
            size: 20 + Math.random() * 15,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            wobbleRange: 5 + Math.random() * 8,
            offset: Math.random() * 100
        });
        
        // Lower cleanliness
        state.clean = Math.max(0, state.clean - 12);
        updateGaugesUI();
        saveState();
        
        if (state.clean < 35 && Math.random() > 0.5) {
            setDialogue(ANGRY_QUOTES[2]);
        }
    }
}

// 12-second periodic spawn loop
setInterval(spawnDarkDust, 12000);

// Canvas Main Loop
function updateAndRender() {
    vTime += 0.03;
    
    // Clear screen dynamically based on night theme
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Smooth follow target physics for spirit
    if (isEating && eatingProgress < 0.6) {
        // Move towards food item (placed at 320, 150)
        spiritTargetX = 290;
        spiritTargetY = 160;
    } else if (state.stage === 5) {
        // Stage 5: Stay perfectly centered in the screen frame, only 3D depth pulsing is applied
        spiritTargetX = canvasWidth / 2;
        spiritTargetY = canvasHeight / 2 + 10;
    } else if (state.stage === 4) {
        // Butterfly fly in 8-shape trajectory naturally
        const t = vTime * 0.8;
        spiritTargetX = canvasWidth / 2 + Math.sin(t) * 110;
        spiritTargetY = canvasHeight / 2 - 20 + Math.sin(t * 2) * 45;
    } else {
        // Natural gentle idle drifting
        spiritTargetX = canvasWidth / 2 + Math.sin(vTime * 0.5) * 25;
        spiritTargetY = canvasHeight / 2 + Math.cos(vTime * 0.7) * 12;
    }
    
    spiritX += (spiritTargetX - spiritX) * 0.06;
    spiritY += (spiritTargetY - spiritY) * 0.06;
    
    // 1. Draw floating ambient path seeds (Glowing specs)
    if (Math.random() > 0.88) {
        // Spawn sparkles from spirit body
        const color = state.stage === 5 ? 'rgba(255, 182, 193, 0.8)' : (state.stage === 4 ? 'rgba(255, 235, 120, 0.8)' : 'rgba(200, 255, 200, 0.6)');
        const type = state.stage === 5 ? 'heart' : (state.stage === 3 ? 'leaf' : 'star');
        particles.push(new VisualParticle(spiritX + (Math.random()*40 - 20), spiritY + (Math.random()*40 - 20), color, type));
    }
    
    // 2. Draw Sadness Dark Dust on Canvas (Floating cloudlets)
    darkDusts.forEach(dust => {
        const wobble = Math.sin(vTime * 3 + dust.offset) * dust.wobbleRange;
        
        ctx.save();
        ctx.translate(dust.x, dust.y + wobble);
        
        // Watercolor dark blotch gradient
        const radGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, dust.size);
        radGrad.addColorStop(0, 'rgba(80, 70, 85, 0.7)');
        radGrad.addColorStop(0.5, 'rgba(60, 50, 65, 0.45)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, dust.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tiny sad floating droplet shapes inside it
        ctx.fillStyle = 'rgba(20, 10, 30, 0.3)';
        ctx.font = '12px sans-serif';
        ctx.fillText('💧', -6, 4);
        
        ctx.restore();
    });
    
    // 3. Draw Active Food / Play Item animation
    if (isEating) {
        eatingProgress += 0.015;
        const foodX = 300;
        const foodY = 160;
        
        if (eatingProgress < 1.0) {
            drawFoodItem(currentFoodItem, foodX, foodY, 1 - eatingProgress);
            
            // Feeding spark particles
            if (Math.random() > 0.7) {
                particles.push(new VisualParticle(foodX, foodY, 'rgba(197, 225, 165, 0.9)', 'star'));
            }
        } else {
            isEating = false;
            currentFoodItem = null;
        }
    }
    
    if (isPlaying) {
        playProgress += 0.018;
        playSpinAngle = Math.sin(playProgress * Math.PI) * 45;
        
        if (playProgress < 1.0) {
            drawPlayItem(currentPlayItem, spiritX - 45, spiritY - 50, playProgress);
            
            // Heart spark particles
            if (Math.random() > 0.65) {
                particles.push(new VisualParticle(spiritX, spiritY - 20, '#ff80ab', 'heart'));
            }
        } else {
            isPlaying = false;
            currentPlayItem = null;
        }
    }
    
    // 4. DRAW HORANGI SPIRIT (PROCEDURAL STAGE BASED)
    ctx.save();
    
    // Ambient spirit drop shadow glow
    ctx.shadowBlur = state.stage === 4 ? 25 : 12;
    ctx.shadowColor = state.stage === 4 ? 'rgba(255, 235, 150, 0.8)' : (state.stage === 3 ? '#c5a3ff' : '#a5d6a7');
    
    ctx.translate(spiritX, spiritY);
    
    // Play full-spin flip animation if happy & playing
    if (isPlaying) {
        ctx.rotate(playProgress * Math.PI * 2);
    }
    
    const stageDetails = getStageDetails(state.stage);
    
    if (state.stage === 1) {
        // STAGE 1: Spirit Egg 🥚 (Pulsing shiny watercolor seed)
        const pulse = 1 + Math.sin(vTime * 4.5) * 0.08;
        
        // Outer glowing oval
        ctx.fillStyle = 'rgba(230, 245, 220, 0.85)';
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24 * pulse, 30 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner embryo wiggling shadow
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#3b2f2f';
        ctx.beginPath();
        ctx.arc(-2, 5 + Math.sin(vTime * 3) * 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Egg highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -10, 4, 0, Math.PI * 2);
        ctx.fill();
        
    } else if (state.stage === 2 || state.stage === 3) {
        // STAGE 2 & 3: Caterpillar Spirit (Baby Worm & Spirit Fairy)
        const stretch = 1 + Math.sin(vTime * 4.5) * 0.12;
        
        // Special Wings for STAGE 3 (Spirit Fairy)
        if (state.stage === 3) {
            ctx.save();
            ctx.translate(-22, -18);
            const wingFlap = Math.sin(vTime * 9) * 0.7; // Fast flutter
            
            // Draw transparent butterfly wings
            ctx.fillStyle = 'rgba(197, 202, 233, 0.65)'; // Soft blue fairy wing
            ctx.strokeStyle = '#a3c4f3';
            ctx.lineWidth = 1.5;
            
            // Top Wing
            ctx.beginPath();
            ctx.ellipse(0, -10, 20, 28, Math.PI/4 + wingFlap, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            
            // Bottom Wing
            ctx.beginPath();
            ctx.ellipse(-5, 8, 12, 18, -Math.PI/6 + wingFlap*0.5, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        
        // Caterpillar body sections (Procedural worm segmentation)
        ctx.fillStyle = 'rgba(220, 240, 200, 0.9)'; // Soft lime worm
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 3.5;
        
        const segmentCount = 6;
        for (let i = 0; i < segmentCount; i++) {
            ctx.save();
            // Wave offset for inchworm wiggling
            const segmentX = -i * 14 * stretch;
            const segmentY = Math.sin(vTime * 4.5 - i * 0.6) * 6;
            const size = 11 - (i * 0.75); // Tapers into tail
            
            ctx.translate(segmentX, segmentY);
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Soft shadow highlight
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.beginPath();
            ctx.arc(-2, -3, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw head
        ctx.save();
        const headY = Math.sin(vTime * 4.5) * 2 - 2;
        ctx.translate(14, headY);
        
        ctx.fillStyle = 'rgba(215, 235, 190, 0.95)';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Smiling Eyes
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        
        // Left eye
        ctx.beginPath();
        if (isPlaying) {
            ctx.arc(2, -4, 3.5, 0, Math.PI * 2); // open happy eyes!
            ctx.fillStyle = '#3e2723';
            ctx.fill();
        } else {
            ctx.arc(2, -4, 2.5, Math.PI, Math.PI * 2); // happy crescent eyes
            ctx.stroke();
        }
        
        // Cute rosy cheeks
        ctx.fillStyle = 'rgba(255, 128, 171, 0.55)';
        ctx.beginPath();
        ctx.arc(6, 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#c2185b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(1, 1, 3.5, 0, Math.PI * 0.95);
        ctx.stroke();
        
        // Antennae (쫑긋 더듬이 - wiggle)
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 2.5;
        const antWobble = Math.sin(vTime * 5.5) * 4;
        
        ctx.beginPath();
        ctx.moveTo(-2, -10);
        ctx.quadraticCurveTo(2 + antWobble, -22, 5 + antWobble, -26);
        ctx.stroke();
        
        // Star bulb antenna tip
        ctx.fillStyle = '#fff59d'; // yellow star bulb
        ctx.beginPath();
        ctx.arc(5 + antWobble, -26, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
    } else if (state.stage === 4) {
        // STAGE 4: Celestial Butterfly 🦋 (The peak beautiful evolution!)
        const wingFlap = Math.sin(vTime * 11) * 0.75;
        
        // Radiant glowing body
        ctx.save();
        ctx.fillStyle = '#fff9c4';
        ctx.shadowColor = '#fff59d';
        ctx.shadowBlur = 15;
        
        // Draw elegant butterfly wings (Watercolor rainbow glow!)
        // Left Wings
        ctx.save();
        ctx.translate(-5, 0);
        ctx.scale(1, 1);
        
        // Upper Wing
        const upperGrad = ctx.createRadialGradient(-15, -20, 5, -15, -20, 45);
        upperGrad.addColorStop(0, '#fff59d');
        upperGrad.addColorStop(0.5, '#c5a3ff');
        upperGrad.addColorStop(1, 'rgba(163, 196, 243, 0.15)');
        
        ctx.fillStyle = upperGrad;
        ctx.strokeStyle = '#c5a3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-25, -25, 26, 36, Math.PI/6 - wingFlap*0.8, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        
        // Lower Wing
        ctx.beginPath();
        ctx.ellipse(-18, 12, 16, 22, -Math.PI/6 - wingFlap*0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Right Wings (Symmetric scaleX = -1)
        ctx.save();
        ctx.translate(5, 0);
        ctx.scale(-1, 1);
        
        ctx.fillStyle = upperGrad;
        ctx.strokeStyle = '#c5a3ff';
        ctx.beginPath();
        ctx.ellipse(-25, -25, 26, 36, Math.PI/6 - wingFlap*0.8, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(-18, 12, 16, 22, -Math.PI/6 - wingFlap*0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Draw slender body core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Sparkle head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -25, 7, 0, Math.PI*2);
        ctx.fill();
        
        // Glowing long butterfly antennae
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -28);
        ctx.quadraticCurveTo(-10, -42, -18, -48);
        ctx.moveTo(2, -28);
        ctx.quadraticCurveTo(10, -42, 18, -48);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-18, -48, 3, 0, Math.PI*2);
        ctx.arc(18, -48, 3, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
    } else if (state.stage === 5) {
        // STAGE 5: Reincarnated Guardian Fairy (Daughter's cute drawing!)
        // 3D back-and-forth perspective scaling (zooming in and out)
        const pulse = 0.98 + Math.sin(vTime * 2.2) * 0.15;
        
        ctx.save();
        ctx.shadowColor = 'rgba(255, 182, 193, 0.9)';
        ctx.shadowBlur = 20;
        
        const processedCanvas = processImageTransparency(reincarnatedImg);
        
        if (processedCanvas) {
            // Keep original aspect ratio
            const aspect = processedCanvas.width / processedCanvas.height;
            const h = 230 * pulse; // Large size filling the screen beautifully!
            const w = h * aspect;
            ctx.drawImage(processedCanvas, -w / 2, -h / 2, w, h);
        } else {
            // Fallback text
            ctx.font = '56px sans-serif';
            ctx.fillText('👧✨', -28, 20);
        }
        ctx.restore();
    }
    
    ctx.restore();
    
    // 5. Update and Draw active dynamic particles
    particles.forEach((p, idx) => {
        p.update();
        p.draw();
        if (p.opacity <= 0) {
            particles.splice(idx, 1);
        }
    });
    
    // Request Frame
    requestAnimationFrame(updateAndRender);
}

// Draw static food helper
function drawFoodItem(type, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowBlur = 10;
    
    if (type === 'lettuce') {
        // Watery green lettuce leaf
        ctx.fillStyle = '#a5d6a7';
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#81c784';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-20, -15, -40, 10, -15, 25);
        ctx.bezierCurveTo(5, 30, 25, 15, 0, 0);
        ctx.fill();
        ctx.stroke();
    } else if (type === 'star') {
        // Sparkling blue galaxy leaf
        ctx.fillStyle = '#bbdefb';
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#64b5f6';
        
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(5, -5);
        ctx.lineTo(15, -5);
        ctx.lineTo(7, 2);
        ctx.lineTo(10, 12);
        ctx.lineTo(0, 5);
        ctx.lineTo(-10, 12);
        ctx.lineTo(-7, 2);
        ctx.lineTo(-15, -5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (type === 'berry') {
        // Soft glowing berry
        ctx.fillStyle = '#ff80ab';
        ctx.strokeStyle = '#c2185b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff4081';
        
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Leaf cap
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(0, -3);
        ctx.lineTo(8, -8);
        ctx.lineTo(0, -12);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw static play item helper
function drawPlayItem(type, x, y, progress) {
    const pulseY = Math.sin(progress * Math.PI) * 20; // floating bounce
    
    ctx.save();
    ctx.translate(x, y - pulseY);
    ctx.rotate(playSpinAngle * Math.PI / 180);
    ctx.shadowBlur = 10;
    
    if (type === 'feather') {
        ctx.font = '24px sans-serif';
        ctx.shadowColor = '#ffe082';
        ctx.fillText('🪶', -12, 12);
    } else if (type === 'bell') {
        ctx.font = '24px sans-serif';
        ctx.shadowColor = '#fff59d';
        ctx.fillText('🔔', -12, 12);
    } else if (type === 'dance') {
        ctx.font = '24px sans-serif';
        ctx.shadowColor = '#c5a3ff';
        ctx.fillText('💫', -12, 12);
    }
    
    ctx.restore();
}

// Handle clicking on Canvas to sweep sadness dust directly!
canvas.addEventListener('click', (e) => {
    // Canvas click offset
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    if (isSweepingActive) {
        let sweptAny = false;
        
        darkDusts.forEach((dust, idx) => {
            const distance = Math.hypot(clickX - dust.x, clickY - dust.y);
            if (distance < dust.size + 15) {
                // Popped!
                sweptAny = true;
                darkDusts.splice(idx, 1);
                
                // Audio pop
                synth.playSweep();
                
                // Sparkle particles
                for(let i=0; i<10; i++) {
                    particles.push(new VisualParticle(dust.x, dust.y, 'rgba(120, 200, 255, 0.85)', 'star'));
                    particles.push(new VisualParticle(dust.x, dust.y, 'rgba(60,50,55,0.3)', 'dust'));
                }
                
                // Add XP & Cleanliness
                state.clean = Math.min(100, state.clean + 20);
                gainXP(15);
            }
        });
        
        if (sweptAny) {
            setDialogue(CLEAN_QUOTES[Math.floor(Math.random() * CLEAN_QUOTES.length)]);
            updateGaugesUI();
            saveState();
        }
    } else {
        // Regular tickling / tapping on Horangi
        const distanceToSpirit = Math.hypot(clickX - spiritX, clickY - spiritY);
        if (distanceToSpirit < 40) {
            // Heart burst!
            synth.playChime();
            for(let i=0; i<8; i++) {
                particles.push(new VisualParticle(spiritX, spiritY, '#ff80ab', 'heart'));
            }
            
            state.happy = Math.min(100, state.happy + 8);
            gainXP(5);
            setDialogue("히힛 루시가 나를 콕 찔러줬어! 마법 부적 같아! ✨");
            updateGaugesUI();
            saveState();
        }
    }
});

// Trigger XP Gain & Evolution Check
function gainXP(amount) {
    if (state.stage === 5) return; // Reincarnated spirit is fully evolved!
    
    state.xp += amount;
    const maxXp = getXpLimit(state.stage);
    
    if (state.xp >= maxXp) {
        // Evolve!
        state.xp = state.xp - maxXp; // carry over
        state.stage++;
        state.level++;
        
        // Full heal
        state.hunger = 100;
        state.happy = 100;
        state.clean = 100;
        
        // Save states
        saveState();
        updateGaugesUI();
        
        // Show evolve modal
        triggerEvolutionClimax();
    } else {
        saveState();
        updateGaugesUI();
    }
}

// Evolution climax modal and special effects
const evolveModal = document.getElementById('evolve-modal');
const evolveCloseBtn = document.getElementById('evolve-close-btn');
const evolveOkBtn = document.getElementById('evolve-ok-btn');

function triggerEvolutionClimax() {
    synth.playLevelUp();
    
    // Confetti particles burst
    for(let i=0; i<50; i++) {
        particles.push(new VisualParticle(canvasWidth/2, canvasHeight/2, `hsla(${Math.random()*360}, 90%, 80%, 1)`, 'star'));
        if (Math.random() > 0.5) {
            particles.push(new VisualParticle(canvasWidth/2, canvasHeight/2, '#ff80ab', 'heart'));
        }
    }
    
    const details = getStageDetails(state.stage);
    document.getElementById('evolve-stub-emoji').textContent = details.emoji;
    
    const subtitles = {
        2: "꼬물꼬물 빛나는 아기 애벌레로 다시 태어났어요!",
        3: "파닥파닥 앙증맞은 요정의 날개가 돋아났어요!",
        4: "은하수를 자유롭게 비행하는 전설의 환상 나비 우화 대성공!",
        5: "루시가 그린 사랑스러운 수호 요정으로 환생했어요! 👧✨"
    };
    document.getElementById('evolve-modal-subtitle').textContent = subtitles[state.stage] || "빛의 성장에 성공했습니다!";
    
    const descs = {
        2: "루시가 정성 들여 먹이고 청소해 준 덕분에 호랑이 알이 부화했어요! 이제 초록빛 몸체에 작고 이쁜 안테나 눈을 쫑긋 세우며 꼬물꼬물 춤출 수 있어요. 🐛✨",
        3: "와! 호랑이의 몸에 반짝거리는 보랏빛 요정 날개가 돋아났어요! 이제 공중에 둥실 떠올라 별가루 궤적을 그리며 숲 속을 신나게 부유할 수 있습니다. 🧚🌿",
        4: "축하합니다! 호랑이가 완전하고 눈부신 '은하 환상 나비'로 최종 우화에 성공했습니다! 호랑이의 영혼은 이제 슬픔과 아픔 없이 밤하늘 가장 높은 곳에서 은하수를 항해하며 영원히 아름다운 날개짓을 보낼 것입니다. 🦋✨",
        5: "기적 같은 일이 일어났어요! 호랑이의 영혼이 루시가 스케치북에 정성껏 그린 사랑 가득한 모습의 '수호 요정'으로 환생했습니다! 숲속의 고통이나 배고픔 없이, 이제 언제나 루시의 곁을 맴돌며 따뜻하게 지켜주는 은하수의 천사가 될 것입니다. 👧✨💚"
    };
    document.getElementById('evolve-modal-desc').textContent = descs[state.stage] || "성공적으로 진화했습니다!";
    
    evolveModal.classList.add('active');
    setDialogue(LEVEL_UP_QUOTES[state.stage - 2] || "와! 내가 성장했어!");
}

evolveCloseBtn.addEventListener('click', () => evolveModal.classList.remove('active'));
evolveOkBtn.addEventListener('click', () => evolveModal.classList.remove('active'));
evolveModal.addEventListener('click', (e) => {
    if (e.target === evolveModal) evolveModal.classList.remove('active');
});

// ==========================================
// 5. Tamagotchi Action UI Handlers
// ==========================================
const btnFeed = document.getElementById('btn-feed');
const btnPlay = document.getElementById('btn-play');
const btnClean = document.getElementById('btn-clean');

const popoverFeed = document.getElementById('popover-feed');
const popoverPlay = document.getElementById('popover-play');

// Active/Deactive Sweeping Brush Cursor
function toggleSweeping(active) {
    isSweepingActive = active;
    if (active) {
        canvas.classList.add('sweeping-active');
        btnClean.classList.add('active');
    } else {
        canvas.classList.remove('sweeping-active');
        btnClean.classList.remove('active');
    }
}

// Close all popovers
function closeAllPopovers() {
    popoverFeed.classList.remove('active');
    popoverPlay.classList.remove('active');
    btnFeed.classList.remove('active');
    btnPlay.classList.remove('active');
}

// Feed buttons triggers
btnFeed.addEventListener('click', (e) => {
    synth.playChime();
    closeAllPopovers();
    toggleSweeping(false);
    
    popoverFeed.classList.add('active');
    btnFeed.classList.add('active');
    e.stopPropagation();
});

// Play buttons triggers
btnPlay.addEventListener('click', (e) => {
    synth.playChime();
    closeAllPopovers();
    toggleSweeping(false);
    
    popoverPlay.classList.add('active');
    btnPlay.classList.add('active');
    e.stopPropagation();
});

// Clean trigger
btnClean.addEventListener('click', (e) => {
    synth.playChime();
    closeAllPopovers();
    
    toggleSweeping(!isSweepingActive);
    
    if (isSweepingActive) {
        setDialogue("먼지 정화 모드 🧹: 화면 속 '어둠의 먼지 솜털'을 직접 탭해서 정화해 주세요!");
    } else {
        setDialogue("정화 모드를 껐어요. 호랑이가 루시와 더 놀고 싶대요! 🎈");
    }
    e.stopPropagation();
});

// Window clicks close popovers
window.addEventListener('click', () => {
    closeAllPopovers();
});

// Popover item action executions
popoverFeed.querySelectorAll('.popover-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const foodType = item.getAttribute('data-food');
        
        isEating = true;
        eatingProgress = 0;
        currentFoodItem = foodType;
        
        // Feed audio
        synth.playEat();
        
        // State updates
        state.hunger = Math.min(100, state.hunger + 25);
        gainXP(12);
        
        // Speech Dialogue quotes selection
        const idx = foodType === 'lettuce' ? 0 : (foodType === 'star' ? 1 : 2);
        setDialogue(FEED_QUOTES[idx]);
        
        updateGaugesUI();
        saveState();
        closeAllPopovers();
        e.stopPropagation();
    });
});

popoverPlay.querySelectorAll('.popover-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const playType = item.getAttribute('data-play');
        
        isPlaying = true;
        playProgress = 0;
        currentPlayItem = playType;
        
        // Play audio
        synth.playPlay();
        
        // State updates
        state.happy = Math.min(100, state.happy + 22);
        gainXP(10);
        
        // Speech Dialogue quotes selection
        const idx = playType === 'feather' ? 0 : (playType === 'bell' ? 1 : 2);
        setDialogue(PLAY_QUOTES[idx]);
        
        updateGaugesUI();
        saveState();
        closeAllPopovers();
        e.stopPropagation();
    });
});

// ==========================================
// 6. Natural Decay Loop (Time tick)
// ==========================================
setInterval(() => {
    if (state.stage >= 4) return; // Butterfly & Reincarnated Spirit achieved nirvana, no hunger/decay!
    
    // Decrement states naturally
    state.hunger = Math.max(0, state.hunger - 0.25);
    state.happy = Math.max(0, state.happy - 0.35);
    
    // Warn if too low
    if (state.hunger < 20 && Math.random() > 0.8) {
        setDialogue(ANGRY_QUOTES[0]);
    } else if (state.happy < 20 && Math.random() > 0.8) {
        setDialogue(ANGRY_QUOTES[1]);
    }
    
    updateGaugesUI();
    saveState();
}, 4000);

// ==========================================
// 7. Ambient BGM & Theme Switcher (Day/Night)
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

const savedTheme = localStorage.getItem('blog_theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    synth.playChime();
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'night' ? 'light' : 'night';
    applyTheme(newTheme);
});

// Audio BGM controller
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
        synth.startAmbientBGM();
        synth.playChime();
    } else {
        audioIconOn.style.display = 'none';
        audioIconOff.style.display = 'block';
        audioToggle.style.borderColor = 'var(--border-color)';
        synth.stopAmbientBGM();
    }
});

// ==========================================
// 8. Outer Star/Firefly background (Floating canvas)
// ==========================================
const bCanvas = document.getElementById('particle-canvas');
const bCtx = bCanvas.getContext('2d');
let bParticles = [];

function resizeBackgroundCanvas() {
    bCanvas.width = window.innerWidth;
    bCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBackgroundCanvas);
resizeBackgroundCanvas();

class AmbientForestParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * bCanvas.height;
    }
    reset() {
        this.x = Math.random() * bCanvas.width;
        this.y = bCanvas.height + 20;
        this.size = 1.5 + Math.random() * 3;
        this.vy = -(0.2 + Math.random() * 0.5);
        this.vx = -0.3 + Math.random() * 0.6;
        this.opacity = 0;
        this.maxOpacity = 0.2 + Math.random() * 0.4;
        this.cycle = Math.random() * Math.PI * 2;
        this.cycleSpeed = 0.01 + Math.random() * 0.02;
    }
    update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.y / 40) * 0.15;
        this.cycle += this.cycleSpeed;
        this.opacity = (Math.sin(this.cycle) + 1) / 2 * this.maxOpacity;
        if (this.y < -20) this.reset();
    }
    draw() {
        const theme = document.body.getAttribute('data-theme') || 'light';
        bCtx.save();
        bCtx.beginPath();
        bCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // soft green firefly for light/night
        const color = theme === 'light' ? `rgba(165, 214, 167, ${this.opacity})` : `rgba(197, 225, 165, ${this.opacity})`;
        bCtx.fillStyle = color;
        bCtx.shadowBlur = 8;
        bCtx.shadowColor = color;
        bCtx.fill();
        bCtx.restore();
    }
}

for (let i = 0; i < 20; i++) {
    bParticles.push(new AmbientForestParticle());
}

function animateBackground() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    bParticles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateBackground);
}
animateBackground();

// ==========================================
// 9. Boot up Engine
// ==========================================
window.addEventListener('load', () => {
    loadState();
    updateAndRender();
    
    // Initial greetings chime after a split second
    setTimeout(() => {
        synth.playChimeLow();
    }, 500);
});
