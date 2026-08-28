/**
 * THE WATER (ticket 23), part two, third build. The first build drew a 1D
 * line ("okay"). The second went GPU but kept the water an invisible ink
 * veil and pre-filled the tank ("fucking worse"). jass's directives after
 * seeing it, honored here in order:
 *
 *   - The tank NEVER starts full. The beat always plays: dry page, the 😔
 *     cries, drops splash, the water rises. /404#flood only shortens the
 *     fuse now; it pre-fills nothing.
 *   - The water has COLOUR. An aqua/cyan family, scheme-aware, deliberately
 *     a different hue from the site's lime so the accent stays reserved.
 *     Water is water — and water is blue.
 *   - The water REFRACTS the page. There is no way to sample the DOM from a
 *     shader, so this file draws a live replica of the page — every text
 *     run measured off the real DOM once per layout, the brainrot video
 *     blitted every frame — into a texture, and everything below the
 *     waterline is that replica bent through the heightfield: wobbling,
 *     lens-squeezed at the line, chromatic-fringed, lit by caustics. The
 *     surface band above the line reflects the page mirrored.
 *   - MAXIMUM PLAYABLE. The pointer disturbs the water anywhere inside it,
 *     wake strength scales with speed, fast drags throw spray, and a click
 *     in the water dumps a real splash.
 *   - THE TANK IS IN THE PHONE. On mobile the orientation sensor keeps the
 *     water level with the earth — tilt the phone and the waterline tilts
 *     against the screen, surging at the rising edge; shake it and the
 *     accelerometer churns the whole field. iOS asks permission on the
 *     first tap (a sensor gated behind a gesture is Apple's rule, not
 *     ours); denied just means the toy stays a pointer toy.
 *
 * The physics and the caustics are still vendored from Evan Wallace's
 * WebGL Water (https://madebyevan.com/webgl-water/):
 *
 *   1. His GPU heightfield: ping-pong float textures of (height, velocity,
 *      normal.x, normal.z), stepped by his exact kernel — velocity toward
 *      the four-neighbour average, damp 0.995, integrate. Drops are his
 *      cosine splat. Rings spread in 2D and bounce off the viewport walls.
 *   2. His caustics: refract the light through every surface vertex,
 *      project the mesh onto the wall behind — here, the page — and let
 *      dFdx/dFdy measure how much each triangle was focused. Compressed
 *      triangles are bright. The pattern dances over the drowned text as
 *      actual light now, not an alpha trick.
 *   3. His surface shading: Fresnel glassy head-on and dense at glancing
 *      angles, the "peaked" normal-march, specular glints.
 *
 *   WebGL Water — Copyright 2011 Evan Wallace, released under the MIT
 *   license. Permission is hereby granted, free of charge, to any person
 *   obtaining a copy of this software and associated documentation files
 *   (the "Software"), to deal in the Software without restriction. THE
 *   SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Staging: an aquarium. The viewer is at the front glass, the page is the
 * back wall, the surface is a shallow perspective band above the waterline.
 * Below the line the canvas is OPAQUE — it is the page, refracted; the real
 * DOM stays underneath untouched, so every link keeps working through the
 * flood (pointer-events: none, as always). Above the line the canvas is
 * transparent and the live page shows through.
 *
 * The monitor floats when the level reaches it, bobbing and tilting on the
 * actual heightfield via an async one-frame-late readback — and since the
 * replica draws the video at its floated position, its draft refracts.
 *
 * Fallbacks: no WebGL2 / no float render targets → the 2D-canvas first
 * build (water-404-sim.ts). Context lost → torn down, dry page. Reduced
 * motion flipping on → drained, the water was never there.
 */

/* ---- scenario constants ---- */

const STEP = 1 / 60;
/** Rise clock: level = max · (1 − e^(−t/TAU)). TAU dropped from 90 to 55 —
 * playable water inside ~15 seconds, still asymptotic, still never drowns
 * the page. */
const RISE_TAU = 55;
const RISE_FRAC = 0.45;
const RISE_CAP = 420;
const GRAVITY = 1400;
const TEAR_R = 2.6;
const FORM_S = 0.55;
const EMOJI = "\u{1F614}";

/* ---- field + stage geometry ---- */

/** Sim texture: x across the viewport, z into the screen. Fixed resolution
 * regardless of viewport width — a resize only re-stretches the mapping, so
 * the flood survives every resize with nothing rebuilt. */
const FW = 512;
const FH = 128;
/** World depth of the tank, css px. */
const DEPTH = 340;
/** How far below the surface the caustic texture reaches, css px. */
const CDEPTH = 430;
/** Caustic texture + the surface mesh that renders into it. */
const CW = 512;
const CH = 256;
const GX = 96;
const GY = 48;
/** Perspective: screen lift of the surface at depth z is
 * horizon · z / (z + Z0). */
const Z0 = 130;

interface Drop {
  x: number;
  y: number;
  z: number;
  r: number;
  vy: number;
  falling: boolean;
  t: number;
}

