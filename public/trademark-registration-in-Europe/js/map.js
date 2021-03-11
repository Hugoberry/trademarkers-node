const sea = "#fff";
const dark = "#888";
const land = "#ccc";
const blue = "#448";
const selected = "#fff";
const shadow = "#000";
const border = "#bbb";
const epsilon = 0.1;
const NS = "http://www.w3.org/2000/svg";

const continents =
{
  EUR: ["NY","AL","AT","BA","BE","BG","BY","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GB","GE","GR","HR","HU","IE","IS","IT","KV","LT","LU","LV","MD","ME","MK","NL","NO","PL","PT","RO","RS","SE","SI","SK","UA"],
  NAM: ["BS","BZ","CA","CR","CU","DO","GL","GT","HN","HT","JM","MX","NI","PA","PR","SV","TT","US"],
  AFR: ["SM","AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","DJ","DZ","EG","EH","ER","ET","GA","GH","GM","GN","GQ","GW","KE","LR","LS","LY","MA","MG","ML","MR","MW","MZ","NA","NE","NG","RW","SD","SL","SN","SO","SS","SZ","TD","TG","TN","TZ","UG","ZA","ZM","ZW"],
  ASA: ["AE","AF","AM","AZ","BD","BN","BT","CN","ID","IL","IN","IQ","IR","JO","JP","KG","KH","KP","KR","KW","KZ","LA","LB","LK","MM","MN","MY","NP","OM","PH","PK","PS","QA","RU","SA","SY","TH","TJ","TL","TM","TR","TW","UZ","VN","YE"],
  SAM: ["AR","BO","BR","CL","CO","EC","FK","GF","GY","PE","PY","SR","UY","VE"],
  OCE: ["AU","FJ","NC","NZ","PG","SB","VU"]
}
const regions =
{
  BX: ["BE","NL","LU"]
}
const EU =
[
  "BE","BG","CZ","DK","DE","EE","IE","EL","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE"
]
const colors = {};
for (let i = 0; i < EU.length; i++)
  colors[ EU[i] ] = blue;

var spritesheet = new Image();
spritesheet.src = "img/girl10x5.png";
const cols = 10;
const rows = 5;

const animations = {
  idle: { start:0, frames:10, bounce:true },
  gesture1: { start:10, frames:10, bounce:true },
  gesture2: { start:10, frames:25, bounce:true },
  gesture3: { start:10, frames:40, bounce:true },
}

class MapViewer {
  constructor() {
    this.flags = {};
    this.geo = {};
    this.data = {};
    this.x = 0; this.y = 0; this.z = 1;
    this.rect = {};
    this.time = 0;
    this.loaded = 0;
    this.total = 0;
    this.ready = false;
    this.mouse = {x:0, y:0};
    this.presenter = false;
  }
  
  renderMap(svg, data) {
    for (let i = 0; i < data.features.length; i++) {
      let geo = data.features[i].geometry;
      let coords = geo["coordinates"];
      if (geo["type"] == "Polygon") {
        for (let i = 0; i < coords.length; i++) {
          let p = document.createElementNS(NS, "polygon");
          p.setAttributeNS(null, "points", coords[i]);
          svg.appendChild(p);
        }
      } else if (geo["type"] == "MultiPolygon") {
        for (let i = 0; i < coords.length; i++) {
          let poly = coords[i][0];
          let out = [];
          out.push("M"+poly[0][0]+","+poly[0][1]);
          for (let j = 1; j < poly.length; j++)
            out.push(" L"+poly[j][0]+","+poly[j][1]);
          for (let j = 1; j < coords[i].length; j++) {
            let hole = coords[i][j];
            out.push("M"+hole[0][0]+","+hole[0][1]);
            for (let k = 1; k < hole.length; k++)
              out.push(" L"+hole[k][0]+","+hole[k][1]);
          }
          out = out.join("");
          let p = document.createElementNS(NS, "path");
          p.setAttributeNS(null, "d", out);
          svg.appendChild(p);
        }
      }
    }
    svg.setAttributeNS(null, "fill", land);
    svg.setAttributeNS(null, "stroke", border);
    svg.setAttributeNS(null, "transform", "scale(1, -1)");
    data.svg = svg;
  }

