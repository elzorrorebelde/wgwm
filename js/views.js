/**
 * WGWM – Renderizado de vistas (DOM vanilla).
 *
 * GPLv3 – ver LICENSE.
 */

import {
  LIFTS,
  LIFT_LABELS,
  getCurrentProgram,
  getEnabledPlates,
  availableLifts,
} from "./state.js";
import {
  buildSets,
  platesNeeded,
  getWorkouts,
} from "./calc.js";

// ── escape y DOM seguro ───────────────────────────────────────────────

/** Establece HTML ya escapado de forma segura usando <template>. */
export function setSafeHTML(el, html) {
  // El contexto debe ser `el` para que <tr>/<td>/<option> se parseen bien.
  const range = document.createRange();
  range.selectNodeContents(el);
  el.replaceChildren(range.createContextualFragment(html));
}

// ── escape HTML ────────────────────────────────────────────────────────

function esc(str) {
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── render: per-side plates string ─────────────────────────────────────

function renderPerSide(perSide) {
  const entries = Object.entries(perSide).sort(([a], [b]) => Number(b) - Number(a));
  if (entries.length === 0) return '<span class="per-side-empty">—</span>';
  return entries
    .map(([denom, count]) => `<span>${count}×${esc(denom)}</span>`)
    .join("");
}

// ── render: calculator ─────────────────────────────────────────────────

export function renderExerciseSelect(state) {
  const lifts = availableLifts(state);
  const sel = lifts.map((lift) => {
    const selAttr = lift === state.currentExercise ? " selected" : "";
    return `<option value="${esc(lift)}"${selAttr}>${esc(LIFT_LABELS[lift])}</option>`;
  }).join("");

  // Ejercicios no disponibles (solo informativo, deshabilitados)
  const disabled = LIFTS
    .filter((l) => !lifts.includes(l))
    .map((l) => `<option disabled>${esc(LIFT_LABELS[l])} (no en programa)</option>`)
    .join("");

  return sel + disabled;
}

export function renderProgramChip(state) {
  const prog = getCurrentProgram(state);
  return esc(prog.title);
}

export function renderSets(state, workingWeight) {
  const prog = getCurrentProgram(state);
  const workouts = getWorkouts(prog, state.currentExercise);
  if (!workouts) return { rows: [], html: "" };

  const plates = getEnabledPlates(state);
  const rows = buildSets(workouts, workingWeight, {
    bar: state.barWeight,
    plates,
    minStep: state.exerciseMins[state.currentExercise],
  });

  const html = rows
    .map((r) => {
      const adjustedClass = r.adjusted ? " class='adjusted'" : "";
      const adjMark = r.adjusted ? " ⚠" : "";
      return `<tr>
        <td>${esc(r.sets)}×${esc(r.reps)}</td>
        <td${adjustedClass}>${esc(r.weight)} lb${adjMark}</td>
        <td class="per-side-cell">${renderPerSide(r.perSide)}</td>
      </tr>`;
    })
    .join("");

  return { rows, html };
}

export function renderPlatesSummary(rows) {
  const plates = [...new Set(rows.flatMap((r) => Object.keys(r.perSide).map(Number)))]
    .sort((a, b) => b - a);

  const needed = platesNeeded(rows, plates);

  const entries = Object.entries(needed).sort(([a], [b]) => Number(b) - Number(a));
  if (entries.length === 0) {
    return '<p class="plates-summary-empty">Solo barra — sin discos.</p>';
  }

  return entries
    .map(([denom, count]) => {
      return `<div class="plate-total">
        ${esc(denom)} lb
        <span class="plate-total-count">×${esc(count)}</span>
      </div>`;
    })
    .join("");
}

// ── render: options ────────────────────────────────────────────────────

export function renderProgramOptions(programs, state) {
  return programs
    .map((p) => {
      const sel = p.slug === state.currentProgram ? " selected" : "";
      return `<option value="${esc(p.slug)}"${sel}>${esc(p.title)}</option>`;
    })
    .join("");
}

export function renderPlateChips(state) {
  const enabled = new Set(state.enabledPlates);

  return [...state.knownPlates]
    .sort((a, b) => b - a)
    .map((p) => {
      const on = enabled.has(p);
      return `<span class="chip${on ? " on" : ""}">
        <button type="button" class="chip-toggle"
          data-plate="${esc(p)}" data-action="toggle-plate"
          aria-pressed="${on}">${esc(p)} lb</button>
        <button type="button" class="chip-remove" data-action="remove-plate"
          data-plate="${esc(p)}" aria-label="Quitar disco de ${esc(p)} lb">×</button>
      </span>`;
    })
    .join("");
}

export function renderExerciseMins(state) {
  return LIFTS
    .map((lift) => {
      return `<div class="exercise-min-row">
        <span class="field-label">${esc(LIFT_LABELS[lift])}</span>
        <label class="field field-row">
          <input type="number" class="field-input exercise-min-input"
            data-lift="${esc(lift)}" value="${esc(state.exerciseMins[lift])}"
            inputmode="decimal" step="0.5" min="0.5">
          <span class="field-suffix">lb</span>
        </label>
      </div>`;
    })
    .join("");
}