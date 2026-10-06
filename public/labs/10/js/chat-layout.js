// Weekdays plus bells form a 3×2 grid. Extra days continue on the next row.
export function chatGrid(cardCount) {
  const columns = Math.min(3, Math.max(cardCount, 1));
  const slots = Array.from({ length: cardCount }, (_, index) => ({ column: index % columns, row: Math.floor(index / columns) }));
  return { columns, slots };
}

export function positionChatCards(heights, gap) {
  const { columns, slots } = chatGrid(heights.length);
  const rowCount = Math.max(0, ...slots.map((slot) => slot.row + 1));
  const rows = Array(rowCount).fill(0);
  slots.forEach((slot, index) => {
    rows[slot.row] = Math.max(rows[slot.row], heights[index]);
  });
  const placements = slots.map((slot) => {
    const top = rows.slice(0, slot.row).reduce((sum, height) => sum + height + gap, 0);
    return { column: slot.column, top, height: rows[slot.row] };
  });
  return { columns, placements, height: rows.reduce((sum, height) => sum + height, 0) + Math.max(0, rows.length - 1) * gap };
}
