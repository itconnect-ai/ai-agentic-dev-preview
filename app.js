// Web Audio API Sound Synthesizer for Dramatic Sound FX
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

// Sound Toggle
const soundBtn = document.getElementById('soundToggleBtn');
soundBtn.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  soundBtn.classList.toggle('active', sfx.enabled);
  soundBtn.innerHTML = sfx.enabled ? '<span class="sound-icon">🔊</span> 효과음 ON' : '<span class="sound-icon">🔇</span> 효과음 OFF';
});

// Presets
const PRESETS = {
  habit: "실시간 성과 통계 차트, 습관 달성 기록, 자동 테스트 및 오류 수정이 포함된 Modern Habit Tracker 웹 애플리케이션 기획 및 개발",
  kanban: "다크모드 지원 및 자율 태스크 카드 생성 기능이 있는 AI 기반 칸반(Kanban) 보드 구축 및 검증",
  crypto: "실시간 암호화폐 시세 및 포트폴리오 트래킹 대시보드 웹 앱 제작 및 브라우저 테스트"
};

function setPreset(type) {
  if (PRESETS[type]) {
    document.getElementById('promptInput').value = PRESETS[type];
    sfx.playWhoosh();
  }
}

// UI Elements
const startBtn = document.getElementById('startAgenticBtn');
const promptInput = document.getElementById('promptInput');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const terminalLogs = document.getElementById('terminalLogs');
const activeAgentTag = document.getElementById('activeAgentTag');

// Tabs Logic
const tabs = document.querySelectorAll('.tab');
const tabPanes = document.querySelectorAll('.tab-pane');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    sfx.playWhoosh();
    tabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});

function switchTab(targetId) {
  tabs.forEach(t => {
    if (t.getAttribute('data-target') === targetId) t.classList.add('active');
    else t.classList.remove('active');
  });
  tabPanes.forEach(p => {
    if (p.id === targetId) p.classList.add('active');
    else p.classList.remove('active');
  });
}

