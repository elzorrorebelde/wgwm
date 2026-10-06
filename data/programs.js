/**
 * WGWM – Programas de series de aproximación.
 *
 * Derivado de nmunson/warmup-reps (GPLv3).
 * https://github.com/nmunson/warmup-reps
 *
 * Cada ejercicio del programa tiene un campo `lift` que lo mapea a uno
 * de los cinco ejercicios soportados por la app:
 *   squat | bench | deadlift | ohp | row
 */

const PROGRAMS = [
  {
    title: "Starting Strength",
    slug: "starting-strength",
    exercises: [
      {
        name: "Squats",
        lift: "squat",
        max: 600,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "3", multiplier: 0.6 },
          { sets: "1", reps: "2", multiplier: 0.8 },
          { sets: "3", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "Bench",
        lift: "bench",
        max: 500,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.5 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.9 },
          { sets: "3", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "Deadlifts",
        lift: "deadlift",
        max: 700,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "3", multiplier: 0.6 },
          { sets: "1", reps: "2", multiplier: 0.85 },
          { sets: "1", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "Press",
        lift: "ohp",
        max: 400,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.55 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.85 },
          { sets: "3", reps: "5", multiplier: 1.0 },
        ],
      },
      // PowerCleans omitido (no está entre los 5 ejercicios)
      {
        name: "Rows",
        lift: "row",
        max: 300,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.5 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.9 },
          { sets: "3", reps: "5", multiplier: 1.0 },
        ],
      },
    ],
  },
  {
    title: "5×5",
    slug: "5x5",
    exercises: [
      {
        name: "Squat",
        lift: "squat",
        max: 600,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "3", multiplier: 0.6 },
          { sets: "1", reps: "2", multiplier: 0.8 },
          { sets: "5", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "BenchPress",
        lift: "bench",
        max: 500,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.5 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.9 },
          { sets: "5", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "Deadlift",
        lift: "deadlift",
        max: 700,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "3", multiplier: 0.6 },
          { sets: "1", reps: "2", multiplier: 0.85 },
          { sets: "1", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "OverheadPress",
        lift: "ohp",
        max: 400,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.55 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.85 },
          { sets: "5", reps: "5", multiplier: 1.0 },
        ],
      },
      {
        name: "BarbellRow",
        lift: "row",
        max: 300,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "2", multiplier: 0.9 },
          { sets: "5", reps: "5", multiplier: 1.0 },
        ],
      },
    ],
  },
  {
    title: "Max Single",
    slug: "max-single",
    exercises: [
      {
        name: "Squats",
        lift: "squat",
        max: 600,
        workouts: [
          { sets: "1", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "5", multiplier: 0.6 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "1", multiplier: 0.8 },
          { sets: "1", reps: "1", multiplier: 0.9 },
          { sets: "1", reps: "1", multiplier: 1.0 },
        ],
      },
      {
        name: "BenchPress",
        lift: "bench",
        max: 500,
        workouts: [
          { sets: "1", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "5", multiplier: 0.6 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "1", multiplier: 0.8 },
          { sets: "1", reps: "1", multiplier: 0.9 },
          { sets: "1", reps: "1", multiplier: 1.0 },
        ],
      },
      {
        name: "Deadlifts",
        lift: "deadlift",
        max: 700,
        workouts: [
          { sets: "1", reps: "5", multiplier: 0.0 },
          { sets: "1", reps: "5", multiplier: 0.4 },
          { sets: "1", reps: "5", multiplier: 0.6 },
          { sets: "1", reps: "3", multiplier: 0.7 },
          { sets: "1", reps: "1", multiplier: 0.8 },
          { sets: "1", reps: "1", multiplier: 0.9 },
          { sets: "1", reps: "1", multiplier: 1.0 },
        ],
      },
      // ohp y row no definidos en Max Single original
    ],
  },
  {
    title: "Greyskull LP",
    slug: "greyskull-lp",
    exercises: [
      {
        name: "Squats",
        lift: "squat",
        max: 400,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.25 },
          { sets: "1", reps: "5", multiplier: 0.42 },
          { sets: "1", reps: "3", multiplier: 0.58 },
          { sets: "1", reps: "2", multiplier: 0.75 },
          { sets: "2", reps: "5", multiplier: 1.0 },
          { sets: "1", reps: "5+", multiplier: 1.0 },
        ],
      },
      {
        name: "Bench",
        lift: "bench",
        max: 300,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.25 },
          { sets: "1", reps: "5", multiplier: 0.42 },
          { sets: "1", reps: "3", multiplier: 0.58 },
          { sets: "1", reps: "2", multiplier: 0.75 },
          { sets: "2", reps: "5", multiplier: 1.0 },
          { sets: "1", reps: "5+", multiplier: 1.0 },
        ],
      },
      {
        name: "Overhead",
        lift: "ohp",
        max: 500,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.25 },
          { sets: "1", reps: "5", multiplier: 0.42 },
          { sets: "1", reps: "3", multiplier: 0.58 },
          { sets: "1", reps: "2", multiplier: 0.75 },
          { sets: "2", reps: "5", multiplier: 1.0 },
          { sets: "1", reps: "5+", multiplier: 1.0 },
        ],
      },
      {
        name: "Deadlifts",
        lift: "deadlift",
        max: 500,
        workouts: [
          { sets: "2", reps: "5", multiplier: 0.25 },
          { sets: "1", reps: "5", multiplier: 0.42 },
          { sets: "1", reps: "3", multiplier: 0.58 },
          { sets: "1", reps: "2", multiplier: 0.75 },
          { sets: "1", reps: "5+", multiplier: 1.0 },
        ],
      },
      // row no definido en Greyskull LP original
    ],
  },
];

export default PROGRAMS;