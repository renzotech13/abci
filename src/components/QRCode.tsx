export function QRCode({ value, size = 96 }: { value: string; size?: number }) {
  // Simple deterministic pseudo-QR pattern based on the string.
  // Not a real QR (kept simple to avoid adding dependencies), but recognizable.
  const cells = 21;
  const seed = Array.from(value).reduce((a, c) => a + c.charCodeAt(0), 0);
  function on(x: number, y: number) {
    // Three finder patterns (corners)
    const finder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7 && (
      x === cx || x === cx + 6 || y === cy || y === cy + 6 ||
      (x >= cx + 2 && x <= cx + 4 && y >= cy + 2 && y <= cy + 4)
    );
    if (finder(0, 0) || finder(cells - 7, 0) || finder(0, cells - 7)) return true;
    // Avoid finder buffer
    const inBuf = (cx: number, cy: number) => x >= cx && x < cx + 8 && y >= cy && y < cy + 8;
    if (inBuf(0, 0) || inBuf(cells - 7, 0) || inBuf(0, cells - 7)) return false;
    const v = (x * 31 + y * 17 + seed) % 7;
    return v < 3;
  }
  const cellSize = size / cells;
  const rects = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (on(x, y)) {
        rects.push(<rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="currentColor" />);
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="text-foreground">
      <rect width={size} height={size} fill="white" />
      {rects}
    </svg>
  );
}
