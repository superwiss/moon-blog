/* js/detail.js */

// ==========================================
// 1. Web Audio API Sound Synthesizer (Magical & Grasshopper Chirps)
// ==========================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.bgmInterval = null;
        this.isPlayingAmbient = false;
        this.nodes = [];
        this.chirpInterval = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Magical chime sparkle sound
    playChime() {
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 880.00, 1046.50];
        
        for (let i = 0; i < 4; i++) {
            const time = now + i * 0.08;
            const freq = freqs[Math.floor(Math.random() * freqs.length)];
            this.synthBell(freq, time);
        }
    }

    synthBell(freq, startTime) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.01, startTime);
        
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

    // Synthesize Summer Grasshopper / Cricket Chirp (Realistic buzz sound!)
    startChirp() {
        this.init();
        this.stopChirp();
        
        const playSingleChirp = () => {
            const now = this.ctx.currentTime;
            
            // Meadow grasshoppers rub wings/legs together creating 6kHz to 8kHz high buzzes.
            // We pulse this at 15Hz to simulate the friction.
            const carrierFreq = 6200 + Math.random() * 500;
            const duration = 0.4;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Band pass filter to make it sound thin and metallic like a real insect
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = carrierFreq;
            filter.Q.value = 5.0;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(carrierFreq, now);

            // Volume Modulator (LFO) to create the rapid rubbing effect (pulse at 25Hz)
            const ampMod = this.ctx.createOscillator();
            const ampModGain = this.ctx.createGain();
            ampMod.frequency.value = 25; // 25 wiggles per second
            ampModGain.gain.value = 0.5;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.05); // volume ramp
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            ampMod.connect(ampModGain);
            ampModGain.connect(gain.gain);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            ampMod.start(now);
            osc.stop(now + duration + 0.1);
            ampMod.stop(now + duration + 0.1);
        };

        // Repeated chirps: "슥-슥- 슥-슥-"
        this.chirpInterval = setInterval(() => {
            playSingleChirp();
            // Double chirp rhythm
            setTimeout(() => {
                if (this.chirpInterval) playSingleChirp();
            }, 500);
        }, 1800);
    }

    stopChirp() {
        if (this.chirpInterval) {
            clearInterval(this.chirpInterval);
            this.chirpInterval = null;
        }
    }

    // Ambient generative synthesizer music
    startAmbient() {
        this.init();
        if (this.isPlayingAmbient) return;
        this.isPlayingAmbient = true;

        const synthDrone = (freq, volume, startTime) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            lfo.frequency.setValueAtTime(0.07 + Math.random() * 0.04, startTime);
            lfoGain.gain.setValueAtTime(volume * 0.4, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 2.0);

            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            lfo.start(startTime);
            this.nodes.push(osc, gain, lfo, lfoGain);
        };

        const now = this.ctx.currentTime;
        synthDrone(174.61, 0.08, now); // F3
        synthDrone(220.00, 0.06, now + 0.5); // A3
        synthDrone(261.63, 0.05, now + 1.0); // C4
        synthDrone(349.23, 0.04, now + 1.5); // F4
        synthDrone(440.00, 0.03, now + 2.0); // A4

        const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        this.bgmInterval = setInterval(() => {
            if (this.isPlayingAmbient && Math.random() > 0.3) {
                const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
                this.synthBell(randomFreq, this.ctx.currentTime + Math.random() * 2);
            }
        }, 4000);
    }

    stopAmbient() {
        this.isPlayingAmbient = false;
        clearInterval(this.bgmInterval);
        
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.nodes.forEach(node => {
            if (node.gain && typeof node.gain.setValueAtTime === 'function') {
                try {
                    node.gain.cancelScheduledValues(now);
                    node.gain.setValueAtTime(node.gain.value, now);
                    node.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
                } catch(e) {}
            }
        });
        
        setTimeout(() => {
            this.nodes.forEach(node => {
                try { node.stop(); } catch(e) {}
            });
            this.nodes = [];
        }, 1600);
    }
}

const synth = new SoundSynth();

