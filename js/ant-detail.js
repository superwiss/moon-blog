/* js/ant-detail.js */

// ==========================================
// 1. Web Audio API Sound Synthesizer (Ant Digging Scratches!)
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

    // Sparkling magical wind chime sound
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

    // High-pitched crunchy scratching sound for digging gel!
    playScratch() {
        this.init();
        const now = this.ctx.currentTime;
        
        const bufferSize = this.ctx.sampleRate * 0.05; // 50ms scratch
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate high-pass filtered white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 4000; // high sand-like scratch
        filter.Q.value = 5;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.05);
    }

    // Play cheerful BGM
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
            console.log("Ant BGM autoplay prevented.", e);
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
// 2. Data Base: Solo Captain Ant's 10 Episodes Content
// ==========================================
const EPISODE_DATA = {
    1: {
        title: "1일차: 신비로운 푸른 젤 개미성 🐜",
        date: "2026년 6월 15일 월요일",
        weather: "구름 없는 맑음 ☀️",
        text: "오늘 우리 집에 진짜진짜 신기하고 멋진 친구가 도착했어요! 바로 투명하고 예쁜 파란색 젤리가 꽉 차 있는 특수 개미집과, 늠름하고 멋진 검은색 카리스마를 자랑하는 한국홍가슴개미 한 마리랍니다. 아빠랑 함께 조심스레 파란 젤성 입구에 넣어주었어요. 돋보기로 보니 여러 마리가 꼬물거리는 것보다 훨씬 멋지게, 혼자서도 아주 씩씩한 장군 포스를 풍겼답니다! 그래서 이름을 '대장 개미'라고 부르기로 했어요. 대장 개미는 새로운 파란 젤성에 오자마자 더듬이를 파르르 흔들며 젤바닥을 이리저리 문지르고 탐색을 시작했답니다. 신비한 젤 속에서 나 홀로 파낼 요새 터널이 벌써부터 기대돼요!",
        caption: "넓은 파란 젤성 입구에서 위엄있게 주위를 탐색하는 대장 개미",
        imgFilter: "brightness(1) contrast(1)",
        videoLabel: "요새 탐색 영상 (0:15)",
        videoDesc: "대장 개미가 파란 젤리 요새에 혼자 우뚝 서서 더듬이를 사방으로 쫑긋거리며 주변을 탐사하고 있어요.",
        videoAction: "explore"
    },
    2: {
        title: "2일차: 수직 갱도 굴착 개시! 🏗️",
        date: "2026년 6월 16일 화요일",
        weather: "살짝 바람 부는 날 🍃",
        text: "와! 오늘 아침 개미통을 들여다보았더니 깜짝 놀랄 만한 변화가 있었어요! 대장 개미 혼자서 그 단단한 파란 젤을 아삭아삭 야금야금 쪼아내며 머리가 쏙 들어갈 만한 깊은 수직 터널을 뚫어놓았지 뭐예요! 비록 혼자지만 강력한 턱 근술로 젤을 한 조각씩 뜯어내고는, 자기 몸집만 한 부스러기를 머리 위로 번쩍 짊어진 채 지상 출구로 열심히 날랐답니다. 영차영차 지치지도 않고 성실하게 1인 터널 공사를 해나가는 대장 개미의 뒷모습을 보며 마음속으로 엄청난 격려와 박수를 보내주었습니다!",
        caption: "혼자서 야금야금 아래로 수직 갱도를 파내려 가는 늠름한 대장 개미",
        imgFilter: "brightness(1.02) contrast(0.98) saturate(1.1)",
        videoLabel: "수직 갱도 굴착 영상 (0:12)",
        videoDesc: "대장 개미가 혼자서 강력한 입턱으로 젤을 부지런히 뜯어내며 밑으로 씩씩하게 전진해요.",
        videoAction: "dig_down"
    },
    3: {
        title: "3일차: 안락한 지하 침실 🛏️",
        date: "2026년 6월 17일 수요일",
        weather: "햇볕 쨍쨍 더움 ☀️🔥",
        text: "수직으로 쑥 파고 내려가던 고독한 건축가 대장 개미가, 오늘은 옆으로 방향을 휙 틀었어요! 가로로 둥글게 파내려 가더니 혼자만의 동그랗고 아늑한 비밀 지하 챔버(방)를 뚝딱 완성했답니다! 돋보기로 보니 다 지어진 방 한가운데에 누워서 더듬이를 살랑이며 꿀맛 같은 낮잠을 청하고 있었어요. 아무도 없는 거대하고 신비로운 파란 요새에서 오직 나만의 안락한 침실을 마련한 셈이죠! 꼼짝도 않고 새끈새끈 자는 모습이 정말 귀여웠어요. 혼자서 설계하고 만드는 정교한 기술이 진짜 신기해요!",
        caption: "둥글고 아늑한 나 홀로 침실 속에서 곤히 단잠을 자는 대장 개미",
        imgFilter: "brightness(1.05) saturate(1.15)",
        videoLabel: "지하 침실 단잠 영상 (0:14)",
        videoDesc: "자신이 뚫은 동그란 침실 방에 편안하게 몸을 뉘이고 다정하게 쉬고 있는 외톨이 대장 개미.",
        videoAction: "sleep"
    },
    4: {
        title: "4일차: 달콤한 설탕물 충전 시간 💧",
        date: "2026년 6월 18일 목요일",
        weather: "개구리 노래하는 흐림 ☁️",
        text: "열심히 나 홀로 집짓기를 수행하는 대장 개미를 위해 특별 영양 간식을 선물했어요! 주사기에 달콤한 설탕물을 한 방울 담아서 상단 급여구에 얹어주었지요. 그러자 보초를 서던 대장 개미가 냄새를 킁킁 맡더니 쏜살같이 기어가 설탕물 방울에 입을 대고 냠냠 먹기 시작했어요. 이번에는 나눠 먹을 다른 식구들이 없으니 온전히 대장 개미 혼자 다 마실 수 있는 독점 특권이 주어졌답니다! 배가 물방울처럼 투명한 파란색으로 빵빵하게 부풀어 오르도록 맛있게 완충하더니, 다시 기운을 내서 굴착 장비를 챙겨 아래쪽 공사 현장으로 씩씩하게 복귀했어요!",
        caption: "달콤한 설탕물 한 방울을 혼자서 남김없이 맛있게 흡입하는 모습",
        imgFilter: "brightness(0.98) saturate(1.25)",
        videoLabel: "당 충전 스위트 영상 (0:15)",
        videoDesc: "설탕물 방울에 착 달라붙어 배가 빵빵하게 부풀어 오를 때까지 에너지를 혼자 채우는 대장 개미.",
        videoAction: "eat_sugar"
    },
    5: {
        title: "5일차: 지하 2층 수평 고속도로 개통! 🗺️",
        date: "2026년 6월 19일 금요일",
        weather: "선선하고 기분 좋은 맑음 ☀️",
        text: "오늘 대장 개미가 진짜 놀랍고 신기한 기적을 만들어냈어요! 어제 마신 설탕물 파워를 100% 가동했는지, 혼자의 힘으로 기어코 지하 2층 수직 갱도 깊은 곳까지 뚫고 내려가 좌우로 곧고 긴 수평 터널을 뚫어냈답니다! 마주치거나 비켜 가야 할 다른 개미 대원도 없으니, 그 터널은 온전히 대장 개미 전용 1인 프리패스 초고속 전용도로가 된 것이죠! 돋보기로 보니 혼자서 신나게 긴 도로 양끝을 꼬리를 살랑이며 쌩쌩 왕복 달리기 연습을 하고 있었어요. 1인 4역을 하며 성 전체를 종횡무진 개척해 나가는 대장의 에너지가 정말 엄청나요!",
        caption: "지하 2층에 혼자의 힘으로 일직선 개통한 시원한 1인 전용 고속도로",
        imgFilter: "brightness(1.02) contrast(1.02)",
        videoLabel: "수평 도로 통행 영상 (0:13)",
        videoDesc: "혼자 전용으로 개통된 긴 터널을 엄청난 질주 속도로 왕복하며 활력 넘치게 뛰어다녀요.",
        videoAction: "run_highway"
    },
    6: {
        title: "6일차: 젤리 부스러기 요새 성벽 🧱",
        date: "2026년 6월 20일 토요일",
        weather: "주륵주륵 여름 장마 🌧️🌧️",
        text: "비가 아주 어마어마하게 쏟아지는 여름 주말이었어요. 대장 개미는 젤 요새 안에서 아주 흥미로운 1인 방어 작업을 진행했답니다. 아래에서 터널을 파면서 모은 투명한 푸른 젤리 부스러기 벽돌들을 한 알 한 알 정성껏 물어 올려 입구 테두리에 성곽이나 댐처럼 둥그렇게 벽을 쌓고 있는 거였어요! 혼자 사는 집이지만 외풍 단속과 습기 방벽 공사만큼은 철저히 하겠다는 지독한 인테리어 정신 같았죠! 턱으로 가루를 다져가며 동그랗고 튼튼한 푸른 방벽 요새를 뚝딱 완성해 내는 걸 보니, 대장 개미는 명불허전 최고의 프로 엔지니어예요!",
        caption: "혼자 쌓아 올린 튼튼한 푸른 젤 방벽과 늠름한 대장의 모습",
        imgFilter: "brightness(1) saturate(1.1)",
        videoLabel: "방벽 건축 영상 (0:15)",
        videoDesc: "대장 개미가 입으로 푸른 젤 벽돌을 하나하나 모아 집 주변에 예쁜 보강 요새 성벽을 지어요.",
        videoAction: "build_wall"
    },
    7: {
        title: "7일차: 이웃집 달팽이와의 첫 유리창 면담 🔍",
        date: "2026년 6월 21일 일요일",
        weather: "개인 하늘과 예쁜 무지개 🌈",
        text: "오늘은 개미통 옆에 달팽이 16마리 대가족이 사는 촉촉한 이끼통을 나란히 놓아주었습니다. 드디어 투명 아크릴 벽을 사이에 두고 대장 개미와 첫째 달팽이 달이의 짜릿한 미팅이 열렸죠! 대장 개미가 유리벽으로 다가오자, 달이가 신기한 듯 눈 stalks(눈자루)를 길게 쭉 뽑아 돋보기처럼 개미를 구경했어요. 대장 개미는 거대한 덩치의 달팽이 형아 앞에서도 꿀리지 않고, 혼자서 당당히 가슴을 편 채 더듬이를 바르르 움직이며 기세 좋게 탭댄스를 추며 경계 인사를 마쳤답니다. 두 고독한 영웅과 평화로운 팽이 패밀리의 우정이 시작되는 기분이에요!",
        caption: "거대한 달팽이 달이의 눈앞에서도 혼자 당당히 기세를 뽐내는 대장 개미",
        imgFilter: "brightness(1.03) saturate(1.05)",
        videoLabel: "이웃사촌 대면 영상 (0:11)",
        videoDesc: "유리벽 너머의 달이와 눈을 마주하고 당차게 더듬이 탭댄스로 기선 제압을 하는 대장 개미.",
        videoAction: "meet_snail"
    },
    8: {
        title: "8일차: 푸른 젤성의 완벽한 밤샘 순찰 👮",
        date: "2026년 6월 22일 월요일",
        weather: "바람 솔솔 부는 밤 🌟",
        text: "밤늦게 스탠드 불빛만 켜놓고 조용히 개미집을 지켜보았어요. 루시가 잠든 고요한 시간에도 대장 개미는 쉴 틈 없이 자기 젤성 곳곳을 꼼꼼하게 순찰하고 있었답니다! 수직 갱도에서 수평 통로, 침실과 입구 방벽까지 혼자서 1인 4역을 해내며 혹시나 젤 요새에 무너지거나 금이 간 곳은 없는지 체크하는 한밤의 외로운 보안관 같았어요. 밤하늘 푸른 은하수처럼 빛나는 젤 성곽을 든든하게 지켜주는 대장 개미 장군이 있어서, 루시도 안심하고 침대에서 푹 단잠에 빠져들 수 있었답니다. 대장 보안관님 오늘도 고마워요!",
        caption: "고요한 밤 푸른 젤성을 혼자서 지키며 든든히 지키고 있는 밤샘 보안관",
        imgFilter: "brightness(0.92) contrast(1.05) saturate(0.95)",
        videoLabel: "철통 요새 순찰 영상 (0:14)",
        videoDesc: "은은한 불빛 속 파란 요새 길을 혼자 꼼꼼하게 왕복하며 하자가 없는지 순찰하는 멋진 대장 개미.",
        videoAction: "patrol"
    },
    9: {
        title: "9일차: 파란 젤 대궁전 완성 기념식! 👑",
        date: "2026년 6월 24일 수요일",
        weather: "구름 한 점 없는 파란 하늘 ☀️",
        text: "드디어 오늘, 우리 위대한 1인 건축가 대장 개미의 거대한 3차원 입체 파란 대궁전이 완벽하게 준공되었습니다! 아래층 수직 통로부터 가로 고속도로, 안락한 침실방까지 거미줄 미로처럼 사방이 정교하게 관통되어 빛나는 걸작이 완성되었어요. 공사를 성황리에 마친 대장 개미가 가장 넓은 1층 중앙 궁전의 왕좌에 홀로 앉아, 앞다리를 번쩍 치켜들며 만세 삼창을 하듯 기쁨의 완공 댄스 퍼레이드를 펼치고 있는 걸 목격했답니다! 단 1마리의 작은 개미가 매일매일 쉬지 않고 파내어 만든 이 장엄한 푸른 요새를 보며 루시는 너무 기특해 진짜 눈물이 찔끔 날 뻔했어요!",
        caption: "혼자의 손으로 대궁전을 최종 완성하고 만세 삼창 댄스를 즐기는 대장 개미",
        imgFilter: "brightness(1.04) saturate(1.25)",
        videoLabel: "대궁전 완공 축하 영상 (0:15)",
        videoDesc: "화려하게 개통된 나 홀로 푸른 젤 미로 성곽의 중심부에서 기쁨의 자축 댄스를 벌이는 모습.",
        videoAction: "celebrate"
    },
    10: {
        title: "10일차: 파란 젤 특공대의 완벽한 작전: 연합 운동회! 🏆",
        date: "2026년 6월 25일 목요일",
        weather: "화창하고 맑은 가을바람 🍂",
        text: "보고드립니다! 나 홀로 부대의 최정예 단일 전사, 대장 개미 장군입니다! 오늘 정오경 마당의 잔디 연병장에서 방아깨비 뚜기 요정, 달팽이 달이 전우와 사상 최초의 '곤충 연합 운동회' 전투가 발발했습니다. 첫 번째 경기인 '기어가기 레이스'가 시작되자마자, 날렵한 뚜기는 로켓 비행 뒷다리로 10미터를 폴짝 점프해 공중 우위를 선점했고, 달이는 배발의 특수 점액 로드를 매끄럽게 포장해 껍질을 스케이트 삼아 마찰력 제로의 피겨스케이팅 슬라이딩으로 질주해 왔지요. 하지만 나 대장 개미 장군도 만만치 않았습니다! 비록 부대원 없이 나 홀로 참전했지만, 마음속으로 '영차영차!' 훈련된 제식 구령을 혼자 힘차게 외치며 1인 3역의 3열 종대 전술 대열을 흉내 내는 압도적 질주 속도로 잔디 연병장을 돌파해 갔습니다! 1인 군단이 보여주는 엄청난 기백과 기동성에 관객석의 루시 대장이 배를 잡고 폭소하며 박수를 쳤지요! 두 번째 '식량 수송 쟁탈전'에서도 나의 독보적인 1인 공병 재단 능력이 빛을 발했습니다. 정밀한 입턱으로 루꼴라 잎사귀를 컴퓨터 도면 오리듯 정밀한 사각형으로 한 치의 오차도 없이 재단하여 나 홀로 기지로 빠르게 실어 날랐죠. 마지막 '줄다리기 덩굴 대격돌'에서는 뚜기의 로켓 엔진과 달이의 닻 무게 중심, 그리고 나 대장 개미가 영혼을 모아 1마리의 어깨에 백만 군대의 단합력을 투영하여 버티다 결국 장미 줄기가 툭- 끊어지는 장렬한 슬랩스틱 엔딩을 맺었습니다! 경기 결과는 전원 공동 우승! 규격과 전술은 서로 달랐지만, 함께 잔디밭을 뒤엉켜 구르며 나눈 시간은 눈부시게 행복했습니다. 뚜기, 달이, 그리고 나 홀로 대장 개미 장군까지 우리는 루시 대장의 영원한 3국 동맹 수호 단짝 패밀리입니다. 1인 부대 만세! 💚🏆🎖️",
        caption: "혼자서도 백만 대군의 기백을 선보인 당찬 대장 개미의 운동회 1인 군단!",
        imgFilter: "brightness(1.02) saturate(1.15) contrast(1.05)",
        videoLabel: "연합 운동회 단체전 (0:25)",
        videoDesc: "대장 개미가 나 홀로 씩씩하게 뛰어가며 뚜기와 달팽이 달이 사이에서 1인 군단 기백을 뽐내는 질주 장면!",
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
    
    // Play chime sound or scratch sound based on episode
    if ([2, 5, 8].includes(currentEp)) {
        synth.playScratch();
    } else {
        synth.playChime();
    }
    
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
        
        // Alternating images for ant farm
        if (currentEp === 10) {
            img.src = "assets/images/ant_farm_1.png";
        } else {
            img.src = currentEp % 2 === 1 ? "assets/images/ant_farm_1.png" : "assets/images/ant_farm_2.png";
        }
        
        img.style.filter = data.imgFilter;
        
        // Randomize polaroid rotation slightly
        const rot = -4 + Math.random() * 8;
        document.getElementById('polaroid-trigger').style.setProperty('--rot', `${rot}deg`);
        
        // Update player
        document.getElementById('player-label').textContent = data.videoLabel;
        
        // Signature updates based on story (Single Ant perspective)
        const sigs = {
            1: "- 루시가 파란 젤성 앞에서 ✍️",
            2: "- 루시가 1인 수직 갱도 현장에서 ✍️🏗️",
            3: "- 나 홀로 요새 설계사 루시가 ✍️🗺️",
            4: "- 혼자 다 먹는 개미가 부러운 루시가 ✍️💧",
            5: "- 1인 프리패스 도로 개통식을 본 루시가 🔍✍️",
            6: "- 방풍 방습 푸른 성곽을 만져본 루시가 🧱✍️",
            7: "- 유리벽 대치전의 목격자 루시가 🔍✍️",
            8: "- 야간 수호천사 개미를 사랑하는 루시가 👮✍️",
            9: "- 1인 대역사 준공식 대표 비서 루시가 👑✍️",
            10: "- 세 곤충 친구들을 응원하는 심판 루시가 ✍️🏅"
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
        nextBtn.style.opacity = currentEp === 10 ? '0.5' : '1';
        nextBtn.style.cursor = currentEp === 10 ? 'not-allowed' : 'pointer';
        
        // Smooth transition fade-in
        diaryCard.style.opacity = 1;
        diaryCard.style.transform = 'translateY(0)';
        
        // Special fireworks celebration on final Episode 10!
        if (currentEp === 10) {
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
    if (currentEp < 10) switchEpisode(currentEp + 1);
});

// Initialize first episode
switchEpisode(1);


// ==========================================
// 4. Background Particle Engine (Canvas)
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

class Bubble {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = 2 + Math.random() * 5;
        this.speedY = 0.5 + Math.random() * 1;
        this.speedX = -0.3 + Math.random() * 0.6;
        this.opacity = 0.2 + Math.random() * 0.4;
    }
    
    update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y / 40) * 0.2;
        
        if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.fillStyle = `rgba(33, 150, 243, ${this.opacity})`; // Soft blue watery bubbles
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

for(let i=0; i<25; i++) {
    particles.push(new Bubble());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();


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
// 6. Theme Switching Logic (Day/Night)
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


// ==========================================
// 7. Simulated Video Player (Canvas Drawing Loop - 1 Ant Only!)
// ==========================================
const videoTrigger = document.getElementById('video-trigger');
const videoModal = document.getElementById('video-modal');
const videoCloseBtn = document.getElementById('video-close-btn');
const videoCanvas = document.getElementById('video-canvas');
const vCtx = videoCanvas.getContext('2d');

let isVideoPlaying = false;
let videoFrameId = null;
let vTime = 0;

videoTrigger.addEventListener('click', () => {
    synth.playChime();
    videoModal.classList.add('active');
    
    const data = EPISODE_DATA[currentEp];
    document.getElementById('video-modal-title').textContent = `${data.title} - 생생 관찰 영상 🎬`;
    document.getElementById('video-modal-desc').textContent = data.videoDesc;
    
    isVideoPlaying = true;
    vTime = 0;
    resizeVideoCanvas();
    
    // Play scratching sound periodically
    if ([2, 5, 8].includes(currentEp)) {
        synth.playScratch();
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
    cancelAnimationFrame(videoFrameId);
    videoModal.classList.remove('active');
}

function resizeVideoCanvas() {
    videoCanvas.width = 560;
    videoCanvas.height = 315;
}

// Tunnels drawing helper
function drawGelTunnels() {
    vCtx.save();
    
    // Base blue gel
    const gelGrad = vCtx.createRadialGradient(280, 150, 50, 280, 150, 300);
    gelGrad.addColorStop(0, '#e3f2fd');
    gelGrad.addColorStop(1, '#90caf9');
    vCtx.fillStyle = gelGrad;
    vCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
    
    // Tunnel pathways
    vCtx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
    vCtx.lineWidth = 16;
    vCtx.lineCap = 'round';
    vCtx.lineJoin = 'round';
    
    vCtx.beginPath();
    vCtx.moveTo(280, 0);
    vCtx.lineTo(280, 220);
    
    vCtx.moveTo(280, 100);
    vCtx.quadraticCurveTo(180, 90, 140, 110);
    
    vCtx.moveTo(280, 180);
    vCtx.lineTo(440, 180);
    vCtx.stroke();
    
    // Draw Chambers
    vCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    vCtx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
    vCtx.lineWidth = 3;
    
    vCtx.beginPath();
    vCtx.arc(140, 110, 24, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    vCtx.beginPath();
    vCtx.arc(280, 220, 30, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    vCtx.restore();
}

function animateVideo() {
    if (!isVideoPlaying) return;
    
    vCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    vTime += 0.04;
    
    const action = EPISODE_DATA[currentEp].videoAction;
    
    // 1. Draw Background gel
    drawGelTunnels();
    
    // Scratch sound periodically for digging
    if (action === 'dig_down' || action === 'build_wall') {
        if (Math.floor(vTime * 3) % 12 === 0 && Math.random() > 0.8) {
            synth.playScratch();
        }
    }
    
    // 2. Render EXACTLY ONE Captain Ant based on action
    if (action === 'explore') {
        // Only one Captain Ant exploring the surface
        drawAnt(280 + Math.sin(vTime*2)*40, 40, 1.1, Math.sin(vTime*2)*0.3, vTime);
    } 
    else if (action === 'dig_down') {
        // One Captain Ant digging deep
        drawAnt(280, 80 + vTime * 6, 1.15, Math.PI/2, vTime);
        
        // falling crumbs
        vCtx.fillStyle = 'rgba(33, 150, 243, 0.6)';
        for(let i=0; i<4; i++) {
            const cy = (80 + vTime * 6 + i*12 + vTime*35) % 220;
            if (cy > 80 + vTime * 6) {
                vCtx.beginPath();
                vCtx.arc(280 + Math.sin(i + vTime)*3, cy, 2, 0, Math.PI*2);
                vCtx.fill();
            }
        }
    } 
    else if (action === 'sleep') {
        // Solo Captain resting peacefully in the main chamber
        drawAnt(280, 220, 1.15, 0, vTime * 0.1);
    } 
    else if (action === 'eat_sugar') {
        // Solo Captain enjoying sugar water all by himself!
        vCtx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        vCtx.strokeStyle = 'rgba(33,150,243,0.35)';
        vCtx.beginPath();
        vCtx.arc(280, 10, 12, 0, Math.PI*2);
        vCtx.fill();
        vCtx.stroke();
        
        drawAnt(280, 24, 1.1, -Math.PI/2, vTime);
    } 
    else if (action === 'run_highway') {
        // Solo Captain running back and forth on horizontal highway
        const highwayX = 140 + (vTime * 110) % 260;
        drawAnt(highwayX, 180, 1.1, 0, vTime);
    } 
    else if (action === 'build_wall') {
        // Solo Captain building a cozy protective wall at the entry
        drawAnt(260, 25, 1.05, -Math.PI/6, vTime);
        
        vCtx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        vCtx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
        vCtx.lineWidth = 1;
        // pile of gel crumbs
        for(let i=0; i<9; i++) {
            vCtx.beginPath();
            vCtx.arc(275 + (i%3)*4, 32 - Math.floor(i/3)*3, 2.5, 0, Math.PI*2);
            vCtx.fill();
            vCtx.stroke();
        }
    } 
    else if (action === 'meet_snail') {
        // Solo Captain meeting Dali Snail through the window
        drawSnailMini(80, 110, vTime);
        drawAnt(130, 110, 1.05, Math.PI, vTime);
    } 
    else if (action === 'patrol') {
        // Solo Captain doing a dedicated night-watch patrol
        drawAnt(280, 60 + Math.sin(vTime)*40, 1.1, Math.PI/2, vTime);
    } 
    else if (action === 'celebrate') {
        // Solo Captain holding an epic one-ant victory dance party!
        drawAnt(280, 220, 1.25, vTime * 0.6, vTime * 2.5);
        drawSparkles(280, 220, vTime);
    } 
    else if (action === 'crossover') {
        // Crossover Sports Day: Dali Snail on left, Ttougi on right,
        // and Solo Captain Ant marching proudly in the center as a one-ant army!
        drawSnailMini(100, 180, vTime);
        drawTtougiMini(460, 170, vTime);
        
        const soloX = 180 + (vTime * 50) % 200;
        drawAnt(soloX, 195, 1.1, 0, vTime * 2);
        
        drawSparkles(280, 150, vTime);
    }
    
    // 3. Draw Video HUD Overlay
    vCtx.save();
    vCtx.fillStyle = 'rgba(255,255,255,0.7)';
    vCtx.fillRect(15, 275, videoCanvas.width - 30, 25);
    vCtx.strokeStyle = 'var(--border-color)';
    vCtx.lineWidth = 2;
    vCtx.strokeRect(15, 275, videoCanvas.width - 30, 25);
    
    const progress = Math.min((vTime / 15) * 100, 100);
    vCtx.fillStyle = 'var(--accent-color)';
    vCtx.fillRect(20, 280, (videoCanvas.width - 40) * (progress / 100), 15);
    
    vCtx.fillStyle = '#fff';
    vCtx.beginPath();
    vCtx.arc(20 + (videoCanvas.width - 40) * (progress / 100), 287, 8, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    vCtx.restore();

    videoFrameId = requestAnimationFrame(animateVideo);
}

// Procedural Ant drawing!
function drawAnt(x, y, scale, angle, time) {
    vCtx.save();
    vCtx.translate(x, y);
    vCtx.rotate(angle);
    vCtx.scale(scale, scale);
    vCtx.fillStyle = '#3e2723'; // Ant dark brown/black
    
    // Gaster (abdomen) wiggles a bit
    const gasterWiggle = Math.sin(time * 8) * 0.15;
    vCtx.save();
    vCtx.translate(-10, 0);
    vCtx.rotate(gasterWiggle);
    vCtx.beginPath();
    vCtx.ellipse(0, 0, 9, 6, 0, 0, Math.PI*2);
    vCtx.fill();
    vCtx.restore();
    
    // Thorax (middle)
    vCtx.beginPath();
    vCtx.ellipse(-1, 0, 5, 4, 0, 0, Math.PI*2);
    vCtx.fill();
    
    // Head
    vCtx.save();
    vCtx.translate(6, -2);
    vCtx.beginPath();
    vCtx.arc(0, 0, 5, 0, Math.PI*2);
    vCtx.fill();
    
    // Eyes
    vCtx.fillStyle = '#ffffff';
    vCtx.beginPath();
    vCtx.arc(2, -1, 1, 0, Math.PI*2);
    vCtx.fill();
    vCtx.fillStyle = '#000000';
    vCtx.beginPath();
    vCtx.arc(2.2, -1, 0.5, 0, Math.PI*2);
    vCtx.fill();
    
    // Antennae (wiggling)
    vCtx.strokeStyle = '#3e2723';
    vCtx.lineWidth = 1.2;
    vCtx.beginPath();
    const antennaAngle = Math.sin(time * 10) * 0.2;
    vCtx.moveTo(3, -2);
    vCtx.quadraticCurveTo(10, -8 + antennaAngle*10, 14, -6);
    vCtx.moveTo(3, 0);
    vCtx.quadraticCurveTo(10, 6 - antennaAngle*10, 14, 4);
    vCtx.stroke();
    vCtx.restore();
    
    // Legs (6 wiggling legs)
    vCtx.strokeStyle = '#3e2723';
    vCtx.lineWidth = 1.5;
    const legPhase = time * 12;
    
    // Front legs
    vCtx.beginPath();
    vCtx.moveTo(2, 2);
    vCtx.lineTo(6 + Math.sin(legPhase)*4, 10);
    vCtx.moveTo(2, -2);
    vCtx.lineTo(6 - Math.sin(legPhase)*4, -10);
    
    // Middle legs
    vCtx.moveTo(-1, 2);
    vCtx.lineTo(-1 + Math.cos(legPhase)*4, 12);
    vCtx.moveTo(-1, -2);
    vCtx.lineTo(-1 - Math.cos(legPhase)*4, -12);
    
    // Back legs
    vCtx.moveTo(-4, 2);
    vCtx.lineTo(-8 + Math.sin(legPhase)*4, 11);
    vCtx.moveTo(-4, -2);
    vCtx.lineTo(-8 - Math.sin(legPhase)*4, -11);
    vCtx.stroke();
    
    vCtx.restore();
}

function drawTtougiMini(x, y, time) {
    vCtx.save();
    vCtx.translate(x, y + Math.sin(time * 6) * 12); // hopping effect!
    vCtx.fillStyle = '#81c784'; // green
    vCtx.strokeStyle = '#4caf50';
    vCtx.lineWidth = 1.5;
    
    // Body (long ellipse)
    vCtx.beginPath();
    vCtx.ellipse(0, 0, 16, 6, Math.PI/12, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    // Head (cone shape/circle)
    vCtx.beginPath();
    vCtx.arc(12, -4, 5, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    // Legs
    vCtx.strokeStyle = '#4caf50';
    vCtx.lineWidth = 2;
    vCtx.beginPath();
    vCtx.moveTo(-8, 2);
    vCtx.lineTo(-14, -10);
    vCtx.lineTo(-6, 8);
    vCtx.stroke();
    
    vCtx.restore();
}

function drawSnailMini(x, y, time) {
    vCtx.save();
    vCtx.translate(x, y + Math.sin(time * 1.5) * 2);
    vCtx.fillStyle = '#fdf5e6';
    vCtx.strokeStyle = '#d7ccc8';
    vCtx.lineWidth = 2;
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
}

function drawSparkles(x, y, time) {
    vCtx.save();
    vCtx.fillStyle = 'rgba(255, 235, 59, 0.8)';
    for(let i=0; i<6; i++) {
        const rad = 10 + (i*15 + time*40) % 35;
        const angle = i * (Math.PI/3) + time * 0.5;
        const px = x + rad * Math.cos(angle);
        const py = y + rad * Math.sin(angle);
        
        vCtx.beginPath();
        vCtx.arc(px, py, 2, 0, Math.PI*2);
        vCtx.fill();
    }
    vCtx.restore();
}


// ==========================================
// 8. 10th Episode Special watercolor celebration
// ==========================================
const petalCanvas = document.getElementById('petal-canvas');
const pCtx = petalCanvas.getContext('2d');

let celebrationInterval = null;
let pTime = 0;
let celebrateParticles = [];

class Confetti {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * petalCanvas.width;
        this.y = -20;
        this.size = 5 + Math.random() * 8;
        this.speedY = 1.5 + Math.random() * 2.5;
        this.speedX = -1 + Math.random() * 2;
        this.spin = -0.05 + Math.random() * 0.1;
        this.angle = Math.random() * Math.PI * 2;
        
        // Shiny watery colors (blue, yellow, magenta, green)
        const colors = ['#2196f3', '#ffeb3b', '#e91e63', '#4caf50', '#00abcd'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = 0.6 + Math.random() * 0.4;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 25) * 0.4;
        this.angle += this.spin;
        
        if (this.y > petalCanvas.height + 20) {
            this.reset();
        }
    }
    
    draw() {
        pCtx.save();
        pCtx.translate(this.x, this.y);
        pCtx.rotate(this.angle);
        pCtx.fillStyle = this.color;
        pCtx.globalAlpha = this.opacity;
        pCtx.beginPath();
        // Draw little diamond/star-like shards
        pCtx.moveTo(0, -this.size);
        pCtx.lineTo(this.size*0.7, 0);
        pCtx.lineTo(0, this.size);
        pCtx.lineTo(-this.size*0.7, 0);
        pCtx.closePath();
        pCtx.fill();
        pCtx.restore();
    }
}

function resizePetalCanvas() {
    petalCanvas.width = diaryCard.offsetWidth;
    petalCanvas.height = diaryCard.offsetHeight;
}

function startCelebration() {
    resizePetalCanvas();
    if (celebrationInterval) return;
    
    celebrateParticles = [];
    for(let i=0; i<45; i++) {
        celebrateParticles.push(new Confetti());
    }
    
    celebrationInterval = setInterval(() => {
        pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
        celebrateParticles.forEach(p => {
            p.update();
            p.draw();
        });
    }, 1000/60);
}

function stopCelebration() {
    if (celebrationInterval) {
        clearInterval(celebrationInterval);
        celebrationInterval = null;
        pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    }
}

window.addEventListener('resize', () => {
    if (celebrationInterval) resizePetalCanvas();
});


// ==========================================
// 9. Interactive Polaroid Zoom Popup
// ==========================================
const polaroid = document.getElementById('polaroid-trigger');
const zoomModal = document.getElementById('zoom-modal');
const zoomCloseBtn = document.getElementById('zoom-close-btn');
const zoomImg = document.getElementById('zoom-img');
const zoomCaption = document.getElementById('zoom-caption');

polaroid.addEventListener('click', () => {
    synth.playChime();
    const currentImg = document.getElementById('diary-img');
    const currentCaption = document.getElementById('diary-caption');
    
    zoomImg.src = currentImg.src;
    zoomCaption.textContent = currentCaption.textContent;
    zoomModal.classList.add('active');
});

zoomCloseBtn.addEventListener('click', () => {
    zoomModal.classList.remove('active');
});

zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) {
        zoomModal.classList.remove('active');
    }
});


// PWA Service Worker register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}
