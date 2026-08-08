// The Nocturne design system is plain CSS on plain HTML, so the page needs no
// JavaScript to render or navigate. This keeps the footer year honest.
(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
