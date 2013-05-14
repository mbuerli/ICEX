attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying float vHeight;

void main(void) {
   vPosition = mvMatrix * vec4(aVertexPosition, 1.0);
   vHeight = vPosition.y;
   gl_Position = pMatrix * vPosition;
   vTextureCoord = aTextureCoord;
   vTransformedNormal = nMatrix * aVertexNormal;
}
