/* Lottie animations, built as plain objects so they also work when the page is opened from disk.
   Layer class names (cl) let CSS recolour the shapes for light and dark themes. */
(function () {
  'use strict';
  var FR = 30, OP = 120;
  var INK3 = [0.373, 0.416, 0.51, 1], PAPER = [1, 1, 1, 1], NAVY = [0.078, 0.125, 0.227, 1], GILT = [0.788, 0.612, 0.271, 1];
  var EASE_OUT = { i: { x: [0.25], y: [1] }, o: { x: [0.55], y: [0] } };

  function st(v) { return { a: 0, k: v }; }
  function kf(frames) {
    /* frames: [[t, value], ...]; value is an array. Easing is a soft decelerate. */
    return {
      a: 1,
      k: frames.map(function (f, i) {
        var k = { t: f[0], s: f[1] };
        if (i < frames.length - 1) {
          var n = f[1].length;
          k.i = { x: Array(n).fill(0.25), y: Array(n).fill(1) };
          k.o = { x: Array(n).fill(0.55), y: Array(n).fill(0) };
        }
        return k;
      })
    };
  }
  function posKf(frames) {
    return {
      a: 1,
      k: frames.map(function (f, i) {
        var k = { t: f[0], s: f[1] };
        if (i < frames.length - 1) { k.i = { x: 0.25, y: 1 }; k.o = { x: 0.55, y: 0 }; k.to = [0, 0, 0]; k.ti = [0, 0, 0]; }
        return k;
      })
    };
  }
  function tr() {
    return { ty: 'tr', p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0), nm: 'Transform' };
  }
  function fill(c) { return { ty: 'fl', c: st(c), o: st(100), r: 1, nm: 'Fill' }; }
  function stroke(c, w) { return { ty: 'st', c: st(c), o: st(100), w: st(w), lc: 2, lj: 2, nm: 'Stroke' }; }
  function path(points, closed) {
    var z = points.map(function () { return [0, 0]; });
    return { ty: 'sh', d: 1, ks: st({ i: z, o: z, v: points, c: closed }), nm: 'Path' };
  }
  function layer(ind, name, cls, ks, items) {
    return {
      ddd: 0, ind: ind, ty: 4, nm: name, cl: cls, sr: 1, ao: 0, ip: 0, op: OP, st: 0, bm: 0,
      ks: {
        o: ks.o || st(100),
        r: ks.r || st(0),
        p: ks.p || st([0, 0, 0]),
        a: st([0, 0, 0]),
        s: ks.s || st([100, 100, 100])
      },
      shapes: [{ ty: 'gr', it: items.concat([tr()]), nm: 'Group' }]
    };
  }
  function paper(ind, x, delay, tilt) {
    var t0 = delay, t1 = delay + 40;
    return layer(ind, 'Paper ' + ind, 'lt-paper', {
      p: posKf([[t0, [x, -50, 0]], [t1, [x < 160 ? x + 30 : x > 160 ? x - 30 : x, 150, 0]]]),
      r: kf([[t0, [tilt]], [t1, [0]]]),
      o: kf([[t0, [0]], [t0 + 8, [100]], [t1 - 6, [100]], [t1 + 4, [0]]])
    }, [
      { ty: 'rc', d: 1, s: st([54, 68]), p: st([0, 0]), r: st(5), nm: 'Sheet' },
      stroke(INK3, 2),
      fill(PAPER)
    ]);
  }

  var rim = layer(1, 'Rim', 'lt-rim', {}, [path([[48, 128], [272, 128]], false), stroke(GILT, 4)]);
  var funnel = layer(2, 'Funnel', 'lt-funnel', {}, [path([[48, 128], [272, 128], [192, 220], [192, 272], [128, 294], [128, 220]], true), fill(NAVY)]);
  var drop = layer(3, 'Drop', 'lt-drop', {
    p: posKf([[0, [160, 284, 0]], [64, [160, 284, 0]], [84, [160, 303, 0]]]),
    s: kf([[0, [0, 0, 100]], [64, [0, 0, 100]], [80, [100, 100, 100]], [108, [100, 100, 100]], [118, [0, 0, 100]]])
  }, [{ ty: 'el', d: 1, s: st([18, 18]), p: st([0, 0]), nm: 'Dot' }, fill(GILT)]);

  window.LR_LOTTIE = {
    funnel: {
      v: '5.7.4', fr: FR, ip: 0, op: OP, w: 320, h: 320, nm: 'Literature funnel', ddd: 0, assets: [],
      layers: [rim, funnel, drop, paper(4, 85, 0, -16), paper(5, 160, 14, 6), paper(6, 235, 28, 14)]
    }
  };
})();
