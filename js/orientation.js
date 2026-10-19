// Force landscape presentation by rotating the game/editor container when device is portrait.
(function(){
  function ensureStyle(){
    if (document.getElementById('orientation-style')) return;
    var s = document.createElement('style');
    s.id = 'orientation-style';
    s.textContent = '\n      /* Force a landscape-first UI and rotation helper */\n      body.landscape { background: #000; }\n      .force-rotated { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); transform-origin: center center; width: 100vh; height: 100vw; display: flex; align-items: center; justify-content: center; overflow: hidden; }\n      .force-rotated #game-canvas-wrap, .force-rotated #editor-canvas-wrap { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; }\n      .force-rotated canvas { max-width: calc(100vh - 32px); max-height: calc(100vw - 32px); width: auto !important; height: auto !important; image-rendering: pixelated; }\n    ';
    document.head.appendChild(s);
  }

  function applyLandscape(){
    ensureStyle();
    var root = document.getElementById('game-root') || document.getElementById('editor') || document.body;
    var isLandscape = window.innerWidth >= window.innerHeight;

    // Always prefer the landscape UI variant
    document.body.classList.add('landscape');

    if (!isLandscape) {
      root.classList.add('force-rotated');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      root.classList.remove('force-rotated');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    // Adjust canvas sizing so it fits when rotated
    var canvas = document.getElementById('gamearea');
    if (canvas) {
      if (!isLandscape) {
        canvas.style.maxWidth = 'calc(100vh - 32px)';
        canvas.style.maxHeight = 'calc(100vw - 32px)';
        canvas.style.width = 'auto';
        canvas.style.height = 'auto';
      } else {
        canvas.style.maxWidth = '';
        canvas.style.maxHeight = '';
        canvas.style.width = '';
        canvas.style.height = '';
      }
    }
  }

  window.addEventListener('load', applyLandscape, false);
  window.addEventListener('resize', applyLandscape, false);
  window.addEventListener('orientationchange', applyLandscape, false);
})();
