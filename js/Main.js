var gl;
var cistern;

var consumption = 0.0;
var waterLevel = 0.5;
var num_months, total_months;
var total_rain = 0.0;
var timestep = 0.1; //100th of month
var total_volume;

var pitch = 15;
var angle = 0;
var zoom = -10.0;

var currentlyPressedKeys = {};

window.onerror = function(text) {alert(text)};
window.onload = function() {
  gl = new GL();
  gl.loadShader("shaders/vertex.glsl", "shaders/fragment.glsl");
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);

  cistern = new Cistern("House Dar Ta'anna", "vertices/HouseDarTa'anna");
  cistern.loadCistern();
  var base_area = 9.7;
  total_volume = base_area * 3000;

  gl.draw = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    var uniforms = {
      'waterLevel' : [waterLevel-0.05,0,0],
      'useLighting' : true,
      'useTextures' : true,
      'ambientColor' : [0.2, 0.2, 0.2],
      'pointLightingLocation' : [0, 0, 1],
      'pointLightingColor' : [0.8, 0.8, 0.8]
    };
    gl.shader.setUniforms(uniforms);

    // Modify projection for camera view
    gl.matrixMode(gl.PROJECTION);
    gl.pushMatrix();
      gl.translate([0,0,zoom]);
      gl.rotate(pitch, [1, 0, 0]);
      gl.rotate(angle, [0, 1, 0]);

    gl.matrixMode(gl.MODELVIEW);
    gl.loadIdentity();

    // Place / Draw Cistern
    gl.pushMatrix();
      gl.translate([-(cistern.rock.max.x + cistern.rock.min.x)/2,
                       -(cistern.rock.max.y + cistern.rock.min.y)/2, -1-cistern.rock.min.z]);
      gl.rotate(-90, [1, 0, 0]);
      cistern.drawCistern(waterLevel);
    gl.popMatrix();

    gl.matrixMode(gl.PROJECTION);
    gl.popMatrix();

    gl.matrixMode(gl.MODELVIEW);
  }

  gl.update = function() {
    angle += 0.04;
    
    // If running simulation
    if(total_months) {
      updateWaterLevel();
    }
  }

  gl.onresize = function(w,h) {
    // resize canvas and background
    gl.canvas.width = w - 300;
    gl.canvas.height = h;
    $("#background").width(w - 300);
    $("#background").height(h);
  }

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  document.getElementById('loading').innerHTML = '';
  gl.resize();
  gl.animate();
}

function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = true;
   handleKeys();
   gl.draw();
}

function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
   if (currentlyPressedKeys[33]) {
      // Page Up
      zoom -= 0.05;
   }
   if (currentlyPressedKeys[34]) {
      // Page Down
      zoom += 0.05;
   }
   if (currentlyPressedKeys[37]) {
      // Left cursor key
      angle -= 1;
   }
   if (currentlyPressedKeys[39]) {
      // Right cursor key
      angle += 1;
   }
   if (currentlyPressedKeys[38]) {
      // Up cursor key
      pitch -= 1;
      if (pitch < 0) pitch = 0;
   }
   if (currentlyPressedKeys[40]) {
      // Down cursor key
      pitch += 1;
      if (pitch > 90) pitch = 90;
   }
}

function updateWaterLevels() {}

function updateWaterConsumption() {
  var num_people = parseFloat(document.getElementById("num_people").value);
  var have_dishwasher = parseFloat(document.getElementById("have_dishwasher").value);
  var have_washing_machine = parseFloat(document.getElementById("have_washing_machine").value);
  var flush = 6;
  var flushes_per_day = 3;
  var shower_per_min = 4;
  var shower_length = parseFloat(document.getElementById("shower_length").value);
  var showers_per_day = 0.5;
  var dishwasher = 37.5;
  var dishwashes_per_day = 1 / parseFloat(document.getElementById("days_between_dishwashes").value);
  var washing_machine = 112.5;
  var washes_per_day = 1 / parseFloat(document.getElementById("days_between_washes").value);

  var day_per_person = flush * flushes_per_day
      + shower_per_min * shower_length * showers_per_day;
  var day = have_dishwasher * dishwasher * dishwashes_per_day
      + have_washing_machine * washing_machine * washes_per_day;
  var monthly_consumption = (day_per_person * num_people + day) * 365 / 12;
  consumption = monthly_consumption / total_volume * timestep;
}

function updateWaterLevel() {
  waterLevel -= consumption;
  num_months -= timestep;
  var month = Math.floor(total_months - num_months)
  if (month > 11) {
    var year = Math.floor(month/12);
    var mon = month - year*12
    if (mon) {
      document.getElementById("month").innerHTML = "Year " + year +  " Month " + mon;
    } else {
      document.getElementById("month").innerHTML = "Year " + year;
    }
  } else {
    document.getElementById("month").innerHTML = "Month " + month;
  }
  updateRainfall(month);
  if (waterLevel > 1) waterLevel = 1;
  if (waterLevel < -0.1) gl.pause();
  if (num_months < 0) gl.pause();
}

function updateRainfall(month) {
  var monthly_rain = [89, 68, 53, 34, 23, 0, 0, 0, 36, 79, 91, 95];
  if (Math.random() < (monthly_rain[month%12]/100)) {
    //Make it rain
    var rainfall = 8000 / total_volume * timestep
    waterLevel += rainfall;
    total_rain += rainfall;
    // Update rain visual
    $("#rain").height(42*total_rain); //42 is height of one drop
  }
}

function go() {
  timestep = parseFloat(document.getElementById("speed").value);
  num_months = parseFloat(document.getElementById("num_months").value);
  total_months = num_months;
  updateWaterConsumption();
  waterLevel = 1;
  total_rain = 0;
  gl.animate();
}