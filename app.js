// ===== AI Agentic Development Visualizer v2 — Player Engine =====
// 콘텐츠는 scenarios.js(SCENARIOS)에, 재생 로직은 이 파일에 있다.
// XSS 방어 원칙:
//  - 사용자 입력(프롬프트)은 innerHTML에 절대 넣지 않는다 → textContent 기반 DOM API로만 렌더
//  - innerHTML은 scenarios.js의 신뢰된 정적 연출 문자열(저장소 커밋 콘텐츠)에만 사용

// --- Web Audio API Sound Synthesizer for Dramatic Sound FX ---
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  }

  playError() {
    if (!this.enabled) return;
    this.playBeep(180, 'sawtooth', 0.25);
    setTimeout(() => this.playBeep(130, 'sawtooth', 0.35), 100);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.playBeep(523.25, 'triangle', 0.1); // C5
    setTimeout(() => this.playBeep(659.25, 'triangle', 0.1), 100); // E5
    setTimeout(() => this.playBeep(783.99, 'triangle', 0.2), 200); // G5
  }

  playWhoosh() {
    if (!this.enabled) return;
    this.playBeep(300, 'sine', 0.15);
  }
}

const sfx = new SoundFX();

const soundBtn = document.getElementById('soundToggleBtn');
soundBtn.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  soundBtn.classList.toggle('active', sfx.enabled);
  soundBtn.textContent = '';
  const icon = document.createElement('span');
  icon.className = 'sound-icon';
  icon.textContent = sfx.enabled ? '🔊' : '🔇';
  soundBtn.appendChild(icon);
  soundBtn.append(sfx.enabled ? ' 효과음 ON' : ' 효과음 OFF');
});

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
const previewCard = document.getElementById('previewCard');
const nodeStatusEls = {
  ui: document.getElementById('statusUI'),
  dev: document.getElementById('statusLogic'),
  qa: document.getElementById('statusQA'),
};
const codeWindows = [0, 1].map(i => {
  const win = document.getElementById(`codeWindow${i}`);
  return {
    win,
    badge: win.querySelector('.agent-badge'),
    filename: win.querySelector('.code-filename'),
    status: win.querySelector('.code-status'),
    code: win.querySelector('code'),
    area: win.querySelector('.code-area'),
  };
});

const AGENT_META = {
  orchestrator: { name: 'Orchestrator', cls: 'orchestrator' },
  planner: { name: 'Planner', cls: 'planner' },
  ui: { name: 'UI 에이전트', cls: 'ui' },
  dev: { name: '로직 에이전트', cls: 'dev' },
  qa: { name: 'QA 에이전트', cls: 'qa' },
};

// --- 초기 상태 스냅샷 (리셋 시 복원) ---
const INITIAL = {
  plan: planDocument.innerHTML,
  finalApp: liveAppContainer.innerHTML,
  overlay: testOverlay.innerHTML,
  console: testConsole.innerHTML,
  logs: terminalLogs.innerHTML,
  browserUrl: browserUrl.textContent,
  nodeStatus: { ui: '대기 중', dev: '대기 중', qa: '대기 중' },
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
tabs.forEach(tab => tab.addEventListener('click', () => {
  sfx.playWhoosh();
  switchTab(tab.getAttribute('data-target'));
}));

function switchTab(targetId) {
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-target') === targetId));
  tabPanes.forEach(p => p.classList.toggle('active', p.id === targetId));
}

// --- Helpers ---
// 로그는 전부 DOM API + textContent로 조립한다 (사용자 입력이 섞여도 안전)
function appendLog(agentKey, message, clsOverride) {
  sfx.playBeep(600, 'sine', 0.05);
  const meta = AGENT_META[agentKey];
  const div = document.createElement('div');
  div.className = `log-entry ${clsOverride || (meta ? meta.cls : agentKey)}`;

  const ts = document.createElement('span');
  ts.className = 'timestamp';
  ts.textContent = `[${new Date().toTimeString().split(' ')[0]}]`;

  const name = document.createElement('strong');
  name.textContent = `[${meta ? meta.name : agentKey}]`;

  div.append(ts, ' ', name, ' ', message);
  terminalLogs.appendChild(div);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

function updateStep(stepIndex) {
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`step${i}`);
    const lineEl = document.getElementById(`stepline${i}`);
    if (i < stepIndex) {
      stepEl.className = 'step completed';
      if (lineEl) lineEl.className = 'step-line filled';
    } else if (i === stepIndex) {
      stepEl.className = 'step active';
      if (lineEl) lineEl.className = 'step-line';
    } else {
      stepEl.className = 'step';
      if (lineEl) lineEl.className = 'step-line';
    }
  }
}

