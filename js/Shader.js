// Many ideas / code borrowed from https://github.com/evanw/lightgl.js

function getFile(filePath) {
  var fileText;
  $.ajax({
    url: filePath,
    type: 'GET',
    dataType: "text",
    async: false,
    success: function(text) {
      fileText = text;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      throw textStatus + ' : ' + errorThrown;
    }
  });
  return fileText;
}

function regexMap(regex, text, callback) {
  while ((result = regex.exec(text)) != null) {
    callback(result);
  }
}

function Shader(gl, vertexShaderFile, fragmentShaderFile) {
  this.gl = gl;
  var vertexSource = getFile(vertexShaderFile);
  var fragmentSource = getFile(fragmentShaderFile);

  function compileSource(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw 'compile error: ' + gl.getShaderInfoLog(shader);
    }
    return shader;
  }

  this.program = gl.createProgram();
  gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(this.program);

  if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
    throw 'link error: ' + gl.getProgramInfoLog(this.program);
  }

  this.attributes = {};
  this.uniformLocations = {};
  this.samplers = {};

  var tsamplers = {};
  regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function(groups) {
    tsamplers[groups[2]] = 1;
  });
  this.samplers = tsamplers;
}

function isArray(obj) {
  var str = Object.prototype.toString.call(obj);
  return str == '[object Array]' || str == '[object Float32Array]';
}

function isNumber(obj) {
  var str = Object.prototype.toString.call(obj);
  return str == '[object Number]' || str == '[object Boolean]';
}

// var tempMatrix = new Matrix();
// var resultMatrix = new Matrix();

Shader.prototype = {
  setUniforms: function(uniforms) {
    var gl = this.gl;
    gl.useProgram(this.program);

    for (var name in uniforms) {
      var location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
      if (!location) {console.log('Unknown uniform ' + name); continue;}
      this.uniformLocations[name] = location;
      var value = uniforms[name];
      if (isArray(value)) {
        switch (value.length) {
          case 1: gl.uniform1fv(location, new Float32Array(value)); break;
          case 2: gl.uniform2fv(location, new Float32Array(value)); break;
          case 3: gl.uniform3fv(location, new Float32Array(value)); break;
          case 4: gl.uniform4fv(location, new Float32Array(value)); break;
          case 9: gl.uniformMatrix3fv(location, false, new Float32Array(value)); break;
          case 16: gl.uniformMatrix4fv(location, false, new Float32Array(value)); break;
          default: throw 'don\'t know how to load uniform "' + name + '" of length ' + value.length;
        }
      } else if (isNumber(value)) {
        gl.uniform1i(location, value);
        //(this.samplers[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
      } else {
        throw 'attempted to set uniform "' + name + '" to invalid value ' + value;
      }
    }

    return this;
  },

  setAttribute: function(name, buffer, type) {
    var gl = this.gl;
    type = type || gl.FLOAT;
    gl.useProgram(this.program);
    var location = this.attributes[name];
    if (!location) {
      location = gl.getAttribLocation(this.program, name);
      if (location < 0) {console.log("Unknown attribute " + name);return;}
      gl.enableVertexAttribArray(location);
      location++;
      this.attributes[name] = location;
    }
    location--;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, buffer.itemSize, type, false, 0, 0);
  }
};