// ==========================================
// 2. Data Base: Ttougi's 6 Episodes Content
// ==========================================
const EPISODE_DATA = {
    1: {
        title: "1회: 뚜기와의 첫 만남 🟢",
        date: "2026년 5월 12일 화요일",
        weather: "눈부신 햇살 ☀️",
        text: "오늘 마당에 있는 장미 나무 근처에서 노란빛이 도는 작고 귀여운 방아깨비를 만났어요. 조심스레 손바닥을 내밀어보니 톡 뛰어올라서 손등에 앉았는데, 얇은 뒷다리가 닿을 때마다 엄청 간지러웠어요! 자세히 보니 머리가 꼬깔 모자처럼 뾰족하게 생겨서 꼭 초록 요정 같아요. 너무 사랑스러워서 이름을 '뚜기'라고 지어주었답니다. 뚜기와 매일매일 친해지면서 관찰일지를 써볼 거예요!",
        caption: "초록 잎 위에 사뿐히 앉은 뚜기",
        imgFilter: "brightness(1) contrast(1)",
        videoLabel: "만남 관찰 영상 (0:15)",
        videoDesc: "첫 만남의 어색함 속에서 안테나를 좌우로 흔들며 인사하는 뚜기예요.",
        videoAction: "greet"
    },
    2: {
        title: "2회: 새집 증후군 극복기 🏠",
        date: "2026년 5월 14일 목요일",
        weather: "포근한 바람 🍃",
        text: "아빠와 함께 뚜기를 위한 예쁜 초록 집을 만들어 주었어요. 신선한 장미 잎사귀들과 물을 머금은 솜, 그리고 높이 기어오를 수 있는 튼튼한 장미 가지도 넣어주었지요. 뚜기가 처음에는 낯선지 구석에 가만히 숨어있더니, 조금 지나자 긴 뒷다리로 폴짝 뛰어올라 가장 높은 가지 위에 당당하게 자리 잡았어요! 새집이 마음에 드는 것 같아 정말 다행이에요.",
        caption: "장미 가지 위 명당자리를 잡은 뚜기",
        imgFilter: "hue-rotate(15deg) contrast(1.05)",
        videoLabel: "집 탐색 영상 (0:12)",
        videoDesc: "새로 만들어준 나뭇가지를 영차영차 기어오르고 있는 뚜기의 발걸음이에요.",
        videoAction: "climb"
    },
    3: {
        title: "3회: 뚜기의 대단한 편식 🍽️",
        date: "2026년 5월 17일 일요일",
        weather: "구름 조금 ☁️",
        text: "오늘은 뚜기가 무엇을 좋아하는지 알아보려고 미니 뷔페를 차려주었어요. 향긋한 딜, 쌉싸름한 레몬밤, 그리고 달콤하고 싱싱한 루꼴라 잎을 나란히 놓아주었지요. 관찰해 보니 뚜기는 딜과 레몬밤은 쳐다보지도 않고 루꼴라 앞으로 곧장 가더니 사각사각 소리를 내며 엄청 맛있게 먹는 게 아니겠어요? 역시 뚜기도 맛있는 건 제일 먼저 알아보나 봐요! 완전 루꼴라 대장이랍니다.",
        caption: "싱싱한 루꼴라를 사각사각 냠냠!",
        imgFilter: "hue-rotate(-10deg) saturate(1.1)",
        videoLabel: "루꼴라 먹방 영상 (0:10)",
        videoDesc: "아삭한 루꼴라 잎을 동그랗게 갉아 먹는 귀여운 입 모양을 관찰해 보아요.",
        videoAction: "eat"
    },
    4: {
        title: "4회: 영차영차 탈피 대작전 ✨",
        date: "2026년 5월 20일 수요일",
        weather: "촉촉한 봄비 🌧️",
        text: "아침에 눈을 뜨자마자 뚜기 방을 들여다보았는데 깜짝 놀랐어요! 뚜기 곁에 뚜기와 똑같이 생긴 투명한 방아깨비 유령이 서 있는 것 같았거든요. 자세히 보니 그것은 바로 뚜기가 밤새 힘겹게 벗어놓은 허물이었어요. 허물을 벗은 뚜기는 전보다 몸도 훨씬 더 커지고, 초록색 빛깔도 훨씬 더 선명하고 예뻐졌어요. 몸이 가려웠을 텐데 혼자서 조용히 이겨낸 뚜기가 정말 기특하고 자랑스러워요.",
        caption: "밤새 벗어놓은 신기한 뚜기의 허물",
        imgFilter: "brightness(1.05) sepia(0.1)",
        videoLabel: "탈피 관찰 영상 (0:18)",
        videoDesc: "허물을 완전히 벗고 반짝반짝 빛나는 새로운 초록 갑옷을 뽐내는 뚜기예요.",
        videoAction: "molding"
    },
    5: {
        title: "5회: 뚜기의 아름다운 노랫소리 🎵",
        date: "2026년 5월 23일 토요일",
        weather: "별이 빛나는 밤 🌟",
        text: "방에서 책을 읽고 있는데 거실 구석에서 귀여운 풀벌레 소리가 들려왔어요. \"슥-슥- 슥-슥-\" 조용히 불을 끄고 다가가 보았더니, 뚜기가 가만히 서서 뒷다리를 날개에 슥슥 비벼 소리를 내고 있었어요! 마치 우리 가족에게 들려주는 가을 밤의 오케스트라 연주 같았지요. 다리를 빠르게 움직이며 연주하는 뚜기가 너무 신기해서 밤새도록 그 아름다운 풀벌레 연주를 들으며 잠들었답니다.",
        caption: "뒷다리를 비비며 밤의 음악을 들려주는 뚜기",
        imgFilter: "brightness(0.95) contrast(0.9) saturate(0.85)",
        videoLabel: "풀벌레 연주 영상 (0:20)",
        videoDesc: "뒷다리를 날개 깃에 빠르게 마찰하며 신비로운 가을 소리를 퍼뜨리고 있어요.",
        videoAction: "sing"
    },
    6: {
        title: "6회: 건강하게 우리 곁에 오래오래! 💜",
        date: "2026년 5월 26일 화요일",
        weather: "쌍무지개 뜬 날 🌈",
        text: "뚜기와 만난 지 벌써 보름이 훌쩍 넘었어요. 조그맣던 아기 방아깨비에서 이제는 더 튼튼하고 늠름한 큰 방아깨비가 되었지요. 매일 아침 싱싱한 잎사귀를 갈아주고 교감을 나누었더니, 이제는 제 손길을 무서워하지 않고 손등 위에 가만히 머물러준답니다. 비록 나중에 자연의 품으로 돌려보내 주어야 할 날이 오겠지만, 그때까지 뚜기가 아프지 않고 건강하게 지낼 수 있도록 매일매일 더 사랑해주고 보살펴줄 거예요! 사랑해 뚜기야!",
        caption: "루시 손등 위에서 눈빛을 나누는 뚜기",
        imgFilter: "brightness(1.03) saturate(1.2)",
        videoLabel: "우정 축하 영상 (0:15)",
        videoDesc: "탐험가 루시의 손 위에서 신나게 춤을 추며 소통하는 단짝 뚜기예요.",
        videoAction: "friendship"
    },
    7: {
        title: "7회: 초록 들판 동물 연합 운동회! 🏆",
        date: "2026년 5월 28일 목요일",
        weather: "화창하고 맑은 가을바람 🍂",
        text: "오늘 루시의 정원에서 사상 최초로 '초록 들판 동물 연합 운동회'가 열렸습니다! 참가 선수는 날렵한 다리의 방아깨비 대표 저 뚜기, 우직한 껍질의 느림보 달팽이 대표 달이, 그리고 파란 물약 젤리 성곽의 고독한 전사 대장 개미 대표였습니다! 놀랍게도 대장 개미네 성에는 대장 개미 딱 한 마리만 기거하고 있었죠! 첫 번째 경기인 '초속 기어가기 레이스'가 시작되자마자 저는 강력한 뒷다리 근육에 우주의 힘을 모아 숲길을 한 번에 날아올랐습니다! ‘폴짝!’ 단 한 번의 점프로 10미터를 날아가며 우승을 따놓은 당상이라 생각하고 신나게 다리를 슥슥 비벼 날갯소리로 오케스트라 연주를 울려댔죠. 하지만 뒤를 돌아보니 기적이 일어나고 있었습니다! 달팽이 달이는 물러서지 않고 자기만의 거대한 은빛 점액 길을 뿜어내며 마찰력을 제로로 만든 채 미끄러지듯 스케이트를 타고 슬라이딩을 하고 있었습니다! 게다가 대장 개미는 여러 마리가 아니라 단 한 마리뿐인데도, 혼자서 '영차영차!' 씩씩한 군대 구령 소리를 내며 1인 3역으로 3열 종대 대열을 시뮬레이션하듯 엄청난 기백과 질주 속도로 돌진해오고 있었죠! (처음엔 너무 날쌔서 개미 군단인 줄 착각했답니다!) 두 번째 종목인 '누가누가 루꼴라 빨리 먹나 뷔페전'에서도 대장 개미의 활약이 돋보였습니다. 혼자서 특유의 정밀한 이빨 커터 능력을 가동해 루꼴라 잎을 도화지 오리듯 자로 잰 격자 사각형으로 오려 기지 성으로 쏜살같이 혼자 날랐고, 저 뚜기는 턱이 빠지도록 루꼴라를 사각사각 구멍 내며 갉아 먹어 저만의 1등 신기록을 경신했습니다. 느림보 달이는 커다란 당근 조각을 입안에 통째로 물고 진공청소기처럼 천천히 빨아들이며 온천욕을 즐기고 있었어요. 마지막 '줄다리기 단체전'에서는 저와 달이와 대장 개미가 장미 줄기를 물고 힘을 겨뤘는데, 달이의 닻 내리기 전술과 대장 개미가 혼자서 백만 대군의 단합력을 온몸으로 시각화하여 버티는 초인적인 힘, 그리고 저의 로켓 엔진 뒷다리가 격돌하여 결국 장미 줄기가 뚝 끊어지는 바람에 모두가 잔디밭에 벌러덩 자빠지고 말았답니다! 경기 결과는 모두가 1등인 완벽한 공동 우승! 서로 다른 발걸음과 재주를 가졌지만, 함께 달리며 잔디밭에서 뒤엉켜 노는 시간이 너무나 눈부시게 행복했습니다. 뚜기 요정, 은빛 달팽이, 대장 개미까지 우리 모두 루시의 소중한 단짝들로서 평화롭고 신나는 초록 연합 영원히 포에버! 💚🌟",
        caption: "정원에서 펼쳐진 신나는 동물 운동회 대격돌!",
        imgFilter: "brightness(1.02) saturate(1.15) contrast(1.05)",
        videoLabel: "연합 운동회 단체전 (0:25)",
        videoDesc: "뚜기가 도약하고 달팽이가 슬라이딩하며 대장 개미가 홀로 장미 줄기를 당기는 손에 땀을 쥐는 경기 장면이에요!",
        videoAction: "crossover"
    }
};

