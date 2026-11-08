/* Ren's living visual. One WebGL canvas that moves between screens, so it never restarts mid-call.
   Looks to compare. In the real build, replace simulatedLevel() with the voice SDK's live output and
   input volume, so the visual follows the actual sound. */
(function () {
  var SJ = window.SJ, esc = SJ.esc;
  SJ.look = 'glow';
  SJ.LOOKS = {
    glow: { k: 0, name: 'Living gradient', idea: 'A slow, liquid gradient in your greens, with amber running through it. Ren speaking makes it swell and flow faster. When you speak it turns warmer and draws in.' },
    rise: { k: 2, bg: true, name: 'Rising light', idea: 'No object at all. The whole screen is the call: light rises out of the ground when Ren speaks and sinks back to warm soil when you do. Ren\'s words become the hero.' },
    aurora: { k: 1, bg: true, name: 'Northern lights', idea: 'Soft ribbons of green and a little amber drift across the whole space. Ren speaking makes them lift and brighten. When you speak they settle low and turn warmer. Nothing has an edge.' },
    halo: { k: 3, bg: true, name: 'Breathing halo', idea: 'A large ring of light with a calm, dark centre, so there is room for words inside it. It opens and glows when Ren speaks, and draws in and warms when you do.' }
  };

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
    'uniform vec2 r;uniform float t,a,m,k;',
    /* Own smoothstep: the built-in is undefined when the edges are reversed, and some phone GPUs really do differ. */
    'float S(float e0,float e1,float x){float v=clamp((x-e0)/(e1-e0),0.,1.);return v*v*(3.-2.*v);}',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,w=.5;for(int i=0;i<3;i++){v+=w*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;w*=.5;}return v/.875;}',
    /* Living gradient: bands of colour folded by sine waves, so it stays silky at any size and is cheap on a phone. */
    'vec4 orb(vec2 uv){float d=length(uv),an=atan(uv.y,uv.x);',
    ' float R=.72+.055*a*m-.025*(1.-m)*a+.008*sin(an*2.+t*.7)*(1.+2.*a);',
    ' vec2 p=uv/R;float l=length(p),z=sqrt(max(0.,1.-min(l*l,1.)));',
    ' vec2 q=p*(1.25+.25*(1.-z));float w=.9+.45*a;',
    ' for(int i=0;i<4;i++){float fi=float(i);q+=.42*w*vec2(sin(q.y*1.9+t*.42+fi*1.7),cos(q.x*1.7-t*.36+fi*2.3));}',
    ' float f=.5+.5*sin(q.x*1.15+q.y*.85+t*.22),g=.5+.5*sin(q.x*.8-q.y*1.25-t*.18+2.1);',
    ' vec3 c=mix(vec3(.10,.27,.19),vec3(.22,.50,.34),S(0.,.38,f));c=mix(c,vec3(.50,.82,.60),S(.32,.72,f));c=mix(c,vec3(.80,.95,.84),S(.80,1.,f));',
    ' c=mix(c,vec3(.95,.72,.38),S(.90,1.,g)*(.62-.26*m));',
    ' c*=.78+.32*z;c+=.06*a;c+=pow(1.-z,2.5)*vec3(.40,.72,.52)*(.45+.4*a);',
    ' float al=S(1.,.975,l),e=exp(-max(d-R,0.)*8.)*(.30+.5*a)*(1.-al)*S(1.,.80,d);',
    ' return vec4(c*al+vec3(.45,.78,.55)*e,al+e);}',
    /* Rising light: stays in the lower half at its loudest, so words above it keep their contrast. */
    'vec4 rise(){vec2 v=gl_FragCoord.xy/r;float x=v.x*r.x/r.y,y=v.y;',
    ' float n1=fbm(vec2(x*1.6+t*.08,y*1.3-t*.22)),n2=fbm(vec2(x*3.+n1*1.5,y*2.2-t*.35));',
    ' float top=.12+m*(.14+.20*a)+.06*a+(n1-.5)*.2;float l=S(top+.26,top-.16,y),inner=S(top-.04,top-.40,y);',
    ' vec3 c=mix(vec3(.133,.188,.165),vec3(.133,.188,.165),y);c=mix(c,vec3(.17,.36,.26),l);c=mix(c,vec3(.33,.62,.44),inner*.62);',
    ' c=mix(c,vec3(.72,.50,.28),S(.15,0.,y)*(.8-.5*m));c+=pow(n2,2.)*l*vec3(.14,.24,.18);',
    ' return vec4(c,1.);}',
    /* Northern lights: three soft ribbons, kept below the words at their loudest. */
    'vec4 aur(){vec2 v=gl_FragCoord.xy/r;float x=v.x*r.x/min(r.x,r.y),y=v.y;vec3 c=vec3(.133,.188,.165);',
    ' for(int i=0;i<3;i++){float fi=float(i);float cy=.50+.12*fi+m*(.02+.06*a)+.055*sin(x*1.5+t*.26+fi*2.1)+.028*sin(x*3.3-t*.42+fi);',
    '  float w=.11+.05*fi+.05*a;float b=exp(-pow((y-cy)/w,2.));float tex=.62+.5*fbm(vec2(x*2.2+t*.14+fi*3.,y*3.-t*.2));',
    '  vec3 col=fi<.5?vec3(.20,.50,.34):fi<1.5?vec3(.42,.78,.55):mix(vec3(.72,.92,.78),vec3(.95,.72,.38),.55*(1.-m)+.2);',
    '  c+=col*b*tex*(.36+.34*a);}',
    ' return vec4(c,1.);}',
    /* Breathing halo: a soft ring with a dark centre for words. */
    'vec4 hal(){vec2 uv=(gl_FragCoord.xy*2.-r)/min(r.x,r.y);uv.y-=.28;float d=length(uv),an=atan(uv.y,uv.x);',
    ' float R=.60+.09*a*m-.05*(1.-m)*a+.018*sin(an*3.+t*.4)+.012*sin(an*5.-t*.3);float wd=.085+.07*a;float ring=exp(-pow((d-R)/wd,2.));',
    ' float out2=exp(-max(d-R,0.)*3.2)*.20*S(R-.08,R+.04,d),in2=exp(-max(R-d,0.)*6.)*.14;float f=.5+.5*sin(an*2.+t*.32+fbm(uv*1.4+t*.1)*3.);float g=.5+.5*sin(an*1.-t*.21+1.7);',
    ' vec3 col=mix(vec3(.24,.56,.38),vec3(.70,.93,.77),f);col=mix(col,vec3(.95,.72,.38),S(.72,1.,g)*(.70-.34*m));',
    ' vec3 c=vec3(.133,.188,.165)+col*(ring*(.50+.30*a)+out2+in2);return vec4(c,1.);}',
    'void main(){vec2 uv=(gl_FragCoord.xy*2.-r)/min(r.x,r.y);gl_FragColor=k<.5?orb(uv):k<1.5?aur():k<2.5?rise():hal();}'
  ].join('\n');

  var cv, gl, U, tried = false, host = null, raf = 0, last = 0, phase = 0, amp = 0, moodV = .3;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function compile(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
  function setup() {
    if (tried) return !!gl; tried = true;
    cv = document.createElement('canvas'); cv.className = 'live-cv'; cv.setAttribute('aria-hidden', 'true');
    try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) return false;
    var v = compile(gl.VERTEX_SHADER, VERT), f = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) { gl = null; return false; }
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    U = { r: gl.getUniformLocation(pr, 'r'), t: gl.getUniformLocation(pr, 't'), a: gl.getUniformLocation(pr, 'a'), m: gl.getUniformLocation(pr, 'm'), k: gl.getUniformLocation(pr, 'k') };
    return true;
  }

  /* Stands in for the real voice level until there is real audio. */
  function simulatedLevel(mood, s) {
    if (mood === 'speak') { var gate = Math.sin(s * .55) > -.72 ? 1 : .12; return (.3 + .7 * Math.pow(Math.abs(Math.sin(s * 3.1) * Math.sin(s * 1.3 + 1)), .7)) * gate; }
    if (mood === 'listen') return .1 + .42 * Math.abs(Math.sin(s * 2.1) * Math.sin(s * .7));
    if (mood === 'think') return .14 + .05 * Math.sin(s * 1.5);
    return .07 + .04 * Math.sin(s * .8);
  }
  var MOOD = { speak: 1, think: .55, listen: 0, idle: .35 };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!host || !host.isConnected || document.hidden) return;
    var dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    var mood = host.getAttribute('data-mood') || 'idle', s = now / 1000;
    var target = still ? .15 : simulatedLevel(mood, s);
    amp += (target - amp) * .16; moodV += ((MOOD[mood] != null ? MOOD[mood] : .35) - moodV) * .05;
    phase += dt * (still ? .02 : (.55 + 1.5 * amp));
    host.style.setProperty('--amp', amp.toFixed(3));
    if (!gl) return;
    var par = cv.parentNode; if (!par) return;
    var look = SJ.LOOKS[SJ.look], scale = (look.bg ? .5 : 1) * Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round(par.clientWidth * scale), H = Math.round(par.clientHeight * scale);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
    gl.uniform2f(U.r, W, H); gl.uniform1f(U.t, phase * 2.2); gl.uniform1f(U.a, amp); gl.uniform1f(U.m, moodV); gl.uniform1f(U.k, look.k);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* Called after every render: finds this screen's spot and moves the canvas into it. */
  SJ.livePlace = function () {
    var h = document.querySelector('#root [data-live]');
    document.documentElement.setAttribute('data-look', SJ.look);
    if (!h) { host = null; if (cv && cv.parentNode) cv.parentNode.removeChild(cv); if (raf) { cancelAnimationFrame(raf); raf = 0; } return; }
    host = h;
    var ok = setup();
    if (ok) {
      if (SJ.LOOKS[SJ.look].bg) {
        var box = h.closest('.ren-hero') || h.closest('.scr'), bg = box.querySelector(':scope > .live-bg');
        if (!bg) { bg = document.createElement('div'); bg.className = 'live-bg'; box.insertBefore(bg, box.firstChild); box.classList.add('has-live-bg'); }
        bg.appendChild(cv);
      } else h.insertBefore(cv, h.firstChild);
    } else h.classList.add('nogl');
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };

  SJ.liveSpot = function (mood, size, leaves, popLast) {
    return '<div class="live-spot" style="--size:' + size + 'px"><div class="live" data-live data-mood="' + mood + '"><div class="live-fallback" aria-hidden="true"></div>' + '</div></div>';
  };
  SJ.lookPills = function () {
    return '<div class="lookpills" role="group" aria-label="Prototype: try a look for Ren"><span>Try</span>' + Object.keys(SJ.LOOKS).map(function (k) { return '<button aria-pressed="' + (SJ.look === k) + '" data-act="setLook" data-arg="' + k + '">' + esc(SJ.LOOKS[k].name) + '</button>'; }).join('') + '</div>';
  };
  SJ.A.setLook = function (k) { SJ.look = k; var old = document.querySelector('#root .live-bg'); if (old) old.remove(); if (cv && cv.parentNode) cv.parentNode.removeChild(cv); SJ.render(false); };
})();
