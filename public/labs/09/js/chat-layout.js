// Weekdays plus bells form a 3×2 grid. Extra days continue on the next row.
export function chatGrid(cardCount) {
  const columns = Math.min(3, Math.max(cardCount, 1));
  const slots = Array.from({ length: cardCount }, (_, index) => ({ column: index % columns, row: Math.floor(index / columns) }));
  return { columns, slots };
}