// ==========================================
// 3. Tab Switching Logic & Content Injection
// ==========================================
let currentEp = 1;
const tabs = document.querySelectorAll('.tab-btn');
const diaryCard = document.getElementById('diary-card');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function switchEpisode(epNumber) {
    currentEp = parseInt(epNumber);
    synth.playChime();
    
    // Smooth transition fade-out
    diaryCard.style.opacity = 0;
    diaryCard.style.transform = 'translateY(10px)';
    diaryCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
        const data = EPISODE_DATA[currentEp];
        
        // Update DOM
        document.getElementById('diary-title').textContent = data.title;
        document.getElementById('diary-date').textContent = data.date;
        document.getElementById('diary-weather-val').textContent = data.weather;
        document.getElementById('diary-text').textContent = data.text;
        document.getElementById('diary-caption').textContent = data.caption;
        
        const img = document.getElementById('diary-img');
        img.style.filter = data.imgFilter;
        
        // Randomize polaroid rotation slightly for a hand-laid scrapbooked look!
        const rot = -4 + Math.random() * 8;
        document.getElementById('polaroid-trigger').style.setProperty('--rot', `${rot}deg`);
        
        // Update player
        document.getElementById('player-label').textContent = data.videoLabel;
        
        // Signature updates based on story
        const sigs = {
            1: "- 루시가 장미 나무 밑에서 ✍️",
            2: "- 루시가 포근한 내 방 책상에서 ✍️",
            3: "- 멋진 쉐프 루시가 🍽️✍️",
            4: "- 기특함에 눈물짓는 루시가 ✍️",
            5: "- 다리는 아직 못 비비는 루시가 🎻✍️",
            6: "- 뚜기 단짝 친구 루시가 💚✍️",
            7: "- 세 곤충 친구들을 응원하는 심판 루시가 ✍️🏅"
        };
        document.getElementById('diary-sig').textContent = sigs[currentEp];

        // Highlight tab
        tabs.forEach(tab => {
            if (parseInt(tab.getAttribute('data-ep')) === currentEp) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Toggle prev/next button states
        prevBtn.style.opacity = currentEp === 1 ? '0.5' : '1';
        prevBtn.style.cursor = currentEp === 1 ? 'not-allowed' : 'pointer';
        nextBtn.style.opacity = currentEp === 7 ? '0.5' : '1';
        nextBtn.style.cursor = currentEp === 7 ? 'not-allowed' : 'pointer';
        
        // Smooth transition fade-in
        diaryCard.style.opacity = 1;
        diaryCard.style.transform = 'translateY(0)';
        
        // Special fireworks celebration on Episode 7!
        if (currentEp === 7) {
            startCelebration();
        } else {
            stopCelebration();
        }
    }, 300);
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const ep = tab.getAttribute('data-ep');
        switchEpisode(ep);
    });
});

