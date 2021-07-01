class Geometry {
  // Checks if an edge cuts the ray
  cutRay(a, b, q) {
    return ((a[1] > q[1] && b[1] < q[1]) || (a[1] < q[1] && b[1] > q[1]))
      && (q[0] - a[0] < (q[1] - a[1])*(b[0] - a[0])/(b[1] - a[1]));
  }

  // Checks if the ray crosses boundary from interior to exterior
  crossBoundary(a, b, q) {
    return (a[1] == q[1] && a[0] > q[0] && b[1] < q[1]) ||
      (b[1] == q[1] && b[0] > q[0] && a[1] < q[1]);
  }

  // Checks if a point is inside the polygon
  pointInPoly(p, q) {
    let inside = false;
    let a = p[p.length - 1];
    for (let i = 0; i < p.length; i++) {
      let b = p[i];
      if (this.cutRay(a, b, q) || this.crossBoundary(a, b, q))
        inside = !inside;
      a = b;
    }
    return inside;
  }

  distance(a, b) {
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    return Math.sqrt(dx*dx + dy*dy);
  }

  segmentVsSegment(a, b, c, d) {
    var dx1 = b[0] - a[0];
    var dy1 = b[1] - a[1];
    var dx2 = d[0] - c[0];
    var dy2 = d[1] - c[1];
    var d = dx1*dy2 - dy1*dx2;
    if (d == 0) return;
    var dx3 = a[0] - c[0];
    var dy3 = a[1] - c[1];
    var t1 = (dx2*dy3 - dy2*dx3)/d;
    if (t1 < 0 || t1 > 1) return;
    var t2 = (dx1*dy3 - dy1*dx3)/d;
    if (t2 < 0 || t2 > 1) return;
    return [ a[0] + t1*dx1, a[1] + t1*dy1 ];
  }

  rayVsPoly(p, a, b) {
    let last = p[p.length - 1];
    for (let i = 0; i < p.length; i++) {
      let cur = p[i];
      let res = this.segmentVsSegment(last, cur, a, b);
      if (res) return res;
      last = cur;
    }
  }
   
  comparison(a, b) {
    return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
  }
   
  cross(a, b, o) {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  }

  convexHull(points) {
    points = [...points];
    points.sort(this.comparison);
    var L = [];
    for (var i = 0; i < points.length; i++) {
      while (L.length >= 2 && this.cross(L[L.length - 2], L[L.length - 1], points[i]) <= 0) {
        L.pop();
      }
      L.push(points[i]);
    }
    var U = [];
    for (var i = points.length - 1; i >= 0; i--) {
      while (U.length >= 2 && this.cross(U[U.length - 2], U[U.length - 1], points[i]) <= 0) {
        U.pop();
      }
      U.push(points[i]);
    }
    L.pop();
    U.pop();
    return L.concat(U);
  }

  AABB(points) {
    let left, right, top, bottom;
    left = right = points[0][0];
    top = bottom = points[0][1];
    for (let i = 1; i < points.length; i++) {
      let v = points[i];
      left = Math.min(left, v[0]);
      right = Math.max(right, v[0]);
      top = Math.min(top, v[1]);
      bottom = Math.max(bottom, v[1]);
    }
    let r = {};
    r.x = left;
    r.y = top;
    r.width = right - left;
    r.height = bottom - top;
    return r;
  }
  
  mergeAABB(a, b, c) {
    if (c == null)
      c = { ...a };
    c.x = Math.min(a.x, b.x);
    c.y = Math.min(a.y, b.y);
    c.width = Math.max(a.width, (b.x + b.width) - a.x);
    c.height = Math.max(a.height, (b.y + b.height) - a.y);
    return c;
  }

  perimeter(p, loop) {
    var n = 0;
    var e = (loop) ? p.length : p.length - 1;
    for (var i = 0; i < e; i++) {
      var a = p[i];
      var b = p[i + 1] ? p[i + 1] : p[0];
      n += this.distance(a, b);
    }
    return n;
  }

  centroid(points)
  {
    let cx = 0;
    let cy = 0;
    let sa = 0;
    let a = points[points.length - 1];
    for (let i = 0; i < points.length; i++)
    {
      let b = points[i];
      let f = a[0]*b[1] - b[0]*a[1];
      sa += f;
      cx += (a[0] + b[0])*f;
      cy += (a[1] + b[1])*f;
      a = b;
    }
    sa *= 3;
    return [ cx/sa, cy/sa ];
  }
  
  signedPolyArea(p) {
    let s = 0;
    let a = p[p.length - 1];
    for (let i = 0; i < p.length; i++) {
      let b = p[i];
      s = s + (b[0] + a[0])*(b[1] - a[1]);
      a = b;
    }
    return s;
  }

  getPoints(geo, points) {
    if (points === undefined)
      points = [];
    let coords = geo["coordinates"];
    if (geo["type"] == "Polygon") {
      for (let i = 0; i < coords.length; i++)
        for (let j = 0; j < coords[i].length; j++)
          points.push(coords[i][j]);
    } else if (geo["type"] == "MultiPolygon") {
      for (let i = 0; i < coords.length; i++)
        for (let j = 0; j < coords[i][0].length; j++)
          points.push(coords[i][0][j]);
    } else if (geo["type"] == "Point") {
      points.push(coords[0]);
    }
    return points;
  }
  
  getPolygons(geo) {
    let coords = geo["coordinates"];
    let list = [];
    if (geo["type"] == "Polygon") {
      for (let i = 0; i < coords.length; i++)
        list.push(coords[i]);
    } else if (geo["type"] == "MultiPolygon") {
      for (let i = 0; i < coords.length; i++)
        list.push(coords[i][0]);
    }
    return list;
  }
  
  getLargestPolygon(geo) {
    let list = this.getPolygons(geo);
    let areas = {};
    for (let i = 0; i < list.length; i++) {
      let p = list[i];
      areas[p] = Math.abs(this.signedPolyArea(p));
    }
    list.sort(function(a, b) {
      return areas[b] - areas[a];
    });
    return list[0];
  }
  
  pointInGeo(geo, lp) {
    let coords = geo["coordinates"];
    if (geo["type"] == "Polygon") {
      for (let i = 0; i < coords.length; i++) {
        if (this.pointInPoly(coords[i], lp)) return true;
      }
    } else if (geo["type"] == "MultiPolygon") {
      for (let i = 0; i < coords.length; i++) {
        // todo: ignore holes/enclaves
        if (this.pointInPoly(coords[i][0], lp)) return true;
      }
    }
    return false;
  }
}

var Geo = new Geometry;