/* Router, state, rendering helpers and shared artwork. */
(function () {
  var D = window.SJData, E = window.SJEngine;
  var SJ = window.SJ = { screens: {}, A: {}, S: D.scenarios.fresh(), cur: null, sheet: null, timers: [] };
  var esc = SJ.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- money and dates ---------- */
  var cur = function () { return SJ.S.currency || 'AED'; };
  SJ.money = function (n, dp) {
    if (n == null || isNaN(n)) return '';
    return cur() + ' ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 });
  };
  SJ.num = function (v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
  SJ.my = function (d) { return d ? d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''; };
  SJ.ord = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  SJ.months = function (n) { return n + (n === 1 ? ' month' : ' months'); };

  /* ---------- plan helpers ---------- */
  SJ.plan = function (over) {
    var S = SJ.S;
    /* Once a payment is logged this month, the sums count from next month, so the date holds still. */
    var start = Object.keys(S.paidMonth).length ? E.addMonths(D.START, 1) : D.START;
    return E.plan(Object.assign({ cards: S.cards, monthly: S.monthly, order: S.order, start: start, firstMonthly: S.firstMonthly }, over || {}));
  };
  /* This month's instructions are set once, so logging one payment doesn't rewrite the others. */
  SJ.monthPlan = function () {
    var S = SJ.S, key = [S.order, S.monthly, S.firstMonthly, S.cardsVersion || 0].join('|');
    if (S.mp && S.mp.key === key) return S.mp;
    var t = E.thisMonth(S.cards, S.monthly, S.order, D.START, S.firstMonthly);
    S.mp = { key: key, never: t.never, rows: t.never || !t.focus ? [] : [t.focus].concat(t.others).map(function (r) { return { id: r.card.id, name: r.card.name, due: r.card.due, pay: r.pay }; }) };
    return S.mp;
  };
  SJ.left = function () { return SJ.S.cards.reduce(function (s, c) { return s + c.balance; }, 0); };
  SJ.rent = function () { return SJ.S.cards.reduce(function (s, c) { return s + c.balance * c.rate / 100; }, 0); };
  SJ.progress = function () { var S = SJ.S, t = S.paidOff + SJ.left(); return t > 0 ? S.paidOff / t : 0; };
  SJ.card = function (id) { return SJ.S.cards.find(function (c) { return c.id === id; }); };

  /* ---------- icons, drawn for this app ---------- */
  var ic = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    micoff: '<path d="M9 9V6a3 3 0 0 1 5.6-1.5M15 11v.5a3 3 0 0 1-4.6 2.5M5.5 11.5a6.5 6.5 0 0 0 10 5.4M18.5 11.5c0 .7-.1 1.3-.3 1.9M12 18v3M4 4l16 16"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.500 2 7.500 6"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>', down: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12.500 10 17.500 19.500 7"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V5M7.500 9.500 12 5l4.500 4.500M4.500 19.500h15"/>', file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    pencil: '<path d="M4 20l1-4L16.500 4.500a2 2 0 0 1 3 3L8 19l-4 1Z"/>', keyboard: '<rect x="3" y="6" width="18" height="12" rx="2.500"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14.500h8"/>',
    bubble: '<path d="M4 6.500A2.500 2.500 0 0 1 6.500 4h11A2.500 2.500 0 0 1 20 6.500v7a2.500 2.500 0 0 1-2.500 2.500H11l-4.500 4v-4A2.500 2.500 0 0 1 4 13.500z"/>',
    bell: '<path d="M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 1.500h-15zM10 20.500h4"/>', globe: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.500 3.500 5.500 3.500 8.500s-1 6-3.500 8.500c-2.500-2.500-3.500-5.500-3.500-8.500s1-6 3.500-8.500Z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2.500"/><path d="M8.500 11V8a3.500 3.500 0 0 1 7 0v3"/>', help: '<circle cx="12" cy="12" r="8.500"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.700 2.200c-.8.5-1.200 1-1.200 1.800M12 16.800h.01"/>',
    wifi: '<path d="M4 9.500a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0M10 16.500a3.500 3.500 0 0 1 4 0M12 19.800h.01"/>', wifioff: '<path d="M4 4l16 16M7 13a8 8 0 0 1 4-1.800M4 9.500c1-.9 2-1.500 3.200-2M13.500 7.100A12 12 0 0 1 20 9.500M10 16.500a3.500 3.500 0 0 1 4 0M12 19.800h.01"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M11 18h2"/>', leaf: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14Zm0 0 7-7"/>', jar: '<path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2zM6 3.500h12V7H6z"/>',
    download: '<path d="M12 4v11M7.500 10.500 12 15l4.500-4.500M4.500 19.500h15"/>', heart: '<path d="M12 20s-7.500-4.700-7.500-10.200A4.300 4.300 0 0 1 12 7.200a4.300 4.300 0 0 1 7.500 2.600C19.500 15.300 12 20 12 20Z"/>', google: '',
    alert: '<path d="M12 4 2.800 19.500h18.400zM12 10v4.500M12 17.200h.01"/>', refresh: '<path d="M4.500 12a7.500 7.500 0 0 1 13-5l2 2M19.500 12a7.500 7.500 0 0 1-13 5l-2-2M19.500 4.500V9H15M4.500 19.500V15H9"/>'
  };
  SJ.icon = function (n, s) { return '<svg width="' + (s || 22) + '" height="' + (s || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ic[n] || '') + '</svg>'; };
  SJ.googleMark = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.600 12.200c0-.7-.1-1.300-.2-1.900H12v3.700h5.400a4.600 4.600 0 0 1-2 3v2.500h3.200c1.900-1.700 3-4.300 3-7.300Z"/><path fill="#34A853" d="M12 22c2.700 0 5-.9 6.600-2.400l-3.200-2.500c-.9.600-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100a10 10 0 0 0 0 9.200L6.400 14Z"/><path fill="#EA4335" d="M12 5.900c1.500 0 2.800.5 3.800 1.500l2.800-2.800A10 10 0 0 0 3.100 7.400L6.400 10c.8-2.400 3-4.100 5.600-4.100Z"/></svg>';

  /* ---------- artwork ---------- */
  SJ.logoLight = function (s) { s = s || 28; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="26" fill="#F2EDE4"/><path d="M50 82 L50 26" stroke="#22302A" stroke-width="10" stroke-linecap="round"/><path d="M53 50 C 53 39 62 31 76 30 C 77 43 65 51 53 50 Z" fill="#22302A"/><path d="M47 62 C 47 51 38 43 24 42 C 23 55 35 63 47 62 Z" fill="#5FA877"/></svg>'; };
  SJ.logo = function (s) { s = s || 28; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="26" fill="#22302A"/><path d="M50 82 L50 26" stroke="#F2EDE4" stroke-width="10" stroke-linecap="round"/><path d="M53 50 C 53 39 62 31 76 30 C 77 43 65 51 53 50 Z" fill="#F2EDE4"/><path d="M47 62 C 47 51 38 43 24 42 C 23 55 35 63 47 62 Z" fill="#5FA877"/></svg>'; };

  var ROOTS = ['M60 104 C 60 112 57 118 52 124', 'M60 104 C 60 112 64 118 68 125', 'M60 104 C 56 110 48 113 41 118', 'M60 104 C 64 110 72 113 80 118', 'M60 104 C 59 114 60 122 60 129', 'M60 104 C 54 108 44 108 36 111', 'M60 104 C 66 108 76 108 85 111', 'M57 110 C 53 116 47 120 44 127', 'M63 110 C 67 116 73 120 77 127', 'M50 112 C 45 115 38 117 33 122', 'M70 112 C 75 115 82 117 87 122', 'M60 118 C 57 122 54 125 52 130'];

  /* The plant in the jar. p: 0..1 progress. roots: one for each talk. It never shrinks or wilts. */
  SJ.plant = function (p, roots, opts) {
    /* Bisma's chosen jar: her leaves and roots, slim glass with a little depth, soil lowered. The lid stays on until the plant outgrows it at 100%. */
    opts = opts || {};
    var w = opts.w || 104, anim = !!opts.anim, full = p >= 1;
    var PAIRS = [[296, 306, -10, -6, .68], [242, 252, -14, -10, .82], [188, 198, -18, -14, .92], [134, 144, -24, -20, .88], [78, 88, -36, -30, .72]], TOPS = [286, 232, 178, 124, 48];
    var LEAF = 'M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z', ROOT3 = ['M220 326 L220 412', 'M220 326 C 204 346 193 368 188 406', 'M220 326 C 236 346 247 368 252 406'];
    var n = full ? 5 : p <= 0 ? 0 : Math.max(1, Math.min(3, Math.ceil(p * 3))), top = n ? TOPS[n - 1] : 312, rc = Math.min(Math.ceil(roots || 0), 3), leaves = '', rts = '', u = 'p' + Math.round(Math.random() * 1e7);
    for (var i = 0; i < n; i++) {
      var q = PAIRS[i];
      leaves += '<g class="' + (anim ? 'gr-leaf r' : '') + '" style="animation-delay:' + (.3 + i * .12).toFixed(2) + 's"><g transform="translate(226,' + q[0] + ') rotate(' + q[2] + ') scale(' + q[4] + ')"><path d="' + LEAF + '" fill="#6FBF88"/></g></g>' +
        '<g class="' + (anim ? 'gr-leaf l' : '') + '" style="animation-delay:' + (.36 + i * .12).toFixed(2) + 's"><g transform="translate(214,' + q[1] + ') scale(-1,1) rotate(' + q[3] + ') scale(' + q[4] + ')"><path d="' + LEAF + '" fill="#92D3A3"/></g></g>';
    }
    for (var r = 0; r < rc; r++) rts += '<path class="' + (anim ? 'gr-root' : '') + '" style="' + (anim ? 'stroke-dasharray:128;stroke-dashoffset:128;' : '') + 'animation-delay:' + (.1 + r * .08).toFixed(2) + 's" d="' + ROOT3[r] + '" fill="none" stroke="#7A6248" stroke-width="6" stroke-linecap="round"/>';
    var d = opts.d == null ? 1 : opts.d, jw = opts.jw || 190, jx = 220 - jw / 2, vw = jw + 132, vy = full ? 10 : 90, vh = 440 - vy, label = 'A plant in a jar. ' + Math.round(p * 100) + ' percent grown' + (full ? ', and it has outgrown the jar.' : '.');
    var stem = n || opts.seed ? '<path class="' + (anim ? 'gr-stem' : '') + '" style="--len:' + (324 - top) + '" d="M220 324 L220 ' + top + '" fill="none" stroke="#5FA877" stroke-width="12" stroke-linecap="round"/>' : '';
    return '<svg class="plant" role="img" aria-label="' + label + '" width="' + w + '" height="' + Math.round(w * vh / vw) + '" viewBox="' + (220 - vw / 2) + ' ' + vy + ' ' + vw + ' ' + vh + '" style="overflow:visible">' +
      '<defs><radialGradient id="' + u + 'h"><stop offset="0" stop-color="' + (opts.dark ? '#5FA877' : '#F6D9A4') + '" stop-opacity="' + (opts.dark ? '.24' : '.62') + '"/><stop offset="1" stop-color="' + (opts.dark ? '#5FA877' : '#F6D9A4') + '" stop-opacity="0"/></radialGradient></defs>' +
      (opts.glow ? '<circle cx="220" cy="270" r="210" fill="url(#' + u + 'h)"/>' : '') +
      SJ.jarBody(jw, d) + rts +
      (full ? '' : SJ.jarLid(jw, '', d)) +
      '<g class="' + (opts.sway ? 'sway' : '') + '">' + stem + leaves + '</g>' +
      (opts.spark ? '<g fill="#E8A94B"><circle class="spark" style="animation-delay:.9s" cx="146" cy="78" r="6"/><circle class="spark" style="animation-delay:1.05s" cx="306" cy="54" r="7"/><circle class="spark" style="animation-delay:1.2s" cx="266" cy="20" r="5"/></g>' : '') + '</svg>';
  };
  /* d: 0 flat (Bisma's drawing), 1 a tad of depth, 2 more. Depth is only on the glass, soil surface and lid. The plant stays flat. */
  SJ.jarBody = function (jw, d, warm) {
    d = d || 0; var x = 220 - jw / 2, r = x + jw - 3, l = x + 3, cx = 220, rx = jw / 2 - 3;
    var o = d ? '<ellipse cx="220" cy="436" rx="' + (jw / 2 + 12) + '" ry="9" fill="#22302a22"/>' : '';
    o += '<rect x="' + x + '" y="132" width="' + jw + '" height="300" rx="34" fill="' + (warm ? 'url(#jgw)' : d ? 'url(#jg' + d + ')' : '#FDFCF8') + '" stroke="' + (warm ? '#E2D3B4' : '#C8DACB') + '" stroke-width="3"/>';
    if (warm === 3) o += '<ellipse cx="' + (x + jw * .36) + '" cy="205" rx="' + (jw * .3) + '" ry="62" fill="#F7D89B" opacity=".42"/>';
    o += '<path d="M' + l + ' 324 H' + r + ' V398 C' + r + ' 416 ' + (r - 14) + ' 430 ' + (r - 32) + ' 430 H' + (l + 32) + ' C' + (l + 14) + ' 430 ' + l + ' 416 ' + l + ' 398 Z" fill="' + (warm ? '#C3935F' : d === 2 ? 'url(#js)' : '#B98F63') + '"/>';
    if (d) o += '<ellipse cx="' + cx + '" cy="324" rx="' + rx + '" ry="' + (d === 2 ? 10 : 7) + '" fill="' + (warm ? '#DBB17F' : '#C9A077') + '"/><rect x="' + (x + 13) + '" y="154" width="9" height="' + (d === 2 ? 120 : 92) + '" rx="4.500" fill="#ffffff" opacity=".95"/>';
    if (d === 2) o += '<rect x="' + (r - 16) + '" y="170" width="5" height="58" rx="2.500" fill="#ffffff" opacity=".8"/><rect x="' + (x + 13) + '" y="330" width="7" height="60" rx="3.500" fill="#ffffff" opacity=".18"/>';
    return o;
  };
  SJ.jarLid = function (jw, id, d, warm) {
    d = d || 0; var lx = 212 - jw / 2, lw = jw + 16;
    var neck = d ? '<rect x="' + (lx + 12) + '" y="126" width="' + (lw - 24) + '" height="10" fill="' + (warm > 1 ? '#B8956A' : '#b3cab7') + '"/>' : '';
    var shine = d ? '<rect x="' + (lx + 12) + '" y="104" width="' + (lw * .45) + '" height="5" rx="2.500" fill="#ffffff" opacity=".7"/>' : '';
    return neck + '<rect ' + id + 'x="' + lx + '" y="98" width="' + lw + '" height="34" rx="17" fill="' + (warm > 1 ? 'url(#jlc)' : d ? 'url(#jl)' : '#CDDCCD') + '"/>' + shine;
  };
  /* Bisma's own growth animation, unchanged except for its background and caption colour. Plays once per render. */
  SJ.growth = function (mw) { return '<div class="sj8-stage play" id="sj8-stage" style="max-width:' + (mw || 280) + 'px;margin:0 auto">' + SJ.GROWTH_SVG + '</div>'; };
  SJ.GROWTH_SVG = "<svg viewBox=\"0 0 440 580\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"A sprout with round chunky leaves growing in bouncy spurts inside a tall glass jar, tipping the lid off and springing into place\">\n      <g transform=\"translate(0,78)\">\n        <g id=\"sj8-jar\"><ellipse cx=\"220\" cy=\"436\" rx=\"107\" ry=\"9\" fill=\"#22302a22\"/><rect x=\"125\" y=\"132\" width=\"190\" height=\"300\" rx=\"34\" fill=\"url(#jg1)\" stroke=\"#C8DACB\" stroke-width=\"3\"/><path d=\"M128 324 H312 V398 C312 416 298 430 280 430 H160 C142 430 128 416 128 398 Z\" fill=\"#B98F63\"/><ellipse cx=\"220\" cy=\"324\" rx=\"92\" ry=\"7\" fill=\"#C9A077\"/><rect x=\"138\" y=\"154\" width=\"9\" height=\"92\" rx=\"4.500\" fill=\"#ffffff\" opacity=\".95\"/></g>\n\n        <path class=\"sj8-root sj8-r1\" d=\"M220 326 L220 412\" fill=\"none\" stroke=\"#7A6248\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n        <path class=\"sj8-root sj8-r2\" d=\"M220 326 C 204 346 193 368 188 406\" fill=\"none\" stroke=\"#7A6248\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n        <path class=\"sj8-root sj8-r3\" d=\"M220 326 C 236 346 247 368 252 406\" fill=\"none\" stroke=\"#7A6248\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n\n        <rect id=\"sj8-lid\" x=\"117\" y=\"98\" width=\"206\" height=\"34\" rx=\"17\" fill=\"url(#jl)\"/>\n\n        <g id=\"sj8-plant\">\n          <path id=\"sj8-stem\" d=\"M220 324 L220 48\" fill=\"none\" stroke=\"#5FA877\" stroke-width=\"12\" stroke-linecap=\"round\"/>\n\n          <g class=\"sj8-leaf sj8-leafR sj8-p1a\"><g transform=\"translate(226,296) rotate(-10) scale(0.68)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#6FBF88\"/></g></g>\n          <g class=\"sj8-leaf sj8-leafL sj8-p1b\"><g transform=\"translate(214,306) scale(-1,1) rotate(-6) scale(0.68)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#92D3A3\"/></g></g>\n\n          <g class=\"sj8-leaf sj8-leafR sj8-p2a\"><g transform=\"translate(226,242) rotate(-14) scale(0.82)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#6FBF88\"/></g></g>\n          <g class=\"sj8-leaf sj8-leafL sj8-p2b\"><g transform=\"translate(214,252) scale(-1,1) rotate(-10) scale(0.82)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#92D3A3\"/></g></g>\n\n          <g class=\"sj8-leaf sj8-leafR sj8-p3a\"><g transform=\"translate(226,188) rotate(-18) scale(0.92)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#6FBF88\"/></g></g>\n          <g class=\"sj8-leaf sj8-leafL sj8-p3b\"><g transform=\"translate(214,198) scale(-1,1) rotate(-14) scale(0.92)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#92D3A3\"/></g></g>\n\n          <g class=\"sj8-leaf sj8-leafR sj8-p4a\"><g transform=\"translate(226,134) rotate(-24) scale(0.88)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#6FBF88\"/></g></g>\n          <g class=\"sj8-leaf sj8-leafL sj8-p4b\"><g transform=\"translate(214,144) scale(-1,1) rotate(-20) scale(0.88)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#92D3A3\"/></g></g>\n\n          <g class=\"sj8-leaf sj8-leafR sj8-p5a\"><g transform=\"translate(226,78) rotate(-36) scale(0.72)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#6FBF88\"/></g></g>\n          <g class=\"sj8-leaf sj8-leafL sj8-p5b\"><g transform=\"translate(214,88) scale(-1,1) rotate(-30) scale(0.72)\"><path d=\"M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z\" fill=\"#92D3A3\"/></g></g>\n        </g>\n\n        <circle class=\"sj8-spark sj8-s1\" cx=\"146\" cy=\"78\" r=\"6\" fill=\"#E8A94B\"/>\n        <circle class=\"sj8-spark sj8-s2\" cx=\"306\" cy=\"54\" r=\"7\" fill=\"#E8A94B\"/>\n        <circle class=\"sj8-spark sj8-s3\" cx=\"266\" cy=\"20\" r=\"5\" fill=\"#E8A94B\"/>\n\n        <text id=\"sj8-cap\" x=\"220\" y=\"474\" text-anchor=\"middle\" font-family=\"var(--font)\" font-size=\"17\" fill=\"#f2ede4cc\">outgrown the jar</text>\n      </g>\n    </svg>";

  /* The savings jar, exact geometry from the live app. */
  SJ.jar = function (pct, w) {
    var l = Math.max(0, Math.min(100, pct)), i = 66 * l / 100, r = 92 - i, o = l >= 100 ? 3 : l >= 50 ? 2 : l > 0 ? 1 : 0, uid = 'j' + Math.round(Math.random() * 1e6);
    var body = 'M10 26 h44 v54 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z';
    return '<svg width="' + (w || 48) + '" viewBox="0 0 64 100" role="img" aria-label="A jar, ' + Math.round(l) + ' percent full"><defs><clipPath id="' + uid + '"><path d="' + body + '"/></clipPath></defs><rect x="8" y="14" width="48" height="10" rx="5" fill="#DED6C8"/><g clip-path="url(#' + uid + ')"><rect x="10" y="26" width="44" height="66" fill="#FDFCF8"/><rect x="10" y="' + r + '" width="44" height="' + (i + 2) + '" fill="#92D3A3"/>' + (l > 0 ? '<ellipse cx="32" cy="' + r + '" rx="22" ry="3" fill="#5FA877"/>' : '') + '</g><path d="' + body + '" fill="none" stroke="#DED6C8" stroke-width="3"/>' + (o > 0 ? '<path d="M32 26 L32 10" stroke="#3D7A55" stroke-width="3" stroke-linecap="round"/><path d="M33 14 C 33 8 39 4 47 4 C 47 12 41 16 33 14 Z" fill="#5FA877"/>' : '') + (o > 1 ? '<path d="M31 20 C 31 14 25 10 17 10 C 17 18 23 22 31 20 Z" fill="#92D3A3"/>' : '') + (o > 2 ? '<circle cx="32" cy="4" r="3.500" fill="#E8A94B"/>' : '') + '</svg>';
  };
  SJ.orb = function (cls, size) { return '<div class="orb ' + (cls || '') + '" style="--s:' + (size || 56) + 'px" aria-hidden="true"></div>'; };
  SJ.waveBars = function (on) { return '<div class="wave ' + (on ? '' : 'off') + '" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'; };

  /* ---------- fields ---------- */
  SJ.get = function (path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, SJ.S); };
  SJ.set = function (path, v) { var ks = path.split('.'), o = SJ.S; ks.slice(0, -1).forEach(function (k) { o = o[k]; }); o[ks[ks.length - 1]] = v; };
  SJ.field = function (o) {
    var v = o.value != null ? o.value : (o.bind ? SJ.get(o.bind) : '');
    var attrs = (o.bind ? ' data-bind="' + o.bind + '"' : '') + (o.rr ? ' data-rr="1"' : '') + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : ' autocomplete="off"');
    var ctl = o.area ? '<textarea rows="' + (o.area === true ? 3 : o.area) + '"' + attrs + '>' + esc(v) + '</textarea>'
      : '<input type="' + (o.type || 'text') + '"' + (o.num ? ' inputmode="decimal"' : '') + attrs + ' value="' + esc(v) + '">';
    return '<label class="f' + (o.err ? ' bad' : '') + '"><span class="t">' + esc(o.label) + '</span><span class="inp">' + (o.pre ? '<span class="pre">' + esc(o.pre) + '</span>' : '') + ctl + (o.post ? '<span class="pre">' + esc(o.post) + '</span>' : '') + '</span>' +
      (o.err ? '<span class="err" role="alert">' + esc(o.err) + '</span>' : '') + (o.hint ? '<span class="hint">' + esc(o.hint) + '</span>' : '') + '</label>';
  };
  SJ.toggle = function (act, arg, on, title, small) {
    return '<button class="toggle" role="switch" aria-checked="' + !!on + '" data-act="' + act + '" data-arg="' + arg + '"><span class="grow"><b style="font-weight:700">' + esc(title) + '</b>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</span><span class="sw" aria-hidden="true"></span></button>';
  };

  /* ---------- screen frames ---------- */
  SJ.demoBanner = function () { return SJ.S.demo ? '<div class="banner"><span>You are looking at Layla, the demo. Nothing here can be changed.</span><button data-act="exitDemo">Start mine</button></div>' : ''; };
  SJ.tabs = function (cur) {
    var t = [['today', 'Today', 'sun'], ['ren', 'Ren', 'mic'], ['plan', 'Plan', 'map'], ['you', 'You', 'person']];
    return '<nav class="tabs" aria-label="Main">' + t.map(function (x) { return '<button class="tab" data-go="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : '') + '>' + SJ.icon(x[2], 23) + x[1] + '</button>'; }).join('') + '</nav>';
  };
  SJ.app = function (o) {
    return '<div class="scr has-tabs' + (o.darkTop ? ' top-dark' : '') + '">' + '<header class="hdr"><div class="logo">' + (o.darkTop ? SJ.logoLight() : SJ.logo()) + 'sproutjar</div><div class="who">' + esc(SJ.S.name) + '</div></header>' + SJ.demoBanner() +
      '<main class="body stack enter"><h1 class="sr" tabindex="-1">' + esc(o.h1) + '</h1>' + o.body + '</main>' + SJ.tabs(o.tab) + '</div>';
  };
  SJ.sub = function (o) {
    return '<div class="scr' + (o.dark ? ' dark' : '') + '"><header class="sub-hdr">' + (o.back ? '<button class="iconbtn" aria-label="Back" data-go="' + o.back + '">' + SJ.icon('back') + '</button>' : '<span style="width:12px"></span>') + '<h1 tabindex="-1">' + esc(o.title) + '</h1></header>' + (o.bar || '') +
      '<main class="body ' + (o.tight ? 'stack' : 'stack-lg') + ' enter">' + o.body + '</main>' + (o.foot ? '<div class="foot">' + o.foot + '</div>' : '') + '</div>';
  };
  SJ.bare = function (o) {
    return '<div class="scr' + (o.dark ? ' dark' : '') + '"><main class="body enter" style="display:flex;flex-direction:column;' + (o.center ? 'justify-content:center;' : '') + 'padding-top:24px">' + o.body + '</main>' + (o.foot ? '<div class="foot">' + o.foot + '</div>' : '') + '</div>';
  };
  SJ.go1 = function (id, label, cls) { return '<button class="btn ' + (cls || 'btn-1') + '" data-go="' + id + '">' + label + '</button>'; };
  SJ.act1 = function (a, label, cls, arg) { return '<button class="btn ' + (cls || 'btn-1') + '" data-act="' + a + '"' + (arg != null ? ' data-arg="' + esc(arg) + '"' : '') + '>' + label + '</button>'; };

  /* ---------- engine ---------- */
  var root, sheetHost;
  SJ.screen = function (id, def) { def.id = id; SJ.screens[id] = def; };
  SJ.later = function (fn, ms) { var t = setTimeout(fn, ms); SJ.timers.push(t); return t; };
  SJ.clearTimers = function () { SJ.timers.forEach(clearTimeout); SJ.timers = []; };
  SJ.toast = function (msg) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
    document.getElementById('phone').appendChild(el); setTimeout(function () { el.remove(); }, 3200);
  };
  /* The public demo can look, never change. */
  SJ.guard = function () { if (SJ.S.demo) { SJ.toast('This is the demo, so nothing changes. Start your own plan to use this.'); return true; } return false; };

  SJ.render = function (nav) {
    var sc = SJ.screens[SJ.cur] || SJ.screens.notfound;
    var bodyEl = root.querySelector('.body'), top = bodyEl ? bodyEl.scrollTop : 0, act = document.activeElement, key = null, sel = null;
    if (!nav && act && act.getAttribute) {
      if (act.getAttribute('data-bind')) { key = '[data-bind="' + act.getAttribute('data-bind') + '"]'; try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) {} }
      else if (act.getAttribute('data-act')) { key = '[data-act="' + act.getAttribute('data-act') + '"]' + (act.getAttribute('data-arg') != null ? '[data-arg="' + act.getAttribute('data-arg').replace(/"/g, '\\"') + '"]' : ''); }
    }
    root.innerHTML = sc.render();
    if (!nav) root.querySelectorAll('.enter').forEach(function (e) { e.classList.remove('enter'); });
    document.title = (sc.title || 'Sproutjar') + ' · Sproutjar';
    var b2 = root.querySelector('.body');
    if (nav) { var h = root.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } if (b2) b2.scrollTop = 0; }
    else {
      if (b2) b2.scrollTop = top;
      if (key) { var again = root.querySelector(key); if (again) { again.focus({ preventScroll: true }); if (sel && again.setSelectionRange && sel[0] != null) { try { again.setSelectionRange(sel[0], sel[1]); } catch (e) {} } } }
    }
    SJ.renderSheet();
    if (SJ.renderPanels) SJ.renderPanels();
    /* Past phone width the page simply takes on the screen's own background, so there is no box around the app. */
    document.body.classList.toggle('bg-dark', !!root.querySelector('.scr.dark'));
    document.body.classList.toggle('wide', SJ.cur === 'landing');
    if (SJ.livePlace) SJ.livePlace();
    if (nav && sc.after) sc.after();
  };
  SJ.go = function (id) {
    SJ.clearTimers(); SJ.sheet = null;
    if (location.hash.slice(1) !== id) { SJ._internal = true; location.hash = id; }
    SJ.cur = id; SJ.render(true);
  };
  SJ.load = function (name) { SJ.S = D.scenarios[name](); };
  /* Jumping from the screen map: seed the state a screen needs. */
  SJ.jump = function (id, scn) {
    var sc = SJ.screens[id] || {};
    var need = scn || sc.need;
    if (need && SJ.S.scn !== need) SJ.load(need);
    else if (sc.app && !SJ.S.signedIn) SJ.load('layla');
    SJ.go(id);
  };
  SJ.openSheet = function (name, arg) { SJ.sheet = { name: name, arg: arg }; SJ.renderSheet(true); };
  SJ.closeSheet = function () { SJ.sheet = null; SJ.renderSheet(); };
  SJ.sheets = {};
  SJ.renderSheet = function (focus) {
    var host = document.getElementById('sheethost');
    root.inert = !!SJ.sheet;
    if (!SJ.sheet) { host.innerHTML = ''; return; }
    var def = SJ.sheets[SJ.sheet.name]; if (!def) return;
    var act = document.activeElement, bind = act && act.getAttribute && act.getAttribute('data-bind'), sel = null;
    if (bind) { try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) {} }
    var keep = host.querySelector('.sheet'), top = keep ? keep.scrollTop : 0;
    host.innerHTML = '<div class="scrim" data-act="scrim"' + (keep ? ' style="animation:none"' : '') + '><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(def.title || '') + '" tabindex="-1"' + (keep ? ' style="animation:none"' : '') + '><div class="grab"></div>' + def.render(SJ.sheet.arg) + '</div></div>';
    var sh = host.querySelector('.sheet'); sh.scrollTop = top;
    if (bind) { var a = host.querySelector('[data-bind="' + bind + '"]'); if (a) { a.focus({ preventScroll: true }); if (sel && a.setSelectionRange) { try { a.setSelectionRange(sel[0], sel[1]); } catch (e) {} } } }
    else if (focus) sh.focus({ preventScroll: true });
  };

  function onClick(e) {
    var t = e.target;
    if (t.classList && t.classList.contains('scrim')) { SJ.closeSheet(); return; }
    var el = t.closest && t.closest('[data-go],[data-act],[data-jump]');
    if (!el) return;
    if (el.hasAttribute('data-jump')) { SJ.closeMap && SJ.closeMap(); SJ.jump(el.getAttribute('data-jump'), el.getAttribute('data-scn') || null); return; }
    if (el.hasAttribute('data-go')) { e.preventDefault(); SJ.go(el.getAttribute('data-go')); return; }
    var a = el.getAttribute('data-act');
    if (a === 'scrim') return;
    if (SJ.A[a]) { if (el.tagName !== 'INPUT') e.preventDefault(); SJ.A[a](el.getAttribute('data-arg'), el, e); }
  }
  function onInput(e) {
    var el = e.target, b = el.getAttribute && el.getAttribute('data-bind');
    if (!b) return;
    SJ.set(b, el.type === 'checkbox' ? el.checked : el.value);
    if (el.hasAttribute('data-rr')) { SJ.render(false); }
  }

  SJ.start = function () {
    root = document.getElementById('root');
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', function (e) { e.preventDefault(); var a = e.target.getAttribute('data-form'); if (a && SJ.A[a]) SJ.A[a](); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (SJ.sheet) SJ.closeSheet(); else if (SJ.closeMap) SJ.closeMap(); } });
    window.addEventListener('hashchange', function () {
      if (SJ._internal) { SJ._internal = false; return; }
      route();
    });
    function route() {
      var h = location.hash.slice(1) || 'landing';
      if (h === 'handoff') { SJ.renderHandoff(); return; }
      var ho = document.getElementById('handoff'); if (ho.style.display !== 'none') { ho.style.display = 'none'; document.getElementById('stage').style.display = ''; }
      SJ.jump(h);
    }
    route();
  };
})();