function markAllStepsCompleted() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`step${i}`).className = 'step completed';
    const lineEl = document.getElementById(`stepline${i}`);
    if (lineEl) lineEl.className = 'step-line filled';
  }
}

function addConsoleLine(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = text;
  testConsole.appendChild(line);
  testConsole.scrollTop = testConsole.scrollHeight;
}

function setNodeStatus(agent, text, color) {
  const el = nodeStatusEls[agent];
  if (!el) return;
  el.textContent = text;
  el.style.color = color || '';
}

function setCodeStatus(w, text, cls) {
  w.status.textContent = text;
  w.status.className = `code-status${cls ? ' ' + cls : ''}`;
}

// 기획서 헤더: 사용자 입력(프롬프트)은 textContent로만 삽입
function renderPlanHeader(sc, userPrompt) {
  planDocument.textContent = '';

  const h2 = document.createElement('h2');
  h2.textContent = '📋 아키텍처 기획서 (implementation_plan.md)';

  const goal = document.createElement('p');
  const goalLabel = document.createElement('strong');
  goalLabel.textContent = '요구사항 목표: ';
  goal.append(goalLabel, userPrompt);

  const target = document.createElement('p');
  target.style.color = '#94a3b8';
  target.style.fontSize = '12px';
  const targetName = document.createElement('strong');
  targetName.textContent = sc.appName;
  target.append('Target Product: ', targetName);

  planDocument.append(h2, goal, target);
}

// --- Controls ---
pauseBtn.addEventListener('click', () => {
  if (!isRunning) return;
  paused = !paused;
  pauseBtn.textContent = paused ? '▶ 재개' : '⏸ 일시정지';
  statusDot.classList.toggle('pulsing', !paused);
});

speedBtns.forEach(btn => btn.addEventListener('click', () => {
  speed = parseFloat(btn.dataset.speed);
  speedBtns.forEach(b => b.classList.toggle('active', b === btn));
  sfx.playWhoosh();
}));

resetBtn.addEventListener('click', resetAll);

presetChips.forEach(chip => chip.addEventListener('click', () => {
  if (isRunning) return;
  activeScenarioKey = chip.dataset.scenario;
  promptInput.value = SCENARIOS[activeScenarioKey].prompt;
  presetChips.forEach(c => c.classList.toggle('active', c === chip));
  sfx.playWhoosh();
}));

function setChipsEnabled(enabled) {
  presetChips.forEach(c => (c.disabled = !enabled));
}