interface Spray {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Splat {
  x: number;
  z: number;
  r: number;
  s: number;
}

/** One measured line-fragment of page text, in document coordinates. */
interface Run {
  text: string;
  x: number;
  yDoc: number;
  font: string;
  color: string;
  ls: string;
}

/* ---- tiny GL helpers (all failures funnel to `null` → caller falls back) ---- */

function sh(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
  return s;
}

function prog(
  gl: WebGL2RenderingContext,
  vs: string,
  fs: string,
): WebGLProgram | null {
  const v = sh(gl, gl.VERTEX_SHADER, vs);
  const f = sh(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  return p;
}

const QUAD_VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUV;
void main(){ vUV = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

/* Evan's drop shader, with the distance measured in world px so rings stay
 * circular even though the field texels are not square. */
const DROP_FS = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uWorld;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
in vec2 vUV;
out vec4 o;
void main(){
  vec4 info = texture(uField, vUV);
  float drop = max(0.0, 1.0 - length(vUV * uWorld - uCenter) / uRadius);
  drop = 0.5 - cos(drop * 3.141592653589793) * 0.5;
  info.r += drop * uStrength;
  o = info;
}`;

/* Evan's update kernel, verbatim: velocity toward the neighbour average,
 * attenuate, integrate. CLAMP_TO_EDGE makes the walls reflective for free. */
const UPDATE_FS = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uDelta;
in vec2 vUV;
out vec4 o;
void main(){
  vec4 info = texture(uField, vUV);
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  float average = (
    texture(uField, vUV - dx).r +
    texture(uField, vUV - dy).r +
    texture(uField, vUV + dx).r +
    texture(uField, vUV + dy).r
  ) * 0.25;
  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  /* one departure from the vendored kernel: a hard ceiling on amplitude.
     Evan's pool bounds its own energy; a page with a splat queue does not,
     and an unbounded spike turns the caustic projection into confetti. */
  info.r = clamp(info.r, -24.0, 24.0);
  o = info;
}`;

/* Evan's normal pass, with world-px spacing so the normals are honest. */
const NORMAL_FS = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uDelta;
uniform vec2 uSpan;
in vec2 vUV;
out vec4 o;
void main(){
  vec4 info = texture(uField, vUV);
  float hx = texture(uField, vec2(vUV.x + uDelta.x, vUV.y)).r - info.r;
  float hz = texture(uField, vec2(vUV.x, vUV.y + uDelta.y)).r - info.r;
  vec3 dx = vec3(uSpan.x, hx, 0.0);
  vec3 dz = vec3(0.0, hz, uSpan.y);
  info.ba = normalize(cross(dz, dx)).xz;
  o = info;
}`;

/* Evan's caustics, restaged. His surface mesh is refracted toward a pool
 * floor; ours is refracted toward the back wall — the page — and the
 * texture is addressed by (x, depth-below-surface) so it rides the rising
 * waterline for free. The area-ratio fragment is his, verbatim. */
const CAUSTIC_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aUV;
uniform sampler2D uField;
uniform vec2 uWorld;
uniform float uCDepth;
uniform vec3 uLight;
out vec3 vOld;
out vec3 vNew;
const float ETA = 1.0 / 1.333;
/* Bounded on purpose, where Evan's pool bounds it for him: a steep facet
 * can refract a ray nearly horizontal, and an unclamped throw distance
 * turns one triangle into a screen-filling smear — thousands of those a
 * frame is a GPU hang, not a caustic. */
vec2 wallHit(vec3 origin, vec3 ray){
  float t = min((uWorld.y - origin.z) / max(ray.z, 0.18), 1200.0);
  vec3 p = origin + ray * t;
  return vec2(clamp(p.x, -0.3 * uWorld.x, 1.3 * uWorld.x),
              clamp(-p.y, -0.3 * uCDepth, 1.5 * uCDepth));
}
void main(){
  vec4 info = texture(uField, aUV);
  vec2 nba = info.ba * 0.35;
  vec3 n = vec3(nba.x, sqrt(max(0.0, 1.0 - dot(nba, nba))), nba.y);
  vec3 flat_ = refract(uLight, vec3(0.0, 1.0, 0.0), ETA);
  vec3 bent = refract(uLight, n, ETA);
  vec3 P = vec3(aUV.x * uWorld.x, info.r, aUV.y * uWorld.y);
  vec2 oldHit = wallHit(vec3(P.x, 0.0, P.z), flat_);
  vec2 newHit = wallHit(P, bent);
  /* the load-bearing bound: a caustic that lands more than ~160px from
     where flat water would put it is smear, not light — and unbounded, a
     choppy frame becomes thousands of screen-filling triangles. */
  vec2 dev = newHit - oldHit;
  newHit = oldHit + dev * (min(length(dev), 160.0) / max(length(dev), 1e-4));
  vOld = vec3(oldHit, 0.0);
  vNew = vec3(newHit, 0.0);
  gl_Position = vec4(
    newHit.x / uWorld.x * 2.0 - 1.0,
    newHit.y / uCDepth * 2.0 - 1.0,
    0.0, 1.0);
}`;

const CAUSTIC_FS = `#version 300 es
precision highp float;
in vec3 vOld;
in vec3 vNew;
out vec4 o;
void main(){
  /* if the triangle gets smaller, it gets brighter, and vice versa */
  float oldArea = length(dFdx(vOld)) * length(dFdy(vOld));
  float newArea = length(dFdx(vNew)) * length(dFdy(vNew));
  o = vec4(oldArea / max(newArea, 1.0e-6) * 0.2, 0.0, 0.0, 1.0);
}`;

/* The composite: one fragment shader that stages the whole aquarium.
 * Below the waterline it IS the page — the replica texture, refracted
 * through the heightfield, tinted by depth, lit by caustics. Above it,
 * the surface band reflects the page; past that, transparent. */
const COMPOSITE_FS = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform sampler2D uCaustic;
uniform sampler2D uPage;
uniform vec2 uRes;
uniform vec2 uWorld;
uniform float uLine;
uniform float uSlope;
uniform float uCDepth;
uniform float uHorizon;
uniform float uCaustOn;
uniform float uCheap;
uniform vec3 uLight;
uniform vec3 uTint;
uniform vec3 uDeep;
uniform vec3 uGlow;
uniform vec3 uEdgeCol;
in vec2 vUV;
out vec4 o;
const float Z0 = ${Z0.toFixed(1)};

vec4 field(float x, float z){
  return texture(uField, vec2(x / uWorld.x, z / uWorld.y));
}
vec3 page(vec2 p){
  return texture(uPage, vec2(p.x / uRes.x, 1.0 - p.y / uRes.y)).rgb;
}
float lift(float z){ return uHorizon * z / (z + Z0); }

void main(){
  float x = vUV.x * uRes.x;
  float sy = (1.0 - vUV.y) * uRes.y;
  /* the waterline is a LINE, not a constant: on a tilted phone the water
     stays level with the earth, so the line tilts against the screen */
  float lineAt = uLine + uSlope * (x - 0.5 * uRes.x);
  float dy = lineAt - sy;
  float hFront = field(x, 0.0).r;

  if (dy <= hFront) {
    /* ---- underwater: the page, refracted ---- */
    float d = max(0.0, -dy);
    float zp = clamp(d * 0.8, 2.0, uWorld.y - 2.0);
    vec4 fi = field(x, zp);
    float att = 0.35 + 0.65 * exp(-d / 220.0);
    vec2 off = vec2(fi.b * 16.0, fi.a * 9.0) * att;
    /* the lens squeeze right under the line — the classic underwater
       compression of whatever sits just above it */
    off.y -= exp(-d / 30.0) * (3.0 + hFront * 1.2);
    vec2 src = vec2(x, sy) + off;
    /* a whisper of chromatic aberration; glass is never perfectly honest */
    float caShift = (uCheap > 0.5) ? 0.0 : 1.3 * att;
    vec3 col = vec3(
      page(src + vec2(caShift, 0.0)).r,
      page(src).g,
      page(src - vec2(caShift, 0.0)).b);
    /* depth: aqua multiplies, then the deep colour swallows */
    float tamt = mix(0.10, 0.42, smoothstep(0.0, 420.0, d));
    col *= mix(vec3(1.0), uTint, 0.30 + tamt);
    col = mix(col, uDeep, tamt * 0.55);
    /* caustic light on the drowned page: bright where the surface focused
       the light, dim where it scattered, fading with depth */
    if (uCaustOn > 0.5) {
      float ca = texture(uCaustic, vec2(x / uWorld.x, d / uCDepth)).r * 5.0;
      float fade = exp(-d / 300.0);
      float L = mix(1.0, clamp(ca, 0.0, 2.4), fade);
      col *= 0.62 + 0.38 * L;
      col += uGlow * max(L - 1.0, 0.0);
    }
    /* the meniscus, riding the front row of the heightfield */
    float edge = 1.0 - smoothstep(0.0, 2.0, hFront - dy);
    col = mix(col, uEdgeCol, edge * 0.6);
    o = vec4(col, 1.0);
  } else {
    /* ---- the surface band: the plane, seen at a glancing angle ---- */
    float z = 0.0;
    float s = 1.0;
    float hh = hFront;
    float xw = x;
    for (int i = 0; i < 3; i++) {
      float q = clamp(dy - hh * s, 0.0, uHorizon * 0.985);
      z = clamp(Z0 * q / (uHorizon - q), 0.0, uWorld.y);
      s = Z0 / (Z0 + z);
      xw = clamp(0.5 * uRes.x + (x - 0.5 * uRes.x) * (1.0 + z * 0.0009),
                 0.0, uWorld.x);
      hh = field(xw, z).r;
    }
    /* silhouette of the far shoreline, antialiased over ~1.5px */
    float sBack = Z0 / (Z0 + uWorld.y);
    float yRim = lineAt - lift(uWorld.y) - field(xw, uWorld.y).r * sBack;
    float cov = smoothstep(-0.75, 0.75, sy - yRim);
    if (cov <= 0.0) { o = vec4(0.0); return; }

    vec4 info = field(xw, z);
    vec2 fuv = vec2(xw / uWorld.x, z / uWorld.y);
    if (uCheap < 0.5) {
      /* Evan: make water look more "peaked" */
      for (int i = 0; i < 3; i++) {
        fuv += info.ba * 0.004;
        info = texture(uField, fuv);
      }
    }
    vec3 n = vec3(info.b, sqrt(max(0.05, 1.0 - dot(info.ba, info.ba))), info.a);
    vec3 V = normalize(vec3(0.0, 150.0, -280.0) - vec3(0.0, hh, z));
    float fres = mix(0.10, 1.0, pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0));
    float spec = pow(clamp(dot(reflect(uLight, n), V), 0.0, 1.0), 90.0);
    /* the page above the line, mirrored into the surface */
    float rl = lift(z);
    vec3 refl = page(vec2(xw + n.x * 34.0,
                          lineAt - 6.0 - rl * 2.4 - info.r * 2.0));
    /* and the page just below it, seen down through the surface */
    vec3 thru = page(vec2(xw + n.x * 22.0, lineAt + 4.0 + rl * 1.4));
    vec3 col = mix(thru, refl, clamp(fres, 0.0, 1.0));
    col *= mix(vec3(1.0), uTint, 0.40);
    col = mix(col, uDeep, 0.16);
    col += vec3(spec);
    float a = cov * (0.52 + 0.44 * fres) + spec * 0.5;
    a += 0.2 * smoothstep(0.93, 1.0, z / uWorld.y) * cov;
    a = clamp(a, 0.0, 0.95);
    o = vec4(col * a, a);
  }
}`;

/* Tears and spray, as premultiplied point sprites. */
const POINT_VS = `#version 300 es
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 aSize;
uniform vec2 uRes;
uniform float uDpr;
out float vAlpha;
void main(){
  vAlpha = aSize.y;
  gl_PointSize = aSize.x * uDpr;
  gl_Position = vec4(aPos.x / uRes.x * 2.0 - 1.0,
                     1.0 - aPos.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const POINT_FS = `#version 300 es
precision highp float;
uniform vec3 uCol;
in float vAlpha;
out vec4 o;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = vAlpha * (1.0 - smoothstep(0.72, 1.0, d));
  o = vec4(uCol * a, a);
}`;

let started = false;

/** Boots the GL water. Returns false when this machine can't carry it —
 * the caller then falls back to the 2D build. */
export function start(): boolean {
  if (started) return true;

  /* The crier, exactly as before: found in the live text via Range. */
  let crier: Text | null = null;
  let crierAt = -1;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const at = (node as Text).data.indexOf(EMOJI);
    if (at >= 0) {
      crier = node as Text;
      crierAt = at;
      break;
    }
  }
  if (!crier) return true; /* no emoji, no water — but no fallback either */
  const emojiNode = crier;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return false;
  /* Float render targets are the whole build; without them, fall back. */
  if (!gl.getExtension("EXT_color_buffer_float")) return false;

  /* The replica canvas that the shader refracts. */
  const rep = document.createElement("canvas");
  const repCtx = rep.getContext("2d");
  if (!repCtx) return false;

  const pDrop = prog(gl, QUAD_VS, DROP_FS);
  const pUpdate = prog(gl, QUAD_VS, UPDATE_FS);
  const pNormal = prog(gl, QUAD_VS, NORMAL_FS);
  const pCaustic = prog(gl, CAUSTIC_VS, CAUSTIC_FS);
  const pComposite = prog(gl, QUAD_VS, COMPOSITE_FS);
  const pPoint = prog(gl, POINT_VS, POINT_FS);
  if (!pDrop || !pUpdate || !pNormal || !pCaustic || !pComposite || !pPoint)
    return false;
  started = true;
  document.body.appendChild(canvas);

  const loc = (p: WebGLProgram, name: string): WebGLUniformLocation | null =>
    gl.getUniformLocation(p, name);

  /* ---- geometry ---- */

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const vaoQuad = gl.createVertexArray();
  gl.bindVertexArray(vaoQuad);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  /* The surface mesh that gets refracted into the caustic texture. */
  const gridPos = new Float32Array((GX + 1) * (GY + 1) * 2);
  for (let j = 0; j <= GY; j++)
    for (let i = 0; i <= GX; i++) {
      const k = (j * (GX + 1) + i) * 2;
      gridPos[k] = i / GX;
      gridPos[k + 1] = j / GY;
    }
  const gridIdx = new Uint16Array(GX * GY * 6);
  let gi = 0;
  for (let j = 0; j < GY; j++)
    for (let i = 0; i < GX; i++) {
      const a = j * (GX + 1) + i;
      const b = a + 1;
      const c = a + (GX + 1);
      const d = c + 1;
      gridIdx[gi++] = a;
      gridIdx[gi++] = b;
      gridIdx[gi++] = c;
      gridIdx[gi++] = b;
      gridIdx[gi++] = d;
      gridIdx[gi++] = c;
    }
  const vaoGrid = gl.createVertexArray();
  gl.bindVertexArray(vaoGrid);
  const gridBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
  gl.bufferData(gl.ARRAY_BUFFER, gridPos, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const gridIdxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridIdxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gridIdx, gl.STATIC_DRAW);

  /* Point sprites: up to 96 of (x, y, size, alpha). */
  const MAX_PTS = 96;
  const ptData = new Float32Array(MAX_PTS * 4);
  const vaoPts = gl.createVertexArray();
  gl.bindVertexArray(vaoPts);
  const ptBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
  gl.bufferData(gl.ARRAY_BUFFER, ptData.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  gl.bindVertexArray(null);

  /* ---- render targets ---- */

  const makeTarget = (
    tw: number,
    th: number,
  ): { tex: WebGLTexture; fbo: WebGLFramebuffer } => {
    const tex = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      tw,
      th,
      0,
      gl.RGBA,
      gl.FLOAT,
      null,
    );
    const fbo = gl.createFramebuffer() as WebGLFramebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    return { tex, fbo };
  };

  let fieldA = makeTarget(FW, FH);
  let fieldB = makeTarget(FW, FH);
  const caustic = makeTarget(CW, CH);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fieldA.fbo);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    canvas.remove();
    started = false;
    return false;
  }

  const pageTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pageTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  /* ---- theme: the water's colours, per scheme ---- */

  const scheme = matchMedia("(prefers-color-scheme: dark)");
  let bgCol = "#ffffff";
  let tint: number[] = [0.58, 0.83, 0.9];
  let deep: number[] = [0.36, 0.6, 0.7];
  let glow: number[] = [0.09, 0.15, 0.17];
  let edgeCol: number[] = [0.16, 0.42, 0.52];
  let dropCol: number[] = [0.25, 0.5, 0.62];
  const readTheme = (): void => {
    const dark = scheme.matches;
    const pick = (c: string): string =>
      c && c !== "transparent" && !/^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(c)
        ? c
        : "";
    bgCol =
      pick(getComputedStyle(document.body).backgroundColor) ||
      pick(getComputedStyle(document.documentElement).backgroundColor) ||
      (dark ? "#0a0a0a" : "#ffffff");
    /* Aqua/cyan on purpose — a different hue from the site's lime, so the
     * accent stays reserved. Water is water, and water is blue. */
    if (dark) {
      tint = [0.8, 0.95, 1.0];
      deep = [0.05, 0.14, 0.2];
      glow = [0.07, 0.15, 0.19];
      edgeCol = [0.62, 0.85, 0.95];
      dropCol = [0.62, 0.82, 0.92];
    } else {
      tint = [0.58, 0.83, 0.9];
      deep = [0.36, 0.6, 0.7];
      glow = [0.09, 0.15, 0.17];
      edgeCol = [0.16, 0.42, 0.52];
      dropCol = [0.25, 0.5, 0.62];
    }
  };
  readTheme();

  const light: [number, number, number] = (() => {
    const l = [0.2, -1.0, 0.85];
    const len = Math.hypot(l[0], l[1], l[2]);
    return [l[0] / len, l[1] / len, l[2] / len];
  })();

  /* ---- the replica: the page, redrawn so the shader can bend it ---- */

  const monitor = document.querySelector<HTMLVideoElement>("main video");
  let runs: Run[] = [];
  const buildRuns = (): void => {
    runs = [];
    const range = document.createRange();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const t = n as Text;
      const el = t.parentElement;
      if (!el || !t.data.trim()) continue;
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ls = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      let cur: Run | null = null;
      let curY = 0;
      let i = 0;
      /* code points, not code units — an emoji split in half measures as
       * nothing and the run drifts */
      for (const ch of t.data) {
        const at = i;
        i += ch.length;
        range.setStart(t, at);
        range.setEnd(t, at + ch.length);
        const r = range.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const yMid = r.top + r.height / 2 + scrollY;
        if (cur && Math.abs(yMid - curY) < 2) {
          cur.text += ch;
        } else {
          cur = {
            text: ch,
            x: r.left + scrollX,
            yDoc: yMid,
            font,
            color: cs.color,
            ls,
          };
          curY = yMid;
          runs.push(cur);
        }
      }
    }
  };

