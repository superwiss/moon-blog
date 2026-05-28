/* js/snail-detail.js */

// ==========================================
// 1. Web Audio API Sound Synthesizer (Poops & Squishes!)
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

    // Funny cartoon "pop/plop" sound for laying colorful snail poop!
    playPoopPop() {
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        // Fast falling pitch sweep for bubble pop
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Squishy wet crawling sound effect (Procedural FM)
    playSquish() {
        this.init();
        const now = this.ctx.currentTime;
        
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        
        carrier.type = 'triangle';
        carrier.frequency.setValueAtTime(90, now);
        // Low pitch modulation for wobbly jelly effect
        carrier.frequency.linearRampToValueAtTime(140, now + 0.3);
        carrier.frequency.linearRampToValueAtTime(90, now + 0.6);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(8, now); // LFO wobble
        modGain.gain.setValueAtTime(30, now);
        
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        carrier.start(now);
        modulator.start(now);
        carrier.stop(now + 0.65);
        modulator.stop(now + 0.65);
    }

    // Play cheerful royalty-free MP3 BGM (Warm Summer!)
    startAmbient() {
        if (this.isPlayingAmbient) return;
        this.isPlayingAmbient = true;
        
        if (!this.bgmAudio) {
            this.bgmAudio = new Audio("./assets/audio/warm-summer.mp3");
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
            console.log("Snail BGM autoplay prevented.", e);
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
// 2. Data Base: Snails' 10 Episodes Content
// ==========================================
const EPISODE_DATA = {
    1: {
        title: "1일차: 16마리 대가족의 첫 소풍 🐌",
        date: "2026년 6월 1일 월요일",
        weather: "개구리 우는 날 🐸🌧️",
        text: "오늘 우리 집에 아주 특별하고 꼬물거리는 식구들이 대거 이사를 왔어요! 바로 귀여운 달팽이 16마리 대가족이랍니다. 그중에서 가장 껍질이 크고 늠름한 첫째 대장에게는 '달이'라는 이름을 붙여주었고, 나머지 15마리 귀여운 동생들은 다 같이 '팽이들'이라고 부르기로 했어요. 아빠랑 함께 촉촉한 코코피트 흙을 부드럽게 깔고 푸른 이끼도 듬뿍 얹어 새 보금자리를 만들었답니다. 16마리나 되다 보니 온 통 안이 순식간에 복작복작 소풍을 온 것처럼 활기가 가득하네요. 앞으로 루시의 팽이 관찰 일기가 시작됩니다!",
        caption: "포근한 새 흙집을 탐색하는 16마리 달팽이 대가족",
        imgFilter: "brightness(1) contrast(1)",
        videoLabel: "가족 탐험 영상 (0:15)",
        videoDesc: "16마리 팽이들이 흙 위로 안테나 눈을 쏙 내밀며 이리저리 소풍을 시작해요.",
        videoAction: "explore"
    },
    2: {
        title: "2일차: 폭풍 루꼴라 먹방 🥬",
        date: "2026년 6월 3일 수요일",
        weather: "촉촉하고 선선함 🍃",
        text: "와! 16마리 팽이들의 먹성이 진짜 어마어마하게 대단할 줄 몰랐어요! 아침에 텃밭에서 갓 뜯어온 싱싱한 루꼴라 잎이랑 상추를 풍성하게 넣어줬는데, 사방에 흩어져 있던 녀석들이 상큼한 채소 향을 맡았는지 순식간에 스르르 기어 나와 잎사귀 주위로 옹기종기 뭉쳤어요. 다들 머리를 잎사귀에 꼭 처박고 '사각사각, 사그락' 소리를 내며 구멍을 송송 뚫어가며 쉼 없이 갉아 먹는데, 다 같이 먹어 대니 상추 한 장이 금세 그물망처럼 변해버렸답니다. 대단한 식신들이에요!",
        caption: "루꼴라 잎을 한껏 갉아먹으며 폭풍 먹방을 펼치는 달이와 동생들",
        imgFilter: "hue-rotate(20deg) contrast(1.05)",
        videoLabel: "잎사귀 먹방 영상 (0:12)",
        videoDesc: "달이가 머리를 잎사귀에 대고 갉아 먹어 구멍을 내는 부지런한 식사 장면이에요.",
        videoAction: "eat_green"
    },
    3: {
        title: "3일차: 초록색 똥의 대폭발! 🟢",
        date: "2026년 6월 5일 금요일",
        weather: "맑음 속 바람 ☀️🍃",
        text: "앗! 학교에서 돌아와 팽이들 통을 들여다보다가 정말 기절할 뻔하면서도 빵 터졌어요! 흙 위는 물론이고 투명한 플라스틱 벽이랑 천장까지 얇고 꼬불꼬불한 초록색 국수 가락 같은 똥들이 진짜 산더미처럼 가득히 쌓여 있는 거예요! 16마리가 밤새 루꼴라 잎을 다 먹어 치우더니 엄청나게 똥을 싸질러 놨네요. 아빠가 달팽이는 신기하게도 자기가 먹은 먹이의 색깔 그대로 똥을 싼다고 알려주셨어요. 루꼴라를 많이 먹어서 완연한 초록색 국수 똥이 나온 거래요! 엄청난 생산력에 박수를 보냅니다.",
        caption: "루꼴라 폭식 후 온 동네에 싸지른 신기한 초록 똥!",
        imgFilter: "hue-rotate(-15deg) saturate(1.1)",
        videoLabel: "초록 똥 방출 영상 (0:10)",
        videoDesc: "루꼴라를 엄청 먹고 귀여운 초록색 똥을 슝 하고 배출하는 순간 포착이에요!",
        videoAction: "poop_green"
    },
    4: {
        title: "4일차: 당근 뷔페와 주황 똥 파티 🥕",
        date: "2026년 6월 8일 월요일",
        weather: "소나기 온 뒤 무지개 🌈",
        text: "초록 똥의 대폭발 비밀을 목격한 나는 오늘 아주 신나는 실험을 계획했어요. 바로 냉장고에 있던 주황색 당근을 얇게 썰어 당근 특식 뷔페를 성대하게 차려준 것이죠! 16마리의 식성 폭발 먹보들은 당근 조각을 쉴 새 없이 기어올라 기대를 저버리지 않고 흔적도 없이 갉아먹어 치웠어요. 그리고 다음 날 아침, 팽이들은 온 동네에 앙증맞은 주황색 크레파스 같은 똥들을 또다시 대방출해주었어요! 흙 위에 마치 주황색 꽃들이 만발한 것 같아 똥 청소를 하면서도 자꾸 웃음이 나왔답니다.",
        caption: "단단한 당근도 아랑곳하지 않고 맛있게 냠냠 먹는 팽이들",
        imgFilter: "hue-rotate(45deg) saturate(1.2)",
        videoLabel: "주황 똥 파티 영상 (0:15)",
        videoDesc: "당근을 먹은 달이가 기어간 자리에 크레파스로 그린 듯한 예쁜 주황 똥이 남겨져요.",
        videoAction: "poop_orange"
    },
    5: {
        title: "5일차: 달이의 대탐험 (탈출 사건!) 🔍",
        date: "2026년 6월 10일 수요일",
        weather: "구름 뭉게뭉게 ☁️",
        text: "오늘 가슴 쓸어내리는 탈출 대사건이 있었어요! 학원 가기 전에 팽이 통을 슬쩍 봤는데, 제일 큰 대장 달이가 보이지 않는 거예요. 뚜껑 틈이 살짝 열려 있었나 봐요! 놀란 마음에 온 책상과 방바닥을 샅샅이 뒤졌어요. 한참을 헤매다 보니, 책상다리 뒤쪽에 투명하고 반짝이는 은빛 끈끈한 길(점액 길)이 보였어요. 그 은빛 보물지도를 따라 쭉 내려갔더니, 책상 밑 바닥 구석에서 아주 느리게 영차영차 대탐험 중인 달이를 무사히 극적으로 발견했답니다! 달아, 집 떠나면 고생이야!",
        caption: "탈출 후 은빛 자국을 남기며 산책하던 달이",
        imgFilter: "brightness(1.05) sepia(0.15)",
        videoLabel: "은빛 점액 길 관찰 (0:18)",
        videoDesc: "달이가 이동하면서 바닥에 반짝거리는 이쁜 은빛 발자국 길을 만드는 원리에요.",
        videoAction: "trail"
    },
    6: {
        title: "6일차: 패각이 튼튼해지는 칼슘 식사 ⚪",
        date: "2026년 6월 12일 금요일",
        weather: "화사한 햇살 ☀️",
        text: "달이와 팽이들의 집(패각)이 더 건강하고 단단해질 수 있도록 특별 보양식을 준비했어요. 바로 말린 달걀껍질을 아주 곱게 빻아 만든 백색 칼슘 가루와 따뜻한 두부 가루예요! 흙 위에 하얗게 흩뿌려 주자마자 16마리 대가족이 꼬물꼬물 몰려들어서 촉촉한 흙과 가루를 뒤섞어가며 맛있게 먹었어요. 다들 하얀 가루를 얼굴에 묻히고 냠냠 먹는 모습이 꼭 눈을 맞이한 산타 요정들 같아서 한참을 흐뭇하게 웃었습니다.",
        caption: "칼슘 두부 가루를 얼굴에 묻히고 먹는 달이",
        imgFilter: "brightness(1.1) contrast(0.95)",
        videoLabel: "보양 가루 냠냠 (0:12)",
        videoDesc: "하얀 백색 영양 가루 주위에 옹기종기 모여 패각을 단단하게 키우는 팽이들이에요.",
        videoAction: "eat_white"
    },
    7: {
        title: "7일차: 우당탕탕 달팽이 달리기 경주 🏁",
        date: "2026년 6월 15일 월요일",
        weather: "시원한 소나기 🌧️",
        text: "비가 와서 팽이들이 엄청 기분이 좋아 보였어요. 그래서 나는 스케치북에 동그라미 트랙을 둥글게 그리고 '제1회 팽이 올림픽 달리기 경주'를 열었어요! 트랙 중심에 달이와 에이스 팽이 4마리를 놓아두었죠. 탕! 소리와 함께 출발했는데, 역시 대장 달이가 긴 안테나 눈을 쫑긋 세우며 가장 먼저 트랙 선 밖으로 느릿느릿 돌진해 우승을 거머쥐었어요! 하지만 나머지 친구들은 출발선에 몸을 꼭 집어넣고 낮잠을 자기 시작해서 경주가 금방 끝나버렸답니다.",
        caption: "올림픽 트랙을 힘차게(!) 가로지르는 달이",
        imgFilter: "hue-rotate(90deg) brightness(0.98)",
        videoLabel: "올림픽 경주 영상 (0:15)",
        videoDesc: "안테나 눈을 한껏 펴고 목적지를 향해 포복 전진하는 달이의 질주!",
        videoAction: "race"
    },
    8: {
        title: "8일차: 단짝 친구 개미 대장과의 눈인사 🐜",
        date: "2026년 6월 17일 수요일",
        weather: "포근한 저녁 🍃",
        text: "오늘은 팽이들 통 바로 옆방에 사는 단짝 친구, '대장 개미'와의 이색 미팅이 있었어요! 달이가 플라스틱 벽 쪽으로 기어가더니, 마침 벽을 타고 오르던 대장 개미와 눈높이가 딱 마주쳤어요. 대장 개미는 더듬이를 흔들흔들하고, 달이는 두 눈을 쫑긋 펴고 서로를 가만히 바라보았지요. 흙을 파고 집을 짓는 개미와 느릿느릿 먹방을 하는 달이, 서로 종류는 다르지만 우리 집 마당에서 온 착한 친구들이라 서로 인사를 하는 것처럼 보였어요.",
        caption: "투명 창 너머 대장 개미와 교감 중인 달이",
        imgFilter: "brightness(1.02) contrast(1.02)",
        videoLabel: "이색 눈인사 영상 (0:11)",
        videoDesc: "느릿느릿 다가온 달이와 벽에 붙어 더듬이를 wiggling 하는 개미의 만남이에요.",
        videoAction: "meet_ant"
    },
    9: {
        title: "9일차: 온천욕과 노란 옥수수 구슬 똥 ⛲",
        date: "2026년 6월 20일 토요일",
        weather: "비가 주룩주룩 🌧️🌧️",
        text: "비가 종일 많이 와서 방이 건조하지 않게 분무기로 팽이들 통에 미지근한 물을 안개처럼 사르르 뿌려주었어요. 물안개가 퍼지자 16마리가 다 같이 약속이라도 한 듯 몸을 길게 쭉 뽑아 올리며 행복한 온천욕 자세를 취했어요! 기분 좋아진 먹보들에게 맛있는 노란 초당옥수수를 알갱이째 줬더니 순식간에 해치우는 괴력을 발휘했어요. 그리고 몇 시간 뒤, 예상대로 흙 위에는 아주 달콤해 보이는 노란색 구슬 똥들이 한가득 흩뿌려졌답니다. 16마리 대식가의 똥을 매일 치우는 건 힘들지만 진짜 행복해요!",
        caption: "달콤한 초당옥수수와 예쁜 노란 똥송이들",
        imgFilter: "hue-rotate(60deg) saturate(1.25)",
        videoLabel: "노란 똥 폭발 영상 (0:14)",
        videoDesc: "옥수수를 냠냠 먹은 팽이들이 노란색 구슬 같은 이쁜 똥들을 조르르 남기는 온천욕!",
        videoAction: "poop_yellow"
    },
    10: {
        title: "10일차: 16마리가 만든 초록빛 행복 💜",
        date: "2026년 6월 22일 월요일",
        weather: "맑은 파란 하늘 ☀️",
        text: "달이와 팽이들 16마리 대가족과 함께한 지도 벌써 열흘이 흘렀어요. 처음 만났을 때보다 껍질도 훨씬 단단하고 윤기가 자르르 흐르며, 다들 먹성이 날로 좋아져서 쑥쑥 자라났어요. 매일 아침 수북하게 쌓인 초록, 주황, 노란 알록달록 똥들을 닦아내고 분무기를 뿌려주는 일이 내 하루 중 가장 즐거운 루틴이 되었지요! 16마리 대가족이 들려주는 꼬물꼬물 평화로운 소리가 우리 가족에게 아주 큰 행복을 줍니다. 달아야 팽이들아, 매일 맛있는 거 가득 줄 테니 건강하게 오래오래 함께 살자!",
        caption: "루시의 영원한 단짝 패밀리가 된 16마리 팽이 가족",
        imgFilter: "brightness(1.04) saturate(1.2)",
        videoLabel: "10일간의 행복 축하 (0:15)",
        videoDesc: "루시의 사랑을 가득 받고 윤기가 흐르는 패각을 뽐내는 16마리의 해피 엔딩!",
        videoAction: "celebrate"
    },
    11: {
        title: "11일차: 은빛 달팽이의 느림보 대역전 운동회! 🐌🏆",
        date: "2026년 6월 25일 목요일",
        weather: "기분 좋은 선선한 가을바람 🍂",
        text: "오늘 대단한 소식이 있어요! 바로 루시의 장미 마당에서 '초록 들판 곤충 연합 운동회'가 대대적으로 펼쳐졌답니다! 참가 선수는 이 구역 제일 날렵한 뒷다리의 방아깨비 뚜기 형아, 저 푸른 젤 개미성에서 기어 나온 한국홍가슴개미 대장인 '대장 개미' (놀랍게도 그 큰 성에 홀로 사는 단 1마리 개미 장군!), 그리고 우직한 은빛 달팽이 대표인 우리 첫째 대장 '달이'였어요! 첫 경기인 '기어가기 레이스'가 시작되자마자 뚜기는 로켓처럼 휘익 하늘로 튀어 올라 10미터를 폴짝 날아갔고, 대장 개미는 단 한 마리뿐인데도 혼자서 '영차영차!' 우렁찬 제식 구령 소리를 내며 1인 3역의 3열 종대 행진 대열 기세로 엄청나게 바삐 다리를 버둥거리며 돌격해 왔어요. 하지만 우리 느림보 달이도 지지 않았습니다! 배발 깊은 곳에서 특수 점액 오일을 대폭 뿜어내며 은빛 윤기가 흐르는 점액 로드를 바닥에 까는 데 성공했거든요! 덕분에 흙바닥에 마찰력이 제로가 되면서, 달이는 꼬물꼬물 걷는 대신 껍질을 스케이트 삼아 쌩쌩 얼음판 위를 미끄러지는 피겨스케이팅 슬라이딩 기술로 무한 쾌속 전진을 감행했답니다! ‘스스스슥-!’ 그 모습은 흡사 은빛 슬라이더 같아 구경하던 루시가 배를 잡고 떼굴떼굴 굴렀지요! 이어진 '루꼴라 뷔페 식성 대격돌'에서도 대장 개미의 활약이 눈부셨습니다. 혼자서 정밀 턱 커터 능력을 가동해 루꼴라 이파리를 자로 잰 듯 완벽한 사각 격자 도면대로 오려 가져갔고, 뚜기는 날갯소리를 슥슥 울리며 엄청난 속도로 구멍을 뻥뻥 뚫어 갉아먹었어요. 하지만 우리 달이도 지지 않고 거대한 주황색 당근 조각을 입속으로 한 번에 진공 흡입하듯 꼬물꼬물 먹어 치웠답니다. 마지막 '줄다리기' 종목은 장미 가지 덩굴을 잡고 팽팽한 당기기를 시도했어요. 뚜기가 강력한 로켓 뒷다리로 땅을 파며 당기고, 대장 개미가 혼자서 마음속 백만 대군의 단합력을 온몸에 투영하여 총력으로 버텼으며, 달이가 자기 몸무게의 100배가 넘는 우직한 패각 중심을 뒤로 슬쩍 눕히는 닻 내리기 전술을 썼죠. 결국 줄이 '툭-' 끊어지면서 세 마리 모두 풀밭에 나뒹굴고 말았답니다! 정말 눈물이 쏙 빠질 정도로 박장대소한 행복한 하루였어요. 달이와 팽이들, 그리고 뚜기와 고독한 전사 대장 개미까지! 우리 마당의 소중한 단짝 삼총사들이 앞으로도 아프지 않고 사이좋게 지내며, 멋진 정원 판타지를 만들어 갔으면 좋겠습니다. 동물 연합 영원하라! 💚🏆✨",
        caption: "달이의 기막힌 은빛 미끄럼틀 슬라이딩 대역전!",
        imgFilter: "brightness(1.02) saturate(1.15) contrast(1.05)",
        videoLabel: "달이의 슬라이딩 레이스 (0:25)",
        videoDesc: "은빛 점액 길을 뿜으며 얼음 스케이트 타듯 쌩쌩 슬라이딩하는 달이의 스릴 만점 질주 장면!",
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
    
    // Choose chime or funny poop sound based on episode!
    if ([3, 4, 9].includes(currentEp)) {
        synth.playPoopPop();
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
        img.style.filter = data.imgFilter;
        
        // Randomize polaroid rotation slightly
        const rot = -4 + Math.random() * 8;
        document.getElementById('polaroid-trigger').style.setProperty('--rot', `${rot}deg`);
        
        // Update player
        document.getElementById('player-label').textContent = data.videoLabel;
        
        // Signature updates based on story
        const sigs = {
            1: "- 루시가 촉촉한 이끼 숲 앞에서 ✍️",
            2: "- 루시가 아삭아삭 갉아먹는 소리를 들으며 ✍️",
            3: "- 초록 똥 예술가 루시가 🟢✍️",
            4: "- 크레파스 주황 똥에 웃음 터진 루시가 🥕✍️",
            5: "- 은빛 보물지도를 정교하게 해독한 루시가 ✍️",
            6: "- 산타 팽이들과 마주 앉은 루시가 ⚪✍️",
            7: "- 올림픽 우승 팀장 루시가 🏆✍️",
            8: "- 개미와 달팽이 통을 잇는 사랑의 가교 루시가 ✍️",
            9: "- 옥수수 온천과 노란 보석 똥을 줍는 루시가 ⛲✍️",
            10: "- 16마리 달팽이 대가족의 수호신 루시가 💚✍️",
            11: "- 세 곤충 친구들을 응원하는 심판 루시가 ✍️🏅"
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
        nextBtn.style.opacity = currentEp === 11 ? '0.5' : '1';
        nextBtn.style.cursor = currentEp === 11 ? 'not-allowed' : 'pointer';
        
        // Smooth transition fade-in
        diaryCard.style.opacity = 1;
        diaryCard.style.transform = 'translateY(0)';
        
        // Special fireworks celebration on Episode 10 and 11!
        if (currentEp === 10 || currentEp === 11) {
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
    if (currentEp < 11) switchEpisode(currentEp + 1);
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
        const hues = [340, 350, 10, 80, 200];
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
// 8. 10th Episode Special watercolor celebration
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
        this.speedY = Math.sin(angle) * speed - 1.5;
        this.gravity = 0.12;
        this.opacity = 1;
        this.hue = 100 + Math.random() * 120; // soft green, gold, purples
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
    
    const cx = petalCanvas.width / 2;
    const cy = petalCanvas.height / 3;
    
    for (let i = 0; i < 40; i++) {
        celebrationPetals.push(new CelebrationPetal(cx, cy));
    }
    
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
// 9. Procedural Animated Snail Video Canvas (Crawls, Eats, and Pops Poop!)
// ==========================================
const videoTrigger = document.getElementById('video-trigger');
const videoModal = document.getElementById('video-modal');
const videoCloseBtn = document.getElementById('video-close-btn');
const videoCanvas = document.getElementById('video-canvas');
const vCtx = videoCanvas.getContext('2d');

let isVideoPlaying = false;
let videoFrameId = null;
let vTime = 0;
let snailX = 80;
let snailY = 170;
let bodyStretch = 1;
let antWiggle = 0;
let shellRotation = 0;
let poopColor = null;
let placedPoops = []; // store placed poops procedurally!

videoTrigger.addEventListener('click', () => {
    synth.playChime();
    videoModal.classList.add('active');
    
    const data = EPISODE_DATA[currentEp];
    document.getElementById('video-modal-title').textContent = `${data.title} - 생생 관찰 영상 🎬`;
    document.getElementById('video-modal-desc').textContent = data.videoDesc;
    
    isVideoPlaying = true;
    vTime = 0;
    snailX = 80;
    placedPoops = [];
    resizeVideoCanvas();
    
    // Play squishy sound or pop sound!
    if ([3, 4, 9].includes(currentEp)) {
        poopColor = currentEp === 3 ? '#9ccc65' : (currentEp === 4 ? '#ff9800' : '#fdd835'); // green, orange, yellow poop
    } else {
        poopColor = null;
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

// Procedural Snail drawing & crawling physics!
function animateVideo() {
    if (!isVideoPlaying) return;
    
    vCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    vTime += 0.04;
    
    const action = EPISODE_DATA[currentEp].videoAction;
    
    // Draw background watercolor moss garden
    const grad = vCtx.createRadialGradient(280, 150, 50, 280, 150, 300);
    grad.addColorStop(0, '#fcf8f2');
    grad.addColorStop(1, '#e3dac9');
    vCtx.fillStyle = grad;
    vCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
    
    // Draw soil/moss path at the bottom
    vCtx.save();
    vCtx.fillStyle = 'rgba(141, 110, 99, 0.25)'; // brown soil
    vCtx.beginPath();
    vCtx.moveTo(0, 210);
    vCtx.bezierCurveTo(150, 180, 380, 230, 560, 195);
    vCtx.lineTo(560, 315);
    vCtx.lineTo(0, 315);
    vCtx.fill();
    
    // Green moss
    vCtx.fillStyle = 'rgba(156, 204, 101, 0.3)';
    vCtx.beginPath();
    vCtx.moveTo(0, 210);
    vCtx.bezierCurveTo(100, 190, 250, 205, 350, 195);
    vCtx.bezierCurveTo(450, 185, 500, 205, 560, 195);
    vCtx.lineTo(560, 230);
    vCtx.lineTo(0, 240);
    vCtx.fill();
    vCtx.restore();

    // Snail crawl physics (slow creeping movement)
    bodyStretch = 1 + Math.sin(vTime * 3) * 0.12; // stretch & shrink body
    antWiggle = Math.sin(vTime * 1.5) * 5;
    
    // Crawl forward slowly
    if (action !== 'race' && action !== 'crossover' && snailX < 450) {
        snailX += 0.45 * (1.2 - Math.abs(Math.sin(vTime * 3)) * 0.4); // moves faster when stretched!
        // Slow periodic crawling squish sound!
        if (Math.floor(vTime * 3) % 10 === 0 && Math.random() > 0.96) {
            synth.playSquish();
        }
    } else if (action === 'race' || action === 'crossover') {
        // High speed race! (Hops/slides forward fast)
        snailX += 1.8 * (1.1 + Math.sin(vTime * 5) * 0.3);
        bodyStretch = 1 + Math.sin(vTime * 6) * 0.18;
    }

    // DRAW THE SHINY TRAIL (점액 trail)
    vCtx.save();
    vCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    vCtx.lineWidth = 6;
    vCtx.lineCap = 'round';
    vCtx.shadowColor = '#ffffff';
    vCtx.shadowBlur = 10;
    vCtx.beginPath();
    vCtx.moveTo(80, 212);
    // Draw trail up to current snail position
    for (let x = 80; x < snailX - 30; x += 10) {
        const y = 210 + Math.sin(x/50) * 5;
        vCtx.lineTo(x, y + 10);
    }
    vCtx.stroke();
    vCtx.restore();

    // DRAW RECURRING COLORFUL POOPS (The ultimate funny feature!)
    if (poopColor) {
        const poopTriggerTime = Math.floor(vTime * 2);
        // Lay a poop periodically as Dali crawls!
        if (poopTriggerTime > 0 && poopTriggerTime % 4 === 0 && !placedPoops.some(p => p.time === poopTriggerTime)) {
            placedPoops.push({
                x: snailX - 45,
                y: 215 + Math.sin((snailX-45)/50)*5,
                color: poopColor,
                time: poopTriggerTime,
                scale: 0.6 + Math.random()*0.4
            });
            synth.playPoopPop(); // Play pop sound!
        }
    }

    // Draw placed poops
    placedPoops.forEach(p => {
        vCtx.save();
        vCtx.translate(p.x, p.y);
        vCtx.scale(p.scale, p.scale);
        vCtx.fillStyle = p.color;
        vCtx.strokeStyle = 'rgba(0,0,0,0.15)';
        vCtx.lineWidth = 1;
        
        // Draw cute spiraled poop curl shape!
        vCtx.beginPath();
        vCtx.arc(0, 0, 8, 0, Math.PI * 2);
        vCtx.arc(-4, -4, 6, 0, Math.PI * 2);
        vCtx.arc(-6, -8, 4, 0, Math.PI * 2);
        vCtx.fill();
        vCtx.stroke();
        
        vCtx.fillStyle = 'rgba(255,255,255,0.4)';
        vCtx.beginPath();
        vCtx.arc(-2, -2, 2, 0, Math.PI * 2); // highlight
        vCtx.fill();
        vCtx.restore();
    });

    // DRAW FOODS (Lettuce, Carrot, Corn) based on episode action
    if (action === 'eat_green' || action === 'poop_green') {
        drawFoodLettuce(420, 205);
    } else if (action === 'poop_orange') {
        drawFoodCarrot(420, 205);
    } else if (action === 'poop_yellow') {
        drawFoodCorn(420, 195);
    } else if (action === 'meet_ant') {
        drawAnt(440, 210, vTime);
    } else if (action === 'crossover') {
        drawTtougiMini(130, 200, vTime);
        drawAnt(430, 200, vTime);
    } else if (action === 'explore') {
        drawHouseSprout(420, 185);
    } else if (action === 'eat_white') {
        drawWhiteCalciumPowder();
    }

    // DRAW DALI (THE CUTE WATERCOLOR SNAIL)
    vCtx.save();
    const currentY = 210 + Math.sin(snailX/50) * 5;
    vCtx.translate(snailX, currentY);
    
    // 1. Snail Wet Foot/Body (Stretches & contracts procedurally!)
    vCtx.fillStyle = '#fdf5e6'; // warm cream watercolor body
    vCtx.strokeStyle = '#d7ccc8';
    vCtx.lineWidth = 4;
    vCtx.lineJoin = 'round';
    
    vCtx.beginPath();
    // Tail
    vCtx.moveTo(-60 * bodyStretch, 12);
    vCtx.quadraticCurveTo(-70 * bodyStretch, 12, -75 * bodyStretch, 8);
    vCtx.quadraticCurveTo(-65 * bodyStretch, 2, -45 * bodyStretch, 0);
    // Body base
    vCtx.lineTo(25 * bodyStretch, 0);
    // Head front curves
    vCtx.quadraticCurveTo(45 * bodyStretch, 0, 50 * bodyStretch, -20);
    vCtx.quadraticCurveTo(45 * bodyStretch, -30, 35 * bodyStretch, -25);
    // Neck curves back into shell
    vCtx.quadraticCurveTo(20 * bodyStretch, -10, 5 * bodyStretch, -8);
    // Under shell connection
    vCtx.lineTo(-40 * bodyStretch, -5);
    vCtx.closePath();
    vCtx.fill();
    vCtx.stroke();

    // 2. Eyes and Long Antennae 눈과 더듬이 (Wiggles gently!)
    vCtx.save();
    vCtx.translate(45 * bodyStretch, -23);
    
    // Left eye stalk
    vCtx.strokeStyle = '#d7ccc8';
    vCtx.lineWidth = 3.5;
    vCtx.lineCap = 'round';
    vCtx.beginPath();
    vCtx.moveTo(-5, 0);
    vCtx.quadraticCurveTo(5 + antWiggle, -20, 15 + antWiggle, -28);
    vCtx.stroke();
    
    // Left Eye bulb
    vCtx.fillStyle = '#ffffff';
    vCtx.strokeStyle = '#8c7a6b';
    vCtx.lineWidth = 1.5;
    vCtx.beginPath();
    vCtx.arc(15 + antWiggle, -28, 5, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();
    
    vCtx.fillStyle = '#333333';
    vCtx.beginPath();
    vCtx.arc(16 + antWiggle, -28, 2.5, 0, Math.PI * 2); // Pupil
    vCtx.fill();

    // Right eye stalk
    vCtx.strokeStyle = '#d7ccc8';
    vCtx.beginPath();
    vCtx.moveTo(2, 2);
    vCtx.quadraticCurveTo(15 - antWiggle, -15, 25 - antWiggle, -22);
    vCtx.stroke();
    
    // Right Eye bulb
    vCtx.fillStyle = '#ffffff';
    vCtx.beginPath();
    vCtx.arc(25 - antWiggle, -22, 5, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();
    
    vCtx.fillStyle = '#333333';
    vCtx.beginPath();
    vCtx.arc(26 - antWiggle, -22, 2.5, 0, Math.PI * 2); // Pupil
    vCtx.fill();
    vCtx.restore();

    // 3. Smiling cute mouth!
    vCtx.save();
    vCtx.strokeStyle = '#5d4037';
    vCtx.lineWidth = 2.5;
    vCtx.beginPath();
    vCtx.arc(43 * bodyStretch, -12, 4, 0.2, Math.PI * 0.8);
    vCtx.stroke();
    vCtx.restore();

    // 4. Watercolor Spiral Shell (패각 - The artistic core!)
    vCtx.save();
    vCtx.translate(-15 * bodyStretch, -22);
    
    // Solid soft brown watercolor circle
    vCtx.fillStyle = '#d7ccc8'; // brown clay
    vCtx.strokeStyle = '#8c7a6b';
    vCtx.lineWidth = 4;
    vCtx.beginPath();
    vCtx.arc(0, 0, 36, 0, Math.PI * 2);
    vCtx.fill();
    vCtx.stroke();
    
    // Spiral lines (mathematical spiral r = a * theta)
    vCtx.strokeStyle = '#5d4037';
    vCtx.lineWidth = 2.5;
    vCtx.beginPath();
    
    const spiralRot = action === 'race' ? vTime * 2 : 0;
    vCtx.rotate(spiralRot);
    
    let a = 1.3; // spacing constant
    vCtx.moveTo(0, 0);
    for (let theta = 0; theta < Math.PI * 8; theta += 0.1) {
        const r = a * theta;
        const sx = r * Math.cos(theta);
        const sy = r * Math.sin(theta);
        vCtx.lineTo(sx, sy);
    }
    vCtx.stroke();
    vCtx.restore();

    vCtx.restore();

    // Draw video HUD overlay (timer bar)
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

    // Loop!
    videoFrameId = requestAnimationFrame(animateVideo);
}

// Procedural Foods Drawing Helpers
function drawFoodLettuce(x, y) {
    vCtx.save();
    vCtx.fillStyle = '#9ccc65';
    vCtx.strokeStyle = '#7cb342';
    vCtx.lineWidth = 3;
    vCtx.beginPath();
    vCtx.moveTo(x, y);
    vCtx.bezierCurveTo(x-30, y-20, x-60, y+10, x-20, y+30);
    vCtx.bezierCurveTo(x+10, y+40, x+40, y+20, x, y);
    vCtx.fill();
    vCtx.stroke();
    
    // Leaf veins
    vCtx.strokeStyle = '#c5e1a5';
    vCtx.lineWidth = 1.5;
    vCtx.beginPath();
    vCtx.moveTo(x-10, y+10);
    vCtx.lineTo(x-35, y-5);
    vCtx.moveTo(x-15, y+15);
    vCtx.lineTo(x-5, y+25);
    vCtx.stroke();
    vCtx.restore();
}

function drawFoodCarrot(x, y) {
    vCtx.save();
    vCtx.fillStyle = '#ff9800';
    vCtx.strokeStyle = '#f57c00';
    vCtx.lineWidth = 3;
    
    // Wedge/slice
    vCtx.beginPath();
    vCtx.ellipse(x, y, 25, 20, Math.PI/4, 0, Math.PI*2);
    vCtx.fill();
    vCtx.stroke();
    
    // Inner rings
    vCtx.strokeStyle = '#ffe0b2';
    vCtx.lineWidth = 2;
    vCtx.beginPath();
    vCtx.ellipse(x, y, 12, 10, Math.PI/4, 0, Math.PI*2);
    vCtx.stroke();
    vCtx.restore();
}

function drawFoodCorn(x, y) {
    vCtx.save();
    vCtx.fillStyle = '#fdd835';
    vCtx.strokeStyle = '#fbc02d';
    vCtx.lineWidth = 2;
    
    // Corn kernels grid
    for(let col=0; col<3; col++) {
        for(let row=0; row<4; row++) {
            vCtx.beginPath();
            vCtx.arc(x + col*10 - 10, y + row*8, 4.5, 0, Math.PI*2);
            vCtx.fill();
            vCtx.stroke();
        }
    }
    vCtx.restore();
}

function drawAnt(x, y, time) {
    vCtx.save();
    vCtx.fillStyle = '#3e2723'; // Ant dark brown
    
    vCtx.translate(x, y + Math.sin(time*5)*5); // ant wiggles!
    
    // Ant body segments (Gaster, Thorax, Head)
    vCtx.beginPath();
    vCtx.ellipse(-12, 0, 8, 5, 0, 0, Math.PI*2); // Gaster
    vCtx.ellipse(-2, 0, 5, 4, 0, 0, Math.PI*2);  // Thorax
    vCtx.ellipse(8, 0, 6, 6, 0, 0, Math.PI*2);   // Head
    vCtx.fill();
    
    // Antennae
    vCtx.strokeStyle = '#3e2723';
    vCtx.lineWidth = 1.5;
    vCtx.beginPath();
    vCtx.moveTo(11, -3);
    vCtx.quadraticCurveTo(18, -10, 22, -8);
    vCtx.moveTo(11, 0);
    vCtx.quadraticCurveTo(18, 5, 22, 3);
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

function drawHouseSprout(x, y) {
    vCtx.save();
    // Draw cute tiny plant sprout
    vCtx.strokeStyle = '#81c784';
    vCtx.lineWidth = 4;
    vCtx.lineCap = 'round';
    vCtx.beginPath();
    vCtx.moveTo(x, y + 30);
    vCtx.quadraticCurveTo(x-10, y+10, x-5, y);
    vCtx.stroke();
    
    // Sprout leaf 1
    vCtx.fillStyle = '#81c784';
    vCtx.beginPath();
    vCtx.ellipse(x-10, y, 12, 6, -Math.PI/6, 0, Math.PI*2);
    vCtx.fill();
    // Sprout leaf 2
    vCtx.beginPath();
    vCtx.ellipse(x+2, y-2, 10, 5, Math.PI/4, 0, Math.PI*2);
    vCtx.fill();
    vCtx.restore();
}

function drawWhiteCalciumPowder() {
    vCtx.save();
    vCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    vCtx.beginPath();
    // draw sprinkle dots
    for(let i=0; i<15; i++) {
        const rx = 300 + (i*17) % 150;
        const ry = 205 + (i*13) % 25;
        vCtx.arc(rx, ry, 2.5, 0, Math.PI*2);
    }
    vCtx.fill();
    vCtx.restore();
}

// PWA Service Worker register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}
