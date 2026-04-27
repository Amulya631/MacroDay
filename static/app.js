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

/* ─── Init ───────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  loadProfileForm();
  routeOnLoad();
});
