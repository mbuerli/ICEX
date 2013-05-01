function Mesh(data, textureFile, min, max, zSubtraction) {
   this.stride = 0;
   this.min = min;
   this.max = max;
   this.data = data;
   this.zSubtraction = zSubtraction;

   this.buffers = this.ScanData();
   this.textureFile = textureFile;
   this.texture = this.InitTexture();
}

// Regular data file
Mesh.prototype.ScanData = function() {
   var lines = this.data.split("\n");
   var vertexCount = 0;
   var index = 0;
   var textureIndex = 0;

   // Positions
   var vertexPositions = [];
   var vertexTextureCoords = [];
   var vertexNormals = [];

   var vertices = [];
   var textures = [];

   var v1;
   var v2;
   var vector;

   for (var i in lines) {
      var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
      if (vals.length == 4 && vals[0] == "v") {
         // Scan vertices
         vertices[index] = new Vertex(parseFloat(vals[1]), parseFloat(vals[2]),
                                      parseFloat(vals[3]));
         this.CalculateExtremes(vertices, index);

         index += 1;
      }
      else if (vals.length == 3 && vals[0] == "vt") {
         // Scan texture coords
         textures[textureIndex] = new Texture(parseFloat(vals[1]), parseFloat(vals[2]));
         textureIndex += 1;
      }
      else if (vals.length == 4 && vals[0] == "f") {
         // Map vertices to each other
         v1 = vec3.create([vertices[vals[2]-1].x-vertices[vals[1]-1].x,
            vertices[vals[2]-1].y-vertices[vals[1]-1].y,
            vertices[vals[2]-1].z-vertices[vals[1]-1].z]);
         v2 = vec3.create([vertices[vals[3]-1].x-vertices[vals[1]-1].x,
            vertices[vals[3]-1].y-vertices[vals[1]-1].y,
            vertices[vals[3]-1].z-vertices[vals[1]-1].z]);

         v1 = vec3.normalize(v1);
         v2 = vec3.normalize(v2);

         vector = vec3.cross(v1, v2);

         for (var i = 0; i < 3; i++) {
            vertexNormals.push(vector[0]);
            vertexNormals.push(vector[1]);
            vertexNormals.push(vector[2]);
         }

         for (var i = 0; i < 3; i++) {
            vertexPositions.push(vertices[vals[i+1]-1].x);
            vertexPositions.push(vertices[vals[i+1]-1].y);
            vertexPositions.push(vertices[vals[i+1]-1].z - this.zSubtraction);
         }

         for (var i = 0; i < 3; i++) {
            vertexTextureCoords.push(textures[vals[i+1]-1].x);
            vertexTextureCoords.push(textures[vals[i+1]-1].y);
         }

         vertexCount += 3;
      }
   }

   return this.BindGLBuffers(vertexCount, vertexPositions, vertexTextureCoords,
                             vertexNormals);
}

Mesh.prototype.CalculateExtremes = function(vertices, i) {
   if (vertices[i].x < this.min.x)
      this.min.x = vertices[i].x;
   if (vertices[i].x > this.max.x)
      this.max.x = vertices[i].x;

   if (vertices[i].y < this.min.y)
      this.min.y = vertices[i].y;
   if (vertices[i].y > this.max.y)
      this.max.y = vertices[i].y;

   if (vertices[i].z < this.min.z)
      this.min.z = vertices[i].z;
   if (vertices[i].z > this.max.z)
      this.max.z = vertices[i].z;
}

Mesh.prototype.InitTexture = function() {
   var texture = gl.createTexture();
   texture.image = new Image();
   texture.image.onload = function () {
      HandleLoadedTexture(texture);
   }
   texture.image.src = this.textureFile;

   return texture;
}

Mesh.prototype.BindGLBuffers = function(count, vertexPositions, vertexTextureCoords, vertexNormals) {
   var vertexPositionBuffer, vertexTextureCoordBuffer, vertexNormalBuffer;

   vertexPositionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
   vertexPositionBuffer.itemSize = 3;
   vertexPositionBuffer.numItems = count;

   vertexTextureCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
   vertexTextureCoordBuffer.itemSize = 2;
   vertexTextureCoordBuffer.numItems = count;

   vertexNormalBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
   vertexNormalBuffer.itemSize = 3;
   vertexNormalBuffer.numItems = count;

   return new Buffers(vertexPositionBuffer, vertexTextureCoordBuffer, vertexNormalBuffer, null);
}

Mesh.prototype.Draw = function(waterHeight) {
   gl.pushMatrix();
      //console.log(this.max.z - waterHeight);// + " max " + this.max.z);
      gl.translate([0.0, 0.0, -(this.max.z - waterHeight)]);

      gl.shader.setAttribute('aVertexPosition', this.buffers.positionBuffer);
      gl.shader.setAttribute('aTextureCoord', this.buffers.textureCoordBuffer);
      gl.shader.setAttribute('aVertexNormal', this.buffers.normalBuffer);
          
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.shader.setUniforms({'sampler':0});

      setMatrixUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, this.buffers.positionBuffer.numItems);
   gl.popMatrix();
}

function HandleLoadedTexture(texture) {
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   gl.generateMipmap(gl.TEXTURE_2D);

   gl.bindTexture(gl.TEXTURE_2D, null);
}

function setMatrixUniforms() {
   var normalMatrix = mat3.create();
   mat4.toInverseMat3(gl.modelViewMatrix, normalMatrix);
   mat3.transpose(normalMatrix);

   var uniforms = {
      'pMatrix': gl.projectionMatrix,
      'mvMatrix': gl.modelViewMatrix,
      'nMatrix': normalMatrix
   };
   gl.shader.setUniforms(uniforms);
}