function resetAll() {
  runToken++;               // 진행 중인 타임라인 루프를 다음 tick에서 즉시 중단
  isRunning = false;
  paused = false;
  pauseBtn.textContent = '⏸ 일시정지';
  pauseBtn.disabled = true;
  startBtn.disabled = false;
  setChipsEnabled(true);

  updateStep(1);
  document.querySelectorAll('.sub-node').forEach(n => (n.className = 'node sub-node'));
  document.getElementById('nodeOrchestrator').className = 'node orchestrator';
  for (let i = 1; i <= 3; i++) document.getElementById(`laser${i}`).classList.remove('active');
  Object.keys(nodeStatusEls).forEach(k => setNodeStatus(k, INITIAL.nodeStatus[k]));

  terminalLogs.innerHTML = INITIAL.logs;
  planDocument.innerHTML = INITIAL.plan;
  liveAppContainer.innerHTML = INITIAL.finalApp;
  testOverlay.innerHTML = INITIAL.overlay;
  testConsole.innerHTML = INITIAL.console;
  browserUrl.textContent = INITIAL.browserUrl;
  browserTestBadge.textContent = '대기 중';
  browserTestBadge.style.background = '';
  testCursor.style.top = '';
  testCursor.style.left = '';

  codeEmptyState.style.display = '';
  codeWindows.forEach(w => {
    w.win.classList.add('hidden');
    w.win.classList.remove('typing');
    w.code.textContent = '';
    setCodeStatus(w, '작성 중...');
  });

  statusText.textContent = '요구사항 대기 중';
  activeAgentTag.textContent = '시스템 대기 중';
  statusDot.classList.add('pulsing');
  statusDot.style.backgroundColor = '';
  statusDot.style.boxShadow = '';
  switchTab('planView');
}

// --- Timing (1x 기준, ms) — 촬영 리허설 후 여기서만 조정 ---
const T = {
  promptIn: 1000, planStart: 1400, planSection: 3400, planDone: 1800,
  delegateIntro: 900, wireUp: 800, agentIntro: 1600,
  codeIntro: 1400, charTick: 45, codeChunk: 3, patchChunk: 8, segmentSize: 130, midLog: 1400,
  testIntro: 1200, testNav: 1600, testStep: 1900, failDwell: 2600,
  healOrch: 1300, healSwitch: 800, rerun: 1500,
  passLine: 900, badgeDwell: 2200, finale: 2400,
};

// 코드 타이핑: speed에 비례해 chunk 크기를 키워 tick 하한(50ms)에도 체감 속도 유지
async function typeChars(w, text, from, to, chunkBase, token) {
  w.win.classList.add('typing');
  let i = from;
  while (i < to) {
    const chunk = Math.max(1, Math.round(chunkBase * speed));
    const next = Math.min(i + chunk, to);
    const slice = text.slice(i, next);
    w.code.textContent += slice;
    w.area.scrollTop = w.area.scrollHeight;
    if (slice.includes('\n')) sfx.playBeep(800, 'square', 0.02);
    i = next;
    await wait(T.charTick, token);
  }
  w.win.classList.remove('typing');
}

// 시나리오 정적 HTML 조각 렌더러 (scenarios.js의 커밋된 콘텐츠 전용)
function renderScenarioHtml(el, trustedHtml) {
  el.innerHTML = trustedHtml;
}

