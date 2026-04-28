/* ─── State ─────────────────────────────────────────────────────────────── */

let selectedGoal = null;
let selectedMascot = 'milo';

/* ─── Screen switching ──────────────────────────────────────────────────── */

function showScreen(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/* ─── Day rollover ───────────────────────────────────────────────────────── */

function averageMacroPercent(macros, targets) {
  const keys = ['calories', 'protein', 'fiber', 'carbs', 'fats'];
  const percents = keys.map(k => Math.min(macros[k] / targets[k], 1));
  return (percents.reduce((a, b) => a + b, 0) / keys.length) * 100;
}

function handleDayRollover() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  if (stored.date && stored.date !== today) {
    if (stored.final_analysis) {
      const profile = getProfile();
      const history = JSON.parse(localStorage.getItem('macroday_history') || '{}');
      history[stored.date] = {
        goals_hit: averageMacroPercent(stored.final_analysis.macros, profile.targets) >= 90,
        macros: stored.final_analysis.macros,
        targets: profile.targets
      };
      localStorage.setItem('macroday_history', JSON.stringify(history));
    }
    localStorage.setItem('macroday_today', JSON.stringify({ date: today, morning_logged: false }));
  }
}

/* ─── Time-aware routing ─────────────────────────────────────────────────── */

function routeOnLoad() {
  const profile = getProfile();
  if (!profile) {
    showScreen('screen-profile');
    return;
  }

  handleDayRollover();

  const hour = new Date().getHours();
  const today = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  const isToday = today.date === new Date().toDateString();

  if (hour >= 5 && hour < 12) {
    showScreen(isToday && today.morning_logged ? 'screen-midday' : 'screen-morning');
  } else if (hour >= 12 && hour < 18) {
    showScreen(isToday && today.morning_logged ? 'screen-midday' : 'screen-afternoon');
  } else if (hour >= 18 && hour < 24) {
    showScreen('screen-night');
    initNightScreen();
  } else {
    showScreen('screen-sleep');
  }
}

/* ─── Profile screen ─────────────────────────────────────────────────────── */

function selectGoal(btn) {
  document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedGoal = btn.dataset.goal;
}

function selectMascot(btn) {
  document.querySelectorAll('.mascot-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMascot = btn.dataset.mascot;
}

function saveProfile() {
  const calories = document.getElementById('target-calories').value;
  const protein  = document.getElementById('target-protein').value;
  const fiber    = document.getElementById('target-fiber').value;
  const carbs    = document.getElementById('target-carbs').value;
  const fats     = document.getElementById('target-fats').value;

  if (!selectedGoal) {
    alert('Please select a fitness goal.');
    return;
  }
  if (!calories || !protein || !fiber || !carbs || !fats) {
    alert('Please fill in all five macro targets.');
    return;
  }

  const profile = {
    goal: selectedGoal,
    targets: {
      calories: parseInt(calories),
      protein:  parseInt(protein),
      fiber:    parseInt(fiber),
      carbs:    parseInt(carbs),
      fats:     parseInt(fats)
    },
    mascot: selectedMascot
  };

  localStorage.setItem('macroday_profile', JSON.stringify(profile));

  const msg = document.getElementById('profile-confirmation');
  msg.classList.remove('hidden');
  setTimeout(() => {
    msg.classList.add('hidden');
    routeOnLoad();
  }, 1500);
}

function getProfile() {
  return JSON.parse(localStorage.getItem('macroday_profile') || 'null');
}

/* ─── Populate profile form with saved values on load ───────────────────── */

function loadProfileForm() {
  const profile = getProfile();
  if (!profile) return;

  document.getElementById('target-calories').value = profile.targets.calories;
  document.getElementById('target-protein').value  = profile.targets.protein;
  document.getElementById('target-fiber').value    = profile.targets.fiber;
  document.getElementById('target-carbs').value    = profile.targets.carbs;
  document.getElementById('target-fats').value     = profile.targets.fats;

  selectedGoal = profile.goal;
  document.querySelectorAll('.goal-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.goal === profile.goal);
  });

  selectedMascot = profile.mascot;
  document.querySelectorAll('.mascot-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mascot === profile.mascot);
  });
}

/* ─── Morning check-in ───────────────────────────────────────────────────── */

function updateAnalyzeBtn() {
  const hasContent = ['meal-breakfast', 'meal-lunch', 'meal-dinner']
    .some(id => document.getElementById(id).value.trim().length > 0);
  document.getElementById('analyze-btn').disabled = !hasContent;
}

