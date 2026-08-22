/**
 * Wicked Hollow — Countdown widget
 * Small, dependency-free, respects prefers-reduced-motion by rendering
 * static values once instead of ticking. No layout shift on first paint.
 */
(function () {
  'use strict';

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function computeParts(msRemaining) {
    if (msRemaining <= 0) return { days: 0, hours: 0, minutes: 0 };
    var totalMinutes = Math.floor(msRemaining / 60000);
    var days = Math.floor(totalMinutes / 1440);
    var hours = Math.floor((totalMinutes - days * 1440) / 60);
    var minutes = totalMinutes - days * 1440 - hours * 60;
    return { days: days, hours: hours, minutes: minutes };
  }

  function render(root, parts) {
    var days = root.querySelector('[data-wh-count="days"]');
    var hours = root.querySelector('[data-wh-count="hours"]');
    var minutes = root.querySelector('[data-wh-count="minutes"]');
    if (days) days.textContent = pad(parts.days);
    if (hours) hours.textContent = pad(parts.hours);
    if (minutes) minutes.textContent = pad(parts.minutes);
  }

  function init(root) {
    var targetIso = root.getAttribute('data-target-iso');
    if (!targetIso) return;
    var targetTime = Date.parse(targetIso);
    if (isNaN(targetTime)) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function tick() {
      var msRemaining = targetTime - Date.now();
      render(root, computeParts(msRemaining));
    }

    tick(); // First paint value, avoids layout shift

    if (!reduced && targetTime - Date.now() > 0) {
      // Update every 30s — cheap, tabular-nums prevents jitter, no re-layout.
      setInterval(tick, 30000);
    }
  }

  function boot() {
    var roots = document.querySelectorAll('[data-wh-countdown]');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