function appendLog(agent, message, type = 'system') {
  sfx.playBeep(600, 'sine', 0.05);
  const now = new Date().toTimeString().split(' ')[0];
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.innerHTML = `<span class="timestamp">[${now}]</span> <strong>[${agent}]</strong> ${message}`;
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
    } else {
      stepEl.className = 'step';
      if (lineEl) lineEl.className = 'step-line';
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pipeline Execution
let isRunning = false;

startBtn.addEventListener('click', async () => {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  sfx.init();

  const userPrompt = promptInput.value;
  terminalLogs.innerHTML = '';
  
  // Reset Topology Nodes
  document.querySelectorAll('.node').forEach(n => n.className = 'node sub-node');
  document.getElementById('nodeOrchestrator').className = 'node orchestrator active working';
  document.getElementById('statusUI').textContent = '대기 중';
  document.getElementById('statusLogic').textContent = '대기 중';
  document.getElementById('statusQA').textContent = '대기 중';

  // -------------------------------------------------------------
  // STEP 1: 기획 및 설계 (Intent Analysis & Architecture Planning)
  // -------------------------------------------------------------
  updateStep(1);
  statusText.textContent = '아키텍처 기획 및 요구사항 분석 중...';
  activeAgentTag.textContent = '메인 아키텍트 에이전트';

  appendLog('Orchestrator', `인간 요구사항 수신: "${userPrompt}"`, 'orchestrator');
  await sleep(1000);

  appendLog('Planner', '요구사항 분해 및 DAG 서브 태스크 아키텍처 수립 시작...', 'planner');
  await sleep(1200);

  switchTab('planView');
  renderPlanDocument(userPrompt);
  appendLog('Planner', '구현 계획서 (implementation_plan.md) 생성 완공.', 'planner');
  await sleep(1500);

  // -------------------------------------------------------------
  // STEP 2: 서브에이전트 스웜 할당 (Sub-Agent Allocation & Laser Pulse)
  // -------------------------------------------------------------
  updateStep(2);
  statusText.textContent = '서브-에이전트 스웜 병렬 배치...';
  activeAgentTag.textContent = '멀티 에이전트 스웜 가동';

  appendLog('Orchestrator', '전문 서브에이전트 3인 발동: UI/UX, 개발 로직, QA 테스트', 'orchestrator');
  
  document.getElementById('laser1').classList.add('active');
  document.getElementById('laser2').classList.add('active');
  document.getElementById('laser3').classList.add('active');
  sfx.playWhoosh();

  await sleep(800);
  document.getElementById('nodeUI').classList.add('working');
  document.getElementById('statusUI').textContent = '🎨 UI 디자인 작업 중';

  document.getElementById('nodeLogic').classList.add('working');
  document.getElementById('statusLogic').textContent = '⚡ 비즈니스 로직 연산 중';

  document.getElementById('nodeQA').classList.add('working');
  document.getElementById('statusQA').textContent = '🛡️ 테스트 시나리오 대기';

  appendLog('UI 에이전트', '다크 모드 글래스모피즘 디자인 시스템 및 HTML 레이아웃 구축...', 'ui');
  await sleep(1000);
  appendLog('로직 에이전트', '습관 CRUD 연산 및 연속 달성(Streak) 알고리즘 모듈 생성...', 'dev');
  await sleep(1000);
  appendLog('QA 에이전트', 'Playwright 가상 브라우저 자율 시나리오 스크립트 대기 완료...', 'qa');
  await sleep(1200);

  // -------------------------------------------------------------
  // STEP 3: 실시간 코드 생성 스트림 (Live Code Generation Stream)
  // -------------------------------------------------------------
  updateStep(3);
  statusText.textContent = '실시간 코드 합성 중...';
  activeAgentTag.textContent = '코드 스트리밍 Engine';
  switchTab('codeStreamView');

  appendLog('로직 에이전트', 'HabitTracker.js 핵심 모듈 코드 실시간 스트리밍 중...', 'dev');
  await streamCodeTyping();
  await sleep(1200);

  // -------------------------------------------------------------
  // STEP 4: 자율 브라우저 테스트 & Self-Healing (극적 클라이맥스 파트!)
  // -------------------------------------------------------------
  updateStep(4);
  statusText.textContent = '자율 E2E 브라우저 테스트 수행 중...';
  activeAgentTag.textContent = '브라우저 자율 테스트';
  switchTab('testBrowserView');

  appendLog('QA 에이전트', '가상 헤드리스 브라우저를 가동하여 사용자 폼 및 클릭 테스트 개시...', 'qa');
  document.getElementById('browserTestBadge').textContent = '테스트 진행 중';
  document.getElementById('browserTestBadge').style.background = 'var(--accent-orange)';
  
  await runSimulatedDramaticTest();

  // -------------------------------------------------------------
  // STEP 5: 최종 앱 완성 및 전달 (Final App Delivery)
  // -------------------------------------------------------------
  updateStep(5);
  statusText.textContent = '에이전틱 수명주기 완료';
  activeAgentTag.textContent = '개발 및 검증 완료';
  statusDot.style.backgroundColor = 'var(--accent-green)';
  statusDot.style.boxShadow = '0 0 16px var(--accent-green)';

  appendLog('Orchestrator', '🎉 모든 테스트 100% 자율 통과! 결과 보고서(walkthrough.md) 생성 및 실시간 앱 미리보기 구동', 'success');
  sfx.playSuccess();
  switchTab('appPreviewView');
  renderLiveAppPreview();

  startBtn.disabled = false;
  isRunning = false;
});

// Implementation Plan Generator
function renderPlanDocument(promptText) {
  const container = document.getElementById('planDocument');
  container.innerHTML = `
    <h2>📋 아키텍처 기획서 (implementation_plan.md)</h2>
    <p><strong>요구사항 목표:</strong> ${promptText}</p>
    
    <h3>1. 컴포넌트 아키텍처 분해</h3>
    <ul>
      <li><code>index.html</code>: 글래스모피즘 모듈, 습관 입력 폼, 통계 링 차트 컴포넌트</li>
      <li><code>styles.css</code>: 다크 모드 토큰, 네온 Accent 컬러, 반응형 그리드</li>
      <li><code>HabitTracker.js</code>: LocalStorage 데이터 영속성, 연속 달성(Streak) 연산 알고리즘</li>
    </ul>

    <h3>2. 서브-에이전트 역할 분담표</h3>
    <ul>
      <li>🎨 <strong>UI/UX 전문 에이전트:</strong> 시각 레이아웃, CSS 애니메이션, 통계 카드 렌더링</li>
      <li>⚡ <strong>개발 로직 에이전트:</strong> CRUD 핸들러, 예외 처리 및 상태 관리 모듈</li>
      <li>🛡️ <strong>QA 테스트 에이전트:</strong> E2E 자동 클릭 검증 및 런타임 자율 수정 (Self-Healing)</li>
    </ul>

    <h3>3. 자율 검증 전략 (Verification Plan)</h3>
    <p>Playwright 기반 가상 브라우저 조작 ➔ 런타임 Null 에러 감지 ➔ 코드 오토 픽스 ➔ 100% 그린 검증</p>
  `;
}

// Live Code Stream Typing Animation
async function streamCodeTyping() {
  const codeEl = document.getElementById('codeContent');
  const codeText = `// ==========================================
// HabitTracker Core Logic (Generated by Dev Agent)
// ==========================================

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
    
    // 습관 목록 배열에 푸시
    this.habits.push(newHabit);
    this.save();
    return newHabit;
  }

  save() {
    localStorage.setItem('user_habits', JSON.stringify(this.habits));
  }
}`;

  codeEl.textContent = '';
  const lines = codeText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    codeEl.textContent += lines[i] + '\n';
    codeEl.scrollTop = codeEl.scrollHeight;
    sfx.playBeep(800, 'square', 0.02);
    await sleep(60);
  }
}