function startVoice(textareaId, btnId, listeningElId = 'voice-listening') {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Voice input requires Chrome or Edge.');
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  const listeningEl = document.getElementById(listeningElId);
  const btn = document.getElementById(btnId);

  recognition.onstart = () => {
    if (listeningEl) listeningEl.classList.remove('hidden');
    if (btn) btn.classList.add('listening');
  };
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const textarea = document.getElementById(textareaId);
    textarea.value += (textarea.value ? ' ' : '') + transcript;
    textarea.dispatchEvent(new Event('input'));
  };
  recognition.onend = () => {
    if (listeningEl) listeningEl.classList.add('hidden');
    if (btn) btn.classList.remove('listening');
  };
  recognition.onerror = () => {
    if (listeningEl) listeningEl.classList.add('hidden');
    if (btn) btn.classList.remove('listening');
  };

  recognition.start();
}

async function submitMorning() {
  const breakfast = document.getElementById('meal-breakfast').value.trim();
  const lunch     = document.getElementById('meal-lunch').value.trim();
  const dinner    = document.getElementById('meal-dinner').value.trim();
  const profile   = getProfile();
  const meals     = { breakfast, lunch, dinner, snacks: [] };

  const analyzeBtn = document.getElementById('analyze-btn');
  const loadingEl  = document.getElementById('morning-loading');
  const clarifEl   = document.getElementById('morning-clarification');

  analyzeBtn.disabled = true;
  loadingEl.classList.remove('hidden');
  if (clarifEl) clarifEl.classList.add('hidden');

  try {
    const result = await callAnalyze({ meals, targets: profile.targets, mode: 'morning', mascot: profile.mascot });
    loadingEl.classList.add('hidden');

    if (result.needs_clarification) {
      analyzeBtn.disabled = false;
      if (clarifEl) {
        clarifEl.textContent = result.clarification_message;
        clarifEl.classList.remove('hidden');
      }
      return;
    }

    showScreen('screen-morning-result');
    renderMorningResults(result, meals, profile);
  } catch (err) {
    loadingEl.classList.add('hidden');
    analyzeBtn.disabled = false;
    alert('Analysis failed — check your connection and try again.');
  }
}

/* ─── Night check-in ─────────────────────────────────────────────────────── */

