import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-shader-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #shaderCanvas></canvas>`,
  styleUrl: './shader-background.component.css',
})
export class ShaderBackgroundComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('shaderCanvas');
  private readonly ngZone = inject(NgZone);

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private rafId = 0;
  private startTime = 0;
  private resizeObserver: ResizeObserver | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;

  private readonly VERT_SRC = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  private readonly FRAG_SRC = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;

    vec3 c1 = vec3(0.039, 0.086, 0.157);
    vec3 c2 = vec3(0.102, 0.227, 0.561);
    vec3 c3 = vec3(0.227, 0.361, 0.620);
    vec3 c4 = vec3(0.157, 0.494, 0.788);
    vec3 c5 = vec3(0.357, 0.561, 0.690);
    vec3 c6 = vec3(0.494, 0.722, 0.969);

    float blob(vec2 uv, vec2 center, float radius) {
      vec2 d = uv - center;
      return exp(-dot(d, d) / (radius * radius));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.06;

      vec2 b1 = vec2(0.20 + sin(t * 0.7) * 0.18, 0.75 + cos(t * 0.5) * 0.15);
      vec2 b2 = vec2(0.75 + cos(t * 0.6) * 0.20, 0.20 + sin(t * 0.8) * 0.18);
      vec2 b3 = vec2(0.50 + sin(t * 0.4) * 0.22, 0.50 + cos(t * 0.55) * 0.20);
      vec2 b4 = vec2(0.10 + cos(t * 0.9) * 0.12, 0.40 + sin(t * 0.65) * 0.18);
      vec2 b5 = vec2(0.85 + sin(t * 0.5) * 0.10, 0.65 + cos(t * 0.7) * 0.15);
      vec2 b6 = vec2(0.40 + cos(t * 0.45) * 0.20, 0.15 + sin(t * 0.6) * 0.12);

      float w1 = blob(uv, b1, 0.38);
      float w2 = blob(uv, b2, 0.42);
      float w3 = blob(uv, b3, 0.50);
      float w4 = blob(uv, b4, 0.30);
      float w5 = blob(uv, b5, 0.35);
      float w6 = blob(uv, b6, 0.28);

      float total = w1 + w2 + w3 + w4 + w5 + w6 + 0.001;
      vec3 col = (c1*w1 + c2*w2 + c3*w3 + c4*w4 + c5*w5 + c6*w6) / total;

      float gridSize = 36.0;
      vec2 grid = fract(gl_FragCoord.xy / gridSize);
      float lineX = step(0.97, grid.x);
      float lineY = step(0.97, grid.y);
      float gridLine = max(lineX, lineY);
      col = mix(col, vec3(1.0), gridLine * 0.07);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initWebGL());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
  }

  private initWebGL(): void {
    const canvas = this.canvasRef().nativeElement;
    const gl = (
      canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;

    if (!gl) { this.fallbackCSS(canvas); return; }
    this.gl = gl;

    const vert = this.compile(gl, gl.VERTEX_SHADER, this.VERT_SRC);
    const frag = this.compile(gl, gl.FRAGMENT_SHADER, this.FRAG_SRC);
    if (!vert || !frag) { this.fallbackCSS(canvas); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { this.fallbackCSS(canvas); return; }

    this.program = prog;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    this.uTime = gl.getUniformLocation(prog, 'u_time');
    this.uResolution = gl.getUniformLocation(prog, 'u_resolution');
    this.startTime = performance.now();

    this.resize(canvas, gl);
    this.resizeObserver = new ResizeObserver(() => this.resize(canvas, gl!));
    this.resizeObserver.observe(canvas.parentElement ?? document.body);

    this.loop();
  }

  private compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }

  private resize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): void {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  private loop = (): void => {
    if (!this.gl) return;
    const t = (performance.now() - this.startTime) / 1000;
    this.gl.uniform1f(this.uTime, t);
    this.gl.uniform2f(this.uResolution, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private fallbackCSS(canvas: HTMLCanvasElement): void {
    canvas.style.display = 'none';
    canvas.parentElement?.classList.add('auth-bg-fallback');
  }
}
