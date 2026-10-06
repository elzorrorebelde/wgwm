/**
 * WGWM – Punto de entrada y ruteo.
 *
 * GPLv3 – ver LICENSE.
 */

import PROGRAMS from "../data/programs.js";
import {
  loadState,
  defaultState,
  saveState,
  isLiftAvailable,
  availableLifts,
} from "./state.js";
import {
  renderExerciseSelect,
  renderProgramChip,
  renderSets,
  renderPlatesSummary,
  renderProgramOptions,
  renderPlateChips,
  renderExerciseMins,
  setSafeHTML,
} from "./views.js";

// ── state ──────────────────────────────────────────────────────────────

const state = loadState();

// currentExercise is runtime (persisted separately via a simple key)
const EXERCISE_KEY = "wgwm-exercise";
state.currentExercise = localStorage.getItem(EXERCISE_KEY) || "squat";
// Ensure it's available in the current program
if (!isLiftAvailable(state, state.currentExercise)) {
  const avail = availableLifts(state);
  state.currentExercise = avail[0] || "squat";
}

// ── DOM refs ───────────────────────────────────────────────────────────

const $viewCalc = document.getElementById("view-calc");
const $viewOptions = document.getElementById("view-options");

// Calc
const $exerciseSelect = document.getElementById("exercise-select");
const $weightInput = document.getElementById("weight-input");
const $programName = document.getElementById("current-program-name");
const $results = document.getElementById("results");
const $setsTbody = document.getElementById("sets-tbody");
const $platesSummary = document.getElementById("plates-summary");
const $emptyState = document.getElementById("empty-state");

// Options
const $programSelect = document.getElementById("program-select");
const $barInput = document.getElementById("bar-input");
const $platesChips = document.getElementById("plates-chips");
const $newPlateInput = document.getElementById("new-plate-input");
const $addPlateBtn = document.getElementById("add-plate-btn");
const $exerciseMins = document.getElementById("exercise-mins");
const $resetBtn = document.getElementById("reset-btn");

const MAX_WEIGHT = 2000; // lb; evita cálculos absurdos

// ── persistencia ───────────────────────────────────────────────────────

function persist() {
  saveState(state);
  localStorage.setItem(EXERCISE_KEY, state.currentExercise);
}

// ── calculadora ────────────────────────────────────────────────────────

function updateCalc() {
  // Exercise selector
  setSafeHTML($exerciseSelect, renderExerciseSelect(state));

  // Last weight
  const lastW = state.lastWeights[state.currentExercise];
  $weightInput.value = lastW !== null ? lastW : "";

  // Program chip
  $programName.textContent = renderProgramChip(state);

  // Results
  recalc();
}

function recalc() {
  const raw = $weightInput.value.trim();
  const w = raw === "" ? NaN : Number(raw);

  if (isNaN(w) || w <= 0 || w > MAX_WEIGHT) {
    $results.hidden = true;
    $emptyState.hidden = false;
    // Still save null
    if (raw === "" || isNaN(w)) {
      state.lastWeights[state.currentExercise] = null;
      persist();
    }
    return;
  }

  state.lastWeights[state.currentExercise] = w;
  persist();

  const { rows, html } = renderSets(state, w);
  if (!html) {
    $results.hidden = true;
    $emptyState.hidden = false;
    return;
  }

  setSafeHTML($setsTbody, html);
  setSafeHTML($platesSummary, renderPlatesSummary(rows));
  $results.hidden = false;
  $emptyState.hidden = true;
}

// ── opciones ───────────────────────────────────────────────────────────

function updateOptions() {
  // Program
  setSafeHTML($programSelect, renderProgramOptions(PROGRAMS, state));

  // Bar
  $barInput.value = state.barWeight;

  // Plates
  setSafeHTML($platesChips, renderPlateChips(state));

  // Exercise mins
  setSafeHTML($exerciseMins, renderExerciseMins(state));
}

