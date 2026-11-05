const COLUMN_COUNT = 5;
const COLUMN_WIDTH = 4;
const ROW_HEIGHT = 6;
const ROW_COUNT = 24;
const PERIOD = ROW_HEIGHT * ROW_COUNT;
const WINDOW_HEIGHT = 60;
// Compact 3×5 numerals survive the tiny frame size without font downsampling.
const DIGITS = [
  [7, 5, 5, 5, 7], [2, 6, 2, 2, 7], [7, 1, 7, 4, 7], [7, 1, 7, 1, 7], [5, 5, 7, 1, 1],
  [7, 4, 7, 1, 7], [7, 4, 7, 5, 7], [7, 1, 1, 1, 1], [7, 5, 7, 5, 7], [7, 5, 7, 1, 7],
];

/** Small code-drawn glyph strips, sampled at independent downward velocities. */
export class DigitalRain {
  private strips: HTMLCanvasElement[];

  constructor() {
    this.strips = ["#efffd0", "#fff1b0", "#d6edff", "#fff4cd"].map((color, channel) => {
      const strip = document.createElement("canvas");
      strip.width = COLUMN_COUNT * COLUMN_WIDTH;
      strip.height = PERIOD * 2;
      const ctx = strip.getContext("2d")!;
      ctx.fillStyle = color;
      for (let column = 0; column < COLUMN_COUNT; column++) {
        for (let row = 0; row < ROW_COUNT; row++) {
          const tail = (row + column * 5 + channel * 3) % 12;
          ctx.globalAlpha = .25 + Math.pow(tail / 11, 2) * .70;
          const digit = ((Math.imul(row + channel * 31 + 1, 2654435761) ^ Math.imul(column + 1, 1597334677)) >>> 0) % 10;
          for (const repeat of [0, PERIOD]) {
            DIGITS[digit].forEach((bits, y) => {
              for (let x = 0; x < 3; x++) {
                if (bits & (1 << (2 - x))) ctx.fillRect(column * COLUMN_WIDTH + x, row * ROW_HEIGHT + y + repeat, 1, 1);
              }
            });
          }
        }
      }
      return strip;
    });
  }

  draw(ctx: CanvasRenderingContext2D, channel: number, time: number, seed: number,
    x: number, y: number, width: number, height: number, opacity: number) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 1, width - 2, height - 2);
    ctx.clip();
    ctx.globalAlpha = opacity * .94;
    ctx.imageSmoothingEnabled = false;
    const columnWidth = (width - 2) / COLUMN_COUNT;
    for (let column = 0; column < COLUMN_COUNT; column++) {
      const speed = 7 + (column * 3 + channel * 5) % 8;
      // Moving the source window upward makes the glyphs fall inside the box.
      const offset = ((column * 37 + seed * 19 - time * speed) % PERIOD + PERIOD) % PERIOD;
      ctx.drawImage(this.strips[channel], column * COLUMN_WIDTH, offset, COLUMN_WIDTH, WINDOW_HEIGHT,
        x + 1 + column * columnWidth, y, columnWidth, height);
    }
    ctx.restore();
  }

  dispose() {
    this.strips.forEach((strip) => { strip.width = 0; strip.height = 0; });
    this.strips = [];
  }
}