let nightState = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initNightScreen() {
  const today = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  const profile = getProfile();

  nightState = {
    phase: 'ticking',
    path: 'a',
    morningLogged: !!(today.morning_logged),
    meals: today.meals || {},
    mealKeys: [],
    ticked: {},
    resolved: {},
    hasInteracted: false
  };

  const noLogEl  = document.getElementById('night-no-log');
  const mainEl   = document.getElementById('night-main');

  if (!nightState.morningLogged) {
    noLogEl.classList.remove('hidden');
    mainEl.classList.add('hidden');
    const mascotImg = document.getElementById('night-no-log-mascot-img');
    const mascotMsg = document.getElementById('night-no-log-mascot-msg');
    if (mascotImg) mascotImg.src = profile.mascot === 'vilo' ? '/assets/Vilo_Evil.png' : '/assets/Milo_Good.png';
    if (mascotMsg) mascotMsg.textContent = profile.mascot === 'vilo'
      ? "You didn't plan today. Sloppy. Log what you actually ate so we can assess the damage."
      : "It's okay! Every day is a chance to learn. Log what you ate and see how you did.";
    ['night-nolog-breakfast', 'night-nolog-lunch', 'night-nolog-dinner'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateNightNoLogBtn();
  } else {
    noLogEl.classList.add('hidden');
    mainEl.classList.remove('hidden');
    const meals = nightState.meals;
    if (meals.breakfast) nightState.mealKeys.push({ key: 'breakfast', label: 'Breakfast', value: meals.breakfast });
    if (meals.lunch)     nightState.mealKeys.push({ key: 'lunch',     label: 'Lunch',     value: meals.lunch });
    if (meals.dinner)    nightState.mealKeys.push({ key: 'dinner',    label: 'Dinner',    value: meals.dinner });
    if (Array.isArray(meals.snacks)) {
      meals.snacks.forEach((s, i) => nightState.mealKeys.push({ key: `snack_${i}`, label: 'Snack', value: s }));
    }
    nightState.mealKeys.forEach(m => { nightState.ticked[m.key] = false; });
    selectNightPath('a');
    renderNightTickList();
    const submitA = document.getElementById('night-submit-a');
    const seeRes  = document.getElementById('night-see-results');
    if (submitA) { submitA.disabled = true; submitA.classList.remove('hidden'); }
    if (seeRes)  seeRes.classList.add('hidden');
    ['night-b-breakfast', 'night-b-lunch', 'night-b-dinner'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

function selectNightPath(path) {
  nightState.path = path;
  document.getElementById('path-a-btn').classList.toggle('active', path === 'a');
  document.getElementById('path-b-btn').classList.toggle('active', path === 'b');
  document.getElementById('night-path-a').classList.toggle('hidden', path !== 'a');
  document.getElementById('night-path-b').classList.toggle('hidden', path === 'a');
}

function renderNightTickList() {
  const container = document.getElementById('night-tick-list');
  if (!container) return;
  if (nightState.mealKeys.length === 0) {
    container.innerHTML = '<p class="path-hint" style="color:#999">No meals logged from this morning.</p>';
    return;
  }
  container.innerHTML = nightState.mealKeys.map(m => `
    <div class="tick-item" id="tick-item-${m.key}">
      <label class="tick-label">
        <input type="checkbox" class="tick-checkbox" id="tick-${m.key}" onchange="onTickChange('${m.key}')">
        <span class="tick-meal-label">${m.label}</span>
        <span class="tick-meal-value">"${escapeHtml(m.value)}"</span>
      </label>
      <div class="tick-expansion hidden" id="expansion-${m.key}">
        <div class="expansion-field" id="expansion-field-${m.key}">
          <div class="meal-label-row" style="margin-bottom:0.4rem">
            <label class="form-label" style="margin-bottom:0">What did you actually eat?</label>
            <button class="mic-btn" id="expansion-mic-${m.key}"
              onclick="startVoice('expansion-text-${m.key}','expansion-mic-${m.key}','night-voice-indicator')">🎤</button>
          </div>
          <textarea id="expansion-text-${m.key}" class="meal-textarea" rows="2"
            placeholder="e.g. grilled chicken 150g…"></textarea>
          <button class="btn-resolve" onclick="resolveItemAte('${m.key}')">Confirm what I ate</button>
        </div>
        <button class="btn-skip-meal" id="expansion-skip-${m.key}" onclick="resolveItemSkipped('${m.key}')">I skipped this meal</button>
        <div class="skip-mascot-card hidden" id="skip-card-${m.key}">
          <img class="mascot-card-img" id="skip-mascot-img-${m.key}" alt="mascot" style="min-width:52px">
          <div class="skip-mascot-body">
            <p class="mascot-card-msg" id="skip-mascot-msg-${m.key}"></p>
            <button class="btn-secondary" onclick="dismissSkipCard('${m.key}')">Got it</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function onTickChange(key) {
  nightState.hasInteracted = true;
  nightState.ticked[key] = document.getElementById(`tick-${key}`).checked;
  const submitA = document.getElementById('night-submit-a');
  if (submitA) submitA.disabled = false;
}

function submitPathA() {
  nightState.phase = 'resolving';
  const submitA = document.getElementById('night-submit-a');
  if (submitA) submitA.classList.add('hidden');

  const unticked = nightState.mealKeys.filter(m => !nightState.ticked[m.key]);

  if (unticked.length === 0) {
    nightState.mealKeys.forEach(m => { nightState.resolved[m.key] = m.value; });
    const seeRes = document.getElementById('night-see-results');
    if (seeRes) { seeRes.classList.remove('hidden'); seeRes.disabled = false; }
    return;
  }

  nightState.mealKeys.filter(m => nightState.ticked[m.key]).forEach(m => {
    nightState.resolved[m.key] = m.value;
  });

  unticked.forEach(m => {
    const expansion = document.getElementById(`expansion-${m.key}`);
    if (expansion) expansion.classList.remove('hidden');
  });

  const seeRes = document.getElementById('night-see-results');
  if (seeRes) { seeRes.classList.remove('hidden'); seeRes.disabled = true; }
}

function resolveItemAte(key) {
  const text = document.getElementById(`expansion-text-${key}`).value.trim();
  if (!text) {
    alert('Please enter what you ate, or click "I skipped this meal".');
    return;
  }
  nightState.resolved[key] = text;
  markTickItemResolved(key, text);
  checkAllNightResolved();
}

function resolveItemSkipped(key) {
  const profile = getProfile();
  const mascotSrc = profile.mascot === 'vilo' ? '/assets/Vilo_Evil.png' : '/assets/Milo_Good.png';
  const msg = profile.mascot === 'vilo'
    ? "Skipped. Bold strategy. Painfully wrong, but bold."
    : "Sounds like a busy day! Have a glass of water or a refreshing juice.";

  const field   = document.getElementById(`expansion-field-${key}`);
  const skipBtn = document.getElementById(`expansion-skip-${key}`);
  if (field)   field.style.display   = 'none';
  if (skipBtn) skipBtn.style.display = 'none';

  // Show card before setting src — Chrome won't load images set on hidden elements
  document.getElementById(`skip-card-${key}`).classList.remove('hidden');
  document.getElementById(`skip-mascot-img-${key}`).src = mascotSrc;
  document.getElementById(`skip-mascot-msg-${key}`).textContent = msg;
}

function dismissSkipCard(key) {
  nightState.resolved[key] = 'skipped';
  markTickItemResolved(key, '(skipped)');
  checkAllNightResolved();
}

function markTickItemResolved(key, displayText) {
  const expansion = document.getElementById(`expansion-${key}`);
  if (expansion) expansion.classList.add('hidden');
  const tickItem = document.getElementById(`tick-item-${key}`);
  if (tickItem) {
    tickItem.classList.add('resolved');
    const badge = document.createElement('div');
    badge.className = 'resolved-badge';
    badge.textContent = displayText === '(skipped)' ? '✓ Skipped' : `✓ ${displayText}`;
    tickItem.appendChild(badge);
  }
}

function checkAllNightResolved() {
  const allResolved = nightState.mealKeys.every(m => nightState.resolved[m.key] !== undefined);
  if (allResolved) {
    const seeRes = document.getElementById('night-see-results');
    if (seeRes) seeRes.disabled = false;
  }
}

function updateNightNoLogBtn() {
  const hasContent = ['night-nolog-breakfast', 'night-nolog-lunch', 'night-nolog-dinner']
    .some(id => { const el = document.getElementById(id); return el && el.value.trim().length > 0; });
  const btn = document.getElementById('night-nolog-submit');
  if (btn) btn.disabled = !hasContent;
}

async function submitNightNoLog() {
  const profile   = getProfile();
  const breakfast = document.getElementById('night-nolog-breakfast').value.trim();
  const lunch     = document.getElementById('night-nolog-lunch').value.trim();
  const dinner    = document.getElementById('night-nolog-dinner').value.trim();
  const meals     = { breakfast, lunch, dinner, snacks: [] };

  const loadingEl = document.getElementById('night-nolog-loading');
  const submitBtn = document.getElementById('night-nolog-submit');
  submitBtn.disabled = true;
  loadingEl.classList.remove('hidden');

  try {
    const result = await callAnalyze({ meals, targets: profile.targets, mode: 'night', mascot: profile.mascot });
    loadingEl.classList.add('hidden');
    saveNightResult(meals, result);
    showScreen('screen-summary');
    if (typeof renderSummary === 'function') renderSummary(result, profile);
  } catch (err) {
    loadingEl.classList.add('hidden');
    submitBtn.disabled = false;
    alert('Analysis failed — check your connection and try again.');
  }
}

async function submitNight(path) {
  const profile = getProfile();
  let meals, loadingEl, submitBtn;

  if (path === 'b') {
    const breakfast = document.getElementById('night-b-breakfast').value.trim();
    const lunch     = document.getElementById('night-b-lunch').value.trim();
    const dinner    = document.getElementById('night-b-dinner').value.trim();
    meals     = { breakfast, lunch, dinner, snacks: [] };
    loadingEl = document.getElementById('night-loading-b');
    submitBtn = document.getElementById('night-b-submit');
  } else {
    meals = { breakfast: '', lunch: '', dinner: '', snacks: [] };
    nightState.mealKeys.forEach(m => {
      const val = nightState.resolved[m.key] === 'skipped' ? '' : (nightState.resolved[m.key] || m.value);
      if (m.key === 'breakfast')          meals.breakfast = val;
      else if (m.key === 'lunch')         meals.lunch     = val;
      else if (m.key === 'dinner')        meals.dinner    = val;
      else if (m.key.startsWith('snack_')) meals.snacks.push(val);
    });
    loadingEl = document.getElementById('night-loading-a');
    submitBtn = document.getElementById('night-see-results');
  }

  if (submitBtn) submitBtn.disabled = true;
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const result = await callAnalyze({ meals, targets: profile.targets, mode: 'night', mascot: profile.mascot });
    if (loadingEl) loadingEl.classList.add('hidden');
    saveNightResult(meals, result);
    showScreen('screen-summary');
    if (typeof renderSummary === 'function') renderSummary(result, profile);
  } catch (err) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    alert('Analysis failed — check your connection and try again.');
  }
}

function saveNightResult(meals, result) {
  const todayData = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  todayData.night_logged   = true;
  todayData.actual_meals   = meals;
  todayData.final_analysis = result;
  localStorage.setItem('macroday_today', JSON.stringify(todayData));
}

/* ─── Init ───────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  loadProfileForm();
  routeOnLoad();
});
