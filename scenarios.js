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
};
