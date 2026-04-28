/* ─── API call ─────────────────────────────────────────────────────────────── */

async function callAnalyze(payload) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

/* ─── Rings ────────────────────────────────────────────────────────────────── */

const MACRO_UNITS = { calories: 'kcal', protein: 'g', fiber: 'g', carbs: 'g', fats: 'g' };

function renderRings(macros, targets, prefix = '') {
  ['calories', 'protein', 'fiber', 'carbs', 'fats'].forEach(key => {
    const pct = Math.min((macros[key] / targets[key]) * 100, 100);
    const fillEl = document.querySelector(`#ring-${prefix}${key} .ring-fill`);
    if (fillEl) fillEl.setAttribute('stroke-dasharray', `${pct.toFixed(1)} ${(100 - pct).toFixed(1)}`);

    const pctEl = document.getElementById(`ring-${prefix}${key}-pct`);
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;

    const remEl = document.getElementById(`ring-${prefix}${key}-rem`);
    if (remEl) {
      const remaining = Math.max(targets[key] - macros[key], 0);
      remEl.textContent = remaining <= 0 ? 'Goal hit!' : `${Math.round(remaining)}${MACRO_UNITS[key]} left`;
    }
  });
}

/* ─── Mascot card ──────────────────────────────────────────────────────────── */

function renderMascotCard(affirmation, mascot) {
  const img = document.getElementById('mascot-img');
  const msg = document.getElementById('mascot-message');
  if (img) img.src = mascot === 'vilo' ? '/assets/Vilo_Evil.png' : '/assets/Milo_Good.png';
  if (msg) msg.textContent = affirmation;
}

/* ─── Snack suggestions ────────────────────────────────────────────────────── */

function renderSnackSuggestions(suggestions) {
  const section = document.getElementById('snack-section');
  const cards = document.getElementById('snack-cards');
  if (!section || !cards) return;

  if (!suggestions || suggestions.length === 0) {
    section.classList.add('hidden');
    return;
  }

  cards.innerHTML = suggestions.map((s, i) => {
    const macroStr = Object.entries(s.macros || {})
      .map(([k, v]) => `${v}${MACRO_UNITS[k] || ''} ${k}`)
      .join(' · ');
    return `<div class="snack-card">
        <div class="snack-info">
          <span class="snack-name">${s.name}</span>
          <span class="snack-macros">${macroStr}</span>
        </div>
        <button class="btn-add-snack" onclick="addSnack(${i})">Add</button>
      </div>`;
  }).join('');

  window._currentSnacks = suggestions;
  section.classList.remove('hidden');
}

async function addSnack(index) {
  const snack = window._currentSnacks && window._currentSnacks[index];
  if (!snack) return;

  const profile = getProfile();
  if (!profile) return;

  const todayData = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  const meals = todayData.meals || {};
  if (!Array.isArray(meals.snacks)) meals.snacks = [];
  meals.snacks.push(snack.name);
  todayData.meals = meals;
  localStorage.setItem('macroday_today', JSON.stringify(todayData));

  const snackLoading = document.getElementById('snack-loading');
  const snackCards = document.getElementById('snack-cards');
  if (snackLoading) snackLoading.classList.remove('hidden');
  if (snackCards) snackCards.classList.add('hidden');

  try {
    const result = await callAnalyze({
      meals,
      targets: profile.targets,
      mode: 'morning',
      mascot: profile.mascot
    });

    if (!result.needs_clarification) {
      todayData.morning_analysis = result;
      localStorage.setItem('macroday_today', JSON.stringify(todayData));
      renderRings(result.macros, profile.targets);
      const feedbackEl = document.getElementById('morning-feedback');
      if (feedbackEl) feedbackEl.textContent = result.feedback;
      renderMascotCard(result.affirmation, profile.mascot);
      renderSnackSuggestions(result.snack_suggestions);
    }
  } catch (err) {
    console.error('Snack recalculation failed:', err);
  } finally {
    if (snackLoading) snackLoading.classList.add('hidden');
    if (snackCards) snackCards.classList.remove('hidden');
  }
}

function doneSnacks() {
  const section = document.getElementById('snack-section');
  if (section) section.classList.add('hidden');
}

/* ─── End-of-day summary ───────────────────────────────────────────────────── */

function renderSummary(result, profile) {
  renderRings(result.macros, profile.targets, 'summary-');

  const feedbackEl = document.getElementById('summary-feedback');
  if (feedbackEl) feedbackEl.textContent = result.feedback;

  const mascotImg = document.getElementById('summary-mascot-img');
  const mascotMsg = document.getElementById('summary-mascot-message');
  const src = profile.mascot === 'vilo' ? '/assets/Vilo_Evil.png' : '/assets/Milo_Good.png';
  if (mascotImg) mascotImg.src = src;
  if (mascotMsg) mascotMsg.textContent = result.affirmation;

  const avg = averageMacroPercent(result.macros, profile.targets);
  const subtitleEl = document.getElementById('summary-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = avg >= 90
      ? 'Goals hit. Here\'s your final breakdown.'
      : 'Here\'s how your day actually went.';
  }

  const snackSection = document.getElementById('summary-snack-section');
  if (snackSection) {
    if (avg < 90 && result.snack_suggestions && result.snack_suggestions.length > 0) {
      window._summarySuggestions = result.snack_suggestions;
      snackSection.classList.remove('hidden');
    } else {
      snackSection.classList.add('hidden');
    }
  }
}

function toggleSummarySnacks() {
  const cards = document.getElementById('summary-snack-cards');
  const btn   = document.getElementById('summary-snack-btn');
  if (!cards) return;

  if (cards.classList.contains('hidden') && window._summarySuggestions) {
    cards.innerHTML = window._summarySuggestions.map(s => {
      const macroStr = Object.entries(s.macros || {})
        .map(([k, v]) => `${v}${MACRO_UNITS[k] || ''} ${k}`)
        .join(' · ');
      return `<div class="snack-card">
        <div class="snack-info">
          <span class="snack-name">${s.name}</span>
          <span class="snack-macros">${macroStr}</span>
        </div>
      </div>`;
    }).join('');
    cards.classList.remove('hidden');
    if (btn) btn.textContent = 'Maybe next time';
  } else {
    cards.classList.add('hidden');
    if (btn) btn.textContent = 'Want a suggestion to close the gap tonight?';
  }
}

/* ─── Morning results ──────────────────────────────────────────────────────── */

function renderMorningResults(result, meals, profile) {
  const today = new Date().toDateString();
  const existing = JSON.parse(localStorage.getItem('macroday_today') || '{}');
  localStorage.setItem('macroday_today', JSON.stringify({
    ...existing,
    date: today,
    morning_logged: true,
    meals,
    morning_analysis: result,
  }));

  renderRings(result.macros, profile.targets);

  const feedbackEl = document.getElementById('morning-feedback');
  if (feedbackEl) feedbackEl.textContent = result.feedback;

  renderMascotCard(result.affirmation, profile.mascot);
  renderSnackSuggestions(result.snack_suggestions);
}