prevBtn.addEventListener('click', () => {
    if (currentEp > 1) switchEpisode(currentEp - 1);
});

nextBtn.addEventListener('click', () => {
    if (currentEp < 7) switchEpisode(currentEp + 1);
});

// Initialize first episode
switchEpisode(1);


// ==========================================
// 4. Interactive Theme Switcher (Day/Night)
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

// Read theme from local storage
const savedTheme = localStorage.getItem('blog_theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    synth.playChime();
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'night' ? 'light' : 'night';
    applyTheme(newTheme);
});


// ==========================================
// 5. Audio Controller (BGM ON/OFF)
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
// 6. Background Petal Engine (Canvas)
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Petal {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = 5 + Math.random() * 7;
        this.speedY = 0.8 + Math.random() * 1.2;
        this.speedX = -0.4 + Math.random() * 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = -0.01 + Math.random() * 0.02;
        const hues = [340, 350, 10, 80, 200]; // Soft pink, green, and watery blue
        this.hue = hues[Math.floor(Math.random() * hues.length)];
        this.opacity = 0.2 + Math.random() * 0.3;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 40) * 0.2;
        this.angle += this.spin;
        if (this.y > canvas.height + 20) this.reset();
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 88%, ${this.opacity})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${this.hue}, 40%, 78%, ${this.opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

for (let i = 0; i < 20; i++) {
    particles.push(new Petal());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw watercolor background particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ==========================================
// 7. Polaroid Zoom Modal Interaction
// ==========================================
const polaroidTrigger = document.getElementById('polaroid-trigger');
const zoomModal = document.getElementById('zoom-modal');
const zoomCloseBtn = document.getElementById('zoom-close-btn');
const zoomImg = document.getElementById('zoom-img');
const zoomCaption = document.getElementById('zoom-caption');

polaroidTrigger.addEventListener('click', () => {
    synth.playChime();
    const data = EPISODE_DATA[currentEp];
    zoomImg.src = document.getElementById('diary-img').src;
    zoomImg.style.filter = data.imgFilter;
    zoomCaption.textContent = data.caption;
    zoomModal.classList.add('active');
});

zoomCloseBtn.addEventListener('click', () => {
    zoomModal.classList.remove('active');
});

zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) zoomModal.classList.remove('active');
});


