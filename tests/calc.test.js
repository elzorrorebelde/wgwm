/**
 * WGWM – Tests de lógica de cálculo.
 *
 * Ejecutar con: node --test tests/calc.test.js
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  floorToStep,
  loadableFloor,
  buildSets,
  platesNeeded,
  getWorkouts,
} from "../js/calc.js";
import PROGRAMS from "../data/programs.js";

// ── floorToStep ────────────────────────────────────────────────────────

describe("floorToStep", () => {
  it("redondea hacia abajo al múltiplo de 5", () => {
    assert.strictEqual(floorToStep(87, 5), 85);
    assert.strictEqual(floorToStep(85, 5), 85);
    assert.strictEqual(floorToStep(0, 5), 0);
    assert.strictEqual(floorToStep(225, 5), 225);
  });

  it("redondea hacia abajo al múltiplo de 2.5", () => {
    assert.strictEqual(floorToStep(87, 2.5), 85);
    assert.strictEqual(floorToStep(53.6, 2.5), 52.5);
    assert.strictEqual(floorToStep(52.5, 2.5), 52.5);
    assert.strictEqual(floorToStep(2, 2.5), 0);
  });

  it("tolera error de coma flotante", () => {
    // 0.7 * 225 = 157.5 (el JS da 157.5 exacto)
    assert.strictEqual(floorToStep(0.7 * 225, 5), 155);
    // 0.4 * 225 = 90
    assert.strictEqual(floorToStep(0.4 * 225, 5), 90);
  });
});

// ── loadableFloor ──────────────────────────────────────────────────────

describe("loadableFloor", () => {
  const bar = 45;
  const std = [45, 35, 25, 10, 5, 2.5];
  const sumPerSide = (ps) =>
    Object.entries(ps).reduce((acc, [d, c]) => acc + Number(d) * c, 0);

  it("barra sola cuando total <= bar", () => {
    const r = loadableFloor(45, bar, std);
    assert.strictEqual(r.total, 45);
    assert.deepStrictEqual(r.perSide, {});
    assert.strictEqual(r.adjusted, false);

    const r2 = loadableFloor(30, bar, std);
    assert.strictEqual(r2.total, 45);
    assert.strictEqual(r2.adjusted, false);
  });

  it("carga exacta con discos estándar (225)", () => {
    const r = loadableFloor(225, bar, std);
    assert.strictEqual(r.total, 225);
    // (225-45)/2 = 90 per side = 45+45
    assert.deepStrictEqual(r.perSide, { 45: 2 });
    assert.strictEqual(r.adjusted, false);
  });

  it("carga exacta con combinación (135)", () => {
    const r = loadableFloor(135, bar, std);
    assert.strictEqual(r.total, 135);
    // (135-45)/2 = 45 per side
    assert.deepStrictEqual(r.perSide, { 45: 1 });
  });

  it("ajusta hacia abajo cuando no es cargable (sin 1.25)", () => {
    // 52.5: (52.5-45)/2 = 3.75 per side → no cargable sin 1.25
    const r = loadableFloor(52.5, bar, std);
    assert.strictEqual(r.total, 50);
    assert.deepStrictEqual(r.perSide, { 2.5: 1 });
    assert.strictEqual(r.adjusted, true);
  });

  it("con disco 1.25 habilita 52.5", () => {
    const plates = [45, 35, 25, 10, 5, 2.5, 1.25];
    const r = loadableFloor(52.5, bar, plates);
    assert.strictEqual(r.total, 52.5);
    assert.deepStrictEqual(r.perSide, { 2.5: 1, 1.25: 1 });
    assert.strictEqual(r.adjusted, false);
  });

  it("carga 180 exacto", () => {
    const r = loadableFloor(180, bar, std);
    assert.strictEqual(r.total, 180);
    assert.strictEqual(sumPerSide(r.perSide) * 2 + bar, 180);
  });

  it("discos no estándar: perSide siempre suma el total (DP, no voraz)", () => {
    // 125 con [25,20]: (125-45)/2 = 40 = 20+20; la vía voraz (25) fallaría
    const r = loadableFloor(125, bar, [25, 20]);
    assert.strictEqual(r.total, 125);
    assert.deepStrictEqual(r.perSide, { 20: 2 });

    const r2 = loadableFloor(145, bar, [35, 25, 10]);
    assert.strictEqual(sumPerSide(r2.perSide) * 2 + bar, r2.total);
    assert.strictEqual(r2.total, 145);
  });

  it("invariante: perSide suma el total para muchos objetivos", () => {
    for (let t = 45; t <= 500; t += 2.5) {
      const r = loadableFloor(t, bar, std);
      assert.strictEqual(sumPerSide(r.perSide) * 2 + bar, r.total, `t=${t}`);
      assert.ok(r.total <= Math.max(t, bar), `t=${t}`);
    }
  });

  it("200 lb → 45 + 25 + 5 + 2.5 por lado (más pesado primero)", () => {
    const r = loadableFloor(200, bar, std);
    assert.strictEqual(r.total, 200);
    assert.deepStrictEqual(r.perSide, { 45: 1, 25: 1, 5: 1, 2.5: 1 });
  });

  it("165 lb → 45 + 10 + 5 (no 35 + 25: los discos no están calibrados)", () => {
    const r = loadableFloor(165, bar, std);
    assert.deepStrictEqual(r.perSide, { 45: 1, 10: 1, 5: 1 });
  });

  it("con discos estándar coincide con el voraz puro en todo el rango", () => {
    const greedy = (side) => {
      const o = {};
      for (const p of std) {
        const c = Math.floor(side / p);
        if (c) { o[p] = c; side -= c * p; }
      }
      return o;
    };
    for (let t = 45; t <= 600; t += 2.5) {
      const r = loadableFloor(t, bar, std);
      assert.deepStrictEqual(r.perSide, greedy((r.total - bar) / 2), `t=${t}`);
    }
  });

  it("devuelve la barra si ningún disco entra", () => {
    const r = loadableFloor(46, bar, [45, 35]);
    assert.strictEqual(r.total, 45);
    assert.strictEqual(r.adjusted, true);
  });
});

// ── buildSets ──────────────────────────────────────────────────────────

describe("buildSets", () => {
  const bar = 45;
  const plates = [45, 35, 25, 10, 5, 2.5];

  it("genera series de Starting Strength para squat 225", () => {
    const program = PROGRAMS.find((p) => p.slug === "starting-strength");
    const workouts = getWorkouts(program, "squat");
    const rows = buildSets(workouts, 225, { bar, plates, minStep: 5 });

    assert.strictEqual(rows.length, 5);
    // 1: mult 0 → bar
    assert.strictEqual(rows[0].target, 45);
    assert.strictEqual(rows[0].weight, 45);
    assert.deepStrictEqual(rows[0].perSide, {});

    // 2: mult 0.4 → 90
    assert.strictEqual(rows[1].target, 90);
    assert.strictEqual(rows[1].weight, 90);

    // 3: mult 0.6 → 135
    assert.strictEqual(rows[2].target, 135);
    assert.strictEqual(rows[2].weight, 135);

    // 4: mult 0.8 → 180
    assert.strictEqual(rows[3].target, 180);
    assert.strictEqual(rows[3].weight, 180);

    // 5: mult 1.0 → 225
    assert.strictEqual(rows[4].target, 225);
    assert.strictEqual(rows[4].weight, 225);
    assert.deepStrictEqual(rows[4].perSide, { 45: 2 });
  });

  it("cappea a la barra cuando mult × peso < barra", () => {
    const rows = buildSets(
      [{ sets: "1", reps: "5", multiplier: 0.0 }],
      135,
      { bar, plates, minStep: 5 },
    );
    assert.strictEqual(rows[0].target, 45);
    assert.strictEqual(rows[0].weight, 45);
  });

  it("respeta minStep 2.5 para OHP", () => {
    const program = PROGRAMS.find((p) => p.slug === "5x5");
    const workouts = getWorkouts(program, "ohp");
    // working weight 100, multiplier 0.55 → 55, floorToStep(55, 2.5) = 55
    const rows = buildSets(workouts, 100, { bar, plates, minStep: 2.5 });
    // First workout: mult 0 → bar
    assert.strictEqual(rows[0].weight, 45);
    // Second: mult 0.55 → 55
    assert.strictEqual(rows[1].target, 55);
  });

  it("marca adjusted cuando baja por discos insuficientes", () => {
    // solo discos grandes: mínimo incremento 10 lb (5×2)
    const rows = buildSets(
      [{ sets: "1", reps: "5", multiplier: 0.5 }],
      100,
      { bar, plates: [45, 35, 25, 10, 5], minStep: 2.5 },
    );
    // 0.5*100=50, floor(50, 2.5)=50, (50-45)/2=2.5 → no 2.5 plate → baja a 45
    assert.strictEqual(rows[0].weight, 45);
    assert.strictEqual(rows[0].adjusted, true);
  });

  it("peso de trabajo 0 o NaN no revienta: todo cae a la barra", () => {
    for (const w of [0, NaN]) {
      const rows = buildSets(
        [{ sets: "1", reps: "5", multiplier: 0.5 }],
        w,
        { bar, plates, minStep: 5 },
      );
      assert.strictEqual(rows[0].weight, 45);
    }
  });

  it("OHP con mínimo 2.5: sin 1.25 baja a múltiplo de 5; con 1.25 conserva 2.5", () => {
    const wo = [{ sets: "1", reps: "5", multiplier: 1.0 }];
    // 52.5 → no cargable sin disco de 1.25 → 50
    const sin = buildSets(wo, 52.5, { bar, plates, minStep: 2.5 });
    assert.strictEqual(sin[0].weight, 50);
    assert.strictEqual(sin[0].adjusted, true);
    const con = buildSets(wo, 52.5, { bar, plates: [...plates, 1.25], minStep: 2.5 });
    assert.strictEqual(con[0].weight, 52.5);
    assert.strictEqual(con[0].adjusted, false);
  });

  it("sin discos por defecto devuelve solo barra", () => {
    const rows = buildSets(
      [{ sets: "1", reps: "5", multiplier: 1.0 }],
      135,
      { bar, plates: [], minStep: 5 },
    );
    assert.strictEqual(rows[0].weight, 45);
  });
});

// ── platesNeeded ───────────────────────────────────────────────────────

describe("platesNeeded", () => {
  const plates = [45, 35, 25, 10, 5, 2.5];

  it("máximo por denominación ×2", () => {
    const rows = [
      { perSide: { 45: 1 } },           // necesita 2 de 45
      { perSide: { 45: 2 } },           // necesita 4 de 45 → pico 4
      { perSide: { 45: 1, 25: 1 } },    // 2 de 45, 2 de 25
    ];
    const needed = platesNeeded(rows, plates);
    assert.strictEqual(needed[45], 4);
    assert.strictEqual(needed[25], 2);
  });

  it("filas sin discos devuelven vacío", () => {
    const rows = [{ perSide: {} }, { perSide: {} }];
    const needed = platesNeeded(rows, plates);
    assert.deepStrictEqual(needed, {});
  });

  it("incluye las denominaciones correctas", () => {
    const rows = [{ perSide: { 5: 1, 45: 2 } }];
    const needed = platesNeeded(rows, plates);
    assert.strictEqual(needed[45], 4);
    assert.strictEqual(needed[5], 2);
    // las claves numéricas se ordenan ascendentemente según spec
  });

  it("total para squat 225 en Starting Strength", () => {
    const program = PROGRAMS.find((p) => p.slug === "starting-strength");
    const workouts = getWorkouts(program, "squat");
    const rows = buildSets(workouts, 225, {
      bar: 45,
      plates,
      minStep: 5,
    });
    const needed = platesNeeded(rows, plates);
    // El pico de 45s es en la última serie: 45×2 por lado → 4 discos de 45
    assert.strictEqual(needed[45], 4);
    // 25s aparecen en 180: 45+45+? → (180-45)/2=67.5 → 45+10+5+5+2.5
    // No hay 25s en squat 225. Verifiquemos.
    // 90: (90-45)/2=22.5 → 10+5+5+2.5 → no 25
    // 135: (135-45)/2=45 → 45
    // 180: (180-45)/2=67.5 → 45+10+5+5+2.5
    // 225: (225-45)/2=90 → 45+45
    // Solo 45, 10, 5, 2.5
    assert.strictEqual(needed[25], undefined);
  });
});

// ── getWorkouts ────────────────────────────────────────────────────────

describe("getWorkouts", () => {
  it("encuentra squat en Starting Strength", () => {
    const prog = PROGRAMS.find((p) => p.slug === "starting-strength");
    const wo = getWorkouts(prog, "squat");
    assert.ok(wo);
    assert.strictEqual(wo.length, 5);
  });

  it("devuelve null para lift no definido (row en Max Single)", () => {
    const prog = PROGRAMS.find((p) => p.slug === "max-single");
    const wo = getWorkouts(prog, "row");
    assert.strictEqual(wo, null);
  });

  it("encuentra deadlift en Greyskull LP", () => {
    const prog = PROGRAMS.find((p) => p.slug === "greyskull-lp");
    const wo = getWorkouts(prog, "deadlift");
    assert.ok(wo);
  });
});