async function runScenario(sc, userPrompt, token) {
  // ============================================================
  // Phase 1: 기획 및 설계 (Intent Analysis & Architecture Planning)
  // ============================================================
  updateStep(1);
  statusText.textContent = '아키텍처 기획 및 요구사항 분석 중...';
  activeAgentTag.textContent = '메인 아키텍트 에이전트';
  document.getElementById('nodeOrchestrator').className = 'node orchestrator active working';

  appendLog('orchestrator', `인간 요구사항 수신: "${userPrompt}"`);
  await wait(T.promptIn, token);
  appendLog('planner', '요구사항 분해 및 DAG 서브 태스크 아키텍처 수립 시작...');
  await wait(T.planStart, token);

  switchTab('planView');
  renderPlanHeader(sc, userPrompt);
  for (const section of sc.planSections) {
    const div = document.createElement('div');
    div.className = 'plan-section';
    const h3 = document.createElement('h3');
    h3.textContent = section.title;
    div.appendChild(h3);
    const body = document.createElement('div');
    renderScenarioHtml(body, section.html);
    div.appendChild(body);
    planDocument.appendChild(div);
    appendLog('planner', `설계 섹션 작성 완료: ${section.title}`);
    await wait(T.planSection, token);
  }
  appendLog('planner', '구현 계획서 (implementation_plan.md) 생성 완공.');
  await wait(T.planDone, token);

  // ============================================================
  // Phase 2: 서브에이전트 스웜 할당 (Sub-Agent Allocation)
  // ============================================================
  updateStep(2);
  statusText.textContent = '서브-에이전트 스웜 병렬 배치...';
  activeAgentTag.textContent = '멀티 에이전트 스웜 가동';

  appendLog('orchestrator', '전문 서브에이전트 3인 발동: UI/UX, 개발 로직, QA 테스트');
  await wait(T.delegateIntro, token);
  for (let i = 1; i <= 3; i++) document.getElementById(`laser${i}`).classList.add('active');
  sfx.playWhoosh();
  await wait(T.wireUp, token);

  document.getElementById('nodeUI').classList.add('working');
  setNodeStatus('ui', '🎨 UI 디자인 작업 중');
  document.getElementById('nodeLogic').classList.add('working');
  setNodeStatus('dev', '⚡ 비즈니스 로직 연산 중');
  document.getElementById('nodeQA').classList.add('working');
  setNodeStatus('qa', '🛡️ 테스트 시나리오 대기');

  for (const d of sc.delegationLogs) {
    appendLog(d.agent, d.text);
    await wait(T.agentIntro, token);
  }

  // ============================================================
  // Phase 3: 실시간 코드 생성 스트림 (듀얼 창 병렬 타이핑)
  // ============================================================
  updateStep(3);
  statusText.textContent = '실시간 코드 합성 중...';
  activeAgentTag.textContent = '코드 스트리밍 Engine';
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
    setCodeStatus(w, '작성 중...');
    appendLog(f.agent, `${f.filename} 모듈 코드 실시간 스트리밍 시작...`);
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
      await typeChars(codeWindows[i], files[i].code, pos[i], to, T.codeChunk, token);
      pos[i] = to;
      if (pos[i] >= files[i].code.length) {
        setCodeStatus(codeWindows[i], '✔ 작성 완료', 'done');
        appendLog(files[i].agent, `${files[i].filename} 작성 완공 ✔`);
      }
    }
    if (!midLogged && pos.every((p, i) => p >= files[i].code.length / 2)) {
      midLogged = true;
      appendLog('orchestrator', '코드 합성 진행률 50% — 컴포넌트 조립 상태 점검 완료.');
      await wait(T.midLog, token);
    }
  }
  await wait(T.midLog, token);

  // ============================================================
  // Phase 4: 자율 브라우저 테스트 & Self-Healing (클라이맥스!)
  // ============================================================
  updateStep(4);
  statusText.textContent = '자율 E2E 브라우저 테스트 수행 중...';
  activeAgentTag.textContent = '브라우저 자율 테스트';
  switchTab('testBrowserView');
  browserUrl.textContent = sc.test.url;

  appendLog('qa', '가상 헤드리스 브라우저를 가동하여 사용자 시나리오 테스트 개시...');
  setNodeStatus('qa', '🛡️ E2E 테스트 실행 중');
  browserTestBadge.textContent = '테스트 진행 중';
  browserTestBadge.style.background = 'var(--accent-orange)';
  await wait(T.testIntro, token);

  testConsole.innerHTML = '';
  addConsoleLine(`> 가상 브라우저 세션 접속: ${sc.test.url}`);
  renderScenarioHtml(testOverlay, sc.test.mockHtml);
  await wait(T.testNav, token);

  for (const step of sc.test.steps) {
    addConsoleLine(step.console);
    testCursor.style.top = step.cursor.top;
    testCursor.style.left = step.cursor.left;
    await wait(T.testStep, token);
  }

  // --- 극적인 버그 발견! (에러 사운드, 카드 셰이크, 붉은 경고) ---
  const fail = sc.test.failure;
  sfx.playError();
  previewCard.classList.add('card-shake');
  setTimeout(() => previewCard.classList.remove('card-shake'), 500);

  addConsoleLine(fail.consoleLine, 'fail');
  appendLog('qa', fail.qaLog, 'error');
  browserTestBadge.textContent = '오류 감지';
  browserTestBadge.style.background = 'var(--accent-red)';
  setNodeStatus('qa', '❌ 오류 발견 (치명적)', '#ef4444');
  await wait(T.failDwell, token);

  // --- Self-Healing 루프 발동: 패치 코드 실시간 재작성 ---
  appendLog('orchestrator', fail.orchestratorLog, 'healing');
  setNodeStatus('dev', '🔧 코드 자율 수정 중');
  await wait(T.healOrch, token);

  switchTab('codeStreamView');
  appendLog('dev', fail.devFixLog);
  const devIndex = files.findIndex(f => f.agent === 'dev');
  const devWindow = codeWindows[devIndex >= 0 ? devIndex : 1];
  setCodeStatus(devWindow, '🩹 Self-Healing 패치 중', 'healing');
  devWindow.code.textContent = '';
  await typeChars(devWindow, fail.patchedCode, 0, fail.patchedCode.length, T.patchChunk, token);
  setCodeStatus(devWindow, '✔ 패치 적용 완료', 'done');
  await wait(T.healSwitch, token);

  // --- 재검증 & 그린 패스 ---
  switchTab('testBrowserView');
  addConsoleLine('🔄 Self-Healing 자율 패치 완료. E2E 테스트 재검증 실행...', 'healing');
  appendLog('qa', '재검증 테스트 구동... 모든 입력 테스트 정상 동작 확인!');
  setNodeStatus('dev', '⚡ 패치 완료·대기');
  await wait(T.rerun, token);

  for (const line of sc.test.passLines) {
    addConsoleLine(line, 'pass');
    await wait(T.passLine, token);
  }
  browserTestBadge.textContent = '100% 검증 통과';
  browserTestBadge.style.background = 'var(--accent-green)';
  setNodeStatus('qa', '✅ 자율 통과 완료', '#34d399');

  const passNote = document.createElement('div');
  passNote.style.cssText = 'margin-top: 14px; color: #34d399; font-weight: 800; font-size: 14px; background: rgba(16,185,129,0.15); padding: 8px; border-radius: 6px;';
  passNote.textContent = '✨ Self-Healing 포함 E2E 브라우저 테스트 100% 성공!';
  testOverlay.appendChild(passNote);
  await wait(T.badgeDwell, token);

  // ============================================================
  // Phase 5: 최종 앱 완성 및 전달 (Final App Delivery)
  // ============================================================
  updateStep(5);
  statusText.textContent = '에이전틱 수명주기 완료';
  activeAgentTag.textContent = '개발 및 검증 완료';
  statusDot.style.backgroundColor = 'var(--accent-green)';
  statusDot.style.boxShadow = '0 0 16px var(--accent-green)';

  appendLog('orchestrator', '🎉 모든 테스트 100% 자율 통과! 결과 보고서(walkthrough.md) 생성 및 실시간 앱 미리보기 구동', 'success');
  sfx.playSuccess();
  switchTab('appPreviewView');
  renderScenarioHtml(liveAppContainer, sc.finalAppHtml);
  await wait(T.finale, token);
  markAllStepsCompleted();
}

// --- Start ---
startBtn.addEventListener('click', async () => {
  if (isRunning) return;
  resetAll();
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  setChipsEnabled(false);
  sfx.init();

  const token = ++runToken;
  const sc = SCENARIOS[activeScenarioKey];
  const userPrompt = promptInput.value.trim() || sc.prompt;
  terminalLogs.innerHTML = '';

  try {
    await runScenario(sc, userPrompt, token);
  } catch (err) {
    if (err !== ABORTED) console.error(err);
    return; // ABORTED: resetAll()이 이미 UI를 복원한 상태
  }
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = '⏸ 일시정지';
  paused = false;
  setChipsEnabled(true);
});
