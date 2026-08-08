# Agentic Visualizer v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 영상 촬영용 AI Agentic Development 시뮬레이터 v2 — 시나리오 3종 완전 지원, 코드 타이핑 스트림, 재생 컨트롤(속도/일시정지/리셋).

**Architecture:** 콘텐츠(`scenarios.js` 순수 데이터)와 재생 엔진(`app.js` 타임라인 플레이어)을 분리. 모든 대기는 단일 `wait(ms, token)` 게이트를 통과하며 speed 배율·pause·runToken(리셋 무효화)을 일괄 처리.

**Tech Stack:** 순수 HTML/CSS/JS 정적 파일. 빌드 도구·외부 라이브러리 없음. 스펙: `docs/superpowers/specs/2026-08-08-agentic-visualizer-v2-design.md`

**검증 방식 (TDD 대체):** 테스트 인프라가 없는 정적 연출 데모이므로(스펙 §7·§8) 자동 단위 테스트 대신 ① 매 태스크 `node --check`로 JS 문법 게이트, ② 최종 태스크에서 브라우저 촬영 리허설 체크리스트를 수행한다.

**XSS 노트:** DOM 주입 HTML은 두 종류다. ① 시나리오 데이터 — 저장소에 커밋된 신뢰된 정적 문자열(스펙 §3.2 결정). ② 사용자가 타이핑한 프롬프트 — **반드시 `escapeHtml()`을 거쳐** 로그·기획서 헤더에 삽입한다.

---

## File Structure

```
e:\TEST\
├── index.html      # 수정: 재생 컨트롤 바, Code Stream 탭, 칩 data-scenario, scenarios.js 로드
├── styles.css      # 수정(끝에 추가): 컨트롤 바, 코드 창, 타이핑 커서, plan 페이드인, 칩 active
├── scenarios.js    # 신규: SCENARIOS 전역 상수 — habit/kanban/crypto 콘텐츠 전부
└── app.js          # 전면 재작성: 범용 플레이어 (state, wait 게이트, 5단계 타임라인, 컨트롤)
```

로드 순서: `scenarios.js` → `app.js` (전역 `SCENARIOS` 참조).

---

### Task 1: scenarios.js — 스키마 + habit 시나리오

**Files:**
- Create: `e:\TEST\scenarios.js`

- [ ] **Step 1: 파일 생성 — 공통 구조와 habit 시나리오**

```js
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
      mockHtml: '', // Step 2에서 정의
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

    finalAppHtml: '', // Step 2에서 정의
  },
};
```

- [ ] **Step 2: habit의 `mockHtml`·`finalAppHtml` 채우기**

