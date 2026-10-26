/* Mahjong Guide: deck script.
   1. Draws each .tile[data-t] face in HTML elements (no images, no icon font).
   2. Scales the fixed 1920x1080 stage to fit the window, letterboxed on #111.
   3. Hands over to the shared master, initPresentation() in ../../presentation.js.
   Vanilla JS, no dependencies. The HTML keeps a plain-text label on each tile for reading without JS. */
(function () {
  'use strict';

  var STAGE_W = 1920;
  var STAGE_H = 1080;

  /* Dot centres in % of the tile face, keyed by rank.
     Layouts are approximate. Check them against a physical set before the PDF goes out. */
  var DOT_LAYOUTS = {
    1: [[50, 50]],
    2: [[50, 28], [50, 72]],
    3: [[28, 24], [50, 50], [72, 76]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 28], [70, 28], [50, 50], [30, 72], [70, 72]],
    6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
    7: [[26, 14], [50, 24], [74, 33], [32, 60], [68, 60], [32, 82], [68, 82]],
    8: [[30, 18], [70, 18], [30, 39], [70, 39], [30, 61], [70, 61], [30, 82], [70, 82]],
    9: [[28, 22], [50, 22], [72, 22], [28, 50], [50, 50], [72, 50], [28, 78], [50, 78], [72, 78]]
  };

  /* Bamboo rows: how many sticks sit in each row, keyed by rank (1 is drawn separately). */
  var BAMBOO_ROWS = {
    2: [2],
    3: [3],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
    7: [4, 3],
    8: [4, 4],
    9: [3, 3, 3]
  };

  var NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var WINDS = { E: '東', S: '南', W: '西', N: '北' };
  var FLOWERS = ['梅', '蘭', '菊', '竹'];
  var SEASONS = ['春', '夏', '秋', '冬'];

  function make(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function placeAt(node, x, y) {
    node.style.left = x + '%';
    node.style.top = y + '%';
  }

  function renderDots(art, rank) {
    var size = rank === 1 ? 'dot dot--xl' : (rank <= 4 ? 'dot dot--lg' : (rank >= 7 ? 'dot dot--sm' : 'dot'));
    DOT_LAYOUTS[rank].forEach(function (p, i) {
      /* Real 5-dot sets have a red centre dot (index 2 in the layout). */
      var accent = (rank === 5 && i === 2) ? ' dot--red' : '';
      var dot = make('span', size + accent);
      placeAt(dot, p[0], p[1]);
      art.appendChild(dot);
    });
  }

  function renderBamboo(art, rank) {
    if (rank === 1) {
      /* One bamboo: a single green stick with red nodes, so no bird drawing is needed. */
      var stick = make('span', 'stick stick--ornate');
      stick.style.left = '50%';
      stick.style.top = '50%';
      stick.style.width = '22%';
      stick.style.height = '80%';
      art.appendChild(stick);
      return;
    }
    var rows = BAMBOO_ROWS[rank];
    var maxCols = Math.max.apply(null, rows);
    var cellW = 100 / maxCols;
    var cellH = 100 / rows.length;
    rows.forEach(function (cols, r) {
      var offset = (maxCols - cols) * cellW / 2;
      for (var c = 0; c < cols; c++) {
        var stick = make('span', 'stick');
        stick.style.left = (offset + (c + 0.5) * cellW) + '%';
        stick.style.top = ((r + 0.5) * cellH) + '%';
        stick.style.width = (cellW * 0.42) + '%';
        stick.style.height = (cellH * 0.8) + '%';
        art.appendChild(stick);
      }
    });
  }

  function renderCharacters(art, rank) {
    art.classList.add('art-chars');
    var num = make('span', 'char char--num');
    num.textContent = NUMERALS[rank - 1];
    var wan = make('span', 'char char--wan');
    wan.textContent = '萬';
    art.appendChild(num);
    art.appendChild(wan);
  }

  function renderSingleChar(art, text, className) {
    art.classList.add('art-center');
    var ch = make('span', 'char ' + className);
    ch.textContent = text;
    art.appendChild(ch);
  }

  function renderTile(tile) {
    if (tile.getAttribute('data-rendered') === 'yes') return;
    var code = tile.getAttribute('data-t') || '';
    var art = make('span', 'tile-art');
    var bonus = /^([FS])([1-4])$/.exec(code);
    var suit = /^([dbc])([1-9])$/.exec(code);

    if (suit) {
      var rank = parseInt(suit[2], 10);
      if (suit[1] === 'd') renderDots(art, rank);
      else if (suit[1] === 'b') renderBamboo(art, rank);
      else renderCharacters(art, rank);
      tile.appendChild(art);
    } else if (WINDS[code]) {
      renderSingleChar(art, WINDS[code], 'char--wind');
      tile.appendChild(art);
    } else if (code === 'RD') {
      renderSingleChar(art, '中', 'char--red');
      tile.appendChild(art);
    } else if (code === 'GD') {
      renderSingleChar(art, '發', 'char--green');
      tile.appendChild(art);
    } else if (code === 'WD') {
      /* White dragon: an empty indigo frame, no character. */
      var frame = make('span', 'tile-frame');
      tile.appendChild(frame);
    } else if (bonus) {
      var index = parseInt(bonus[2], 10) - 1;
      var glyph = bonus[1] === 'F' ? FLOWERS[index] : SEASONS[index];
      renderSingleChar(art, glyph, 'char--bonus');
      tile.appendChild(art);
      var num = make('span', 'tile-num');
      num.textContent = bonus[2];
      tile.appendChild(num);
    } else {
      return;
    }
    tile.setAttribute('data-rendered', 'yes');
  }

  function renderTiles() {
    var tiles = document.querySelectorAll('.tile[data-t]');
    Array.prototype.forEach.call(tiles, renderTile);
  }

  /* Scale the 1920x1080 stage to fit the window and centre it. Letterbox is the body colour #111. */
  function fitStage() {
    var deck = document.getElementById('deck');
    if (!deck) return;
    var scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    deck.style.transform = 'scale(' + scale + ')';
    deck.style.left = Math.round((window.innerWidth - STAGE_W * scale) / 2) + 'px';
    deck.style.top = Math.round((window.innerHeight - STAGE_H * scale) / 2) + 'px';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderTiles();
    fitStage();
    window.addEventListener('resize', fitStage);
    if (typeof initPresentation === 'function') initPresentation();
  });
})();
