// Monday–Friday times supplied for the project, separately from the Excel data.
export const bells = [
  ["08:00", "09:35"],
  ["09:55", "11:30"],
  ["11:50", "13:25"],
  ["13:45", "15:20"],
  ["15:30", "17:05"],
  ["17:15", "18:50"],
  ["19:00", "20:35"],
];

export function bellMarkup({ card = false } = {}) {
  const heading = card ? "h3" : "h2";
  return `<section id="bell-schedule"${card ? ' class="day-card bell-card"' : ''} aria-labelledby="bell-title">
      <header${card ? ' class="day-heading"' : ''}><${heading} id="bell-title">Расписание звонков</${heading}></header>
      <p class="bell-weekdays">Понедельник — пятница</p>
      <dl class="bell-times">
${bells.map(([start, end], index) => `        <div><dt>${index + 1} пара</dt><dd><time datetime="${start}">${start}</time> — <time datetime="${end}">${end}</time></dd></div>`).join("\n")}
      </dl>
    </section>`;
}
