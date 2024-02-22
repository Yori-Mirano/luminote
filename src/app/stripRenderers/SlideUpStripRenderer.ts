import { GlslStripRenderer } from "./abstracts/GlslStripRenderer";

export class SlideUpStripRenderer extends GlslStripRenderer {
  onInitFragment(): string {
    /* language=glsl */
    return `
      #ifdef GL_ES
        precision mediump float;
      #endif
      
      const float FACTOR = ${this.factor.toPrecision(5)};
      const int STRIP_LENGTH = ${this.strip.length};
      const int COLOR_PER_PIXEL = ${this.strip.getColorPerPixel()};
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform sampler2D u_buffer0;
      
      uniform float u_array[STRIP_LENGTH * COLOR_PER_PIXEL];
      
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
        #if defined( BUFFER_0 )
          // Buffer
          vec3 diff = vec3( vec2(1.0) / u_resolution.xy, 0.0);
          vec2 mouse_uv = u_mouse.xy / u_resolution.xy;
          float mouse_pointer = smoothstep(100.0, 1.0, length((mouse_uv - uv) * u_resolution) );
      
          vec4 center = texture2D(u_buffer0, uv);
      
          if (u_time < .1) {
            gl_FragColor = vec4(vec3(0.), 1.);
      
          } else {
            if (gl_FragCoord.y < 1.) {
              int colorIndex = int(floor(uv.x * float(STRIP_LENGTH)));
              vec3 finalColor;
  
              for (int i = 0; i < STRIP_LENGTH; i++) {
                if (i == colorIndex) {
                  finalColor = vec3(
                  (u_array[i*COLOR_PER_PIXEL]     + u_array[i*COLOR_PER_PIXEL + 3] * .5) * FACTOR,
                  (u_array[i*COLOR_PER_PIXEL + 1] + u_array[i*COLOR_PER_PIXEL + 3] * .5) * FACTOR,
                  (u_array[i*COLOR_PER_PIXEL + 2] + u_array[i*COLOR_PER_PIXEL + 3] * .35) * FACTOR
                  );
                }
              }
              gl_FragColor = vec4(finalColor, 1.0);
            } else {
              vec3 lastCenterValue = center.rgb;
              vec3 lastTopValue = texture2D(u_buffer0, uv - diff.zy).rgb;
              vec3 lastLeftValue = texture2D(u_buffer0, uv - diff.xz).rgb;
              vec3 lastRightValue = texture2D(u_buffer0, uv + diff.xz).rgb;
              vec3 lastBottomValue = texture2D(u_buffer0, uv + diff.zy).rgb;
  
              vec3 newValue = (
                  0. * lastCenterValue
                + 1.0 * lastTopValue
                + .02 * lastLeftValue
                + .02 * lastRightValue
                + .0 * lastBottomValue)
                / 1.0;
              //newValue += .1 * mouse_pointer; // mouse
              newValue *= 0.96; // damping
              //newValue *= step(0.1, u_time); // hacky way of clearing the buffer
              //newValue = 0.5 + newValue * 0.5;
              newValue = clamp(newValue, 0., 1.);
              gl_FragColor = vec4(newValue, 1.);
            }
          }
      
        #else
          // Main Buffer
          gl_FragColor = texture2D(u_buffer0, uv);
        #endif
      }
    `;
  }

}
