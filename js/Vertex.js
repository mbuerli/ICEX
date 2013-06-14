function Vertex(x, y, z) {
   this.x = x;
   this.y = y;
   this.z = z;
   this.print = function() {
     console.log("["+this.x+","+this.y+","+this.z+"]");
   };
}
