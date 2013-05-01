attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;
uniform bool useWater;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying float colorBlue;

void main(void) {
    if(useWater)
        colorBlue = -1.0;
    else
        colorBlue = 1.0;
   vPosition = mvMatrix * vec4(aVertexPosition, 1.0);
   gl_Position = pMatrix * vPosition;
   vTextureCoord = aTextureCoord;
   vTransformedNormal = nMatrix * aVertexNormal;
}
