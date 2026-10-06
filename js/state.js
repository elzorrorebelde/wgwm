/**
 * WGWM – Estado y persistencia.
 *
 * GPLv3 – ver LICENSE.
 */

import PROGRAMS from "../data/programs.js";

const STORAGE_KEY = "wgwm-state";
const VERSION = 1;

// ── defaults ───────────────────────────────────────────────────────────

export const LIFTS = ["squat", "bench", "deadlift", "ohp", "row"];

export const LIFT_LABELS = {
  squat: "Sentadilla",
  bench: "Press de banca",
  deadlift: "Peso muerto",
  ohp: "Press militar",
  row: "Remo con barra",
};

const DEFAULT_PLATES = [45, 35, 25, 10, 5, 2.5];

const DEFAULTS = {
  version: VERSION,
  currentProgram: "starting-strength",
  barWeight: 45,
  enabledPlates: DEFAULT_PLATES,
  knownPlates: DEFAULT_PLATES,
  exerciseMins: {
    squat: 5,
    bench: 5,
    deadlift: 5,
    ohp: 2.5,
    row: 2.5,
  },
  lastWeights: {
    squat: null,
    bench: null,
    deadlift: null,
    ohp: null,
    row: null,
  },
};

// ── validación tolerante ──────────────────────────────────────────────

function isPositiveNumber(v) {
  return typeof v === "number" && isFinite(v) && v > 0;
}

function isNumberOrNull(v) {
  return v === null || (typeof v === "number" && isFinite(v) && v > 0);
}

function isString(v) {
  return typeof v === "string";
}

function isArrayOfPositiveNumbers(arr) {
  return Array.isArray(arr) && arr.every((v) => isPositiveNumber(v));
}

function validate(state) {
  if (!state || typeof state !== "object") return null;
  if (state.version !== VERSION) return null;
  if (!isString(state.currentProgram)) return null;
  if (!PROGRAMS.some((p) => p.slug === state.currentProgram)) return null;
  if (!isPositiveNumber(state.barWeight)) return null;
  if (!isArrayOfPositiveNumbers(state.enabledPlates)) return null;
  if (state.knownPlates === undefined) state.knownPlates = [...state.enabledPlates];
  if (!isArrayOfPositiveNumbers(state.knownPlates)) return null;
  // Todo disco activo debe figurar en la lista de conocidos
  for (const p of state.enabledPlates) {
    if (!state.knownPlates.includes(p)) state.knownPlates.push(p);
  }

  // Validar exerciseMins
  if (!state.exerciseMins || typeof state.exerciseMins !== "object") return null;
  for (const lift of LIFTS) {
    if (!isPositiveNumber(state.exerciseMins[lift])) return null;
  }

  // Validar lastWeights
  if (!state.lastWeights || typeof state.lastWeights !== "object") return null;
  for (const lift of LIFTS) {
    if (!isNumberOrNull(state.lastWeights[lift])) return null;
  }

  return state;
}

// ── carga / guardado ───────────────────────────────────────────────────

/** Copia profunda del estado por defecto (nunca compartir arrays con DEFAULTS). */
export function defaultState() {
  return {
    ...DEFAULTS,
    enabledPlates: [...DEFAULTS.enabledPlates],
    knownPlates: [...DEFAULTS.knownPlates],
    exerciseMins: { ...DEFAULTS.exerciseMins },
    lastWeights: { ...DEFAULTS.lastWeights },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const valid = validate(parsed);
    if (valid) return valid;
  } catch {
    // corrupto → defaults
  }
  return defaultState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage lleno o no disponible → ignorar
  }
}

// ── helpers para la UI ─────────────────────────────────────────────────

/** Devuelve el objeto programa para el slug guardado. */
export function getCurrentProgram(state) {
  return PROGRAMS.find((p) => p.slug === state.currentProgram) || PROGRAMS[0];
}

/** Discos habilitados ordenados descendente (el estado ya los guarda así). */
export function getEnabledPlates(state) {
  return [...state.enabledPlates].sort((a, b) => b - a);
}

/** Devuelve true si el lift está definido en el programa actual. */
export function isLiftAvailable(state, lift) {
  const prog = getCurrentProgram(state);
  return prog.exercises.some((e) => e.lift === lift);
}

/** Lista de lifts disponibles en el programa actual. */
export function availableLifts(state) {
  const prog = getCurrentProgram(state);
  const lifts = new Set(prog.exercises.map((e) => e.lift));
  return LIFTS.filter((l) => lifts.has(l));
}