var gl;
var waterLevel = 0.5;
var cistern;

var consumption = 0.0;

var xRot = 0;
var xSpeed = 0;

var yRot = 0;
var ySpeed = 0;

var zVal = -15.0;

var filter = 0;
var currentlyPressedKeys = {};

window.onerror = function(text) {alert(text)};
window.onload = function() {
  gl = new GL();
  gl.loadShader("shaders/vertex.glsl", "shaders/fragment.glsl");
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(1,1,1,1);
  //gl.disableVertexAttribArray(3);
  cistern = new Cistern("House Dar Ta'anna", "vertices/HouseDarTa'anna");
  cistern.loadCistern();

  gl.draw = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    var uniforms = {
      'waterLevel' : [waterLevel-0.05,0,0],
      'useLighting' : true,
      'useTextures' : true,
      'ambientColor' : [0.2, 0.2, 0.2],
      'pointLightingLocation' : [0.0, 0.0, 0.0],
      'pointLightingColor' : [0.8, 0.8, 0.8]
    };
    gl.shader.setUniforms(uniforms);

    gl.matrixMode(gl.PROJECTION);
    gl.pushMatrix();
      gl.translate([0,-2,-15]);
      gl.rotate(yRot, [0, 1, 0]);
      //gl.rotate(xRot, [1, 0, 0]);

    gl.matrixMode(gl.MODELVIEW);
    gl.loadIdentity();

    gl.pushMatrix();
      gl.translate([-(cistern.rock.max.x + cistern.rock.min.x)/2,
                       -(cistern.rock.max.y + cistern.rock.min.y)/2, -cistern.rock.min.z]);
      gl.rotate(-90, [1, 0, 0]);
      cistern.drawCistern(waterLevel);
    gl.popMatrix();

    gl.matrixMode(gl.PROJECTION);
    gl.popMatrix();

    gl.matrixMode(gl.MODELVIEW);
  }

  gl.update = function() {
    yRot += 0.04;
    waterLevel -= consumption;
    if (waterLevel < -0.1) gl.pause();
  }

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  document.getElementById('loading').innerHTML = '';
  gl.resize();
  gl.animate();
}

function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = true;

   if (String.fromCharCode(event.keyCode) == "F") {
      filter += 1;
      if (filter == 3) {
         filter = 0;
      }
   }
   handleKeys();
   gl.draw();
}

function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
   if (currentlyPressedKeys[33]) {
      // Page Up
      zVal -= 0.05;
   }
   if (currentlyPressedKeys[34]) {
      // Page Down
      zVal += 0.05;
   }
   if (currentlyPressedKeys[37]) {
      // Left cursor key
      yRot -= 1;
   }
   if (currentlyPressedKeys[39]) {
      // Right cursor key
      yRot += 1;
   }
   if (currentlyPressedKeys[38]) {
      // Up cursor key
      xRot -= 1;
   }
   if (currentlyPressedKeys[40]) {
      // Down cursor key
      xRot += 1;
   }
}

function updateWaterLevels() {
    // calcDefaultWaterLevel();
    // calcAlteredWaterLevel();
}

// function calcDefaultWaterLevel() {
//     //get user inputs
//     var num_people = parseFloat(document.getElementById("num_people").value);
//     var have_dishwasher = parseFloat(document.getElementById("have_dishwasher").value);
//     var have_washing_machine = parseFloat(document.getElementById("have_washing_machine").value);
//     var num_months = parseFloat(document.getElementById("num_months").value);

//     //set cistern metrics
//     var base_area = 9.7;

//     //set usage metrics
//     var flush = 6;
//     var flushes_per_day = 3;
//     var shower_per_min = 4;
//     var shower_length = 10;
//     var showers_per_day = 0.5;
//     var dishwasher = 37.5;
//     var dishwashes_per_day = 1.0/3.0;
//     var washing_machine = 112.5;
//     var washes_per_day = 1.0/7.0;

//     //daily usage calculations
//     var day_per_person = flush * flushes_per_day
//         + shower_per_min * shower_length * showers_per_day;
//     var day = have_dishwasher * dishwasher * dishwashes_per_day
//         + have_washing_machine * washing_machine * washes_per_day;
//     var month = (day_per_person * num_people + day) * 365 / 12;

//     //average monthly rainfall for Maltese Islands
//     var rainfall = [89, 68, 53, 34, 23, 0, 0, 0, 36, 79, 91, 95];

//     var cistern_level_liters = base_area * cistern.rock.max.z * 1000;

//     //march thru months, adding rainfall, and subtracting usage
//     for (var i = 0; i < num_months; i++) {
//         cistern_level_liters += rainfall[i%12] - month;
//     }

//     //convert cistern level from liters to meters
//     defaultWater = cistern_level_liters / (base_area * 1000);
//     //ensure that the level is not negative
//     if (defaultWater < 0)
//         defaultWater = 0;
//     else if (defaultWater > cistern.rock.max.z)
//         defaultWater = cistern.rock.max.z;
// }

// function calcAlteredWaterLevel() {
//     //get user inputs
//     var num_people = parseFloat(document.getElementById("num_people").value);
//     var have_dishwasher = parseFloat(document.getElementById("have_dishwasher").value);
//     var have_washing_machine = parseFloat(document.getElementById("have_washing_machine").value);
//     var num_months = parseFloat(document.getElementById("num_months").value);

//     //set cistern metrics
//     var base_area = 9.7;

//     //set usage metrics
//     var flush = 6;
//     var flushes_per_day = 3;
//     var shower_per_min = 4;
//     var shower_length = parseFloat(document.getElementById("shower_length").value);
//     var showers_per_day = 0.5;
//     var dishwasher = 37.5;
//     var dishwashes_per_day = 1 / parseFloat(document.getElementById("days_between_dishwashes").value);
//     var washing_machine = 112.5;
//     var washes_per_day = 1 / parseFloat(document.getElementById("days_between_washes").value);

//     //daily usage calculations
//     var day_per_person = flush * flushes_per_day
//         + shower_per_min * shower_length * showers_per_day;
//     var day = have_dishwasher * dishwasher * dishwashes_per_day
//         + have_washing_machine * washing_machine * washes_per_day;
//     var month = (day_per_person*num_people + day) * 365 / 12;

//     //average monthly rainfall for Maltese Islands
//     var rainfall = [89, 68, 53, 34, 23, 0, 0, 0, 36, 79, 91, 95];

//     var cistern_level_liters = base_area * cistern.rock.max.z * 1000;

//     //march thru months, adding rainfall, and subtracting usage
//     for (var i = 0; i < num_months; i++) {
//         cistern_level_liters += rainfall[i%12] - month;
//     }

//     //convert cistern level from liters to meters
//     alteredWater = cistern_level_liters / (base_area * 1000);
//     //ensure that the level is not negative
//     if (alteredWater < 0)
//         alteredWater = 0;
//     else if (alteredWater > cistern.rock.max.z)
//         alteredWater = cistern.rock.max.z;
// }

function reset() {
  consumption = 0.01;
  waterLevel = 1;
  gl.animate();
  num_months = 0;
  document.getElementById("num_months").selectedIndex = 0;
  updateWaterLevels();
}