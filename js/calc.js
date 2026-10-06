/**
 * WGWM – Lógica de cálculo (sin DOM).
 *
 * GPLv3 – ver LICENSE.
 */

// ── helpers de precisión ──────────────────────────────────────────────
// Trabajamos en cuartos de libra (×4) para evitar errores de coma flotante.
const SCALE = 4;

/** libras → unidades internas (cuartos) */
function u(lb) {
  return Math.floor(lb * SCALE);
}

/** unidades internas → libras */
function lb(units) {
  return Number((units / SCALE).toFixed(5));
}

// ── redondeo ───────────────────────────────────────────────────────────

/**
 * Redondea `value` hacia abajo al múltiplo más cercano de `step`.
 * Ej: floorToStep(87, 5) → 85; floorToStep(53.6, 2.5) → 52.5
 */
export function floorToStep(value, step) {
  return Number((Math.floor(value / step) * step).toFixed(5));
}

// ── carga de discos ────────────────────────────────────────────────────

/**
 * Dado un peso total objetivo (barra + discos), el peso de la barra y la
 * lista de discos disponibles (libras, orden descendente), encuentra el
 * mayor peso cargable ≤ `totalWeight` usando DP (minimizando número de
 * discos) sobre la rejilla de 0.25 lb. Si el objetivo es ≤ barra, devuelve
 * la barra sola.
 *
 * Devuelve:
 *   { total, perSide: { [denom]: n }, adjusted }
 * `adjusted` es true si el peso conseguido difiere del objetivo original.
 */
export function loadableFloor(totalWeight, barWeight, plates) {
  if (!Number.isFinite(totalWeight) || totalWeight <= barWeight) {
    return {
      total: barWeight,
      perSide: {}, // plain: deep-equal con {} en tests
      adjusted: totalWeight > barWeight,
    };
  }

  const perSideTarget = (totalWeight - barWeight) / 2;
  const targetUnits = u(perSideTarget);
  const plateUnits = plates.map((p) => u(p));

  // DP: dp[w] = mínimo número de discos para w unidades por lado;
  // via[w] = disco (en unidades) usado en el último paso, para reconstruir.
  const dp = new Array(targetUnits + 1).fill(Infinity);
  const via = new Array(targetUnits + 1).fill(0);
  dp[0] = 0;

  for (const pu of plateUnits) {
    if (pu <= 0) continue;
    for (let w = pu; w <= targetUnits; w++) {
      if (dp[w - pu] + 1 < dp[w]) {
        dp[w] = dp[w - pu] + 1;
        via[w] = pu;
      }
    }
  }

  // Buscar el mayor peso alcanzable ≤ target
  let bestUnits = 0;
  for (let w = targetUnits; w >= 0; w--) {
    if (dp[w] !== Infinity) {
      bestUnits = w;
      break;
    }
  }

  // Reconstruir siguiendo los punteros del DP (siempre suma bestUnits)
  const unitToPlate = new Map(plates.map((p) => [u(p), p]));
  const perSide = {};
  for (let w = bestUnits; w > 0; w -= via[w]) {
    const p = unitToPlate.get(via[w]);
    perSide[p] = (perSide[p] || 0) + 1;
  }

  const total = barWeight + 2 * lb(bestUnits);
  return { total: lb(u(total)), perSide, adjusted: total !== totalWeight };
}

// ── construcción de series ─────────────────────────────────────────────

/**
 * Construye las filas de series a partir de los workouts del programa,
 * el peso de trabajo y la configuración.
 *
 * @param {Array} workouts – [{sets, reps, multiplier}, …]
 * @param {number} workingWeight – peso de trabajo en lb
 * @param {object} opts
 * @param {number} opts.bar – peso de la barra
 * @param {number[]} opts.plates – discos disponibles (descendente)
 * @param {number} opts.minStep – paso mínimo de redondeo para este ejercicio
 * @returns {Array} filas [{sets, reps, target, weight, perSide, adjusted}]
 */
export function buildSets(workouts, workingWeight, { bar, plates, minStep }) {
  const w = Number.isFinite(workingWeight) && workingWeight > 0 ? workingWeight : 0;
  return workouts.map((wo) => {
    const raw = wo.multiplier * w;
    const target = raw <= bar ? bar : floorToStep(raw, minStep);
    const { total: weight, perSide, adjusted } = loadableFloor(target, bar, plates);
    return {
      sets: wo.sets,
      reps: wo.reps,
      target,
      weight,
      perSide,
      adjusted,
    };
  });
}

// ── discos totales ────────────────────────────────────────────────────

/**
 * Calcula cuántos discos de cada denominación se necesitan para cubrir
 * todas las filas. Para cada denominación es 2 × max(perSide) entre filas.
 *
 * @param {Array} rows – filas devueltas por buildSets
 * @param {number[]} plateOrder – orden de denominaciones (descendente)
 * @returns {object} { [denom]: count } (solo denominaciones con count > 0)
 */
export function platesNeeded(rows, plateOrder) {
  const maxPerSide = {};
  for (const row of rows) {
    for (const [denom, count] of Object.entries(row.perSide)) {
      const n = Number(denom);
      if (!(n in maxPerSide) || count > maxPerSide[n]) {
        maxPerSide[n] = count;
      }
    }
  }

  const result = {};
  for (const p of plateOrder) {
    if (p in maxPerSide) {
      result[p] = maxPerSide[p] * 2;
    }
  }
  return result;
}

// ── utilidad ───────────────────────────────────────────────────────────

/**
 * Obtiene los workouts para un lift específico dentro de un programa.
 * Devuelve null si el lift no está definido en ese programa.
 */
export function getWorkouts(program, lift) {
  const ex = program.exercises.find((e) => e.lift === lift);
  return ex ? ex.workouts : null;
}