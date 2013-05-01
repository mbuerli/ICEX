precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying float colorBlue;

uniform bool useLighting;
uniform bool useTextures;
uniform vec3 ambientColor;
uniform vec3 pointLightingLocation;
uniform vec3 pointLightingColor;
uniform sampler2D sampler;

void main(void) {
   vec3 lightWeighting;
   vec4 blue = vec4(0.4, 0.4, 1.0, 1.0);

   if (!useLighting) {
      lightWeighting = vec3(1.0, 1.0, 1.0);
   } else {
      vec3 lightDirection = normalize(pointLightingLocation - vPosition.xyz);

      float directionalLightWeighting = abs(dot(normalize(vTransformedNormal), lightDirection));
      lightWeighting = ambientColor + pointLightingColor * directionalLightWeighting;
   }

   vec4 fragmentColor;
   if (useTextures) {
      fragmentColor = texture2D(sampler, vec2(vTextureCoord.s, vTextureCoord.t));
   } else {
      fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
   }

	if(colorBlue < 0.0)
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting * blue.rgb, fragmentColor.a);
	else
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}
