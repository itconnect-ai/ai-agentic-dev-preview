// ===== Scenario Data — AI Agentic Development Visualizer v2 =====
// 순수 데이터 파일. app.js의 플레이어가 이 구조를 타임라인으로 재생한다.
// 여기 담긴 HTML/코드 문자열은 저장소에 커밋되는 신뢰된 정적 연출 콘텐츠다.

const SCENARIOS = {
  habit: {
    label: '습관 트래커 App',
    appName: 'Modern Habit Tracker',
    prompt: '실시간 성과 통계 차트와 습관 기록, 자동 테스트가 포함된 Modern Habit Tracker 웹 애플리케이션 기획 및 개발',

    planSections: [
      { title: '1. Architecture Breakdown',
        html: '<ul><li><code>index.html</code>: Glassmorphic 컨테이너, 통계 차트 영역, 습관 입력 폼</li><li><code>styles.css</code>: 다크 팔레트, 글로우 뱃지, CSS Grid 레이아웃</li><li><code>app.js</code>: LocalStorage 상태 저장, 습관 토글, 스트릭 계산</li></ul>' },
      { title: '2. Sub-Agent Work Distribution',
        html: '<ul><li>🎨 <strong>UI Specialist:</strong> 비주얼 계층, CSS 애니메이션, 차트 컴포넌트</li><li>⚡ <strong>Dev Engineer:</strong> CRUD 로직, 달성 통계 계산</li><li>🛡️ <strong>QA Tester:</strong> 브라우저 자동화, 입력 검증, 자가치유 버그픽스</li></ul>' },
      { title: '3. Verification Strategy',
        html: '<p>Browser Sub-Agent가 폼 제출·차트 갱신을 E2E로 자동 검증. 실패 시 Self-Healing 루프 가동.</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: 'Design System 초기화: Glassmorphism 토큰 & 레이아웃 템플릿 구성...' },
      { agent: 'dev', text: '습관 기록·통계용 State Store와 이벤트 리스너 설계...' },
      { agent: 'qa',  text: 'Playwright 기반 Browser Sub-Agent E2E 시나리오 준비...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'styles.css', code:
`.habit-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 14px;
  padding: 16px 20px;
  transition: transform 0.2s ease;
}
.habit-card:hover { transform: translateY(-2px); }
.streak-badge {
  color: #38bdf8;
  font-weight: 700;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
}
.progress-ring { stroke: #6366f1; stroke-linecap: round; }` },
      { agent: 'dev', filename: 'app.js', code:
`const store = JSON.parse(localStorage.getItem('habits')) || [];

function addHabit(title) {
  store.push({ id: Date.now(), title, done: [], streak: 0 });
  persist();
  renderHabits();
}

function toggleToday(id) {
  const habit = store.find(h => h.id === id);
  const today = new Date().toDateString();
  habit.done.includes(today)
    ? habit.done = habit.done.filter(d => d !== today)
    : habit.done.push(today);
  habit.streak = calcStreak(habit.done);
  persist();
}` },
    ],

    test: {
      url: 'http://localhost:3000/habit-tracker',
      mockHtml:
        '<div style="background: #121826; padding: 16px; border-radius: 8px; width: 80%; margin: 0 auto; text-align: left;">' +
        '<h4>Habit Tracker Preview</h4>' +
        '<input type="text" value="매일 30분 운동하기" style="width: 100%; padding: 6px; margin: 8px 0; background: #000; color: #fff; border: 1px solid #333;">' +
        '<button style="background: #6366f1; color: #fff; border: none; padding: 6px 12px; border-radius: 4px;">습관 추가</button>' +
        '</div>',
      steps: [
        { console: '> Step 1: 습관 제목 입력 필드에 타이핑 시뮬레이션...', cursor: { top: '40%', left: '45%' } },
        { console: '> Step 2: "습관 추가" 버튼 클릭...', cursor: { top: '52%', left: '60%' } },
      ],
      failure: {
        consoleLine: '❌ TEST 1 FAILED: TypeError: Cannot read properties of null (reading "push")',
        qaLog: '❌ 습관 추가 시 E2E 실패 감지! 스택 트레이스를 Orchestrator에 보고합니다.',
        orchestratorLog: '⚠️ Self-Healing 루프 가동: Dev Agent에게 state 핸들러 null-check 가드 추가 요청.',
        devFixLog: '🔧 app.js:1 패치 — LocalStorage가 null이면 빈 배열로 폴백 초기화.',
      },
      passLines: [
        '✅ TEST 1 PASSED: 습관이 스토어에 정상 추가됨',
        '✅ TEST 2 PASSED: 스트릭 통계 재계산 정상 (+1 day)',
        '✅ TEST 3 PASSED: LocalStorage 영속성 검증 완료',
      ],
    },

    finalAppHtml:
      '<div style="background: #0f172a; padding: 20px; border-radius: 10px; height: 100%; display: flex; flex-direction: column; gap: 16px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<h3 style="color: #f8fafc; font-size: 16px;">🔥 Daily Habit Tracker</h3>' +
      '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">달성률 85%</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">' +
      '<div style="background: #1e293b; padding: 12px; border-radius: 8px;">' +
      '<div style="font-size: 11px; color: #94a3b8;">연속 달성 (Streak)</div>' +
      '<div style="font-size: 20px; font-weight: bold; color: #38bdf8;">14일 연속 ⚡</div>' +
      '</div>' +
      '<div style="background: #1e293b; padding: 12px; border-radius: 8px;">' +
      '<div style="font-size: 11px; color: #94a3b8;">완료한 습관</div>' +
      '<div style="font-size: 20px; font-weight: bold; color: #c084fc;">12 / 14 개</div>' +
      '</div>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">' +
      '<div style="background: #1a2336; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">' +
      '<span>🏃‍♂️ 매일 30분 아침 러닝</span>' +
      '<input type="checkbox" checked style="width: 18px; height: 18px; accent-color: #6366f1;">' +
      '</div>' +
      '<div style="background: #1a2336; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">' +
      '<span>📚 전공 서적 20페이지 읽기</span>' +
      '<input type="checkbox" checked style="width: 18px; height: 18px; accent-color: #6366f1;">' +
      '</div>' +
      '<div style="background: #1a2336; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">' +
      '<span>💧 물 2리터 마시기</span>' +
      '<input type="checkbox" style="width: 18px; height: 18px; accent-color: #6366f1;">' +
      '</div>' +
      '</div>' +
      '</div>',
  },

  kanban: {
    label: 'AI 칸반 보드',
    appName: 'AI Kanban Board',
    prompt: '다크모드 지원 및 자율 태스크 카드 생성 기능이 있는 AI 기반 칸반(Kanban) 보드 구축 및 검증',

    planSections: [
      { title: '1. Architecture Breakdown',
        html: '<ul><li><code>index.html</code>: 3컬럼 보드 레이아웃, 카드 생성 폼, 다크모드 토글</li><li><code>board.css</code>: 3컬럼 Grid, 다크모드 컬러 토큰, 카드 호버 모션</li><li><code>kanban.js</code>: 카드 CRUD, HTML5 Drag&amp;Drop API, AI 태스크 제안</li></ul>' },
      { title: '2. Sub-Agent Work Distribution',
        html: '<ul><li>🎨 <strong>UI Specialist:</strong> 컬럼·카드 컴포넌트, 다크모드 팔레트, 드래그 고스트 스타일</li><li>⚡ <strong>Dev Engineer:</strong> 드래그&amp;드롭 상태 이동, AI 카드 자동 생성 로직</li><li>🛡️ <strong>QA Tester:</strong> 카드 생성·드래그 E2E, 컬럼 간 이동 검증</li></ul>' },
      { title: '3. Verification Strategy',
        html: '<p>Browser Sub-Agent가 카드 생성과 컬럼 간 드래그&amp;드롭을 E2E로 검증. 실패 시 Self-Healing 루프 가동.</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: '보드 컬럼 Grid & 다크모드 토큰 설계, 카드 컴포넌트 스타일링 착수...' },
      { agent: 'dev', text: '카드 상태 머신(To Do → Doing → Done)과 Drag&Drop 핸들러 설계...' },
      { agent: 'qa',  text: '드래그&드롭 시나리오용 Browser Sub-Agent 테스트 스크립트 준비...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'board.css', code:
`.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.board-column {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 12px;
}
.column-header { font-weight: 700; color: #93c5fd; }
.task-card {
  background: #1e293b;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: grab;
  transition: transform 0.15s ease;
}
.task-card:hover { transform: translateY(-2px); }` },
      { agent: 'dev', filename: 'kanban.js', code:
`function createCard(title, column) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.textContent = title;
  card.draggable = true;
  card.addEventListener('dragstart', e =>
    e.dataTransfer.setData('cardId', card.id));
  column.appendChild(card);
}

dropZones.forEach(zone => {
  zone.addEventListener('drop', e => {
    const id = e.dataTransfer.getData('cardId');
    zone.appendChild(document.getElementById(id));
    saveBoardState();
  });
});` },
    ],

    test: {
      url: 'http://localhost:3000/kanban',
      mockHtml:
        '<div style="background: #121826; padding: 14px; border-radius: 8px; width: 88%; margin: 0 auto; text-align: left;">' +
        '<h4 style="margin-bottom: 10px;">AI Kanban Board Preview</h4>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 11px;">' +
        '<div style="background: #0f172a; border-radius: 6px; padding: 8px;"><div style="color: #93c5fd; font-weight: 700; margin-bottom: 6px;">To Do</div>' +
        '<div style="background: #1e293b; border-radius: 6px; padding: 6px 8px;">API 명세 작성</div></div>' +
        '<div style="background: #0f172a; border-radius: 6px; padding: 8px;"><div style="color: #fbbf24; font-weight: 700; margin-bottom: 6px;">Doing</div></div>' +
        '<div style="background: #0f172a; border-radius: 6px; padding: 8px;"><div style="color: #4ade80; font-weight: 700; margin-bottom: 6px;">Done</div></div>' +
        '</div></div>',
      steps: [
        { console: '> Step 1: "API 명세 작성" 카드 생성 확인...', cursor: { top: '38%', left: '30%' } },
        { console: '> Step 2: 카드를 Doing 컬럼으로 드래그&드롭...', cursor: { top: '45%', left: '55%' } },
      ],
      failure: {
        consoleLine: '❌ TEST 2 FAILED: drop 이벤트 미발화 — 카드가 원위치로 복귀함',
        qaLog: '❌ 드래그&드롭 E2E 실패 감지! 카드가 Doing 컬럼에 안착하지 못했습니다.',
        orchestratorLog: '⚠️ Self-Healing 루프 가동: Dev Agent에게 드롭존 이벤트 핸들러 점검 지시.',
        devFixLog: '🔧 kanban.js:9 패치 — 드롭존에 dragover preventDefault 핸들러 추가.',
      },
      passLines: [
        '✅ TEST 1 PASSED: 카드 생성 및 To Do 컬럼 렌더링 정상',
        '✅ TEST 2 PASSED: 드래그&드롭으로 Doing 컬럼 이동 성공',
        '✅ TEST 3 PASSED: 다크모드 토글 상태 유지 검증 완료',
      ],
    },

    finalAppHtml:
      '<div style="background: #0f172a; padding: 20px; border-radius: 10px; height: 100%; display: flex; flex-direction: column; gap: 14px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<h3 style="color: #f8fafc; font-size: 16px;">🗂 AI Kanban Board</h3>' +
      '<span style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">🌙 Dark</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; flex: 1; font-size: 12px;">' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px;">' +
      '<div style="color: #93c5fd; font-weight: 700; margin-bottom: 8px;">To Do <span style="opacity:.6;">2</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">결제 모듈 연동</div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px;">온보딩 화면 개선 <span style="background: rgba(168, 85, 247, 0.25); color: #c084fc; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 700;">✨ AI 제안</span></div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px;">' +
      '<div style="color: #fbbf24; font-weight: 700; margin-bottom: 8px;">Doing <span style="opacity:.6;">1</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px;">API 명세 작성</div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px;">' +
      '<div style="color: #4ade80; font-weight: 700; margin-bottom: 8px;">Done <span style="opacity:.6;">2</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">로그인 플로우</div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px;">DB 스키마 설계</div>' +
      '</div>' +
      '</div>' +
      '</div>',
  },

  crypto: {
    label: '암호화폐 대시보드',
    appName: 'Crypto Portfolio Dashboard',
    prompt: '실시간 암호화폐 시세 및 포트폴리오 트래킹 대시보드 웹 앱 제작 및 브라우저 테스트',

    planSections: [
      { title: '1. Architecture Breakdown',
        html: '<ul><li><code>index.html</code>: 시세 테이블, 포트폴리오 요약 카드, 미니 차트 영역</li><li><code>dashboard.css</code>: 시세 테이블, 등락 색상 토큰, CSS 미니 차트 바</li><li><code>portfolio.js</code>: 모의 시세 틱 생성, 보유수량 × 시세 합산</li></ul>' },
      { title: '2. Sub-Agent Work Distribution',
        html: '<ul><li>🎨 <strong>UI Specialist:</strong> 시세 테이블·요약 카드, 등락 컬러 시스템, 스파크 차트</li><li>⚡ <strong>Dev Engineer:</strong> 시세 틱 시뮬레이션, 포트폴리오 합산·포맷팅</li><li>🛡️ <strong>QA Tester:</strong> 시세 갱신 반영·합산 정확도 E2E 검증</li></ul>' },
      { title: '3. Verification Strategy',
        html: '<p>Browser Sub-Agent가 시세 틱 주입 후 테이블 갱신과 포트폴리오 합산값을 E2E로 검증. 실패 시 Self-Healing 루프 가동.</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: '시세 테이블 레이아웃 & 등락 컬러 토큰, CSS 스파크 바 차트 설계...' },
      { agent: 'dev', text: '모의 시세 틱 제너레이터와 포트폴리오 합산 파이프라인 구현 착수...' },
      { agent: 'qa',  text: '시세 갱신·합산 검증용 Browser Sub-Agent 어서션 준비...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'dashboard.css', code:
`.price-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.price-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}
.change-up   { color: #34d399; font-weight: 700; }
.change-down { color: #f87171; font-weight: 700; }
.spark-bar {
  display: inline-block;
  width: 6px;
  background: linear-gradient(180deg, #6366f1, #38bdf8);
  border-radius: 3px;
}` },
      { agent: 'dev', filename: 'portfolio.js', code:
`function tickPrices(prices) {
  return prices.map(p => ({
    ...p,
    krw: Math.round(p.krw * (1 + (Math.random() - 0.5) * 0.01)),
  }));
}

function sumPortfolio(holdings, prices) {
  return holdings.reduce((total, h) => {
    const price = prices.find(p => p.symbol === h.symbol);
    return total + h.amount * price.krw;
  }, 0);
}

const formatKRW = n => '₩' + n.toLocaleString('ko-KR');` },
    ],

    test: {
      url: 'http://localhost:3000/crypto',
      mockHtml:
        '<div style="background: #121826; padding: 14px; border-radius: 8px; width: 85%; margin: 0 auto; text-align: left; font-size: 12px;">' +
        '<h4 style="margin-bottom: 10px;">Crypto Dashboard Preview</h4>' +
        '<div style="display: flex; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #1e293b;"><span>BTC</span><span style="color: #34d399;">₩98,200,000 (+2.4%)</span></div>' +
        '<div style="display: flex; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #1e293b;"><span>ETH</span><span style="color: #f87171;">₩4,150,000 (-1.1%)</span></div>' +
        '<div style="display: flex; justify-content: space-between; padding: 8px 4px; font-weight: 700;"><span>총 보유자산</span><span style="color: #38bdf8;">₩12,450,000</span></div>' +
        '</div>',
      steps: [
        { console: '> Step 1: 모의 시세 틱 3회 주입...', cursor: { top: '35%', left: '40%' } },
        { console: '> Step 2: 포트폴리오 합산값 검증...', cursor: { top: '60%', left: '50%' } },
      ],
      failure: {
        consoleLine: '❌ TEST 2 FAILED: 합산 오차 — expected ₩12,450,000 but got ₩12,449,999.87',
        qaLog: '❌ 포트폴리오 합산 E2E 실패 감지! 부동소수점 누적 오차가 검출되었습니다.',
        orchestratorLog: '⚠️ Self-Healing 루프 가동: Dev Agent에게 금액 연산 방식 교체 지시.',
        devFixLog: '🔧 portfolio.js:7 패치 — 부동소수점 곱셈을 정수(원 단위) 연산으로 교체.',
      },
      passLines: [
        '✅ TEST 1 PASSED: 시세 틱 주입 후 테이블 갱신 정상',
        '✅ TEST 2 PASSED: 포트폴리오 합산 정확도 검증 (₩12,450,000)',
        '✅ TEST 3 PASSED: 등락 색상(상승 녹색/하락 적색) 렌더링 정상',
      ],
    },

    finalAppHtml:
      '<div style="background: #0f172a; padding: 20px; border-radius: 10px; height: 100%; display: flex; flex-direction: column; gap: 14px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<h3 style="color: #f8fafc; font-size: 16px;">📈 Crypto Portfolio</h3>' +
      '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">● LIVE</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; flex: 1; font-size: 12px;">' +
      '<div style="background: #111827; border-radius: 10px; padding: 12px;">' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #1e293b;"><span>₿ BTC</span><span style="color: #34d399; font-weight: 700;">₩98,200,000 (+2.4%)</span></div>' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #1e293b;"><span>Ξ ETH</span><span style="color: #f87171; font-weight: 700;">₩4,150,000 (-1.1%)</span></div>' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px;"><span>◎ SOL</span><span style="color: #34d399; font-weight: 700;">₩285,000 (+5.8%)</span></div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">' +
      '<div><div style="font-size: 11px; color: #94a3b8;">총 보유자산</div>' +
      '<div style="font-size: 20px; font-weight: bold; color: #38bdf8;">₩12,450,000</div></div>' +
      '<div style="display: flex; align-items: flex-end; gap: 4px; height: 48px;">' +
      '<span style="display: inline-block; width: 8px; height: 40%; background: linear-gradient(180deg, #6366f1, #38bdf8); border-radius: 3px;"></span>' +
      '<span style="display: inline-block; width: 8px; height: 55%; background: linear-gradient(180deg, #6366f1, #38bdf8); border-radius: 3px;"></span>' +
      '<span style="display: inline-block; width: 8px; height: 45%; background: linear-gradient(180deg, #6366f1, #38bdf8); border-radius: 3px;"></span>' +
      '<span style="display: inline-block; width: 8px; height: 70%; background: linear-gradient(180deg, #6366f1, #38bdf8); border-radius: 3px;"></span>' +
      '<span style="display: inline-block; width: 8px; height: 85%; background: linear-gradient(180deg, #6366f1, #38bdf8); border-radius: 3px;"></span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>',
  },
};