// ==========================================
// 8. 6th Episode Special Watercolor Petals Canvas Celebration
// ==========================================
const petalCanvas = document.getElementById('petal-canvas');
const pCtx = petalCanvas.getContext('2d');

let celebrationInterval = null;
let celebrationPetals = [];
let isCelebrating = false;

function resizePetalCanvas() {
    petalCanvas.width = diaryCard.offsetWidth;
    petalCanvas.height = diaryCard.offsetHeight;
}
window.addEventListener('resize', resizePetalCanvas);

class CelebrationPetal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 6 + Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed - 1.5; // slight upward force
        this.gravity = 0.12;
        this.opacity = 1;
        this.hue = 260 + Math.random() * 60; // gorgeous purples/lavenders for Episode 6!
        this.angle = Math.random() * Math.PI;
        this.spin = -0.05 + Math.random() * 0.1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.opacity -= 0.015;
        this.angle += this.spin;
    }
    
    draw() {
        pCtx.save();
        pCtx.translate(this.x, this.y);
        pCtx.rotate(this.angle);
        pCtx.beginPath();
        pCtx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        pCtx.fillStyle = `hsla(${this.hue}, 90%, 82%, ${this.opacity})`;
        pCtx.fill();
        pCtx.restore();
    }
}

function startCelebration() {
    resizePetalCanvas();
    isCelebrating = true;
    celebrationPetals = [];
    
    // Burst initial petals from center
    const cx = petalCanvas.width / 2;
    const cy = petalCanvas.height / 3;
    
    for (let i = 0; i < 40; i++) {
        celebrationPetals.push(new CelebrationPetal(cx, cy));
    }
    
    // Occasional bursts
    if (celebrationInterval) clearInterval(celebrationInterval);
    celebrationInterval = setInterval(() => {
        if (!isCelebrating) return;
        const rx = 50 + Math.random() * (petalCanvas.width - 100);
        const ry = 50 + Math.random() * (petalCanvas.height * 0.6);
        for (let i = 0; i < 15; i++) {
            celebrationPetals.push(new CelebrationPetal(rx, ry));
        }
    }, 2500);
    
    animateCelebration();
}

function stopCelebration() {
    isCelebrating = false;
    clearInterval(celebrationInterval);
    celebrationInterval = null;
    pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
}

function animateCelebration() {
    if (!isCelebrating) return;
    pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    
    celebrationPetals.forEach((p, idx) => {
        p.update();
        p.draw();
        if (p.opacity <= 0) {
            celebrationPetals.splice(idx, 1);
        }
    });
    
    requestAnimationFrame(animateCelebration);
}


// ==========================================
// 9. Simulated Interactive Watercolor Video Player
// ==========================================
const videoTrigger = document.getElementById('video-trigger');
const videoModal = document.getElementById('video-modal');
const videoCloseBtn = document.getElementById('video-close-btn');
const videoCanvas = document.getElementById('video-canvas');
const vCtx = videoCanvas.getContext('2d');

