/* SkateNav project page — nav highlighting, BibTeX copy, single-video playback */

(function () {
  'use strict';

  /* ---- active section in the nav --------------------------------------- */

  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  var sections = links
    .map(function (a) { return document.getElementById(a.hash.slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Map();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      });

      var bestId = null;
      var bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });

      links.forEach(function (a) {
        a.classList.toggle('active', bestId !== null && a.hash === '#' + bestId);
      });
    }, {
      rootMargin: '-56px 0px -55% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---- copy BibTeX ----------------------------------------------------- */

  var btn = document.getElementById('copyBib');
  var bib = document.getElementById('bibText');

  if (btn && bib) {
    btn.addEventListener('click', function () {
      var text = bib.textContent;

      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('done');
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---- only one video plays at a time (hero + clips) ----------------------------------- */

  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  videos.forEach(function (v) {
    v.addEventListener('play', function () {
      videos.forEach(function (other) {
        if (other !== v && !other.paused) { other.pause(); }
      });
    });
  });

})();
