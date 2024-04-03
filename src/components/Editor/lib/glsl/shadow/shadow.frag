precision highp float;
precision highp sampler2D;

uniform sampler2D tex;
in vec2 vUv;
out vec4 color;

void main () {
    vec4 col = texture(tex, vUv);

    color = col;

    if(color.r == 1.0) discard;
}