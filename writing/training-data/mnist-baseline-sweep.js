const stepsPlot = document.querySelector('[data-mnist-sweep="steps"]');
const targetAccuracy = 57.76;
const stepCap = 100;

// Images per class, reported step, mean test accuracy (%), standard deviation (pp).
const sweep = [
  [1, 100, 45.03, 4.50],
  [2, 100, 55.24, 1.66],
  [3, 13, 58.16, 4.38],
  [4, 12, 59.22, 4.56],
  [5, 7, 58.09, 4.33],
  [6, 7, 59.35, 5.10],
  [7, 6, 59.06, 4.49],
  [8, 6, 59.05, 3.71],
  [9, 5, 57.80, 4.66],
  [10, 6, 59.72, 3.55],
].map(([images, steps, mean, sd]) => ({
  images, steps, mean, sd, reachedTarget: mean >= targetAccuracy,
}));

const matches = sweep.filter((row) => row.reachedTarget);
const misses = sweep.filter((row) => !row.reachedTarget);

function line(x1, y1, x2, y2, attributes = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attributes}/>`;
}

function text(x, y, value, anchor = 'start') {
  return `<text x="${x}" y="${y}" fill="currentColor" text-anchor="${anchor}">${value}</text>`;
}

function circle(x, y) {
  return `<circle cx="${x}" cy="${y}" r="4" fill="currentColor"/>`;
}

function point(row, glyph) {
  const unit = row.images === 1 ? 'image' : 'images';
  const result = row.reachedTarget ? 'first match' : 'best below target';
  const details = `${row.images} ${unit} per class · ${result} at step ${row.steps} · ${row.mean.toFixed(2)}% mean · ${row.sd.toFixed(2)} pp SD`;
  return `<g class="${row.reachedTarget ? 'sweep-hit' : 'sweep-miss'}"><title>${details}</title>${glyph}</g>`;
}

function drawSweep(width) {
  if (width === 0) return;

  const left = 36;
  const right = width - 4;
  const spacing = (right - left) / sweep.length;
  const x = (images) => left + spacing * (images - 0.5);
  const stepY = (steps) => 95 - (steps - 5) * 8.5;

  function horizontalAxis(y) {
    return line(left, y, right, y, 'class="sweep-grid"') + sweep.map(({ images }) =>
      text(x(images), y + 17, images, 'middle'),
    ).join('');
  }

  function gridLine(y, value) {
    return line(left, y, right, y, 'class="sweep-grid"') + text(left - 6, y + 4, value, 'end');
  }

  const stepPath = matches.map(({ images, steps }) => `${x(images)},${stepY(steps)}`).join(' ');
  stepsPlot.innerHTML = [
    ...[5, 9, 13].map((steps) => gridLine(stepY(steps), steps)),
    `<polyline points="${stepPath}" class="sweep-hit" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    ...matches.map((row) => point(row, circle(x(row.images), stepY(row.steps)))),
    ...misses.map((row) => {
      const center = x(row.images);
      const cross = line(center - 3, 112, center + 3, 118, 'stroke="currentColor"') +
        line(center - 3, 118, center + 3, 112, 'stroke="currentColor"');
      return point(row, cross);
    }),
    text(x(2) + 9, 119, `Missed by step ${stepCap}`),
    horizontalAxis(129),
    text(width / 2, 168, 'Random images per class', 'middle'),
  ].join('');
}

drawSweep(stepsPlot.clientWidth);
new ResizeObserver(() => drawSweep(stepsPlot.clientWidth)).observe(stepsPlot);