function saveOptionsFromDOM() {
  // Program
  const newProg = $programSelect.value;
  const programChanged = newProg !== state.currentProgram;
  state.currentProgram = newProg;

  // Bar
  const barVal = Number($barInput.value);
  if (isFinite(barVal) && barVal > 0) state.barWeight = barVal;

  // Exercise mins
  $exerciseMins.querySelectorAll(".exercise-min-input").forEach((inp) => {
    const lift = inp.dataset.lift;
    const val = Number(inp.value);
    if (lift && isFinite(val) && val > 0) {
      state.exerciseMins[lift] = val;
    }
  });

  // Si cambió el programa, verificar que el ejercicio actual siga disponible
  if (programChanged) {
    if (!isLiftAvailable(state, state.currentExercise)) {
      const avail = availableLifts(state);
      state.currentExercise = avail[0] || "squat";
    }
  }

  persist();
  updateCalc();
}

// ── ruteo ──────────────────────────────────────────────────────────────

function showCalc() {
  $viewCalc.hidden = false;
  $viewOptions.hidden = true;
  updateCalc();
}

function showOptions() {
  $viewCalc.hidden = true;
  $viewOptions.hidden = false;
  updateOptions();
}

function route() {
  const hash = location.hash || "#/";
  if (hash === "#/opciones") {
    showOptions();
  } else {
    showCalc();
  }
}

window.addEventListener("hashchange", route);

// ── eventos: calculadora ───────────────────────────────────────────────

$exerciseSelect.addEventListener("change", () => {
  state.currentExercise = $exerciseSelect.value;
  persist();
  updateCalc();
});

$weightInput.addEventListener("input", recalc);

// ── eventos: opciones ──────────────────────────────────────────────────

$programSelect.addEventListener("change", () => {
  saveOptionsFromDOM();
  updateOptions(); // re-render exercise mins for new program
});

$barInput.addEventListener("change", () => {
  saveOptionsFromDOM();
});

// Plates: toggle
$platesChips.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const plate = Number(btn.dataset.plate);

  if (action === "toggle-plate") {
    // Toggle on/off
    const idx = state.enabledPlates.indexOf(plate);
    if (idx >= 0) {
      state.enabledPlates.splice(idx, 1);
    } else {
      state.enabledPlates.push(plate);
      state.enabledPlates.sort((a, b) => b - a);
    }
  } else if (action === "remove-plate") {
    // Quitar por completo (de activos y de la lista de discos)
    state.enabledPlates = state.enabledPlates.filter((p) => p !== plate);
    state.knownPlates = state.knownPlates.filter((p) => p !== plate);
  }

  persist();
  setSafeHTML($platesChips, renderPlateChips(state));
});

// Add plate
$addPlateBtn.addEventListener("click", () => {
  const val = Number($newPlateInput.value);
  if (!isFinite(val) || val <= 0) return;
  if (!state.knownPlates.includes(val)) state.knownPlates.push(val);
  if (!state.enabledPlates.includes(val)) state.enabledPlates.push(val);
  state.enabledPlates.sort((a, b) => b - a);
  persist();
  $newPlateInput.value = "";
  setSafeHTML($platesChips, renderPlateChips(state));
});

// Add plate on Enter
$newPlateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $addPlateBtn.click();
});

// Exercise mins
$exerciseMins.addEventListener("change", (e) => {
  if (e.target.classList.contains("exercise-min-input")) {
    saveOptionsFromDOM();
  }
});

// Reset
$resetBtn.addEventListener("click", () => {
  if (!confirm("¿Restablecer todas las opciones a sus valores por defecto?")) return;

  const currentExercise = "squat";
  Object.assign(state, defaultState(), { currentExercise });

  persist();
  updateOptions();
  // If we're on options page, stay; otherwise navigate back from calc perspective
  if ($viewOptions.hidden) {
    updateCalc();
  }
});

// ── arranque ───────────────────────────────────────────────────────────

route();