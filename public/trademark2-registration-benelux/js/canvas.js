CanvasRenderingContext2D.prototype.plotRoundRect = function(x, y, w, h, r)
{
  if (typeof r === "undefined")
    r = 5;
  this.beginPath();
  this.moveTo(x + r, y);
  this.lineTo(x + w - r, y);
  this.quadraticCurveTo(x + w, y, x + w, y + r);
  this.lineTo(x + w, y + h - r);
  this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  this.lineTo(x + r, y + h);
  this.quadraticCurveTo(x, y + h, x, y + h - r);
  this.lineTo(x, y + r);
  this.quadraticCurveTo(x, y, x + r, y);
  this.closePath();
};

CanvasRenderingContext2D.prototype.plotCapsule = function(x1, y1, x2, y2, r)
{
  let dx = x2 - x1;
  let dy = y2 - y1;
  let d = Math.sqrt(dx*dx + dy*dy);
  let a = Math.atan2(dy, dx);
  let cx = (x1 + x2)/2;
  let cy = (y1 + y2)/2;
  this.save();
  this.translate(cx, cy);
  this.rotate(a);
  this.plotRoundRect(-d/2 - r/2, -r/2, d + r, r, r/2);
  this.restore();
} 

CanvasRenderingContext2D.prototype.fillRoundRect = function(x, y, w, h, r)
{
  this.plotRoundRect(x, y, w, h, r);
  this.fill();
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, w, h, r)
{
  this.plotRoundRect(x, y, w, h, r);
  this.stroke();
};

CanvasRenderingContext2D.prototype.fillCapsule = function(x1, y1, x2, y2, r)
{
  this.plotCapsule(x1, y1, x2, y2, r);
  this.fill();
}

CanvasRenderingContext2D.prototype.strokeCapsule = function(x1, y1, x2, y2, r)
{
  this.plotCapsule(x1, y1, x2, y2, r);
  this.stroke();
}

CanvasRenderingContext2D.prototype.drawImageR = function(img, r, x, y, w, h)
{
  this.save();
  this.translate(x, y);
  this.rotate(r);
  this.drawImage(img, 0, 0, img.width, img.height, -w/2, -h/2, w, h);
  this.restore();
}

CanvasRenderingContext2D.prototype.drawImageA = function(img, bx, by, bw, bh)
{
  let aspect = bw/bh;
  let cw = img.width;
  let ch = img.height;
  if (cw/ch > bw/bh)
    cw = aspect*ch;
  else
    ch = cw/aspect;
  let cx = img.width/2 - cw/2;
  let cy = img.height/2 - ch/2;
  this.drawImage(img, cx, cy, cw, ch, bx, by, bw, bh);
}

CanvasRenderingContext2D.prototype.outlinePolygon = function(coords, holes, ratio) {
  let len = Geo.perimeter(coords, true);
  let t = ratio*len;
  var n = 0;
  this.beginPath();
  this.moveTo(coords[0][0], coords[0][1]);
  for (var i = 0; i < coords.length; i++) {
    var a = coords[i];
    var b = coords[i + 1] ? coords[i + 1] : coords[0];
    var d = Geo.distance(a, b);
    this.lineTo(a[0], a[1]);
    if (n + d > t) {
      var r = (t - n)/d;
      let dx = b[0] - a[0];
      let dy = b[1] - a[1];
      this.lineTo(a[0] + r*dx, a[1] + r*dy);
      break;
    }
    n += d;
  }
  this.stroke();
}

CanvasRenderingContext2D.prototype.plotPolygon = function(coords, holes) {
  this.moveTo(coords[0][0], coords[0][1]);
  for (let i = 1; i < coords.length; i++)
    this.lineTo(coords[i][0], coords[i][1]);
  if (holes) {
    for (let j = 1; j < holes.length; j++ ) {
      let hole = holes[j];
      this.moveTo(hole[0][0], hole[0][1]);
      for (let i = 1; i < hole.length; i++)
        this.lineTo(hole[i][0], hole[i][1]);
    }
  }
}

CanvasRenderingContext2D.prototype.scaleText = function(text, x, y, w, min, max) {
  let m = this.measureText(text);
  let s = w/m.width;
  if (min != null)
    s = Math.max(s, min);
  if (max != null)
    s = Math.min(s, max);
  this.save();
  this.translate(x, y);
  this.scale(s, s);
  this.fillText(text, 0, 0);
  this.restore();
}