  const drawReplica = (): void => {
    const s = rep.width / Math.max(1, w);
    repCtx.setTransform(s, 0, 0, s, 0, 0);
    repCtx.fillStyle = bgCol;
    repCtx.fillRect(0, 0, w, h);
    repCtx.textBaseline = "middle";
    for (const r of runs) {
      repCtx.font = r.font;
      repCtx.fillStyle = r.color;
      repCtx.letterSpacing = r.ls;
      repCtx.fillText(r.text, r.x - scrollX, r.yDoc - scrollY);
    }
    if (monitor) {
      const r = monitor.getBoundingClientRect();
      if (r.width > 0) {
        if (monitor.readyState >= 2) {
          repCtx.drawImage(monitor, r.left, r.top, r.width, r.height);
        } else {
          repCtx.fillStyle = scheme.matches ? "#161616" : "#e2e2e2";
          repCtx.fillRect(r.left, r.top, r.width, r.height);
        }
      }
    }
  };

  const uploadPage = (): void => {
    drawReplica();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, pageTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rep);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  };

  /* ---- sizing ---- */

  let dpr = 1;
  let w = 0;
  let h = 0;
  const sizeCanvas = (): void => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const rs = Math.min(dpr, 1.5);
    rep.width = Math.max(1, Math.round(w * rs));
    rep.height = Math.max(1, Math.round(h * rs));
    readTheme();
    buildRuns();
  };
  sizeCanvas();

  /* ---- scenario state (always starts dry; the beat always plays) ---- */

  let simT = 0;
  let wetAt = -1;
  let level = 0;
  const drops: Drop[] = [];
  const spray: Spray[] = [];
  const splats: Splat[] = [];
  let nextTear = 0.8;
  let leftEye = true;

  /* One-frame-late surface heights for the CPU side (drop landings, spray,
   * the floating monitor). An async PBO readback of the field's front row —
   * never a sync stall. */
  const row = new Float32Array(FW * 4);
  const pbo = gl.createBuffer();
  let fence: WebGLSync | null = null;
  const heightAt = (x: number): number => {
    const i = Math.max(0, Math.min(FW - 1, Math.round((x / w) * (FW - 1))));
    return row[i * 4];
  };
  /* the waterline as a function of x: flat on a desk, tilted on a tilted
   * phone — the water stays level with the earth, not with the screen */
  let slope = 0;
  let slopeTarget = 0;
  const yLineAt = (x: number): number => h - level + slope * (x - w / 2);
  const surfaceAt = (x: number): number => yLineAt(x) - heightAt(x);

  const queueSplat = (x: number, z: number, r: number, s: number): void => {
    if (splats.length < 24)
      splats.push({ x, z, r, s: Math.max(-10, Math.min(10, s)) });
  };

  const eye = (): { x: number; y: number } | null => {
    if (!emojiNode.isConnected) return null;
    const r = document.createRange();
    r.setStart(emojiNode, crierAt);
    r.setEnd(emojiNode, crierAt + 2);
    const b = r.getBoundingClientRect();
    if (b.width === 0) return null;
    leftEye = !leftEye;
    return {
      x: b.left + b.width * (leftEye ? 0.34 : 0.66),
      y: b.top + b.height * 0.58,
    };
  };

  const stepScenario = (): void => {
    simT += STEP;

    nextTear -= STEP;
    if (nextTear <= 0) {
      /* quicker than the first build — the toy needs things happening */
      nextTear = 0.9 + Math.random() * 1.2;
      const at = eye();
      if (at)
        drops.push({
          x: at.x,
          y: at.y,
          z: 12 + Math.random() * 58,
          r: 0.4,
          vy: 0,
          falling: false,
          t: 0,
        });
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.t += STEP;
      if (!d.falling) {
        d.r = 0.4 + (TEAR_R - 0.4) * Math.min(1, d.t / FORM_S);
        d.y += 4 * STEP;
        if (d.t >= FORM_S) d.falling = true;
        continue;
      }
      d.vy += GRAVITY * STEP;
      d.y += d.vy * STEP;
      const s = surfaceAt(d.x);
      if (d.y + d.r >= s) {
        const depth = Math.min(1, level / 24 + 0.3);
        queueSplat(d.x, d.z, 26, -Math.min(9, d.vy * 0.009) * depth);
        const bits = 3 + ((Math.random() * 3) | 0);
        for (let k = 0; k < bits; k++)
          spray.push({
            x: d.x,
            y: s,
            vx: (Math.random() - 0.5) * 160,
            vy: -(60 + Math.random() * 140),
            life: 0.5 + Math.random() * 0.25,
          });
        if (wetAt < 0) wetAt = simT;
        drops.splice(i, 1);
      }
    }

    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i];
      p.life -= STEP;
      p.vy += GRAVITY * STEP;
      p.x += p.vx * STEP;
      p.y += p.vy * STEP;
      if (p.life <= 0 || p.y > surfaceAt(p.x) + 4) spray.splice(i, 1);
    }

    if (wetAt >= 0) {
      const riseMax = Math.min(RISE_CAP, h * RISE_FRAC);
      level = riseMax * (1 - Math.exp(-(simT - wetAt) / RISE_TAU));
    }
  };

  /* ---- the monitor floats (ticket 23's "funniest object on the site") ---- */

  let lift = 0;
  const buoy = (): void => {
    if (!monitor || level < 4) return;
    const r = monitor.getBoundingClientRect();
    const baseBottom = r.bottom + lift; /* undo our own transform */
    const yLine = yLineAt(r.left + r.width / 2);
    const draft = r.height * 0.3; /* how deep a floating monitor sits */
    const target = Math.max(0, baseBottom - (yLine + draft));
    lift += (target - lift) * Math.min(1, 2.5 * STEP * 3);
    if (lift < 0.2 && target === 0) {
      if (monitor.style.transform) monitor.style.transform = "";
      return;
    }
    /* ride the real surface: height and slope from the readback row, plus
     * the tilt of the whole waterline when the phone is tilted */
    const cx = r.left + r.width / 2;
    const bob = heightAt(cx) * 0.9;
    const wave = (heightAt(cx + 40) - heightAt(cx - 40)) / 80;
    const rot = Math.max(
      -16,
      Math.min(
        16,
        Math.max(-4, Math.min(4, wave * 50)) +
          (Math.atan(slope) * 180) / Math.PI,
      ),
    );
    monitor.style.transform = `translateY(${(-(lift + bob)).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
  };

  /* ---- the pointer: a hand in the tank, anywhere in the tank ---- */

  let px = -1;
  let py = -1;
  const horizonNow = (): number => Math.min(56, 9 + level * 0.14);
  const zAt = (clientY: number, yLine: number, hor: number): number => {
    const above = yLine - clientY;
    if (above <= 0) return 8;
    const q = Math.min(above, hor * 0.98);
    return Math.min(DEPTH, (Z0 * q) / (hor - q));
  };
  const onMove = (e: PointerEvent): void => {
    const pdx = px < 0 ? 0 : e.clientX - px;
    const pdy = py < 0 ? 0 : e.clientY - py;
    const dist = Math.hypot(pdx, pdy);
    px = e.clientX;
    py = e.clientY;
    if (level < 4 || dist < 3) return;
    const yLine = yLineAt(e.clientX);
    const hor = horizonNow();
    if (e.clientY < yLine - hor - 12) return;
    const z = zAt(e.clientY, yLine, hor);
    let s = -Math.max(-7, Math.min(7, pdy * 0.45));
    if (Math.abs(s) < 1.6) s = -1.8;
    queueSplat(e.clientX, z, 26 + Math.min(dist, 60) * 0.35, s);
    /* a fast drag near the surface throws water */
    const sAt = yLine - heightAt(e.clientX);
    if (dist > 20 && Math.abs(e.clientY - sAt) < 34 && spray.length < 48) {
      for (let k = 0; k < 2; k++)
        spray.push({
          x: e.clientX,
          y: sAt,
          vx: Math.max(-260, Math.min(260, pdx * (4 + Math.random() * 5))),
          vy: -(80 + Math.random() * 200),
          life: 0.4 + Math.random() * 0.3,
        });
    }
  };
  addEventListener("pointermove", onMove, { passive: true });

  const onDown = (e: PointerEvent): void => {
    if (level < 6) return;
    const yLine = yLineAt(e.clientX);
    const hor = horizonNow();
    if (e.clientY < yLine - hor - 12) return;
    queueSplat(e.clientX, zAt(e.clientY, yLine, hor), 60, -9);
    const s0 = yLine - heightAt(e.clientX);
    const bits = 6 + ((Math.random() * 4) | 0);
    for (let k = 0; k < bits && spray.length < 64; k++)
      spray.push({
        x: e.clientX + (Math.random() - 0.5) * 24,
        y: s0,
        vx: (Math.random() - 0.5) * 320,
        vy: -(120 + Math.random() * 260),
        life: 0.5 + Math.random() * 0.35,
      });
  };
  addEventListener("pointerdown", onDown, { passive: true });

  /* ---- the gyro: the tank is IN the phone (jass's idea, aug 22) ----
   *
   * Tilt: the water stays level with the earth, so the waterline tilts
   * against the screen — slopeTarget from the orientation sensor, remapped
   * through screen.orientation so landscape works, tanh-capped so a phone
   * on its side doesn't empty the tank. The spring toward it lives in the
   * frame loop, and the CHANGE in slope injects surge splats at the edges,
   * which is what sloshing is.
   *
   * Shake: linear acceleration spikes churn the whole field and throw
   * spray. Cooldown so a vigorous shake reads as waves, not white noise.
   *
   * iOS gates both sensors behind a permission that can only be requested
   * from a user gesture, so the first tap asks once; denied means denied
   * forever, silently — the water is still a toy without it. Only wired on
   * coarse-pointer devices; a desk-bound laptop has no business sloshing. */

  let churnAt = 0;
  const churn = (k: number): void => {
    const now = performance.now();
    if (now - churnAt < 150 || level < 8) return;
    churnAt = now;
    const n = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++)
      queueSplat(
        Math.random() * w,
        Math.random() * DEPTH,
        40 + Math.random() * 30,
        (Math.random() < 0.5 ? -1 : 1) * (4 + 6 * k),
      );
    for (let i = 0; i < 4 && spray.length < 64; i++) {
      const sx = Math.random() * w;
      spray.push({
        x: sx,
        y: surfaceAt(sx),
        vx: (Math.random() - 0.5) * 340,
        vy: -(120 + Math.random() * 300),
        life: 0.45 + Math.random() * 0.3,
      });
    }
  };

  const onMotion = (e: DeviceMotionEvent): void => {
    const a = e.acceleration;
    if (a && a.x != null) {
      const m = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      if (m > 14) churn(Math.min(1, (m - 14) / 18));
      return;
    }
    /* no linear channel: fall back to |gravity+motion| leaving ~9.8 */
    const g = e.accelerationIncludingGravity;
    if (g && g.x != null) {
      const m = Math.hypot(g.x ?? 0, g.y ?? 0, g.z ?? 0);
      if (Math.abs(m - 9.81) > 8)
        churn(Math.min(1, (Math.abs(m - 9.81) - 8) / 14));
    }
  };

  const onOrient = (e: DeviceOrientationEvent): void => {
    if (e.gamma == null || e.beta == null) return;
    const ang = screen.orientation ? screen.orientation.angle : 0;
    let tilt = e.gamma;
    if (ang === 90) tilt = e.beta;
    else if (ang === 180) tilt = -e.gamma;
    else if (ang === 270) tilt = -e.beta;
    /* screen slope of a world-level surface; tanh caps it near ±27° so
     * extreme tilt sloshes hard instead of leaving the page */
    slopeTarget = -Math.tanh((tilt * Math.PI) / 180) * 0.52;
  };

  let motionOn = false;
  const attachMotion = (): void => {
    if (motionOn) return;
    motionOn = true;
    addEventListener("devicemotion", onMotion, { passive: true });
    addEventListener("deviceorientation", onOrient, { passive: true });
  };
  interface Askable {
    requestPermission?: () => Promise<string>;
  }
  const askMotion = (): void => {
    removeEventListener("pointerdown", askMotion);
    const asks: Promise<string>[] = [];
    const dme =
      typeof DeviceMotionEvent !== "undefined"
        ? (DeviceMotionEvent as unknown as Askable)
        : undefined;
    const doe =
      typeof DeviceOrientationEvent !== "undefined"
        ? (DeviceOrientationEvent as unknown as Askable)
        : undefined;
    if (dme?.requestPermission)
      asks.push(dme.requestPermission().catch(() => "denied"));
    if (doe?.requestPermission)
      asks.push(doe.requestPermission().catch(() => "denied"));
    void Promise.all(asks).then((rs) => {
      if (rs.some((r) => r === "granted")) attachMotion();
    });
  };
  const coarse = matchMedia("(pointer: coarse)").matches;
  const needsAsk =
    typeof DeviceMotionEvent !== "undefined" &&
    typeof (DeviceMotionEvent as unknown as Askable).requestPermission ===
      "function";
  if (coarse) {
    if (needsAsk) addEventListener("pointerdown", askMotion);
    else attachMotion();
  }

  /* ---- GL frame ---- */

  const fieldDelta: [number, number] = [1 / FW, 1 / FH];
  /* quality tiers: 0 full → 1 caustics half-rate → 2 caustics off, replica
   * half-rate → 3 cheap shading too. Never the frame rate. */
  let tier = 0;
  let frameNo = 0;

  const simPass = (p: WebGLProgram, bind: () => void): void => {
    gl.useProgram(p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fieldB.fbo);
    gl.viewport(0, 0, FW, FH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fieldA.tex);
    gl.uniform1i(loc(p, "uField"), 0);
    bind();
    gl.bindVertexArray(vaoQuad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const t = fieldA;
    fieldA = fieldB;
    fieldB = t;
  };

  const stepField = (): void => {
    gl.disable(gl.BLEND);
    let burst = 0;
    while (splats.length && burst < 6) {
      const s = splats.shift() as Splat;
      simPass(pDrop, () => {
        gl.uniform2f(loc(pDrop, "uWorld"), w, DEPTH);
        gl.uniform2f(loc(pDrop, "uCenter"), s.x, s.z);
        gl.uniform1f(loc(pDrop, "uRadius"), s.r);
        gl.uniform1f(loc(pDrop, "uStrength"), s.s);
      });
      burst++;
    }
    const passes = tier >= 3 ? 1 : 2;
    for (let i = 0; i < passes; i++)
      simPass(pUpdate, () => {
        gl.uniform2f(loc(pUpdate, "uDelta"), fieldDelta[0], fieldDelta[1]);
      });
  };

  const drawFrame = (): void => {
    gl.disable(gl.BLEND);
    simPass(pNormal, () => {
      gl.uniform2f(loc(pNormal, "uDelta"), fieldDelta[0], fieldDelta[1]);
      gl.uniform2f(loc(pNormal, "uSpan"), w / FW, DEPTH / FH);
    });

    const caustOn = tier < 2 && (tier < 1 || frameNo % 2 === 0);
    if (caustOn) {
      gl.useProgram(pCaustic);
      gl.bindFramebuffer(gl.FRAMEBUFFER, caustic.fbo);
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldA.tex);
      gl.uniform1i(loc(pCaustic, "uField"), 0);
      gl.uniform2f(loc(pCaustic, "uWorld"), w, DEPTH);
      gl.uniform1f(loc(pCaustic, "uCDepth"), CDEPTH);
      gl.uniform3f(loc(pCaustic, "uLight"), light[0], light[1], light[2]);
      gl.bindVertexArray(vaoGrid);
      gl.drawElements(gl.TRIANGLES, GX * GY * 6, gl.UNSIGNED_SHORT, 0);
    }

    if (level > 0.5 && (tier < 2 || frameNo % 2 === 0)) uploadPage();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    if (level > 0.5) {
      const yLine = h - level;
      const hor = horizonNow();
      const top = Math.max(0, yLine - Math.abs(slope) * w * 0.5 - hor - 28);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(0, 0, canvas.width, Math.round((h - top) * dpr));
      gl.useProgram(pComposite);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldA.tex);
      gl.uniform1i(loc(pComposite, "uField"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, caustic.tex);
      gl.uniform1i(loc(pComposite, "uCaustic"), 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, pageTex);
      gl.uniform1i(loc(pComposite, "uPage"), 2);
      gl.uniform2f(loc(pComposite, "uRes"), w, h);
      gl.uniform2f(loc(pComposite, "uWorld"), w, DEPTH);
      gl.uniform1f(loc(pComposite, "uLine"), yLine);
      gl.uniform1f(loc(pComposite, "uSlope"), slope);
      gl.uniform1f(loc(pComposite, "uCDepth"), CDEPTH);
      gl.uniform1f(loc(pComposite, "uHorizon"), hor);
      gl.uniform1f(loc(pComposite, "uCaustOn"), tier < 2 ? 1 : 0);
      gl.uniform1f(loc(pComposite, "uCheap"), tier >= 3 ? 1 : 0);
      gl.uniform3f(loc(pComposite, "uLight"), light[0], light[1], light[2]);
      gl.uniform3f(loc(pComposite, "uTint"), tint[0], tint[1], tint[2]);
      gl.uniform3f(loc(pComposite, "uDeep"), deep[0], deep[1], deep[2]);
      gl.uniform3f(loc(pComposite, "uGlow"), glow[0], glow[1], glow[2]);
      gl.uniform3f(
        loc(pComposite, "uEdgeCol"),
        edgeCol[0],
        edgeCol[1],
        edgeCol[2],
      );
      gl.bindVertexArray(vaoQuad);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.SCISSOR_TEST);
    }

    let np = 0;
    for (const d of drops) {
      if (np >= MAX_PTS) break;
      ptData[np * 4] = d.x;
      ptData[np * 4 + 1] = d.y;
      ptData[np * 4 + 2] = d.r * 2;
      ptData[np * 4 + 3] = 0.5;
      np++;
    }
    for (const p of spray) {
      if (np >= MAX_PTS) break;
      ptData[np * 4] = p.x;
      ptData[np * 4 + 1] = p.y;
      ptData[np * 4 + 2] = 2.6;
      ptData[np * 4 + 3] = 0.55;
      np++;
    }
    if (np > 0) {
      gl.useProgram(pPoint);
      gl.uniform2f(loc(pPoint, "uRes"), w, h);
      gl.uniform1f(loc(pPoint, "uDpr"), dpr);
      gl.uniform3f(loc(pPoint, "uCol"), dropCol[0], dropCol[1], dropCol[2]);
      gl.bindVertexArray(vaoPts);
      gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, ptData, 0, np * 4);
      gl.drawArrays(gl.POINTS, 0, np);
    }
    gl.bindVertexArray(null);

    /* kick / collect the async height readback */
    if (fence) {
      const st = gl.clientWaitSync(fence, 0, 0);
      if (st === gl.ALREADY_SIGNALED || st === gl.CONDITION_SATISFIED) {
        gl.deleteSync(fence);
        fence = null;
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, row);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      }
    }
    if (!fence) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldA.fbo);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
      gl.bufferData(gl.PIXEL_PACK_BUFFER, row.byteLength, gl.STREAM_READ);
      gl.readPixels(0, 0, FW, 1, gl.RGBA, gl.FLOAT, 0);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    }
  };

  /* ---- the loop, with the calibrated load-shed from the first build ---- */

  let raf = 0;
  let last = 0;
  let acc = 0;
  let slow = 0;
  let sloshAcc = 0;
  const sample: number[] = [];
  let slowT = 0;

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    frameNo++;
    const raw = (now - last) / 1000;
    last = now;
    acc += Math.min(raw, 0.05);
    let steps = 0;
    while (acc >= STEP && steps < 3) {
      stepScenario();
      if (wetAt >= 0) stepField();
      acc -= STEP;
      steps++;
    }
    if (steps === 3) acc = 0;
    /* the tilt spring; its motion IS the slosh. When the line swings, the
     * rising edge surges and the falling edge dips — a wave is born at
     * each wall and rolls across, which is what a carried tank does. */
    const s0 = slope;
    slope += (slopeTarget - slope) * Math.min(1, 6 * raw);
    sloshAcc += slope - s0;
    if (Math.abs(sloshAcc) > 0.012 && level > 8) {
      const surge = Math.max(-8, Math.min(8, sloshAcc * 300));
      queueSplat(w * 0.08, DEPTH * 0.35, 130, surge);
      queueSplat(w * 0.92, DEPTH * 0.35, 130, -surge);
      sloshAcc = 0;
    }
    drawFrame();
    buoy();

    if (!slowT) {
      sample.push(raw);
      if (sample.length === 40)
        slowT = 1.5 * [...sample].sort((a, b) => a - b)[20];
      return;
    }
    if (raw > slowT) slow++;
    else if (slow > 0) slow--;
    if (slow > 45) {
      slow = 0;
      if (tier < 3) tier++;
    }
  };

  const onVis = (): void => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  /* Resize: the field is resolution-fixed and normalized, so nothing is
   * rebuilt and the flood survives — canvas, replica and text runs update.
   * Still debounced, still immune to the iOS URL-bar dance. */
  let resizeTimer: number | undefined;
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(sizeCanvas, 200);
  };
  addEventListener("resize", onResize);

  scheme.addEventListener("change", readTheme);

  const teardown = (): void => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resizeTimer);
    document.removeEventListener("visibilitychange", onVis);
    removeEventListener("resize", onResize);
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerdown", onDown);
    removeEventListener("pointerdown", askMotion);
    removeEventListener("devicemotion", onMotion);
    removeEventListener("deviceorientation", onOrient);
    scheme.removeEventListener("change", readTheme);
    reduced.removeEventListener("change", drain);
    if (monitor) monitor.style.transform = "";
    canvas.remove();
  };

  /* Context lost mid-flood: the page is simply dry again, which is just
   * the 404. No restore dance for a decoration. */
  canvas.addEventListener("webglcontextlost", teardown);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const drain = (): void => {
    if (reduced.matches) teardown();
  };
  reduced.addEventListener("change", drain);

  last = performance.now();
  raf = requestAnimationFrame(frame);
  return true;
}