let isVideoPlaying = false;
let videoFrameId = null;
let vTime = 0;
let grasshopperAngle = 0;
let grasshopperScale = 1;
let antennaWiggle = 0;
let leafEatenPercent = 0;

videoTrigger.addEventListener('click', () => {
    synth.playChime();
    videoModal.classList.add('active');
    
    // Set custom description based on action
    const data = EPISODE_DATA[currentEp];
    document.getElementById('video-modal-title').textContent = `${data.title} - 생생 관찰 영상 🎬`;
    document.getElementById('video-modal-desc').textContent = data.videoDesc;
    
    // Initialize video parameters
    isVideoPlaying = true;
    vTime = 0;
    leafEatenPercent = 0;
    resizeVideoCanvas();
    
    // Trigger grasshopper chirping if episode 5 (music episode)
    if (data.videoAction === 'sing') {
        synth.startChirp();
    }
    
    animateVideo();
});

videoCloseBtn.addEventListener('click', () => {
    closeVideo();
});

videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
});

function closeVideo() {
    isVideoPlaying = false;
    synth.stopChirp();
    cancelAnimationFrame(videoFrameId);
    videoModal.classList.remove('active');
}

function resizeVideoCanvas() {
    videoCanvas.width = 560;
    videoCanvas.height = 315;
}

