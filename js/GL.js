function GL(options) {
  var gl;
  options = options || {};
  if (options.canvas) {
    var canvas = options.canvas;
  } else {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  } 
  canvas.width = options.width || 800;
  canvas.height = options.height || 600;
  try { gl = canvas.getContext('webgl', options); } catch (e) {}
  try { gl = gl || canvas.getContext('experimental-webgl', options); } catch (e) {}
  if (!gl) throw 'WebGL not supported';

  addMatrixStacks(gl);
  addDrawFunctions(gl);
  return gl;
}

function addMatrixStacks(gl) {
  gl.MODELVIEW = 1; gl.PROJECTION = 2;
  gl.modelViewMatrix = mat4.create();
  gl.projectionMatrix = mat4.create();
  gl.modelViewMatrixStack = [];
  gl.projectionMatrixStack = [];

  gl.matrixMode = function(mode) {
    if (mode == gl.MODELVIEW) {
      gl.matrix = gl.modelViewMatrix;
      gl.matrixStack = gl.modelViewMatrixStack;
    }
    else if (mode == gl.PROJECTION) {
      gl.matrix = gl.projectionMatrix;
      gl.matrixStack = gl.projectionMatrixStack;
    }
  }

  gl.loadIdentity = function() {
    mat4.identity(gl.matrix);
  }

  gl.pushMatrix = function() {
    var copy = mat4.create();
    mat4.set(gl.matrix, copy);
    gl.matrixStack.push(copy);
  };
  
  gl.popMatrix = function() {
    if (gl.matrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    var m = gl.matrixStack.pop();
    mat4.set(m, gl.matrix);
  };

  gl.perspective = function(fov,aspect,near,far) {
    fov = fov || 45;
    aspect = aspect || (gl.canvas.width / gl.canvas.height);
    near = near || 0.1;
    far = far || 100.0;
    mat4.perspective(fov,aspect,near,far,gl.projectionMatrix);
  }

  gl.rotate = function(deg,axis) {
    axis = axis || [0, 1, 0];
    mat4.rotate(gl.matrix, deg * Math.PI / 180.0, axis);
  }

  gl.translate = function(vec) {
     mat4.translate(gl.matrix, vec);
  }

  gl.scale = function(vec) {
     mat4.scale(gl.matrix, vec);
  }

  gl.matrixMode(gl.MODELVIEW);
}

function addDrawFunctions(gl) {
  gl.update = function() {}
  gl.draw = function() {}
  gl.resize = function() {
    gl.canvas.width = window.innerWidth - 300;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION);
    gl.loadIdentity();
    gl.perspective();
    gl.matrixMode(gl.MODELVIEW);
    gl.draw();
  }
  gl.loadShader = function(vertexFile, fragFile) {
    gl.shader = new Shader(gl, vertexFile, fragFile);
  }
  gl.animate = function() {
    if (gl.paused) {
      gl.paused = false;
      gl.animation();
    }
  }
  gl.animation = function() {
    if (!gl.paused) requestAnimFrame(gl.animation);
    gl.update();
    gl.draw();
  }
  gl.pause = function() {
    gl.paused = true;
  }
  gl.paused = true;
  window.onresize = gl.resize;
}

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();