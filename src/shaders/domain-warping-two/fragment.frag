#ifdef GL_ES
precision mediump float;
#endif

const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);
uniform vec2 u_resolution;
uniform float u_time;

float noise(in vec2 p) {
  return cos(p.x) * cos(p.y);
}

float fbm4(vec2 p) {
  float f = 0.0;
  f += 0.5000 * noise(p);
  p = m * p * 2.02;
  f += 0.2500 * noise(p);
  p = m * p * 2.03;
  f += 0.1250 * noise(p);
  p = m * p * 2.01;
  f += 0.0625 * noise(p);
  return f / 0.9375;
}

float fbm6(vec2 p) {
  float f = 0.0;
  f += 0.500000 * (0.5 + 0.5 * noise(p));
  p = m * p * 2.02;
  f += 0.250000 * (0.5 + 0.5 * noise(p));
  p = m * p * 2.03;
  f += 0.125000 * (0.5 + 0.5 * noise(p));
  p = m * p * 2.01;
  f += 0.062500 * (0.5 + 0.5 * noise(p));
  p = m * p * 2.04;
  f += 0.031250 * (0.5 + 0.5 * noise(p));
  p = m * p * 2.01;
  f += 0.015625 * (0.5 + 0.5 * noise(p));

  return f / 0.86875;
}

vec2 fbm4_2(vec2 p) {
  return vec2(fbm4(p), fbm4(p + vec2(5)));
}

vec2 fbm6_2(vec2 p) {
  return vec2(fbm6(p + vec2(16.8)), fbm6(p + vec2(11.5)));
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float func(vec2 q, out vec4 ron) {
  q += 0.03 * cos(vec2(0.27, 0.23) * 2.0 * (u_time * 0.0) * vec2(4.1, 4.3));
  vec2 o = fbm4_2(0.9 * q);
  o += 0.06 * sin(vec2(0.12, 0.14) * (u_time * 2.0 + u_time) + length(o));
  vec2 n = fbm6_2(3.0 * o);
  ron = vec4(o, n);
  float f = 0.5 + 0.5 * fbm4(1.8 * q + 6.0 * n);
  return mix(f, f * f * f * 3.5, f * abs(n.x));
}

void main() {

  // vec2 p = (map(gl_FragCoord.x + gl_FragCoord.y, 0.5, u_resolution.y, 1.0, 4.0) * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
  vec2 p = (6.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

  vec2 drift = vec2(p.x + u_time * .02, p.y - u_time * .02);
  // vec2 drift = vec2(fbm6(p) * 1.0, fbm4(p) * 1.0);

  float e = 1.0 / u_resolution.y;
  vec4 on = vec4(0.5);
  float f = func(drift, on);


  vec3 col = mix(vec3(0.2, 0.1, 0.4), vec3(0.3, 0.05, 0.05), f * .5);
  // vec3 col = vec3(0);

  col = mix(col, vec3(0.9, 0.9, 0.9), dot(on.yw, on.zw));
  col = mix(col, vec3(0.3, 0.4, 0.3), 0.2 + 0.5 * on.y * on.y);
  col = mix(col, vec3(0.4, 0.2, 0.0), 0.6 * smoothstep(1.0, 1.5, abs(on.z) + abs(on.w)));
  col = clamp(col * f * 2.0, 0.0, 1.0);
  // vec4 kk = vec4((cos(u_time) + sin(u_time) / 1.0));
  vec4 kk = vec4(0);

  vec3 nor = normalize(
    vec3(
      func(drift + vec2(e, 0.0), kk) - f,
      2.0 * e,
      func(drift + vec2(0.0, e ), kk) - f
    )
  );

  vec3 lig = normalize(vec3(-0.9, 0.2, 0.4));
  //vec3 lig = normalize(vec3(1.0, 1.0, 1.0));

  float dif = clamp(0.3 + 0.2 * dot(nor, lig), 0.0, 1.0);

  //vec3 lin = vec3(0.70, 0.90, 0.95) * (nor.y * 0.5 + 0.5) + vec3(0.15, 0.10, 0.05) * dif;
  vec3 lin = vec3(0.70, 0.90, 0.95) * (nor.y * 0.8 + 0.5) + vec3(0.15, 0.10, 0.05);

  col *= 1.2 * lin;
  gl_FragColor = vec4(col, 1.0);
}