`mockHtml` (가상 브라우저 뷰포트, v1 overlay 개선): 다크 카드(#121826, radius 8px, 폭 80%) 안에 `<h4>Habit Tracker Preview</h4>`, 값이 `매일 30분 운동하기`인 텍스트 입력, 인디고(#6366f1) `습관 추가` 버튼.

`finalAppHtml` (v1 `renderLiveAppPreview()` 내용 이관): 다크 컨테이너(#0f172a) 안에 ① 헤더 `🔥 Daily Habit Tracker` + `달성률 85%` 녹색 뱃지, ② 2열 스탯 카드(연속 달성 `14일 연속 ⚡` / 완료한 습관 `12 / 14 개`), ③ 습관 리스트 3행(러닝·독서 체크됨, 물 마시기 미체크) — 각 행은 `#1a2336` 카드 + accent-color 인디고 체크박스.

- [ ] **Step 3: 문법 검증**

Run: `node --check scenarios.js`
Expected: 출력 없이 종료 코드 0 (node 부재 시: 브라우저 로드 콘솔 오류 없음으로 대체)

- [ ] **Step 4: Commit**

```bash
git add scenarios.js && git commit -m "feat: 시나리오 데이터 스키마 + habit 시나리오"
```

---

### Task 2: scenarios.js — kanban·crypto 시나리오

**Files:**
- Modify: `e:\TEST\scenarios.js` (SCENARIOS에 kanban, crypto 키 추가)

- [ ] **Step 1: kanban 시나리오 추가** — habit과 동일 구조. 핵심 값:

- `label: 'AI 칸반 보드'`, `appName: 'AI Kanban Board'`, prompt는 v1 PRESETS.kanban 문구.
- planSections: `board.css`(3컬럼 Grid, 다크모드 토큰) / `kanban.js`(카드 CRUD, HTML5 Drag&Drop API, AI 태스크 제안) / 검증 전략(카드 생성·드래그 E2E).
- codeFiles: `{ agent:'ui', filename:'board.css' }` — `.board-column`(3컬럼 grid, 다크 surface), `.task-card`(hover lift), `.column-header`(상태색 뱃지) 등 12~16줄. `{ agent:'dev', filename:'kanban.js' }` — `createCard(title, column)`, `card.draggable = true`, `dragstart`에서 `dataTransfer.setData`, `drop`에서 컬럼 이동 로직 12~16줄.
- test: url `http://localhost:3000/kanban`. mockHtml: 다크 배경에 미니 3컬럼(To Do/Doing/Done) + To Do에 카드 1장 `API 명세 작성`. steps: ① `> Step 1: "API 명세 작성" 카드 생성 확인...` cursor 38%/30% ② `> Step 2: 카드를 Doing 컬럼으로 드래그&드롭...` cursor 45%/55%.
- failure: consoleLine `❌ TEST 2 FAILED: drop 이벤트 미발화 — 카드가 원위치로 복귀함`, qaLog(드롭 실패 보고), orchestratorLog(Self-Healing: 드롭존 이벤트 핸들러 점검 지시), devFixLog `🔧 kanban.js:9 패치 — 드롭존에 dragover preventDefault 핸들러 추가.`
- passLines: 카드 생성 / 드래그&드롭 이동 / 다크모드 토글 3개 PASSED.
- finalAppHtml: 헤더(`🗂 AI Kanban Board` + `🌙 Dark` 뱃지) + 3컬럼(To Do 2장·Doing 1장·Done 2장), 카드 중 1장에 `✨ AI 제안` 보라 뱃지.

- [ ] **Step 2: crypto 시나리오 추가** — 핵심 값:

- `label: '암호화폐 대시보드'`, `appName: 'Crypto Portfolio Dashboard'`, prompt는 v1 PRESETS.crypto 문구.
- planSections: `dashboard.css`(시세 테이블, 미니 차트 바) / `portfolio.js`(모의 시세 틱 생성, 보유수량 × 시세 합산) / 검증 전략(시세 갱신·합산 정확도 E2E).
- codeFiles: `dashboard.css` — `.price-table`, `.change-up`(green)/`.change-down`(red), `.spark-bar`(CSS 미니 차트) 12~16줄. `portfolio.js` — `tickPrices()` 모의 변동, `sumPortfolio(holdings, prices)` 합산, `formatKRW()` 12~16줄.
- test: url `http://localhost:3000/crypto`. mockHtml: 미니 시세 테이블(BTC·ETH 2행, 등락 색상) + `총 보유자산` 합계 라벨. steps: ① `> Step 1: 모의 시세 틱 3회 주입...` cursor 35%/40% ② `> Step 2: 포트폴리오 합산값 검증...` cursor 60%/50%.
- failure: consoleLine `❌ TEST 2 FAILED: 합산 오차 — expected ₩12,450,000 but got ₩12,449,999.87`, qaLog(부동소수점 합산 오차 보고), orchestratorLog(Self-Healing: 금액 연산 방식 교체 지시), devFixLog `🔧 portfolio.js:7 패치 — 부동소수점 곱셈을 정수(원 단위) 연산으로 교체.`
- passLines: 시세 갱신 반영 / 합산 정확도 / 등락 색상 렌더링 3개 PASSED.
- finalAppHtml: 헤더(`📈 Crypto Portfolio` + `LIVE` 녹색 점멸 뱃지) + 시세 테이블 3행(BTC +2.4% 녹색, ETH -1.1% 적색, SOL +5.8% 녹색) + 우측 요약 카드(`총 보유자산 ₩12,450,000`, CSS 막대 미니 차트 5개).

- [ ] **Step 3: 문법 검증** — `node --check scenarios.js` → exit 0

- [ ] **Step 4: Commit** — `git add scenarios.js && git commit -m "feat: kanban·crypto 시나리오 추가"`

---

### Task 3: index.html — 컨트롤 바·Code Stream 탭·칩 개편

**Files:**
- Modify: `e:\TEST\index.html`

- [ ] **Step 1: 프리셋 칩을 data-scenario 방식으로 교체** (기존 `onclick="setPreset(...)"` 제거)

```html
<div class="preset-triggers">
  <span class="preset-label">추천 템플릿:</span>
  <button class="chip active" data-scenario="habit">습관 트래커 App</button>
  <button class="chip" data-scenario="kanban">AI 칸반 보드</button>
  <button class="chip" data-scenario="crypto">암호화폐 대시보드</button>
</div>
```

- [ ] **Step 2: 파이프라인 스테퍼를 `pipeline-row`로 감싸고 우측에 재생 컨트롤 바 추가**

기존 `<div class="pipeline-stepper">...(스테퍼 전체 유지)...</div>`를 아래로 감싼다:

```html
<div class="pipeline-row">
  <div class="pipeline-stepper"> <!-- 기존 내용 그대로 --> </div>
  <div class="playback-controls">
    <button id="pauseBtn" class="ctrl-btn" disabled>⏸ 일시정지</button>
    <div class="speed-group">
      <button class="ctrl-btn speed-btn" data-speed="0.5">0.5x</button>
      <button class="ctrl-btn speed-btn active" data-speed="1">1x</button>
      <button class="ctrl-btn speed-btn" data-speed="2">2x</button>
    </div>
    <button id="resetBtn" class="ctrl-btn">⟳ 리셋</button>
  </div>
</div>
```

- [ ] **Step 3: Code Stream 탭 + 패널 추가**

탭 헤더의 `📝 Architecture Plan` 탭 다음에 삽입:
```html
<div class="tab" data-target="codeStreamView">💻 Code Stream</div>
```

`planView` 패널 다음에 삽입:
```html
<div class="tab-pane" id="codeStreamView">
  <div class="code-stream" id="codeStream">
    <div class="empty-state" id="codeEmptyState">
      <span class="empty-icon">💻</span>
      <p>코드 생성 단계가 시작되면 Sub-Agent들이 병렬로 코드를 작성하는 모습이 실시간 스트리밍됩니다.</p>
    </div>
    <div class="code-window hidden" id="codeWindow0">
      <div class="code-window-header"><span class="agent-badge"></span><span class="code-filename"></span></div>
      <pre class="code-area"><code></code></pre>
    </div>
    <div class="code-window hidden" id="codeWindow1">
      <div class="code-window-header"><span class="agent-badge"></span><span class="code-filename"></span></div>
      <pre class="code-area"><code></code></pre>
    </div>
  </div>
</div>
```

- [ ] **Step 4: 스크립트 로드 순서 변경**

```html
<script src="scenarios.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 5: Commit** — `git add index.html && git commit -m "feat: 재생 컨트롤 바·Code Stream 탭·시나리오 칩 마크업"`

---

### Task 4: styles.css — 신규 UI 스타일

**Files:**
- Modify: `e:\TEST\styles.css` (파일 끝에 `/* ===== v2 additions ===== */` 블록 추가)

- [ ] **Step 1: 스타일 블록 추가** — 기존 CSS 변수(`--accent-*`, surface 색)를 재사용해 다음을 정의:

```css
/* ===== v2 additions ===== */
/* 1) 파이프라인 행 + 재생 컨트롤 */
.pipeline-row { display: flex; align-items: center; gap: 16px; }
.pipeline-row .pipeline-stepper { flex: 1; }
.playback-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ctrl-btn {
  background: rgba(30, 41, 59, 0.8); color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 8px;
  padding: 7px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
}
.ctrl-btn:hover:not(:disabled) { border-color: #6366f1; color: #fff; }
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.speed-group { display: flex; gap: 2px; }
.speed-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }

/* 2) 코드 스트림 */
.code-stream { display: flex; flex-direction: column; gap: 12px; height: 100%; overflow: hidden; }
.code-window {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #0b1120; border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 10px;
  overflow: hidden;
}
.code-window.hidden { display: none; }
.code-window-header {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: rgba(30, 41, 59, 0.7); border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 12px;
}
.agent-badge { padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px; }
.agent-badge.ui  { background: rgba(236, 72, 153, 0.18); color: #f472b6; }
.agent-badge.dev { background: rgba(56, 189, 248, 0.18); color: #38bdf8; }
.code-filename { font-family: 'Fira Code', monospace; color: #94a3b8; }
.code-area {
  flex: 1; margin: 0; padding: 12px 14px; overflow-y: auto;
  font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.6;
  color: #dbeafe; white-space: pre-wrap; word-break: break-all;
}
.code-window.typing .code-area code::after {
  content: '▌'; color: #6366f1; animation: blinkCursor 0.7s steps(1) infinite;
}
@keyframes blinkCursor { 50% { opacity: 0; } }

/* 3) 기획서 섹션 페이드인 */
.plan-section { animation: fadeSlideIn 0.6s ease both; }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* 4) 칩 활성/비활성 */
.chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.chip:disabled { opacity: 0.45; cursor: not-allowed; }
```

(v1 `.chip`에 이미 base 스타일이 있으면 재선언 없이 위 상태 클래스만 추가. `.tab-pane#codeStreamView` 높이는 기존 `.tab-pane` 규칙 상속 확인.)

- [ ] **Step 2: Commit** — `git add styles.css && git commit -m "feat: v2 스타일 — 컨트롤 바·코드 스트림·페이드인"`

---

### Task 5: app.js — 플레이어 코어 (state·wait·컨트롤·리셋)

**Files:**
- Rewrite: `e:\TEST\app.js` (전면 교체 — 이번 태스크는 코어, 다음 태스크에서 타임라인)

- [ ] **Step 1: 코어 작성** — 파일 전체를 아래로 교체:

```js
// ===== AI Agentic Development Visualizer v2 — Player Engine =====
// DOM 주입 HTML의 출처는 두 가지뿐이다:
//  1) scenarios.js의 신뢰된 정적 연출 문자열 (저장소 커밋 콘텐츠)
//  2) 사용자 입력 프롬프트 — escapeHtml()을 거친 뒤에만 삽입

// --- DOM refs ---
const startBtn = document.getElementById('startAgenticBtn');
const promptInput = document.getElementById('promptInput');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const terminalLogs = document.getElementById('terminalLogs');
const activeAgentTag = document.getElementById('activeAgentTag');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedBtns = [...document.querySelectorAll('.speed-btn')];
const presetChips = [...document.querySelectorAll('.chip')];
const planDocument = document.getElementById('planDocument');
const liveAppContainer = document.getElementById('liveAppContainer');
const codeEmptyState = document.getElementById('codeEmptyState');
const browserUrl = document.getElementById('browserUrl');
const browserTestBadge = document.getElementById('browserTestBadge');
const testCursor = document.getElementById('testCursor');
const testOverlay = document.getElementById('testInteractionOverlay');
const testConsole = document.getElementById('testConsole');
const codeWindows = [0, 1].map(i => {
  const win = document.getElementById(`codeWindow${i}`);
  return { win, badge: win.querySelector('.agent-badge'),
           filename: win.querySelector('.code-filename'),
           code: win.querySelector('code'), area: win.querySelector('.code-area') };
});

const AGENT_META = {
  orchestrator: { name: 'Orchestrator', cls: 'orchestrator' },
  planner: { name: 'Planner', cls: 'planner' },
  ui: { name: 'UI Specialist', cls: 'ui' },
  dev: { name: 'Dev Engineer', cls: 'dev' },
  qa: { name: 'QA Tester', cls: 'qa' },
};

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// --- 초기 상태 스냅샷 (리셋 시 복원) ---
const INITIAL = {
  plan: planDocument.innerHTML,
  finalApp: liveAppContainer.innerHTML,
  overlay: testOverlay.innerHTML,
  console: testConsole.innerHTML,
  logs: terminalLogs.innerHTML,
};

// --- Player state ---
let speed = 1;
let paused = false;
let runToken = 0;
let isRunning = false;
let activeScenarioKey = 'habit';

const TICK_MS = 50;
const ABORTED = Symbol('aborted');

// 모든 연출 대기의 단일 게이트: speed 배율·pause·리셋(runToken) 일괄 처리
function wait(ms, token) {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    (function tick() {
      if (token !== runToken) return reject(ABORTED);
      if (!paused) elapsed += TICK_MS * speed;
      if (elapsed >= ms) return resolve();
      setTimeout(tick, TICK_MS);
    })();
  });
}

// --- Tabs ---
const tabs = document.querySelectorAll('.tab');
const tabPanes = document.querySelectorAll('.tab-pane');
tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.getAttribute('data-target'))));
function switchTab(targetId) {
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-target') === targetId));
  tabPanes.forEach(p => p.classList.toggle('active', p.id === targetId));
}

// --- Helpers ---
function appendLog(agentKey, message, clsOverride) {
  const meta = AGENT_META[agentKey];
  const now = new Date().toTimeString().split(' ')[0];
  const div = document.createElement('div');
  div.className = `log-entry ${clsOverride || (meta ? meta.cls : agentKey)}`;
  div.innerHTML = `<span class="timestamp">[${now}]</span> <strong>[${meta ? meta.name : agentKey}]</strong> ${message}`;
  terminalLogs.appendChild(div);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

function updateStep(stepIndex) {
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`step${i}`);
    const lineEl = document.getElementById(`stepline${i}`);
    if (i < stepIndex) { stepEl.className = 'step completed'; if (lineEl) lineEl.className = 'step-line filled'; }
    else if (i === stepIndex) { stepEl.className = 'step active'; if (lineEl) lineEl.className = 'step-line'; }
    else { stepEl.className = 'step'; if (lineEl) lineEl.className = 'step-line'; }
  }
}

function addConsoleLine(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = text;
  testConsole.appendChild(line);
  testConsole.scrollTop = testConsole.scrollHeight;
}

// --- Controls ---
pauseBtn.addEventListener('click', () => {
  if (!isRunning) return;
  paused = !paused;
  pauseBtn.innerHTML = paused ? '▶ 재개' : '⏸ 일시정지';
  statusDot.classList.toggle('pulsing', !paused);
});

speedBtns.forEach(btn => btn.addEventListener('click', () => {
  speed = parseFloat(btn.dataset.speed);
  speedBtns.forEach(b => b.classList.toggle('active', b === btn));
}));

resetBtn.addEventListener('click', resetAll);

presetChips.forEach(chip => chip.addEventListener('click', () => {
  if (isRunning) return;
  activeScenarioKey = chip.dataset.scenario;
  promptInput.value = SCENARIOS[activeScenarioKey].prompt;
  presetChips.forEach(c => c.classList.toggle('active', c === chip));
}));

function setChipsEnabled(enabled) {
  presetChips.forEach(c => (c.disabled = !enabled));
}

function resetAll() {
  runToken++;               // 진행 중인 타임라인 루프를 다음 tick에서 즉시 중단
  isRunning = false;
  paused = false;
  pauseBtn.innerHTML = '⏸ 일시정지';
  pauseBtn.disabled = true;
  startBtn.disabled = false;
  setChipsEnabled(true);

  updateStep(1);
  document.querySelectorAll('.sub-node').forEach(n => (n.className = 'node sub-node'));
  document.getElementById('nodeOrchestrator').className = 'node orchestrator active';
  for (let i = 1; i <= 4; i++) document.getElementById(`line${i}`).style.width = '0';

  terminalLogs.innerHTML = INITIAL.logs;
  planDocument.innerHTML = INITIAL.plan;
  liveAppContainer.innerHTML = INITIAL.finalApp;
  testOverlay.innerHTML = INITIAL.overlay;
  testConsole.innerHTML = INITIAL.console;
  browserTestBadge.textContent = 'Standby';
  browserTestBadge.style.background = '';
  testCursor.style.top = '';
  testCursor.style.left = '';

  codeEmptyState.style.display = '';
  codeWindows.forEach(w => {
    w.win.classList.add('hidden');
    w.win.classList.remove('typing');
    w.code.textContent = '';
  });

  statusText.textContent = 'Ready for Prompt';
  activeAgentTag.textContent = 'Idle';
  statusDot.classList.add('pulsing');
  statusDot.style.backgroundColor = '';
  statusDot.style.boxShadow = '';
  switchTab('planView');
}
```

- [ ] **Step 2: 문법 검증** — `node --check app.js` → exit 0 (runScenario 미정의 상태여도 문법만 통과하면 됨. 시작 버튼 핸들러는 Task 6에서 추가)

- [ ] **Step 3: Commit** — `git add app.js && git commit -m "feat: v2 플레이어 코어 — wait 게이트·컨트롤·리셋"`

---

### Task 6: app.js — 5단계 타임라인 + 시작 핸들러

**Files:**
- Modify: `e:\TEST\app.js` (파일 끝에 추가)

- [ ] **Step 1: 타이밍 상수와 타임라인 추가**

```js
// --- Timing (1x 기준, ms) — 촬영 리허설 후 여기서만 조정 ---
const T = {
  promptIn: 1000, planStart: 1400, planSection: 3200, planDone: 1600,
  delegateIntro: 900, wireUp: 800, agentIntro: 1500,
  codeIntro: 1300, charTick: 45, codeChunk: 3, segmentSize: 130, midLog: 1300,
  testNav: 1600, testStep: 1700, failDwell: 2300, healLog: 1700, rerun: 1500,
  passLine: 900, badgeDwell: 1900, finale: 2200,
};

async function typeSegment(w, text, from, to, token) {
  w.win.classList.add('typing');
  for (let i = from; i < to; i += T.codeChunk) {
    w.code.textContent += text.slice(i, Math.min(i + T.codeChunk, to));
    w.area.scrollTop = w.area.scrollHeight;
    await wait(T.charTick, token);
  }
  w.win.classList.remove('typing');
}

async function runScenario(sc, userPrompt, token) {
  // userPrompt는 호출 전에 escapeHtml() 처리된 문자열이다.
  // ===== Phase 1: Intent & Planning (~15s) =====
  updateStep(1);
  statusText.textContent = 'Orchestration & Planning...';
  activeAgentTag.textContent = 'Master Orchestrator';
  document.getElementById('nodeOrchestrator').className = 'node orchestrator active working';

  appendLog('orchestrator', `Human prompt received: "${userPrompt}"`);
  await wait(T.promptIn, token);
  appendLog('planner', '프롬프트를 아키텍처 컴포넌트와 DAG 태스크 의존성으로 분해 중...');
  document.getElementById('nodePlanner').classList.add('working');
  await wait(T.planStart, token);

  switchTab('planView');
  planDocument.innerHTML =
    `<h2>📋 Implementation Plan: ${sc.appName}</h2><p><strong>Proposed Goal:</strong> ${userPrompt}</p>`;
  for (const section of sc.planSections) {
    const div = document.createElement('div');
    div.className = 'plan-section';
    div.innerHTML = `<h3>${section.title}</h3>${section.html}`;
    planDocument.appendChild(div);
    appendLog('planner', `설계 섹션 작성: ${section.title}`);
    await wait(T.planSection, token);
  }
  appendLog('planner', 'implementation_plan.md 생성 완료.');
  await wait(T.planDone, token);

  // ===== Phase 2: Sub-Agent Allocation (~10s) =====
  updateStep(2);
  statusText.textContent = 'Spawning Sub-Agent Swarm...';
  activeAgentTag.textContent = 'Multi-Agent Sub-Tasking';
  appendLog('orchestrator', 'Delegating tasks: UI Specialist, Dev Engineer, QA Tester');
  await wait(T.delegateIntro, token);
  for (let i = 1; i <= 4; i++) document.getElementById(`line${i}`).style.width = '100%';
  await wait(T.wireUp, token);
  document.getElementById('nodeUI').classList.add('working');
  document.getElementById('nodeLogic').classList.add('working');
  document.getElementById('nodeQA').classList.add('working');
  for (const d of sc.delegationLogs) {
    appendLog(d.agent, d.text);
    await wait(T.agentIntro, token);
  }

  // ===== Phase 3: Code Generation (~30s) =====
  updateStep(3);
  statusText.textContent = 'Writing & Assembling Code...';
  activeAgentTag.textContent = 'Code Stream';
  switchTab('codeStreamView');
  codeEmptyState.style.display = 'none';

  const files = sc.codeFiles.slice(0, 2);
  files.forEach((f, i) => {
    const w = codeWindows[i];
    const meta = AGENT_META[f.agent];
    w.win.classList.remove('hidden');
    w.badge.textContent = meta.name;
    w.badge.className = `agent-badge ${meta.cls}`;
    w.filename.textContent = f.filename;
    w.code.textContent = '';
    appendLog(f.agent, `${f.filename} 작성 시작...`);
  });
  await wait(T.codeIntro, token);

  // 두 파일을 세그먼트 단위로 번갈아 타이핑 → 병렬 작업 연출
  const pos = files.map(() => 0);
  let midLogged = false;
  while (files.some((f, i) => pos[i] < f.code.length)) {
    for (let i = 0; i < files.length; i++) {
      if (pos[i] >= files[i].code.length) continue;
      const to = Math.min(pos[i] + T.segmentSize, files[i].code.length);
      activeAgentTag.textContent = AGENT_META[files[i].agent].name;
      await typeSegment(codeWindows[i], files[i].code, pos[i], to, token);
      pos[i] = to;
    }
    if (!midLogged && pos.every((p, i) => p >= files[i].code.length / 2)) {
      midLogged = true;
      appendLog('orchestrator', '진행률 50% — 컴포넌트 조립 상태 점검 완료.');
      await wait(T.midLog, token);
    }
  }
  files.forEach(f => appendLog(f.agent, `${f.filename} 작성 완료 ✔`));
  await wait(T.midLog, token);

  // ===== Phase 4: E2E Verification & Self-Healing (~25s) =====
  updateStep(4);
  statusText.textContent = 'Running Autonomous E2E Tests...';
  activeAgentTag.textContent = 'Browser Sub-Agent';
  switchTab('testBrowserView');
  browserUrl.textContent = sc.test.url;
  appendLog('qa', 'Headless Browser Sub-Agent 기동 — 시각·인터랙션 테스트 수행...');
  browserTestBadge.textContent = 'TESTING';
  browserTestBadge.style.background = 'var(--accent-orange)';
  testConsole.innerHTML = '';
  addConsoleLine(`> Navigating to ${sc.test.url} ...`);
  testOverlay.innerHTML = sc.test.mockHtml;
  await wait(T.testNav, token);

  for (const step of sc.test.steps) {
    addConsoleLine(step.console);
    testCursor.style.top = step.cursor.top;
    testCursor.style.left = step.cursor.left;
    await wait(T.testStep, token);
  }

  const f = sc.test.failure;
  addConsoleLine(f.consoleLine, 'fail');
  appendLog('qa', f.qaLog, 'error');
  await wait(T.failDwell, token);
  appendLog('orchestrator', f.orchestratorLog);
  await wait(T.healLog, token);
  appendLog('dev', f.devFixLog);
  await wait(T.healLog, token);
  addConsoleLine('🔄 Self-Healing 적용 완료. 테스트 스위트 재실행...');
  appendLog('qa', 'Browser Sub-Agent 테스트 세션 재실행...');
  await wait(T.rerun, token);
  for (const line of sc.test.passLines) {
    addConsoleLine(line, 'pass');
    await wait(T.passLine, token);
  }
  browserTestBadge.textContent = 'PASSED 100%';
  browserTestBadge.style.background = 'var(--accent-green)';
  testOverlay.innerHTML += '<div style="margin-top: 12px; color: #4ade80; font-weight: bold;">✨ E2E Test Passed Successfully!</div>';
  await wait(T.badgeDwell, token);

  // ===== Phase 5: Final Product (~10s) =====
  updateStep(5);
  statusText.textContent = 'Agentic Pipeline Complete';
  activeAgentTag.textContent = 'Done';
  statusDot.style.backgroundColor = 'var(--accent-green)';
  statusDot.style.boxShadow = '0 0 12px var(--accent-green)';
  appendLog('orchestrator', '🎉 All tests passed! 최종 앱 프리뷰를 공개합니다.', 'success');
  switchTab('appPreviewView');
  liveAppContainer.innerHTML = sc.finalAppHtml;
  await wait(T.finale, token);
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`step${i}`).className = 'step completed';
    const lineEl = document.getElementById(`stepline${i}`);
    if (lineEl) lineEl.className = 'step-line filled';
  }
}

// --- Start ---
startBtn.addEventListener('click', async () => {
  if (isRunning) return;
  resetAll();
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  setChipsEnabled(false);
  const token = ++runToken;
  const sc = SCENARIOS[activeScenarioKey];
  const userPrompt = escapeHtml(promptInput.value.trim() || sc.prompt);
  terminalLogs.innerHTML = '';
  try {
    await runScenario(sc, userPrompt, token);
  } catch (err) {
    if (err !== ABORTED) console.error(err);
    return; // ABORTED: resetAll()이 이미 UI 복원함
  }
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  setChipsEnabled(true);
});
```

- [ ] **Step 2: 문법 검증** — `node --check app.js` → exit 0

- [ ] **Step 3: Commit** — `git add app.js && git commit -m "feat: 5단계 타임라인·코드 스트림·자가치유 연출"`

---

### Task 7: 브라우저 검증 (촬영 리허설 체크리스트)

**Files:** 없음 (필요 시 발견된 버그 수정)

- [ ] **Step 1: 로컬 실행** — `Start-Process e:\TEST\index.html` (또는 간단 정적 서버). 콘솔 오류 0 확인.
- [ ] **Step 2: 시나리오 3종 각각 완주** — 기획서/코드 파일명/테스트 드라마/최종 앱이 주제와 일치.
- [ ] **Step 3: 속도** — 0.5x/1x/2x 재생, 재생 중 속도 변경 즉시 반영.
- [ ] **Step 4: 일시정지** — 코드 타이핑 중 일시정지 → 탭 전환 → 재개 정상.
- [ ] **Step 5: 리셋** — 재생 중·일시정지 중 리셋 → 초기 화면 복원, 유령 로그/타이핑 없음, 즉시 재시작 가능.
- [ ] **Step 6: 러닝타임** — 1x 완주 80~100초 범위 (벗어나면 `T` 상수 조정).
- [ ] **Step 7: 수정사항 발생 시 커밋** — `git add -A && git commit -m "fix: 리허설 검증 수정"`

---

### Task 8: 배포 — GitHub 푸시 + Firebase Hosting

**Files:**
- Create: `e:\TEST\firebase.json`, `e:\TEST\.firebaserc`, `e:\TEST\.gitignore`

- [ ] **Step 1: 배포 설정 파일 생성**

`.gitignore`:
```
.firebase/
*.log
```

`firebase.json` (루트를 그대로 호스팅, 문서·설정 제외):
```json
{
  "hosting": {
    "site": "ai-agentic-dev",
    "public": ".",
    "ignore": ["firebase.json", ".firebaserc", "**/.*", "**/node_modules/**", "docs/**"]
  }
}
```

`.firebaserc` — 프로젝트 ID는 `firebase projects:list`로 확인 후 기입 (사이트명 `ai-agentic-dev` 기준 추정).

- [ ] **Step 2: GitHub 푸시**

```bash
git branch -M main
git remote add origin https://github.com/itconnect-ai/ai-agentic-dev-preview.git
git push -u origin main
```
사전 확인: `gh auth status`. 원격에 기존 커밋이 있으면 먼저 `git pull --rebase origin main --allow-unrelated-histories` 후 푸시. 인증 실패 시 사용자에게 알림(차단 지점).

- [ ] **Step 3: Firebase 배포**

```bash
firebase deploy --only hosting
```
사전 확인: `firebase --version`(없으면 `npx firebase-tools`), `firebase login:list`(미로그인 시 사용자에게 알림 — 차단 지점). 배포 후 https://ai-agentic-dev.web.app/ 응답 확인.

- [ ] **Step 4: Commit** — `git add firebase.json .firebaserc .gitignore && git commit -m "chore: Firebase Hosting·배포 설정" && git push`

---

## Self-Review 결과

- **스펙 커버리지:** §3 아키텍처(T1·T5), §3.2 스키마(T1·T2), §3.3 엔진(T5), §3.4 페이싱(T6 `T` 상수), §4 UI 5항목(T3·T4·T6), §5 시나리오 3종(T1·T2), §6 오류 처리(T5 resetAll·토큰, 칩 비활성), §7 검증(T7), 배포 요청(T8) — 누락 없음.
- **플레이스홀더:** habit의 mockHtml/finalAppHtml 및 kanban·crypto 장문 문자열은 요소 단위 명세로 기술(연출용 표시 문자열로, 구조·문구가 전부 명시됨). 그 외 코드는 전문 수록.
- **타입 일관성:** `wait(ms, token)`·`ABORTED`·`codeWindows[i]` 구조(win/badge/filename/code/area)·`AGENT_META` 키(ui/dev/qa/orchestrator/planner)가 T5 정의와 T6 사용처 일치. `SCENARIOS` 필드명은 T1 스키마와 T6 참조(`planSections`, `delegationLogs`, `codeFiles`, `test.steps/failure/passLines`, `finalAppHtml`) 일치 확인. 사용자 입력은 시작 핸들러에서 `escapeHtml()` 단일 지점 처리.