// Dramatic E2E Test with Error & Self Healing
async function runSimulatedDramaticTest() {
  const cursor = document.getElementById('testCursor');
  const overlay = document.getElementById('testInteractionOverlay');
  const consoleEl = document.getElementById('testConsole');
  const previewCard = document.getElementById('previewCard');

  consoleEl.innerHTML = '';
  
  function addConsoleLine(text, type='info') {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = text;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  addConsoleLine('> 가상 브라우저 세션 접속: http://localhost:3000/...', 'info');
  overlay.innerHTML = '<div style="background: #0f172a; padding: 18px; border-radius: 10px; width: 85%; margin: 0 auto; text-align: left; border: 1px solid #1e293b;"><h4 style="color:#38bdf8; margin-bottom:8px;">🔥 Habit Tracker E2E 검증 세션</h4><input type="text" value="매일 아침 30분 수영하기" style="width: 100%; padding: 8px; margin: 8px 0; background: #080d1a; color: #fff; border: 1px solid #334155; border-radius:6px;"><button style="background: #6366f1; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight:bold; cursor:pointer;">+ 새 습관 등록</button></div>';

  await sleep(1000);
  addConsoleLine('> Step 1: 자동 텍스트 입력 - "매일 아침 30분 수영하기"', 'info');
  cursor.style.top = '42%';
  cursor.style.left = '45%';
  await sleep(1200);

  addConsoleLine('> Step 2: "+ 새 습관 등록" 버튼 클릭 액션 마우스 릴리즈', 'info');
  cursor.style.top = '54%';
  cursor.style.left = '58%';
  await sleep(1000);

  // -------------------------------------------------------------
  // DRAMATIC BUG DETECTED! (카메라 쉐이크, 에러 사운드, 붉은색 경고)
  // -------------------------------------------------------------
  sfx.playError();
  previewCard.classList.add('card-shake');
  setTimeout(() => previewCard.classList.remove('card-shake'), 500);

  addConsoleLine('❌ [치명적 런타임 오류] Uncaught TypeError: Cannot read properties of null (reading "push")', 'fail');
  appendLog('QA 에이전트', '🚨 습관 추가 중 런타임 널(Null) 예외 감지! 오케스트레이터로 스택트레이스 즉시 전송', 'error');
  
  document.getElementById('browserTestBadge').textContent = '오류 감지';
  document.getElementById('browserTestBadge').style.background = 'var(--accent-red)';
  document.getElementById('statusQA').textContent = '❌ 오류 발견 (치명적)';
  document.getElementById('statusQA').style.color = '#ef4444';

  await sleep(1800);

  // -------------------------------------------------------------
  // SELF-HEALING LOOP ACTIVATED! (자율 코드 오토 픽스)
  // -------------------------------------------------------------
  appendLog('Orchestrator', '🚨 자율 수정 루프(Self-Healing Loop) 발동 ➔ 개발 에이전트에 자율 핫픽스 명령', 'healing');
  document.getElementById('statusLogic').textContent = '🔧 코드 자율 수정 중';
  
  await sleep(1200);

  switchTab('codeStreamView');
  appendLog('로직 에이전트', '🔧 HabitTracker.js Line 8 핫픽스: LocalStorage 초기화 예외 처리 코드 주입 중...', 'dev');

  const codeEl = document.getElementById('codeContent');
  codeEl.textContent = `// ==========================================
// HabitTracker Core Logic (Self-Healing Applied)
// ==========================================

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
}`;

  await sleep(1500);

  // -------------------------------------------------------------
  // RE-RUN TEST & GREEN PASS!
  // -------------------------------------------------------------
  switchTab('testBrowserView');
  addConsoleLine('🔄 Self-Healing 자율 패치 완료. E2E 테스트 재검증 실행...', 'healing');
  appendLog('QA 에이전트', '재검증 테스트 구동... 모든 입력 테스트 정상 동작 확인!', 'qa');
  await sleep(1000);

  addConsoleLine('✅ [TEST 1 PASS] 습관 데이터 배열 생성 및 널 가드 작동', 'pass');
  addConsoleLine('✅ [TEST 2 PASS] 연속 달성(Streak) 연산 100% 정상', 'pass');
  addConsoleLine('✅ [TEST 3 PASS] LocalStorage 브라우저 저장 완료', 'pass');

  document.getElementById('browserTestBadge').textContent = '100% 검증 통과';
  document.getElementById('browserTestBadge').style.background = 'var(--accent-green)';
  document.getElementById('statusQA').textContent = '✅ 자율 통과 완료';
  document.getElementById('statusQA').style.color = '#34d399';

  overlay.innerHTML += '<div style="margin-top: 14px; color: #34d399; font-weight: 800; font-size: 14px; background: rgba(16,185,129,0.15); padding: 8px; border-radius: 6px;">✨ Self-Healing 포함 E2E 브라우저 테스트 100% 성공!</div>';
  await sleep(1500);
}

// Final Live App Preview Renderer
function renderLiveAppPreview() {
  const container = document.getElementById('liveAppContainer');
  container.innerHTML = `
    <div style="background: #0b1120; padding: 22px; border-radius: 12px; height: 100%; display: flex; flex-direction: column; gap: 16px; border: 1px solid #1e293b;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
        <div>
          <h3 style="color: #f8fafc; font-size: 17px; font-weight: 800;">🔥 안티그래비티 데일리 습관 트래커</h3>
          <p style="color: #94a3b8; font-size: 12px;">AI 에이전트 부대가 전 과정 자율 구축한 서비스</p>
        </div>
        <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: 800;">목표 달성률 85%</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">
          <div style="font-size: 11px; color: #94a3b8; font-weight:600;">연속 달성 (Streak)</div>
          <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">14일 연속 ⚡</div>
        </div>
        <div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">
          <div style="font-size: 11px; color: #94a3b8; font-weight:600;">완료한 습관</div>
          <div style="font-size: 22px; font-weight: 800; color: #c084fc;">12 / 14 개</div>
        </div>
        <div style="background: #162035; padding: 12px; border-radius: 10px; border: 1px solid #1e293b;">
          <div style="font-size: 11px; color: #94a3b8; font-weight:600;">E2E 통과 지수</div>
          <div style="font-size: 22px; font-weight: 800; color: #34d399;">100% Pass 🛡️</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto;">
        <div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">
          <span style="font-size:14px; font-weight:600;">🏃‍♂️ 매일 아침 30분 러닝하기</span>
          <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;">
        </div>
        <div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">
          <span style="font-size:14px; font-weight:600;">📚 전공 서적 20페이지 읽기</span>
          <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;">
        </div>
        <div style="background: #111a2e; padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1e293b;">
          <span style="font-size:14px; font-weight:600;">🏊‍♂️ 매일 아침 30분 수영하기 (Self-Healing 통과)</span>
          <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #6366f1; cursor:pointer;">
        </div>
      </div>
    </div>
  `;
}
