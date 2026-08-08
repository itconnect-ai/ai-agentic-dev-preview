// ===== Scenario Data — AI Agentic Development Visualizer v2 =====
// 순수 데이터 파일. app.js의 플레이어가 이 구조를 타임라인으로 재생한다.
// 여기 담긴 HTML/코드 문자열은 저장소에 커밋되는 신뢰된 정적 연출 콘텐츠다.
//
// 스키마 (시나리오별 공통):
//   label            프리셋 칩 이름
//   appName          기획서 헤더에 표기할 앱 이름
//   prompt           프롬프트 입력란 기본 문구
//   planSections[]   { title, html }        — 기획서, 섹션 단위 점진 렌더링
//   delegationLogs[] { agent, text }        — 2단계 서브에이전트 착수 로그
//   codeFiles[2]     { agent, filename, code } — 코드 스트림 창 2개 (ui / dev)
//   test             { url, mockHtml, steps[], failure{...patchedCode}, passLines[] }
//   finalAppHtml     최종 결과물 미리보기 목업

const SCENARIOS = {
  habit: {
    label: '🔥 습관 트래커 App',
    appName: 'Modern Habit Tracker',
    prompt: '실시간 성과 통계 차트, 습관 달성 기록, 자동 테스트 및 오류 수정이 포함된 Modern Habit Tracker 웹 애플리케이션 기획 및 개발',

    planSections: [
      { title: '1. 컴포넌트 아키텍처 분해',
        html: '<ul><li><code>index.html</code>: 글래스모피즘 모듈, 습관 입력 폼, 통계 링 차트 컴포넌트</li><li><code>styles.css</code>: 다크 모드 토큰, 네온 Accent 컬러, 반응형 그리드</li><li><code>HabitTracker.js</code>: LocalStorage 데이터 영속성, 연속 달성(Streak) 연산 알고리즘</li></ul>' },
      { title: '2. 서브-에이전트 역할 분담표',
        html: '<ul><li>🎨 <strong>UI/UX 전문 에이전트:</strong> 시각 레이아웃, CSS 애니메이션, 통계 카드 렌더링</li><li>⚡ <strong>개발 로직 에이전트:</strong> CRUD 핸들러, 예외 처리 및 상태 관리 모듈</li><li>🛡️ <strong>QA 테스트 에이전트:</strong> E2E 자동 클릭 검증 및 런타임 자율 수정 (Self-Healing)</li></ul>' },
      { title: '3. 자율 검증 전략 (Verification Plan)',
        html: '<p>Playwright 기반 가상 브라우저 조작 ➔ 런타임 Null 에러 감지 ➔ 코드 오토 픽스 ➔ 100% 그린 검증</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: '다크 모드 글래스모피즘 디자인 시스템 및 HTML 레이아웃 구축...' },
      { agent: 'dev', text: '습관 CRUD 연산 및 연속 달성(Streak) 알고리즘 모듈 생성...' },
      { agent: 'qa',  text: 'Playwright 가상 브라우저 자율 시나리오 스크립트 대기 완료...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'styles.css', code:
`/* Habit Tracker — Glassmorphism UI (UI 에이전트 생성) */
.habit-card {
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
      { agent: 'dev', filename: 'HabitTracker.js', code:
`// HabitTracker Core Logic (개발 로직 에이전트 생성)
class HabitTracker {
  constructor() {
    this.habits = JSON.parse(localStorage.getItem('user_habits'));
  }

  addHabit(title) {
    const newHabit = {
      id: Date.now(),
      title: title,
      completed: false,
      streak: 1
    };
    this.habits.push(newHabit);
    this.save();
    return newHabit;
  }

  save() {
    localStorage.setItem('user_habits', JSON.stringify(this.habits));
  }
}` },
    ],

    test: {
      url: 'http://localhost:3000/habit-tracker',
      mockHtml:
        '<div style="background: #0f172a; padding: 18px; border-radius: 10px; width: 85%; margin: 0 auto; text-align: left; border: 1px solid #1e293b;">' +
        '<h4 style="color:#38bdf8; margin-bottom:8px;">🔥 Habit Tracker E2E 검증 세션</h4>' +
        '<input type="text" value="매일 아침 30분 수영하기" style="width: 100%; padding: 8px; margin: 8px 0; background: #080d1a; color: #fff; border: 1px solid #334155; border-radius:6px;">' +
        '<button style="background: #6366f1; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight:bold; cursor:pointer;">+ 새 습관 등록</button>' +
        '</div>',
      steps: [
        { console: '> Step 1: 자동 텍스트 입력 - "매일 아침 30분 수영하기"', cursor: { top: '42%', left: '45%' } },
        { console: '> Step 2: "+ 새 습관 등록" 버튼 클릭 액션 마우스 릴리즈', cursor: { top: '54%', left: '58%' } },
      ],
      failure: {
        consoleLine: '❌ [치명적 런타임 오류] Uncaught TypeError: Cannot read properties of null (reading "push")',
        qaLog: '🚨 습관 추가 중 런타임 널(Null) 예외 감지! 오케스트레이터로 스택트레이스 즉시 전송',
        orchestratorLog: '🚨 자율 수정 루프(Self-Healing Loop) 발동 ➔ 개발 에이전트에 자율 핫픽스 명령',
        devFixLog: '🔧 HabitTracker.js Line 4 핫픽스: LocalStorage 초기화 예외 처리 코드 주입 중...',
        patchedCode:
`// HabitTracker Core Logic (Self-Healing Applied)
class HabitTracker {
  constructor() {
    // 🔧 [Self-Healing Auto-Fix]: null 방지 가드 코드 자동 삽입
    const saved = localStorage.getItem('user_habits');
    this.habits = saved ? JSON.parse(saved) : [];
  }

  addHabit(title) {
    const newHabit = {
      id: Date.now(),
      title: title,
      completed: false,
      streak: 1
    };
    this.habits.push(newHabit);
    this.save();
    return newHabit;
  }

  save() {
    localStorage.setItem('user_habits', JSON.stringify(this.habits));
  }
}`,
      },
      passLines: [
        '✅ [TEST 1 PASS] 습관 데이터 배열 생성 및 널 가드 작동',
        '✅ [TEST 2 PASS] 연속 달성(Streak) 연산 100% 정상',
        '✅ [TEST 3 PASS] LocalStorage 브라우저 저장 완료',
      ],
    },

    finalAppHtml:
      '<div style="background: #0b1120; padding: 22px; border-radius: 12px; height: 100%; display: flex; flex-direction: column; gap: 16px; border: 1px solid #1e293b;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<div><h3 style="color: #f8fafc; font-size: 17px; font-weight: 800;">🔥 안티그래비티 데일리 습관 트래커</h3>' +
      '<p style="color: #94a3b8; font-size: 12px;">AI 에이전트 부대가 전 과정 자율 구축한 서비스</p></div>' +
      '<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: 800;">목표 달성률 85%</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">' +
      '<div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">' +
      '<div style="font-size: 11px; color: #94a3b8; font-weight:600;">연속 달성 (Streak)</div>' +
      '<div style="font-size: 22px; font-weight: 800; color: #38bdf8;">14일 연속 ⚡</div></div>' +
      '<div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">' +
      '<div style="font-size: 11px; color: #94a3b8; font-weight:600;">완료한 습관</div>' +
      '<div style="font-size: 22px; font-weight: 800; color: #c084fc;">12 / 14 개</div></div>' +
      '<div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">' +
      '<div style="font-size: 11px; color: #94a3b8; font-weight:600;">E2E 통과 지수</div>' +
      '<div style="font-size: 22px; font-weight: 800; color: #34d399;">100% Pass 🛡️</div></div>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto;">' +
      '<div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">' +
      '<span style="font-size:14px; font-weight:600;">🏃‍♂️ 매일 아침 30분 러닝하기</span>' +
      '<input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;"></div>' +
      '<div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">' +
      '<span style="font-size:14px; font-weight:600;">📚 전공 서적 20페이지 읽기</span>' +
      '<input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;"></div>' +
      '<div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">' +
      '<span style="font-size:14px; font-weight:600;">🏊‍♂️ 매일 아침 30분 수영하기 (Self-Healing 통과)</span>' +
      '<input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;"></div>' +
      '</div>' +
      '</div>',
  },

  kanban: {
    label: '📋 AI 칸반 보드',
    appName: 'AI Kanban Board',
    prompt: '다크모드 지원 및 자율 태스크 카드 생성 기능이 있는 AI 기반 칸반(Kanban) 보드 구축 및 검증',

    planSections: [
      { title: '1. 컴포넌트 아키텍처 분해',
        html: '<ul><li><code>index.html</code>: 3컬럼 보드 레이아웃, 카드 생성 폼, 다크모드 토글</li><li><code>board.css</code>: 3컬럼 Grid, 다크모드 컬러 토큰, 카드 드래그 모션</li><li><code>kanban.js</code>: 카드 CRUD, HTML5 Drag&amp;Drop API, AI 태스크 자동 제안</li></ul>' },
      { title: '2. 서브-에이전트 역할 분담표',
        html: '<ul><li>🎨 <strong>UI/UX 전문 에이전트:</strong> 컬럼·카드 컴포넌트, 다크모드 팔레트, 드래그 고스트 스타일</li><li>⚡ <strong>개발 로직 에이전트:</strong> 드래그&amp;드롭 상태 이동, AI 카드 자동 생성 로직</li><li>🛡️ <strong>QA 테스트 에이전트:</strong> 카드 생성·드래그 E2E 및 런타임 자율 수정 (Self-Healing)</li></ul>' },
      { title: '3. 자율 검증 전략 (Verification Plan)',
        html: '<p>Playwright 가상 브라우저 조작 ➔ 카드 드래그&amp;드롭 검증 ➔ 드롭 이벤트 미발화 감지 ➔ 코드 오토 픽스 ➔ 100% 그린 검증</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: '보드 3컬럼 Grid & 다크모드 토큰 설계, 카드 컴포넌트 스타일링 착수...' },
      { agent: 'dev', text: '카드 상태 머신(To Do ➔ Doing ➔ Done)과 Drag&Drop 핸들러 모듈 생성...' },
      { agent: 'qa',  text: '드래그&드롭 검증용 Playwright 자율 시나리오 스크립트 대기 완료...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'board.css', code:
`/* AI Kanban Board — Dark Mode UI (UI 에이전트 생성) */
.board {
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
`// Kanban Drag&Drop Logic (개발 로직 에이전트 생성)
function createCard(title, column) {
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
        '<div style="background: #0f172a; padding: 16px; border-radius: 10px; width: 88%; margin: 0 auto; text-align: left; border: 1px solid #1e293b;">' +
        '<h4 style="color:#93c5fd; margin-bottom:10px;">📋 AI Kanban Board E2E 검증 세션</h4>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 11px;">' +
        '<div style="background: #080d1a; border-radius: 6px; padding: 8px; border: 1px solid #334155;"><div style="color: #93c5fd; font-weight: 700; margin-bottom: 6px;">To Do</div>' +
        '<div style="background: #1e293b; border-radius: 6px; padding: 6px 8px;">API 명세 작성</div></div>' +
        '<div style="background: #080d1a; border-radius: 6px; padding: 8px; border: 1px dashed #6366f1;"><div style="color: #fbbf24; font-weight: 700; margin-bottom: 6px;">Doing</div></div>' +
        '<div style="background: #080d1a; border-radius: 6px; padding: 8px; border: 1px solid #334155;"><div style="color: #4ade80; font-weight: 700; margin-bottom: 6px;">Done</div></div>' +
        '</div></div>',
      steps: [
        { console: '> Step 1: "API 명세 작성" 카드 자동 생성 및 To Do 컬럼 렌더링 확인', cursor: { top: '40%', left: '30%' } },
        { console: '> Step 2: 카드를 Doing 컬럼으로 드래그&드롭 액션 마우스 릴리즈', cursor: { top: '46%', left: '55%' } },
      ],
      failure: {
        consoleLine: '❌ [치명적 상호작용 오류] drop 이벤트 미발화 — 카드가 원위치로 복귀함',
        qaLog: '🚨 드래그&드롭 E2E 실패 감지! 카드가 Doing 컬럼에 안착하지 못함. 스택트레이스 즉시 전송',
        orchestratorLog: '🚨 자율 수정 루프(Self-Healing Loop) 발동 ➔ 개발 에이전트에 드롭존 핸들러 점검 명령',
        devFixLog: '🔧 kanban.js Line 12 핫픽스: 드롭존 dragover preventDefault 핸들러 주입 중...',
        patchedCode:
`// Kanban Drag&Drop Logic (Self-Healing Applied)
function createCard(title, column) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.textContent = title;
  card.draggable = true;
  card.addEventListener('dragstart', e =>
    e.dataTransfer.setData('cardId', card.id));
  column.appendChild(card);
}

dropZones.forEach(zone => {
  // 🔧 [Self-Healing Auto-Fix]: dragover 기본동작 차단 — drop 발화 조건 충족
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('drop', e => {
    const id = e.dataTransfer.getData('cardId');
    zone.appendChild(document.getElementById(id));
    saveBoardState();
  });
});`,
      },
      passLines: [
        '✅ [TEST 1 PASS] 카드 생성 및 To Do 컬럼 렌더링 정상',
        '✅ [TEST 2 PASS] 드래그&드롭 Doing 컬럼 안착 성공',
        '✅ [TEST 3 PASS] 다크모드 토글 상태 유지 검증 완료',
      ],
    },

    finalAppHtml:
      '<div style="background: #0b1120; padding: 22px; border-radius: 12px; height: 100%; display: flex; flex-direction: column; gap: 14px; border: 1px solid #1e293b;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<div><h3 style="color: #f8f8fc; font-size: 17px; font-weight: 800;">🗂 안티그래비티 AI 칸반 보드</h3>' +
      '<p style="color: #94a3b8; font-size: 12px;">AI 에이전트 부대가 전 과정 자율 구축한 서비스</p></div>' +
      '<span style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.4); padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: 800;">🌙 다크모드 ON</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; flex: 1; font-size: 12px;">' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px; border: 1px solid #1e293b;">' +
      '<div style="color: #93c5fd; font-weight: 700; margin-bottom: 8px;">To Do <span style="opacity:.6;">2</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">결제 모듈 연동</div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px;">온보딩 화면 개선<br><span style="background: rgba(168, 85, 247, 0.25); color: #c084fc; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 700;">✨ AI 자동 제안</span></div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px; border: 1px solid #1e293b;">' +
      '<div style="color: #fbbf24; font-weight: 700; margin-bottom: 8px;">Doing <span style="opacity:.6;">1</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px; border: 1px solid rgba(99,102,241,0.5);">API 명세 작성<br><span style="color: #a5b4fc; font-size: 10px; font-weight: 700;">🖱 Self-Healing 드롭 통과</span></div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 10px; border: 1px solid #1e293b;">' +
      '<div style="color: #4ade80; font-weight: 700; margin-bottom: 8px;">Done <span style="opacity:.6;">2</span></div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">로그인 플로우</div>' +
      '<div style="background: #1e293b; border-radius: 8px; padding: 8px 10px;">DB 스키마 설계</div>' +
      '</div>' +
      '</div>' +
      '</div>',
  },

  crypto: {
    label: '📈 코인 대시보드',
    appName: 'Crypto Portfolio Dashboard',
    prompt: '실시간 암호화폐 시세 및 포트폴리오 트래킹 대시보드 웹 앱 제작 및 브라우저 테스트',

    planSections: [
      { title: '1. 컴포넌트 아키텍처 분해',
        html: '<ul><li><code>index.html</code>: 시세 테이블, 포트폴리오 요약 카드, 스파크 미니 차트 영역</li><li><code>dashboard.css</code>: 시세 테이블, 등락 컬러 토큰, CSS 스파크 바 차트</li><li><code>portfolio.js</code>: 모의 시세 틱 생성기, 보유수량 × 시세 합산 파이프라인</li></ul>' },
      { title: '2. 서브-에이전트 역할 분담표',
        html: '<ul><li>🎨 <strong>UI/UX 전문 에이전트:</strong> 시세 테이블·요약 카드, 등락 컬러 시스템, 스파크 차트</li><li>⚡ <strong>개발 로직 에이전트:</strong> 시세 틱 시뮬레이션, 포트폴리오 합산·통화 포맷팅</li><li>🛡️ <strong>QA 테스트 에이전트:</strong> 시세 갱신·합산 정확도 E2E 및 런타임 자율 수정 (Self-Healing)</li></ul>' },
      { title: '3. 자율 검증 전략 (Verification Plan)',
        html: '<p>가상 브라우저에 모의 시세 틱 주입 ➔ 테이블 갱신·합산값 검증 ➔ 부동소수점 오차 감지 ➔ 코드 오토 픽스 ➔ 100% 그린 검증</p>' },
    ],

    delegationLogs: [
      { agent: 'ui',  text: '시세 테이블 레이아웃 & 등락 컬러 토큰, CSS 스파크 바 차트 설계...' },
      { agent: 'dev', text: '모의 시세 틱 제너레이터와 포트폴리오 합산 파이프라인 모듈 생성...' },
      { agent: 'qa',  text: '시세 갱신·합산 검증용 Playwright 자율 어서션 스크립트 대기 완료...' },
    ],

    codeFiles: [
      { agent: 'ui', filename: 'dashboard.css', code:
`/* Crypto Dashboard — Price Table UI (UI 에이전트 생성) */
.price-table {
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
`// Portfolio Aggregation Logic (개발 로직 에이전트 생성)
function tickPrices(prices) {
  return prices.map(p => ({
    ...p,
    krw: p.krw * (1 + (Math.random() - 0.5) * 0.01),
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
        '<div style="background: #0f172a; padding: 16px; border-radius: 10px; width: 85%; margin: 0 auto; text-align: left; font-size: 12px; border: 1px solid #1e293b;">' +
        '<h4 style="color:#38bdf8; margin-bottom:10px;">📈 Crypto Dashboard E2E 검증 세션</h4>' +
        '<div style="display: flex; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #1e293b;"><span>₿ BTC</span><span style="color: #34d399;">₩98,200,000 (+2.4%)</span></div>' +
        '<div style="display: flex; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid #1e293b;"><span>Ξ ETH</span><span style="color: #f87171;">₩4,150,000 (-1.1%)</span></div>' +
        '<div style="display: flex; justify-content: space-between; padding: 8px 4px; font-weight: 700;"><span>총 보유자산</span><span style="color: #38bdf8;">₩12,450,000</span></div>' +
        '</div>',
      steps: [
        { console: '> Step 1: 모의 시세 틱 3회 주입 - 테이블 실시간 갱신 확인', cursor: { top: '38%', left: '40%' } },
        { console: '> Step 2: 포트폴리오 합산값 어서션 검증 실행', cursor: { top: '58%', left: '52%' } },
      ],
      failure: {
        consoleLine: '❌ [합산 정확도 오류] AssertionError: expected ₩12,450,000 but got ₩12,449,999.87',
        qaLog: '🚨 포트폴리오 합산 E2E 실패 감지! 부동소수점 누적 오차 검출. 스택트레이스 즉시 전송',
        orchestratorLog: '🚨 자율 수정 루프(Self-Healing Loop) 발동 ➔ 개발 에이전트에 금액 연산 방식 교체 명령',
        devFixLog: '🔧 portfolio.js Line 5 핫픽스: 부동소수점 연산을 정수(원 단위) 연산으로 교체 중...',
        patchedCode:
`// Portfolio Aggregation Logic (Self-Healing Applied)
function tickPrices(prices) {
  return prices.map(p => ({
    ...p,
    // 🔧 [Self-Healing Auto-Fix]: 시세를 정수(원 단위)로 강제 반올림
    krw: Math.round(p.krw * (1 + (Math.random() - 0.5) * 0.01)),
  }));
}

function sumPortfolio(holdings, prices) {
  return holdings.reduce((total, h) => {
    const price = prices.find(p => p.symbol === h.symbol);
    // 🔧 [Self-Healing Auto-Fix]: 항목별 정수 변환 후 합산 — 누적 오차 제거
    return total + Math.round(h.amount * price.krw);
  }, 0);
}

const formatKRW = n => '₩' + n.toLocaleString('ko-KR');`,
      },
      passLines: [
        '✅ [TEST 1 PASS] 시세 틱 주입 후 테이블 실시간 갱신 정상',
        '✅ [TEST 2 PASS] 포트폴리오 합산 정확도 검증 (₩12,450,000)',
        '✅ [TEST 3 PASS] 등락 색상(상승 녹색/하락 적색) 렌더링 정상',
      ],
    },

    finalAppHtml:
      '<div style="background: #0b1120; padding: 22px; border-radius: 12px; height: 100%; display: flex; flex-direction: column; gap: 14px; border: 1px solid #1e293b;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">' +
      '<div><h3 style="color: #f8fafc; font-size: 17px; font-weight: 800;">📈 안티그래비티 크립토 포트폴리오</h3>' +
      '<p style="color: #94a3b8; font-size: 12px;">AI 에이전트 부대가 전 과정 자율 구축한 서비스</p></div>' +
      '<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: 800;">● LIVE</span>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; flex: 1; font-size: 12px;">' +
      '<div style="background: #111827; border-radius: 10px; padding: 12px; border: 1px solid #1e293b;">' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #1e293b;"><span>₿ BTC</span><span style="color: #34d399; font-weight: 700;">₩98,200,000 (+2.4%)</span></div>' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #1e293b;"><span>Ξ ETH</span><span style="color: #f87171; font-weight: 700;">₩4,150,000 (-1.1%)</span></div>' +
      '<div style="display: flex; justify-content: space-between; padding: 8px 4px;"><span>◎ SOL</span><span style="color: #34d399; font-weight: 700;">₩285,000 (+5.8%)</span></div>' +
      '</div>' +
      '<div style="background: #111827; border-radius: 10px; padding: 12px; border: 1px solid #1e293b; display: flex; flex-direction: column; justify-content: space-between;">' +
      '<div><div style="font-size: 11px; color: #94a3b8; font-weight:600;">총 보유자산 (Self-Healing 검증 통과)</div>' +
      '<div style="font-size: 22px; font-weight: 800; color: #38bdf8;">₩12,450,000</div></div>' +
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