  fetchMap(file, name, delayed) {
    let map = this;
    map.total ++;
    map.ready = false;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        map.loaded ++;
        map.ready = (map.loaded == map.total);
        // load data
        let data = JSON.parse(this.responseText);
        data.name = name;
        map.geo[name] = data;
        // vector graphics
        let svg = svgs[name];
        if (svg)
          map.renderMap(svg, data);
        // props
        let features = data.features;
        for (let i = 0; i < features.length; i++)
          features[i].properties.type = "Country";
        // joined features
        for (let k in continents)
          map.defineContinent(k, continents[k], name);
        for (let k in regions)
          map.defineRegion(k, regions[k], name);
        // bounding box and convex hull
        for (let i = 0; i < features.length; i++) {
          let feat = features[i];
          let prop = feat.properties;
          let geo = feat.geometry;
          let largest = Geo.getLargestPolygon(geo);
          let points = largest;
          if (prop.type != "Country")
            points = Geo.getPoints(geo);
          geo.rect = Geo.AABB(points);
          //geo.hull = Geo.convexHull(points);
          geo.centroid = Geo.centroid(largest);
        }
      }
    };
    xmlhttp.open("GET", file, delayed);
    xmlhttp.send();
  }

  fetchFlag(code) {
    if (this.flags[code])
      return;
    let img = new Image();
    this.flags[code] = img;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let base64 = btoa(this.responseText);
        img.src = "data:image/svg+xml;base64,"+base64;
      }
    }
    xmlhttp.open("GET", "flags/"+code.toLowerCase()+".svg", true);
    xmlhttp.send();
  }

  fetchText(iso, header) {
    let file = "text/"+iso.toLowerCase()+".html";
    lpanel.innerHTML = "";
    cpanel.innerHTML = header || "";
    rpanel.innerHTML = "";
    speech.style["display"] = "none";
    content.style["display"] = "none";
    let map = this;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      let doc;
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        doc = new DOMParser().parseFromString(xmlhttp.responseText, "text/html");
        // replace urls with javascript
        let loc = window.location;
        let cur = loc.protocol+'//'+loc.host+loc.pathname+"?c=";
        let list = doc.getElementsByTagName("A");
        for (let i = 0; i < list.length; i++) {
          let a = list[i].href.toLowerCase();
          if (a.substring(0,cur.length) == cur)
            list[i].setAttribute("href", "javascript:map.selectFeature('"+a.substring(cur.length)+"')");
        }
        map.data[iso] = doc;
      }
      if (header !== undefined) {
        if (doc) {
          let left = doc.getElementById("left");
          if (left) lpanel.innerHTML = left.innerHTML;
          let main = doc.getElementById("center");
          if (main) cpanel.innerHTML = header+main.innerHTML;
          let right = doc.getElementById("right");
          if (right) rpanel.innerHTML = right.innerHTML;
          let msg = doc.getElementById("message");
          if (msg) message.innerHTML = msg.innerHTML; 
        }
        if (lpanel.innerHTML == "") {
          let feat = map.getFeatureById(iso);
          let doc2 = map.data[feat.properties.continent];
          if (doc2) lpanel.innerHTML = doc2.getElementById("left").innerHTML;
        }
      }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
  }
  
  receiveText(xmlrpc, iso) {
  }
  
  defineGroup(list, q) {
    let out = [];
    for (let i = 0; i < list.length; i++) {
      let feat = this.getFeatureById(list[i], q);
      let geo = feat.geometry;
      let coords = geo.coordinates;
      if (geo.type == "MultiPolygon") {
        for (let j = 0; j < coords.length; j++)
          out.push(coords[j]);
      } else if (geo.type == "Polygon") {
        for (let j = 0; j < coords.length; j++)
          out.push([coords[j]]);
      }
    }
    let feat = {};
    feat.properties = {};
    feat.geometry = {};
    feat.geometry.type = "MultiPolygon";
    feat.geometry.coordinates = out;
    return feat;
  }
  
  defineRegion(iso, list, q) {
    for (let i = 0; i < list.length; i++) {
      let feat = this.getFeatureById(list[i], q);
      feat.properties.region = iso;
    }
    let first = this.getFeatureById(list[0], q);
    let feat = this.defineGroup(list, q);
    feat.properties.type = "Region";
    feat.properties.continent = first.properties.continent;
    feat.properties.iso2 = iso;
    this.geo[q].features.push(feat);
    return feat;
  }
  
  defineContinent(iso, list, q) {
    for (let i = 0; i < list.length; i++) {
      let feat = this.getFeatureById(list[i], q);
      feat.properties.continent = iso;
    }
    let feat = this.defineGroup(list, q);
    feat.properties.type = "Continent";
    feat.properties.iso2 = iso;
    this.geo[q].features.push(feat);
    return feat;
  }

  queryFeatures(type, lp, q) {
    let data = this.getGeo(q);
    if (!data || !data.features)
      return;
    let features = data.features;
    for (let i = 0; i < features.length; i++) {
      let feat = features[i];
      if (feat.properties.type != type) continue;
      let geo = feat.geometry;
      let rect = geo.rect;
      if (lp.x < rect.x || lp.x > rect.x + rect.width)
        continue;
      if (lp.y < rect.y || lp.y > rect.y + rect.height)
        continue;
      if (Geo.pointInGeo(geo, lp))
        return feat;
    }
  }
  
  outlineGeometry(ctx, geo, ratio) {
    let coords = geo.coordinates;
    if (geo.type == "Polygon") {
      for (let i = 0; i < coords.length; i++)
        ctx.outlinePolygon(coords[i], null, ratio);
    } else if (geo.type == "MultiPolygon") {
      for (let i = 0; i < coords.length; i++)
        ctx.outlinePolygon(coords[i][0], coords[i], ratio);
    }
  }
  
  plotGeometry(ctx, geo) {
    ctx.beginPath();
    let coords = geo.coordinates;
    if (geo.type == "Polygon") {
      for (let i = 0; i < coords.length; i++)
        ctx.plotPolygon(coords[i], null);
    } else if (geo.type == "MultiPolygon") {
      for (let i = 0; i < coords.length; i++)
        ctx.plotPolygon(coords[i][0], coords[i]);
    }
    ctx.closePath();
  }
  
  setTarget(tx, ty, tz, delay) {
    if (delay === undefined)
      delay = 1;

    let anim = {};
    anim.ix = this.x;
    anim.iy = this.y;
    anim.iz = this.z;
    anim.tx = tx;
    anim.ty = ty;
    anim.tz = tz;
    anim.dx = tx - anim.ix;
    anim.dy = ty - anim.iy;
    anim.dz = tz - anim.iz;
    anim.start = this.time;
    anim.stop = this.time + delay;
    anim.delay = delay;
    anim.done = false;

    this.anim = anim;
  }

  click(id, x, y) { }
  
  resetZoom(delay) {
    this.deselectFeature();
    //this.continent = null;
    //this.tcontinent = null;
    let rect = Geo.AABB([[-140,-20], [180, 80]]);
    this.focusOnRect(rect, delay, 1);
    this.fetchText("hello");
  }

  press(id, x, y, istouch) {
    if (this.anim && !this.anim.done) return;
    let lp = this.toWorld(x, y);
    let feat = this.queryFeatures("Country", lp);
    let targ;
    if (feat) {
      let prop = feat.properties;
      let region = (prop.region) ? prop.region : null;
      if ((this.continent != prop.continent) || (this.region && !region) || this.country)
        targ = prop.continent;
      else if ((this.region != region) && region)
        targ = region;
      else
        targ = prop.iso2;
    } else {
      if (this.country || this.region)
        targ = this.continent;
    }
    if (targ)
      this.selectFeature(targ);
    else
      this.resetZoom(1.5);
    targ = targ || "";
    targ = targ.toLowerCase();
    window.history.pushState({}, null, "?c="+targ);
  }
  
  move(id, x, y, dx, dy, istouch) {
    let mp = this.mouse;
    mp.x = x;
    mp.y = y;
    
  }
  
  release(id, x, y, istouch) { }

  scroll(x, y) { }
  
  setCanvas(c, c2) {
    this.canvas = c;
    this.canvas2 = c2;
    this.resize(c.width, c.height);
  }

  resize(w, h) {
    if (w != this.w || h != this.h) {
      this.w = this.canvas.width = this.canvas2.width = w;
      this.h = this.canvas.height = this.canvas2.height = h;
      //this.resetZoom(1);
    }
  }
  
  toWorld(x, y) {
    let lx = (x - this.w/2)/this.z + this.x;
    let ly = this.y - (y - this.h/2)/this.z;
    return [ lx, ly ];
  }

  toLocal(x, y) {
    let wx = (x - this.x)*this.z + this.w/2;
    let wy = (this.y - y)*this.z + this.h/2;
    return [ wx, wy ];
  }

  deselectFeature() {
    let sel = this.getFeatureById(this.selected);
    if (sel) {
      this.continent = null;
      this.region = null;
      this.country = null;
      
      this.dselected = this.selected;
      this.selected = null;
      this.tselected = this.time;
    }
    if (this.anim)
      this.anim.done = true;;
    this.tflag = null;
    content.style["display"] = "none";
  }
  
  selectFeature(id2, delay) {
    if (delay === undefined)
      delay = 1;
    let id1 = this.selected;
    if (id2 === id1) return;
    this.deselectFeature();
    this.selected = id2;
    this.tselected = this.time;
    let sel = this.getFeatureById(id2, "medium");
    if (!sel) return;

    let prop = sel.properties;
    if (prop.continent)
      this.continent = prop.continent;
    if (prop.region)
      this.region = prop.region;

    if (prop.type == "Continent")
      this.continent = id2;
    else if (prop.type == "Region")
      this.region = id2;
    else if (prop.type == "Country")
      this.country = id2;

    this.focusOnFeature(id2, delay);
    if (prop.type == "Country") {
      let header = '<h1><img src="flags/'+id2+'.svg" class="shadow">'+sel.properties.name+'</h1>';    
      this.fetchFlag(id2);
      this.setPresenter("gesture3");
      this.fetchText(id2, header);
    } else {
      this.setPresenter("gesture2");
      this.fetchText(id2, "");
    }
  }
  
  getGeo(q) {
    let data = this.geo[q];
    if (!data)
      data = this.geo["low"];
    return data;
  }
  
  getFeatureById(id, q) {
    if (!id) return;
    id = id.toUpperCase();
    let data = this.getGeo(q);
    let features = data.features;
    for (let i = 0; i < features.length; i++) {
      let feat = features[i];
      if (id == feat.properties.iso2) {
        return feat;
      }
    }
  }

  focusOnRect(rect, delay, sx) {
    let cz = Math.min(sx*this.w/rect.width, this.h/rect.height);
    let cx = rect.x + rect.width/2;
    let cy = rect.y + rect.height/2;
    if (!delay) {
      this.x = cx;
      this.y = cy;
      this.z = cz;
    } else {
      this.setTarget(cx, cy, cz, delay);
    }
  }
  
  focusOnFeature(iso2, delay) {
    let feat = this.getFeatureById(iso2);
    if (feat)
      this.focusOnRect(feat.geometry.rect, delay, (feat.properties.type == "Country") ? 1/2: 1);
    this.fetchText(iso2);
  }
  
  drawGroup(canvas, data, group, ratio) {
    let ratio1 = Math.max(ratio - 0.25, 0)/0.75;
    let ratio2 = ratio*ratio; //Math.sin(ratio*Math.PI);

    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.scale(this.z, -this.z);
    ctx.translate(-this.x, -this.y);

    let list = [];
    for (let i = 0; i < data.features.length; i++) {
      let feat = data.features[i];
      if (feat.properties.continent == group || feat.properties.region == group)
        list.push(feat);
    }
    ctx.lineJoin = "round";
    ctx.lineWidth = 1/this.z*2;
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < list.length; i++) {
      let feat = list[i];
      if (feat.properties.type != "Country")
        continue;
      let r = (i + 1)/list.length;
      let a = ratio2/r;
      ctx.globalAlpha = a*a;
      ctx.fillStyle = colors[feat.properties.iso2] || land;
      this.plotGeometry(ctx, feat.geometry);
      ctx.fill();
      this.outlineGeometry(ctx, feat.geometry, a*a);
    }
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "32px Roboto";
    for (let i = 0; i < list.length; i++) {
      let feat = list[i];
      if (feat.properties.type != "Country")
        continue;
      ctx.globalAlpha = ratio1*ratio1;
      let country = feat.properties.name.toUpperCase();
      let bb = feat.geometry.rect;
      let cp = feat.geometry.centroid;
      let lp = this.toLocal(cp[0], cp[1]);
      let met = ctx.measureText(country);
      let s = bb.width*this.z/met.width;
      s = Math.min(s, 1)*0.6;
      if (s >= 0.5) {
        ctx.resetTransform();
        ctx.translate(lp[0], lp[1]);
        ctx.scale(s, s);
        ctx.fillText(country, 0, 0);
      }
    }
    ctx.restore();
    
    let feat = this.getFeatureById(group, data);
    if (feat)
      this.redrawContent(feat, ratio);
  }
  
  drawSelected(canvas, feat, ratio) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    
    let fadeoutbg = ratio;
    let extrusion = 0;
    let fadeinflag = 0;
    let swipecover = 0;
    let fadeintext = 0;
    let img = this.flags[this.selected];
    if (img && img.complete && img.naturalHeight !== 0 && ratio >= 1) {
      if (!this.tflag)
        this.tflag = this.time;
      let tf = this.time - this.tflag;
      fadeinflag = Math.min(tf/1, 1);
      swipecover = Math.min(Math.max(tf - 1, 0)/0.75, 1);
      fadeintext = Math.min(Math.max(tf - 2, 0)/0.25, 1);
      extrusion = swipecover;
    }

    // fade
    ctx.globalAlpha = 0.5*fadeoutbg;
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    ctx.translate(w/2, h/2);
    ctx.scale(this.z, -this.z);
    ctx.translate(-this.x, -this.y);
    
    if (img && fadeintext > 0) {
      ctx.save();
      ctx.resetTransform();
      ctx.globalAlpha = fadeintext*0.5;
      ctx.drawImageA(img, 0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    
    // shadow
    let v = h/32;
    ctx.save();
    ctx.fillStyle = land;
    ctx.shadowBlur = v*extrusion;
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = v*extrusion;
    ctx.translate(0, 8/this.z*extrusion);
    this.plotGeometry(ctx, feat.geometry);
    ctx.fill();
    ctx.restore();

    // extrusion
    ctx.translate(0, 8/this.z*extrusion);
    
    // clip and outline
    ctx.save();
    this.plotGeometry(ctx, feat.geometry);
    ctx.clip();
    
    if (img && fadeinflag > 0) {
      // flag
      if (swipecover < 1) {
        ctx.globalAlpha = fadeinflag;
        ctx.scale(1, -1);
        let b = feat.geometry.rect;
        ctx.drawImageA(img, b.x, -b.y - b.height, b.width, b.height);
      }
    }

    // cover
    let scan = h/4;
    let offset = (h + scan)*swipecover - scan/2;
    ctx.resetTransform();
    ctx.fillStyle = land;
    ctx.fillRect(0, 0, w, offset);

    // minority report sweep
    //ctx.restore();
    ctx.resetTransform();
    if (swipecover < 1) {
      let grad = ctx.createLinearGradient(0, offset - scan/2, 0, offset + scan/2);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, offset - scan/2, w, scan);
    }
    ctx.restore();
    
    if (img && fadeintext > 0) {
      let blurred = Math.floor(fadeintext*4);
      for (let k in svgs)
        svgs[k].style.filter = "blur("+blurred+"px)";

      this.redrawContent(feat, fadeintext);
    }
  }
  
  redrawContent(feat, fadeintext) {
    // content area
    let anim = this.anim;
    if (!anim || anim.done) {

      let b = this.rect;
      let r = feat.geometry.rect;
      let cw = b.width/3;
      let ch = b.height*0.8;
      let cx = b.x + b.width/2;
      let cy = b.y + b.height/2;
      let pw = cw*0.75;
      
      this.resizeElement(cpanel, cx - cw/2, cy + ch/2, cw, ch);
      this.resizeElement(lpanel, cx - cw/2 - cw, b.y + b.height, pw, b.height);
      this.resizeElement(rpanel, cx + cw/2 + cw - pw, b.y + b.height, pw, b.height);

      content.style.display = "block";
      content.style.opacity = fadeintext;
    }
  }
  
  resizeElement(e, x, y, w, h, pad) {
    let x1 = x;
    let y1 = y - h;
    let x2 = x + w;
    let y2 = y;
    if (pad === undefined)
      pad = 0;
    let pt1 = this.toLocal(x1, y2);
    let pt2 = this.toLocal(x2, y1);

    let rx = Math.floor(pt1[0] + pad);
    let ry = Math.floor(pt1[1] + pad);
    let rw = Math.floor(pt2[0] - pt1[0] - pad*2);
    let rh = Math.floor(pt2[1] - pt1[1] - pad*2);

    e.style.left = rx+"px";
    e.style.top = ry+"px";
    e.style.width = rw+"px";
    //e.style.height = rh+"px";
  }
  
  animatePresenter(canvas, anim) {
    // animation
    if (!anim)
      anim = animations["idle"];

    speech.style["display"] = "none";
    if (!this.presenter) return;
    
    // calculate frame
    let t = this.time;
    if (this.tpresent)
      t = this.time - this.tpresent;
    let i = Math.floor(t/0.1);
    let n = anim.frames - 1;
    if (i > n*2)
      this.present = null;
    let frame = Math.min(i, n);
    if (anim.bounce)
      frame = n - Math.abs(i%(n*2) - n);
    frame += anim.start;

    // draw
    let ox = frame%cols;
    let oy = (frame - ox)/cols;
    const fw = spritesheet.width/cols;
    const fh = spritesheet.height/rows;
    
    let w = canvas.width;
    let h = canvas.height;
    
    let ss = Math.min(h*0.6/fh, w*0.6/fw);
    ss = Math.min(ss, 1);
    
    let tx = 0;
    let ty = h - fh*ss;

    let ctx = canvas.getContext("2d");
    ctx.save();
    ctx.resetTransform();
  
    let grad = ctx.createLinearGradient(0, h, h/2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0.75)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.shadowColor = "#aaa";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.drawImage(spritesheet, ox*fw, oy*fh, fw, fh, tx, ty, fw*ss, fh*ss);

    if (message.innerHTML != "")
      speech.style["display"] = "block";
    // adjust speech bubble
    let tail = document.getElementById("tail");

    //if (w > h) {
    if (false) {
      // above
      speech.style["left"] = "10px";
      speech.style["bottom"] = (fh*0.9*ss)+"px";
      speech.style["width"] = (fw*ss - 40)+"px";
      tail.style["left"] = "3em";
      tail.style["bottom"] = "-2em";
    } else {
      // aside
      speech.style["left"] = (fw*0.9*ss - 20)+"px";
      speech.style["width"] = (fw*ss - 40)+"px";
      speech.style["bottom"] = "10px";
      tail.style["left"] = "-2em";
      tail.style["bottom"] = "3em";
    }
    
    ctx.restore();
  }
  
  hidePresenter() {
    this.presenter = false;
    this.present = null;
    //overlay.style.visibility = "hidden";
  }
  
  showPresenter() {
    this.presenter = true;
    //overlay.style.visibility = "visible";
  }

  setPresenter(action) {
    if (this.present)
      return;
    this.present = animations[action];
    this.tpresent = this.time;
  }

  drawPresenter(canvas) {
    let ctx = canvas.getContext("2d");
    
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!spritesheet.complete || spritesheet.naturalHeight === 0)
      return;
    
    this.animatePresenter(canvas, this.present);
  }

  drawCanvas(canvas, data) {
    let ctx = canvas.getContext("2d");
    
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let k in svgs)
      svgs[k].style.filter = "none";

    let sel = this.getFeatureById(this.selected, data.name);
    let dsel = this.getFeatureById(this.dselected, data.name);
    if (sel || dsel) {
      let t = this.time - this.tselected;
      let ratio = Math.min(t/1, 1);
      if (!sel && dsel) {
        ratio = 1 - ratio;
        //sel = dsel;
      }
      let targ = sel || dsel;
      if (ratio > 0 && targ.properties.type == "Country") {
        this.drawSelected(canvas, sel, ratio);
      } else if (sel) {
        let q = Math.min(Math.max(t - 1, 0)/3, 1);
        this.drawGroup(canvas, data, sel.properties.iso2, q);
      }
    }
  }

  update(dt) {
    this.time += dt;
    let anim = this.anim;
    if (anim && !anim.done) {
      // animated pan and zoom
      let ratio = (this.time - anim.start)/anim.delay;
      let k = Math.min(ratio, 1);;
      let expo = (k == 1) ? 1 : -Math.pow(2, -10*k) + 1;
      if (ratio < 1) {
        this.x = anim.ix + anim.dx*expo;
        this.y = anim.iy + anim.dy*expo;
        this.z = anim.iz + anim.dz*expo;
      } else {
        this.x = anim.tx;
        this.y = anim.ty;
        this.z = anim.tz;
        anim.done = true;
      }
    }
    
/*
    // hover
    let mp = this.mouse;
    if (mp && !this.anim || this.anim.done) {
      if (!this.selected) {
        let lp = this.toWorld(mp.x, mp.y);
        let c = this.queryContinents(lp);
        if (c && !this.continent) {
          this.focusOnContnient(c, 2);
        } else if (!c && this.continent) {
          this.resetZoom(2);
        }
      }
    }
*/
    if (!this.anim || this.anim.done)
      if (!this.geo["medium"] && this.ready && !this.present)
        map.fetchMap("js/medium.geo.json", "medium", true);
  }
  
  draw() {
    let sw = this.w/this.z;
    let sh = this.h/this.z;

    let r = this.rect;
    r.x = this.x - sw/2;
    r.y = this.y - sh/2;
    r.width = sw;
    r.height = sh;

    let q = "low";
    if (this.z > 20)
      q = "medium";
    let data = this.getGeo(q);
    if (data && data.features)
      this.drawCanvas(this.canvas, data);
    this.drawPresenter(this.canvas2);

    for (let k in svgs) {
      let svg = svgs[k];
      svg.style.display = (svg == data.svg) ? "block" : "none";
      svg.setAttribute("viewBox", r.x+" "+r.y+" "+r.width+" "+r.height);
      let linew = 0;
      if (!this.anim || this.anim.done)
        linew = 1/this.z;
      svg.setAttributeNS(null, "stroke-width", linew);
    }
  }
}