// Canvas-based procedural cartoon watercolor grasshopper drawing & animating!
function animateVideo() {
    if (!isVideoPlaying) return;
    
    vCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    vTime += 0.05;
    
    const action = EPISODE_DATA[currentEp].videoAction;
    
    // Draw background watercolor field
    const grad = vCtx.createRadialGradient(280, 150, 50, 280, 150, 300);
    grad.addColorStop(0, '#e8f5e9'); // Minty center
    grad.addColorStop(1, '#c8e6c9'); // Soft green borders
    vCtx.fillStyle = grad;
    vCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
    
    // Draw organic grass leaves in background
    vCtx.save();
    vCtx.strokeStyle = 'rgba(127,168,127,0.3)';
    vCtx.lineWidth = 15;
    vCtx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
        vCtx.beginPath();
        vCtx.moveTo(50 + i * 120, 315);
        vCtx.quadraticCurveTo(80 + i * 120, 100, 180 + i * 120, 50);
        vCtx.stroke();
    }
    vCtx.restore();

    // Action specific calculations
    if (action === 'greet') {
        // Antenna wiggles heavily, eyes spin
        antennaWiggle = Math.sin(vTime * 5) * 12;
        grasshopperAngle = Math.sin(vTime * 2) * 0.02;
    } 
    else if (action === 'climb') {
        // Hops/scales up and down naively
        grasshopperScale = 1 + Math.sin(vTime * 4) * 0.04;
        grasshopperAngle = Math.sin(vTime * 2) * 0.05;
        // Slide grasshopper position
        const yOffset = Math.sin(vTime * 2) * 15;
        vCtx.translate(0, yOffset);
    } 
    else if (action === 'eat') {
        // Chewing animation: grasshopper tilts forward, leaf disappears
        grasshopperAngle = 0.05 + Math.sin(vTime * 6) * 0.03;
        leafEatenPercent = Math.min(vTime * 8, 100); // Leaf gets eaten over time
        
        // draw chewing bubble
        if (Math.sin(vTime * 8) > 0) {
            vCtx.save();
            vCtx.font = "24px 'Gamja Flower'";
            vCtx.fillStyle = 'var(--text-secondary)';
            vCtx.fillText("사각사각 냠냠! 🥬", 340, 100);
            vCtx.restore();
        }
    } 
    else if (action === 'molding') {
        // Shines! Golden sparkles fly out
        grasshopperScale = 1 + Math.sin(vTime * 1) * 0.02;
        antennaWiggle = Math.sin(vTime * 3) * 6;
        drawSparkles(280, 150, vTime);
    } 
    else if (action === 'sing') {
        // Legs rub rapidly! Pulse sound is played!
        antennaWiggle = Math.sin(vTime * 2) * 4;
        const legVibe = Math.sin(vTime * 25) * 8; // Rapid leg movement!
        
        // Draw Leg vibrations in coordinates
        vCtx.save();
        vCtx.translate(280, 150);
        vCtx.strokeStyle = 'rgba(127,168,127,0.5)';
        vCtx.lineWidth = 3;
        vCtx.beginPath();
        vCtx.moveTo(-80, 10);
        vCtx.lineTo(-120 + legVibe, -30);
        vCtx.stroke();
        vCtx.restore();

        // draw sound waves
        vCtx.save();
        vCtx.strokeStyle = 'var(--accent-color)';
        vCtx.lineWidth = 2;
        vCtx.beginPath();
        const pulseRad = (vTime * 120) % 150;
        vCtx.arc(280, 150, pulseRad, 0, Math.PI * 2);
        vCtx.stroke();
        vCtx.restore();
    }
    else if (action === 'friendship') {
        // Hearts drift out
        antennaWiggle = Math.sin(vTime * 3) * 8;
        drawHearts(280, 120, vTime);
    }
    else if (action === 'crossover') {
        // Epic Sports Day Crossover Animation!
        antennaWiggle = Math.sin(vTime * 5) * 8;
        grasshopperScale = 0.95 + Math.sin(vTime * 3) * 0.05;
        drawHearts(280, 110, vTime);
        drawSparkles(280, 150, vTime);
        
        // Draw Snail to the left (x: 130, y: 200)
        vCtx.save();
        vCtx.translate(130, 200);
        vCtx.fillStyle = '#fdf5e6';
        vCtx.strokeStyle = '#d7ccc8';
        vCtx.lineWidth = 2.5;
        vCtx.beginPath();
        vCtx.ellipse(0, 10, 20, 8, 0, 0, Math.PI*2);
        vCtx.fill();
        vCtx.stroke();
        // draw shell
        vCtx.fillStyle = '#d7ccc8';
        vCtx.strokeStyle = '#5d4037';
        vCtx.beginPath();
        vCtx.arc(-5, 0, 15, 0, Math.PI*2);
        vCtx.fill();
        vCtx.stroke();
        vCtx.restore();
        
        // Draw Ant to the right (x: 430, y: 200)
        vCtx.save();
        vCtx.translate(430, 200);
        vCtx.fillStyle = '#1e120c';
        // Abdomen
        vCtx.beginPath();
        vCtx.ellipse(-10, 0, 9, 6, 0, 0, Math.PI*2);
        vCtx.fill();
        // Head
        vCtx.beginPath();
        vCtx.arc(5, -2, 5, 0, Math.PI*2);
        vCtx.fill();
        vCtx.restore();
    }

    // DRAW THE LEAF for eating action
    vCtx.save();
    vCtx.fillStyle = '#9ccc65';
    vCtx.strokeStyle = '#7cb342';
    vCtx.lineWidth = 3;
    vCtx.beginPath();
    vCtx.moveTo(420, 200);
    vCtx.quadraticCurveTo(340, 150, 240, 180);
    vCtx.quadraticCurveTo(300, 250, 420, 200);
    vCtx.fill();
    vCtx.stroke();
    
    // Chewed hole
    if (action === 'eat') {
        vCtx.fillStyle = '#e8f5e9'; // Background match
        vCtx.beginPath();
        vCtx.arc(280, 175, Math.min(leafEatenPercent * 0.35, 30), 0, Math.PI * 2);
        vCtx.fill();
    }
    vCtx.restore();

    // DRAW THE CUTE WATERCOLOR GRASSHOPPER (Ttougi)
    vCtx.save();
    vCtx.translate(280, 160);
    vCtx.rotate(grasshopperAngle);
    vCtx.scale(grasshopperScale, grasshopperScale);

    // 1. Back leg
    vCtx.fillStyle = '#7cb342'; // Dark green
    vCtx.strokeStyle = '#558b2f';
    vCtx.lineWidth = 4;
    vCtx.beginPath();
    vCtx.moveTo(-20, 10);
    vCtx.lineTo(-60, -40);
    vCtx.lineTo(-50, 30);
    vCtx.fill();
    vCtx.stroke();

    // 2. Main Body (Cute organic oval)
    vCtx.fillStyle = '#9ccc65'; // Bright Grass green
    vCtx.beginPath();
    vCtx.ellipse(0, 10, 60, 25, 0.1, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();

    // 3. Cute pointed head (cocker hat shape)
    vCtx.beginPath();
    vCtx.moveTo(45, -10);
    vCtx.quadraticCurveTo(80, -35, 85, -25); // pointed tip
    vCtx.quadraticCurveTo(65, 15, 45, 20);
    vCtx.closePath();
    vCtx.fill();
    vCtx.stroke();

    // 4. Large friendly cartoon eye
    vCtx.fillStyle = '#ffffff';
    vCtx.beginPath();
    vCtx.arc(60, -12, 10, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();
    
    // Pupil
    vCtx.fillStyle = '#333333';
    vCtx.beginPath();
    vCtx.arc(63, -12, 5 + Math.sin(vTime * 3) * 1, 0, Math.PI * 2); // expanding pupil
    vCtx.fill();
    
    // Eye shine
    vCtx.fillStyle = '#ffffff';
    vCtx.beginPath();
    vCtx.arc(61, -14, 2, 0, Math.PI * 2);
    vCtx.fill();

    // 5. Smiling mouth
    vCtx.strokeStyle = '#333333';
    vCtx.lineWidth = 2.5;
    vCtx.beginPath();
    vCtx.arc(65, 3, 6, 0.2, Math.PI * 0.8);
    vCtx.stroke();

    // 6. Antennae (with wiggle)
    vCtx.strokeStyle = '#558b2f';
    vCtx.lineWidth = 3;
    vCtx.beginPath();
    vCtx.moveTo(70, -25);
    vCtx.quadraticCurveTo(90 + antennaWiggle, -60, 110 + antennaWiggle, -70);
    vCtx.stroke();
    
    vCtx.beginPath();
    vCtx.moveTo(68, -23);
    vCtx.quadraticCurveTo(85 - antennaWiggle, -55, 100 - antennaWiggle, -65);
    vCtx.stroke();

    // 7. Cute translucent watercolor wings
    vCtx.fillStyle = 'rgba(220, 245, 180, 0.6)';
    vCtx.beginPath();
    vCtx.ellipse(-10, -5, 55, 12, -0.05, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();

    // 8. Front crawl legs
    vCtx.strokeStyle = '#7cb342';
    vCtx.lineWidth = 4.5;
    vCtx.beginPath();
    vCtx.moveTo(25, 22);
    vCtx.lineTo(30, 45);
    vCtx.moveTo(10, 24);
    vCtx.lineTo(8, 45);
    vCtx.stroke();

    vCtx.restore();

    // Draw video HUD overlay (cute timer bar)
    vCtx.save();
    vCtx.fillStyle = 'rgba(255,255,255,0.7)';
    vCtx.fillRect(15, 275, videoCanvas.width - 30, 25);
    vCtx.strokeStyle = 'var(--border-color)';
    vCtx.lineWidth = 2;
    vCtx.strokeRect(15, 275, videoCanvas.width - 30, 25);
    
    // Cute progress bar
    const progress = Math.min((vTime / 15) * 100, 100); // 15 sec simulated max
    vCtx.fillStyle = 'var(--accent-color)';
    vCtx.fillRect(20, 280, (videoCanvas.width - 40) * (progress / 100), 15);
    
    // Play head
    vCtx.fillStyle = '#fff';
    vCtx.beginPath();
    vCtx.arc(20 + (videoCanvas.width - 40) * (progress / 100), 287, 8, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    vCtx.restore();

    videoFrameId = requestAnimationFrame(animateVideo);
}

function drawSparkles(cx, cy, time) {
    vCtx.save();
    vCtx.fillStyle = 'rgba(255, 235, 110, 0.8)';
    for (let i = 0; i < 8; i++) {
        const angle = i * (Math.PI / 4) + time * 1.5;
        const rad = 70 + Math.sin(time * 8) * 15;
        const sx = cx + Math.cos(angle) * rad;
        const sy = cy + Math.sin(angle) * rad;
        
        vCtx.beginPath();
        vCtx.arc(sx, sy, 4 + Math.sin(time * 12 + i) * 2, 0, Math.PI * 2);
        vCtx.fill();
    }
    vCtx.restore();
}

function drawHearts(cx, cy, time) {
    vCtx.save();
    for (let i = 0; i < 4; i++) {
        const offsetAngle = i * (Math.PI / 2) + time * 0.8;
        const rad = 60 + Math.sin(time * 3) * 10;
        const hx = cx + Math.cos(offsetAngle) * rad;
        const hy = cy + Math.sin(offsetAngle) * rad - (time * 10) % 40; // float up
        
        vCtx.fillStyle = 'rgba(239, 154, 154, 0.85)';
        vCtx.font = "24px 'Gamja Flower'";
        vCtx.fillText("💜", hx, hy);
    }
    vCtx.restore();
}

// Reset body opacity to 1 immediately when the page is shown,
// especially when loaded from back-forward cache (bfcache)
window.addEventListener('pageshow', (event) => {
    document.body.style.opacity = '1';
    document.body.style.transition = '';
});

// Smooth fade-out page transition when returning to list
const backHomeBtn = document.querySelector('.back-home');
if (backHomeBtn) {
    backHomeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        synth.playChime();
        document.body.style.opacity = 0;
        document.body.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            window.location.href = backHomeBtn.href;
        }, 450);
    });
}

// PWA Service Worker register
if ('serviceWorker' in navigator) {
    // Force instant reload when the new Service Worker takes over and deletes the old cache
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}
