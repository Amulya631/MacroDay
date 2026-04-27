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

function renderRings(macros, targets) {
  ['calories', 'protein', 'fiber', 'carbs', 'fats'].forEach(key => {
    const pct = Math.min((macros[key] / targets[key]) * 100, 100);
    const fillEl = document.querySelector(`#ring-${key} .ring-fill`);
    if (fillEl) fillEl.setAttribute('stroke-dasharray', `${pct.toFixed(1)} ${(100 - pct).toFixed(1)}`);

    const pctEl = document.getElementById(`ring-${key}-pct`);
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;

    const remEl = document.getElementById(`ring-${key}-rem`);
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
}
