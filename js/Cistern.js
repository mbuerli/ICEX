function Cistern(name, file) {
   this.name = name;
   this.file = file;
   this.rock;
   this.water;
}

Cistern.prototype.loadCistern = function() {
   var min = new Vertex(999, 999, 999);
   var max = new Vertex(-999, -999, -999);

   // Rock vertex file
   var request = new XMLHttpRequest();
   console.log(this.file + ".txt");
   request.open("GET", this.file + ".txt", false);
   request.send();
   this.rock = new Mesh(request.responseText, "textures/Stones.jpg",
                        min, max, 0.0);

   // Water vertex file
   var requestWater = new XMLHttpRequest();
   requestWater.open("GET", this.file + "Water.txt", false);
   requestWater.send();
   this.water = new Mesh(requestWater.responseText, "textures/WaterTex.gif",
                         min, max, this.rock.max.z);
}

Cistern.prototype.drawCistern = function(waterHeight) {
   this.rock.Draw(0.0);

   if (waterHeight > 0.0)
      this.water.Draw(waterHeight);
}
