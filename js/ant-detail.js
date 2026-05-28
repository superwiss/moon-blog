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
// 2. Data Base: Ants' 10 Episodes Content
// ==========================================
const EPISODE_DATA = {
    1: {
        title: "1일차: 신비로운 푸른 젤 개미집 🐜",
        date: "2026년 6월 15일 월요일",
        weather: "구름 없는 맑음 ☀️",
        text: "오늘 우리 집에 진짜진짜 신기하고 멋진 친구들이 도착했어요! 바로 투명하고 예쁜 파란색 젤리가 꽉 차 있는 특수 개미집과 한국홍가슴개미 식구들이랍니다. 개미들이 다치지 않게 조심히 파란 젤성 입구에 넣어주었어요. 그중에서 가장 덩치가 크고 멋진 카리스마를 가진 첫째 대장에게 '대장 개미'라는 이름을 지어주었지요. 대장 개미와 대원들은 새로운 파란 젤성에 오자마자 더듬이를 파르르 흔들며 젤바닥을 이리저리 문지르고 주위를 살피며 탐색을 시작했답니다. 신비한 젤 속에서 어떤 궁전 터널들이 뚫릴지 벌써부터 기대돼요!",
        caption: "파란 젤성 입구에서 주위를 적극적으로 탐색하는 개미들",
        imgFilter: "brightness(1) contrast(1)",
        videoLabel: "요새 탐색 영상 (0:15)",
        videoDesc: "대장 개미와 대원들이 파란 젤리 위에 옹기종기 모여 더듬이로 주변을 신나게 탐사하는 중이에요.",
        videoAction: "explore"
    },
    2: {
        title: "2일차: 수직 갱도 굴착 개시! 🏗️",
        date: "2026년 6월 16일 화요일",
        weather: "살짝 바람 부는 날 🍃",
        text: "와! 오늘 아침 개미통을 들여다보았더니 깜짝 놀랄 만한 변화가 있었어요! 대장 개미의 완벽한 지휘 아래, 일개미 대원들이 입을 모아 파란 젤을 아삭아삭 야금야금 파내려 가며 머리 하나가 쏙 들어갈 만한 깊은 수직 터널을 뚫어놓은 거예요! 대장 개미는 터널 입구에서 보초를 서며 대원들을 든든하게 지켜주었고, 대원들은 자른 젤 조각들을 머리 위로 번쩍 들어 올리며 밖으로 부지런히 날랐답니다. 아주 작은 몸집의 개미들이 단단한 젤을 이렇게나 열심히 뚫고 영차영차 협동하는 모습을 보니 진짜 기특하고 대단해요!",
        caption: "야금야금 아래로 수직 갱도를 파내려 가는 일개미 대원들",
        imgFilter: "brightness(1.02) contrast(0.98) saturate(1.1)",
        videoLabel: "수직 갱도 굴착 영상 (0:12)",
        videoDesc: "대장 개미의 진두지휘 하에 일개미들이 입으로 젤을 부지런히 뜯어내며 밑으로 전진해요.",
        videoAction: "dig_down"
    },
    3: {
        title: "3일차: 첫 번째 안락한 지하 침실 🛏️",
        date: "2026년 6월 17일 수요일",
        weather: "햇볕 쨍쨍 더움 ☀️🔥",
        text: "수직으로 쑥 파고 내려가던 개미 특공대가 오늘은 옆으로 방향을 휙 틀었어요! 가로로 둥글게 파내려 가더니 동그랗고 널찍한 비밀 지하 챔버(방)를 뚝딱 완성했답니다. 다 지어진 방에 옹기종기 모여서 서로의 더듬이를 슥슥 맞대고 다정하게 대화를 나누거나 젤 위에서 꿀맛 같은 낮잠을 자는 모습을 포착했어요! 대장 개미는 방 한가운데서 대원들을 포근히 감싸고 있었고, 밖에서는 경비 개미가 서성거렸답니다. 이 푸른 젤리 방은 개미들의 첫 번째 보금자리인 안락한 침실이 된 것 같아요. 정말 정교하고 신기한 설계예요!",
        caption: "동그란 가로 챔버 속에 모여 단잠을 자는 개미 대원들",
        imgFilter: "brightness(1.05) saturate(1.15)",
        videoLabel: "지하 침실 단잠 영상 (0:14)",
        videoDesc: "완성된 동그란 침실 방에 옹기종기 모여 더듬이를 맞대고 편안하게 쉬고 있는 개미 가족.",
        videoAction: "sleep"
    },
    4: {
        title: "4일차: 달콤한 설탕물 충전 시간 💧",
        date: "2026년 6월 18일 목요일",
        weather: "개구리 노래하는 흐림 ☁️",
        text: "열심히 땅을 파는 개미 대원들을 위해 아빠랑 특급 간식을 준비했어요! 주사기에 달콤하고 맛있는 설탕물을 한 방울 쪽 담아서 개미집 상단 먹이 급여구에 살포시 얹어주었지요. 그러자 보초를 서던 대장 개미가 냄새를 킁킁 맡고는 재빨리 다가와 설탕물 방울을 맛있게 냠냠 먹기 시작했어요. 그리고 터널 속 대원들에게 쏜살같이 돌아가 입에서 입으로 달콤한 설탕물을 골고루 나누어주는 기발한 '사회적 위장'을 선보였답니다! 온 식구가 다 같이 달콤한 기운을 가득 충전하고 나더니 터널 공사에 속도가 어마어마하게 붙기 시작했어요!",
        caption: "달콤한 설탕물 한 방울을 사이좋게 나눠 먹는 모습",
        imgFilter: "brightness(0.98) saturate(1.25)",
        videoLabel: "당 충전 스위트 영상 (0:15)",
        videoDesc: "설탕물 방울 주위로 모여들어 배가 투명하게 부풀어 오르도록 맛있게 당을 보충하는 개미들.",
        videoAction: "eat_sugar"
    },
    5: {
        title: "5일차: 지하 2층 수평 고속도로 개통! 🗺️",
        date: "2026년 6월 19일 금요일",
        weather: "선선하고 기분 좋은 맑음 ☀️",
        text: "개미들의 개척 정신은 끝이 없나 봐요! 어제 다진 설탕물 에너지를 가지고 오늘 무려 지하 2층까지 도달하더니, 좌우로 아주 길고 넓은 수평 터널을 뚫어냈습니다. 그 길이와 직선도가 얼마나 자로 잰 듯 똑바른지, 꼭 우리 동네 지하철선이나 고속도로를 보는 것 같았지요! 일개미들이 서로 스쳐 지나갈 때마다 교통체증 없이 길을 척척 양보해가며 바쁘게 오가는 협동 시스템이 아주 잘 짜여 있었어요. 대장 개미는 고속도로 중심 교차로에 딱 버티고 서서 양방향 통행을 조율하는 카리스마 사령관처럼 멋지게 지시를 내리고 있었답니다!",
        caption: "지하 2층에 일직선으로 개통된 시원한 수평 고속도로",
        imgFilter: "brightness(1.02) contrast(1.02)",
        videoLabel: "수평 도로 통행 영상 (0:13)",
        videoDesc: "양방향으로 뚫린 긴 터널을 일개미들이 마주치며 서로 통행을 조율하며 바삐 오가요.",
        videoAction: "run_highway"
    },
    6: {
        title: "6일차: 젤리 부스러기 대작전 🧱",
        date: "2026년 6월 20일 토요일",
        weather: "주륵주륵 여름 장마 🌧️🌧️",
        text: "오늘은 밖에서 비가 엄청나게 내렸어요. 습도가 높아진 개미집 안에서 개미들이 신기한 공동 작업을 하고 있었답니다. 터널을 파면서 나온 푸른 젤리 부스러기들을 한곳에 버리지 않고, 입구 주변에 조르르 쌓아 올려 꼭 성벽이나 둑 같은 단단한 방벽을 만들고 있는 거예요! 대장 개미가 선두에서 부스러기를 조심히 물어 입구 모서리에 꾹꾹 눌러 다지자, 뒤를 이은 대원들도 젤리 성벽을 튼튼하게 보강했지요. 외부 습기나 빛을 차단해 집안을 쾌적하고 안전하게 유지하려는 개미들의 똑똑한 생활 지혜에 감탄사가 절로 나왔어요!",
        caption: "파낸 젤 가루들을 뭉쳐 튼튼한 요새 성벽을 쌓는 특공대",
        imgFilter: "brightness(1) saturate(1.1)",
        videoLabel: "방벽 건축 영상 (0:15)",
        videoDesc: "개미들이 입으로 젤 부스러기 벽돌을 차곡차곡 모아 입구 주변에 멋진 요새 성벽을 지어요.",
        videoAction: "build_wall"
    },
    7: {
        title: "7일차: 이웃집 달팽이와의 첫 유리창 면담 🔍",
        date: "2026년 6월 21일 일요일",
        weather: "개인 하늘과 예쁜 무지개 🌈",
        text: "오늘은 개미집 옆에 우리 달팽이 대가족의 통을 나란히 놓아주었어요. 투명한 아크릴 유리창을 사이에 두고, 드디어 우리 대장 개미와 첫째 달이의 신비로운 첫 만남이 이루어졌답니다! 대장 개미가 유리창 쪽으로 조심히 기어가 더듬이를 바르르 떨며 인사하자, 유리창 너머에 있던 느림보 달이도 신기한 듯 커다란 눈 stalks(눈자루)를 쭉 내밀고 한참 동안 개미의 움직임을 관찰했어요. 크기와 움직이는 속도는 완전히 다르지만, 두 녀석이 눈을 맞추며 교감하는 모습이 너무 귀여워서 돋보기를 들고 한참을 배시시 웃으며 구경했답니다!",
        caption: "유리벽 너머로 눈을 마주하며 소통하는 대장 개미와 달이",
        imgFilter: "brightness(1.03) saturate(1.05)",
        videoLabel: "이웃사촌 대면 영상 (0:11)",
        videoDesc: "더듬이를 바르르 움직이는 개미와 눈자루를 길게 뺀 달이의 평화로운 첫 유리벽 미팅.",
        videoAction: "meet_snail"
    },
    8: {
        title: "8일차: 푸른 젤성의 완벽한 순찰대 👮",
        date: "2026년 6월 22일 월요일",
        weather: "바람 솔솔 부는 밤 🌟",
        text: "밤에 잠이 안 와서 스탠드 불빛 아래 개미집을 가만히 관찰했어요. 모두가 잠든 고요한 시간에도 대장 개미와 정예 보초 대원들은 쉬지 않고 푸른 젤리 요새 전체를 꼼꼼하게 순찰하고 있었답니다! 수직 통로부터 침실, 2층 고속도로와 외벽 성벽까지 구석구석을 기어 다니며 혹시나 젤성에 균열이 있거나 위험 요소가 없는지 체크하는 철통 보안 모습이었어요. 밤하늘 푸른 별처럼 빛나는 젤성 안에서 든든하게 요새를 지키는 대장 개미 순찰대를 보니 안심하고 푹 잘 수 있을 것 같아요. 멋쟁이 순찰대 화이팅!",
        caption: "한밤중 푸른 젤성을 질서 정연하게 순찰하는 개미 순찰대",
        imgFilter: "brightness(0.92) contrast(1.05) saturate(0.95)",
        videoLabel: "철통 요새 순찰 영상 (0:14)",
        videoDesc: "스탠드 조명 속 푸른 젤리 미로를 질서정연하게 오가며 꼼꼼히 안전을 체크하는 순찰 대원들.",
        videoAction: "patrol"
    },
    9: {
        title: "9일차: 파란 젤 대궁전 완성 기념식! 👑",
        date: "2026년 6월 24일 수요일",
        weather: "구름 한 점 없는 파란 하늘 ☀️",
        text: "드디어 오늘, 우리 개미 군단의 파란 젤 대궁전이 완벽하게 완공되었습니다! 개미집 아래쪽부터 상단 출구까지 모든 수직 갱도와 수평 통로들이 거미줄처럼 그물망 시스템으로 멋지게 연결되어, 거대하고 화려한 3차원 개미 입체 요새가 만들어졌어요. 고생한 대장 개미와 대원들이 요새 가장 안쪽에 있는 크고 화려한 중앙 궁전에 모여 서로의 몸을 깨끗이 단장해주고, 먹이를 다정하게 나누며 완공 축하연을 즐기고 있네요! 9일 동안 매일매일 포기하지 않고 흙 대신 젤을 파가며 정교한 걸작을 만들어 낸 우리 개미들, 진짜 기특해서 아낌없는 박수를 보내주고 싶어요!",
        caption: "화려한 3D 푸른 젤 궁전을 마침내 완공한 개미 특공대",
        imgFilter: "brightness(1.04) saturate(1.25)",
        videoLabel: "대궁전 완공 축하 영상 (0:15)",
        videoDesc: "정교하게 개통된 3차원 푸른 젤 대궁전 속에서 평화롭고 웅장한 기념 축하연을 벌이는 모습.",
        videoAction: "celebrate"
    },
    10: {
        title: "10일차: 파란 젤 특공대의 완벽한 작전: 연합 운동회! 🏆",
        date: "2026년 6월 25일 목요일",
        weather: "화창하고 맑은 가을바람 🍂",
        text: "보고드립니다! 오늘 11시경, 마당의 장미 영토에서 사상 초유의 '초록 들판 곤충 연합 운동회' 전투가 벌어졌습니다! 우리 푸른 젤성 한국홍가슴개미 연대 대표인 나 대장 개미와, 비행 돌격 능력을 갖춘 날렵한 뒷다리의 방아깨비 뚜기 형아, 그리고 엄청난 무게중심 패각 닻을 소유한 느림보 달이 녀석까지 삼국 동맹군이 잔디 연병장에 집결했지요. 첫 경기인 '지상 돌파 기어가기 작전'이 발발하자마자, 뚜기 녀석은 엄청난 충격 도약력을 일으키며 미사일처럼 10미터를 폴짝 날아 가볍게 공중 우위를 선점했습니다. 하지만 우리 개미 사단도 결코 호락호락하지 않았지요! 즉각 '영차영차!' 훈련된 제식 구령에 맞추어 수십 마리의 정예 일개미 대원들을 3열 종대로 칼같이 배치, 고도의 전술적 대열을 맞춰 일사불란한 행진 속도로 잔디밭을 압도적으로 돌파해 갔습니다! 그 와중에 달이 녀석은 몸체 후미에서 투명 윤활유 특수 오일을 바닥에 사정없이 코팅하더니, 마찰 계수를 0으로 만들어 패각 밑바닥을 미끄럼틀처럼 쭉쭉 썰매 태워 초속 슬라이딩 질주를 시도하는 기상천외한 전략을 펼쳤습니다! ‘스스스슥-!’ 하는 가히 사기적인 속도에 관람석의 루시 대장이 웃음을 터트리며 격렬한 박수를 보냈죠. 두 번째 종목인 '식량 보급 루꼴라 쟁탈전'이 개시되자, 우리 공병 부대의 정밀 커터 능력이 빛을 발했습니다. 대원들이 줄 맞춰 루꼴라 잎을 한 치의 오차도 없는 사각 격자 도면으로 완벽하게 전단하여 기지 터널로 신속하게 수송 작전을 완료했거든요! 뚜기 녀석은 턱 관절 속사포 공격으로 이파리들에 무수한 포탄 구멍을 냈고, 달이는 입안의 진공 흡입 모터를 가동해 대형 당근 슬라이스를 꼬물꼬물 통째로 소화시키는 괴력을 선보였습니다. 마지막 '줄다리기 참호전'에서는 세 전사의 힘이 우주급으로 격돌했습니다. 뚜기가 잔디밭에 발톱을 깊숙이 고정하고 당겼고, 달이가 자기 질량의 100배에 달하는 패각의 우직한 중력 무게로 버티는 사이, 우리 개미 백만 대군이 어깨를 겯고 총출동해 온 힘을 모아 밧줄인 장미 넝쿨을 잡아당겼죠! 팽팽한 장력에 걸린 장미 줄기가 결국 '툭-' 소리를 내며 끊어져, 세 동맹군 모두 잔디밭 위로 벌러덩 슬랩스틱 자빠짐을 시도하며 대작전은 성황리에 종료되었습니다! 전투 결과는 전원 만장일치 공동 우승! 서로 다른 전술과 규격을 가졌지만, 함께 협동하여 잔디 연병장을 뒹구는 시간은 가히 감동적인 초록빛 판타지였습니다. 뚜기 요정, 은빛 달팽이, 그리고 우리 파란 젤성 개미 부대까지! 우리 모두 루시 대장의 영원한 우방국 단짝 패밀리로서 영원한 평화와 협동을 선서합니다! 동물 연합 특공대 영원하라! 💚🏆🎖️",
        caption: "일사불란한 행진과 철통 전술로 빛난 동물 연합 대작전!",
        imgFilter: "brightness(1.02) saturate(1.15) contrast(1.05)",
        videoLabel: "연합 운동회 단체전 (0:25)",
        videoDesc: "대장 개미가 이끄는 개미 군단이 일사불란하게 나란히 행진하며 뚜기와 달이와 격돌하는 명승부!",
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
            img.src = "assets/images/ant_farm_1.png"; // or custom crossover illustration
        } else {
            img.src = currentEp % 2 === 1 ? "assets/images/ant_farm_1.png" : "assets/images/ant_farm_2.png";
        }
        
        img.style.filter = data.imgFilter;
        
        // Randomize polaroid rotation slightly
        const rot = -4 + Math.random() * 8;
        document.getElementById('polaroid-trigger').style.setProperty('--rot', `${rot}deg`);
        
        // Update player
        document.getElementById('player-label').textContent = data.videoLabel;
        
        // Signature updates based on story
        const sigs = {
            1: "- 루시가 파란 젤성 앞에서 ✍️",
            2: "- 루시가 수직 갱도 현장에서 ✍️🏗️",
            3: "- 지하 요새 설계사 루시가 ✍️🗺️",
            4: "- 영차영차 구령에 맞춘 루시가 ✍️",
            5: "- 투명 방 속 개미를 돋보기로 보는 루시가 🔍✍️",
            6: "- 젤리 푸딩을 선물한 루시가 🍮✍️",
            7: "- 지하 터널 통풍을 도운 루시가 🍃✍️",
            8: "- 고속도로 개통식을 직관한 루시가 🏁✍️",
            9: "- 영리한 개미 군단의 보좌관 루시가 👑✍️",
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
// 7. Simulated Video Player (Canvas Drawing Loop)
// ==========================================
const videoTrigger = document.getElementById('video-trigger');
const videoModal = document.getElementById('video-modal');
const videoCloseBtn = document.getElementById('video-close-btn');
const videoCanvas = document.getElementById('video-canvas');
const vCtx = videoCanvas.getContext('2d');

let isVideoPlaying = false;
let videoFrameId = null;
let vTime = 0;
let antLegWiggle = 0;
let progressPercent = 0;

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

// Draw the beautiful blue gel ant-farm tunnels procedurally!
function drawGelTunnels() {
    vCtx.save();
    
    // Base translucent blue gel gradient
    const gelGrad = vCtx.createRadialGradient(280, 150, 50, 280, 150, 300);
    gelGrad.addColorStop(0, '#e3f2fd'); // Soft ice blue
    gelGrad.addColorStop(1, '#90caf9'); // Translucent royal blue
    vCtx.fillStyle = gelGrad;
    vCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
    
    // Drawing watercolor gel lines
    vCtx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
    vCtx.lineWidth = 14;
    vCtx.lineCap = 'round';
    vCtx.lineJoin = 'round';
    
    // Tunnel 1: Central vertical shaft
    vCtx.beginPath();
    vCtx.moveTo(280, 0);
    vCtx.lineTo(280, 220);
    
    // Tunnel 2: Left 1st floor chamber
    vCtx.moveTo(280, 100);
    vCtx.quadraticCurveTo(180, 90, 140, 110);
    
    // Tunnel 3: Right highway (straight horizontal)
    vCtx.moveTo(280, 180);
    vCtx.lineTo(440, 180);
    vCtx.stroke();
    
    // Draw Chambers
    vCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    vCtx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
    vCtx.lineWidth = 3;
    
    // Left Chamber
    vCtx.beginPath();
    vCtx.arc(140, 110, 22, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    // Central Chamber
    vCtx.beginPath();
    vCtx.arc(280, 220, 28, 0, Math.PI*2);
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
    
    // 2. Render characters based on action
    if (action === 'explore') {
        // Ants walking around top area
        drawAnt(280 + Math.sin(vTime*2)*30, 40, 1, Math.sin(vTime*2)*0.2, vTime);
        drawAnt(220 + Math.cos(vTime)*20, 30, 0.8, -0.2, vTime + 1);
    } 
    else if (action === 'dig_down') {
        // Ant at the bottom of shaft wiggling and chipping gel
        drawAnt(280, 80 + vTime * 6, 1, Math.PI/2, vTime);
        
        // falling gel crumbs
        vCtx.fillStyle = 'rgba(33, 150, 243, 0.6)';
        for(let i=0; i<5; i++) {
            const cy = (80 + vTime * 6 + i*10 + vTime*40) % 220;
            if (cy > 80 + vTime * 6) {
                vCtx.beginPath();
                vCtx.arc(280 + Math.sin(i + vTime)*3, cy, 2, 0, Math.PI*2);
                vCtx.fill();
            }
        }
    } 
    else if (action === 'sleep') {
        // Ants resting inside left chamber
        drawAnt(135, 110, 0.9, Math.PI/6, vTime * 0.2); // sleeping - slow breathing wiggle
        drawAnt(145, 115, 0.8, -Math.PI/4, vTime * 0.15);
        drawAnt(280, 220, 1.1, 0, vTime * 0.1); // big captain resting in central chamber
    } 
    else if (action === 'eat_sugar') {
        // Feeding scene at the top
        vCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        vCtx.strokeStyle = 'rgba(33,150,243,0.3)';
        vCtx.beginPath();
        vCtx.arc(280, 10, 12, 0, Math.PI*2); // drop of water
        vCtx.fill();
        vCtx.stroke();
        
        // Ants drinking
        drawAnt(268, 16, 0.9, -Math.PI/4, vTime);
        drawAnt(292, 16, 0.95, -Math.PI*0.75, vTime + 0.5);
    } 
    else if (action === 'run_highway') {
        // Fast running ants along right highway
        const highwayX1 = (100 + vTime * 120) % 360;
        const highwayX2 = (440 - vTime * 90);
        drawAnt(280 + (highwayX1 % 160), 180, 0.9, 0, vTime);
        if (highwayX2 > 280) {
            drawAnt(highwayX2, 180, 0.85, Math.PI, vTime + 2);
        }
    } 
    else if (action === 'build_wall') {
        // Ants piling crumbs at the entry
        drawAnt(260, 25, 0.95, -Math.PI/6, vTime);
        
        vCtx.fillStyle = 'rgba(33, 150, 243, 0.8)';
        vCtx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
        vCtx.lineWidth = 1;
        // pile of gel crumbs
        for(let i=0; i<12; i++) {
            vCtx.beginPath();
            vCtx.arc(275 + (i%4)*4, 32 - Math.floor(i/4)*3, 2.5, 0, Math.PI*2);
            vCtx.fill();
            vCtx.stroke();
        }
    } 
    else if (action === 'meet_snail') {
        // Dali Snail outside the glass container on the left!
        drawSnailMini(80, 110, vTime);
        // Ant wiggling on the inside of the wall
        drawAnt(130, 110, 1.05, Math.PI, vTime);
    } 
    else if (action === 'patrol') {
        // Patrol ants marching
        drawAnt(280, 60 + Math.sin(vTime)*30, 1, Math.PI/2, vTime);
        drawAnt(320, 180, 0.9, 0, vTime + 1);
    } 
    else if (action === 'celebrate') {
        // All ants party! Wiggling around central chamber
        drawAnt(280, 220, 1.2, vTime * 0.5, vTime * 2); // Captain spinning
        drawAnt(262, 212, 0.85, Math.PI/3, vTime * 3);
        drawAnt(298, 228, 0.8, -Math.PI/3, vTime * 2.5);
        drawAnt(282, 195, 0.9, Math.PI, vTime * 2);
        
        // Sparkling stars in central chamber
        drawSparkles(280, 220, vTime);
    } 
    else if (action === 'crossover') {
        // Epic Crossover Sports day!
        // Draws grasshopper on the right, snail on the left, and ant platoon marching in the center
        drawSnailMini(100, 180, vTime);
        drawTtougiMini(460, 170, vTime);
        
        // Platoon of 3 ants marching together!
        const platoonX = 220 + (vTime * 40) % 180;
        drawAnt(platoonX, 195, 0.9, 0, vTime * 1.5);
        drawAnt(platoonX - 25, 205, 0.8, 0, vTime * 1.5);
        drawAnt(platoonX - 12, 185, 0.85, 0, vTime * 1.5);
        
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
