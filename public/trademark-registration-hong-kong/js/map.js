const sea = "#fff";
const dark = "#888";
const land = "#ccc";
const blue = "#448";
const green = "#484";
const selected = "#fff";
const shadow = "#000";
const border = "#bbb";
const epsilon = 0.1;
const NS = "http://www.w3.org/2000/svg";

const EUIPO = [ "BE","BG","CZ","DK","DE","EE","IE","GR","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE" ];
const ARIPO = [ "BW","GM","GH","KE","LS","LR","MW","MZ","NA","RW","ST","SL","SO","SD","SZ","TZ","UG","ZM","ZW" ];
const OAPI = [ "BJ","BF","CM","CF","TD","CI","GQ","GA","GN","GW","ML","MR","NE","SN","TG","KM" ];
const colors = {};
for (let i = 0; i < EUIPO.length; i++)
  colors[ EUIPO[i] ] = blue;
for (let i = 0; i < ARIPO.length; i++)
  colors[ ARIPO[i] ] = blue;
for (let i = 0; i < OAPI.length; i++)
  colors[ OAPI[i] ] = green;

const elements = [ "left", "right", "center", "message" ];
const logos =
[
  {id:"US",go:"US",file:"img/uspto.png",base:null},
  {id:"DE",go:"EM",file:"img/euipo2.png",base:null},
  {id:"ML",go:"OA",file:"img/oapi2.png",base:null},
  {id:"TZ",go:"ARIPO",file:"img/aripo2.png",base:null},
  {id:"HK",go:"HK",file:"img/hk.png",centroid:[118.23203125000006,22.210546874999979],base:"ASIA"}
];
for (let k in logos) {
  let logo = logos[k];
  logo.img = new Image();
  logo.img.src = logo.file;
}

class MapViewer {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 1;
    this.flags = {};
    this.collection = {};
    this.text = {};
    this.data = {};
    this.rect = {};
    this.path = [];
    this.time = 0;
    this.loaded = 0;
    this.requested = 0;
    this.mouse = {x:0, y:0};
    this.presenter = null;
  }
  
  renderGeometryToSVG(svg, geo) {
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
        out.push(`M${poly[0][0]},${poly[0][1]}`);
        for (let j = 1; j < poly.length; j++)
          out.push(` L${poly[j][0]},${poly[j][1]}`);
        for (let j = 1; j < coords[i].length; j++) {
          let hole = coords[i][j];
          out.push(`M${hole[0][0]},${hole[0][1]}`);
          for (let k = 1; k < hole.length; k++)
            out.push(` L${hole[k][0]},${hole[k][1]}`);
        }
        out = out.join("");
        let p = document.createElementNS(NS, "path");
        p.setAttributeNS(null, "d", out);
        svg.appendChild(p);
      }
    }
  }
  
  loadCollection(json, name, overwrite) {
    json.name = name;
    json.overwrite = overwrite;
    if (overwrite || !this.collection[name])
      this.collection[name] = json;
    else
      this.collection[name].features.push(json.features[0]);
    
    // vector graphics
    let features = json.features;
    let svg = svgs[name];
    if (svg) {
      // todo clear svg with overwriting
      for (let i = 0; i < features.length; i++)
        this.renderGeometryToSVG(svg, features[i].geometry);
      svg.setAttributeNS(null, "fill", land);
      svg.setAttributeNS(null, "stroke", border);
      svg.setAttributeNS(null, "transform", "scale(1, -1)");
    }

    // bounding box
    let data = this.data;
    if (name == "low") {
      for (let i = 0; i < features.length; i++)
        this.calcFeatureBounds(features[i]);
      for (let k in data)
        if (!data[k].rect)
          this.calcRegionBounds(k);
    } else {
      for (let i = 0; i < features.length; i++) {
        let feat = features[i];
        let id = feat.properties.id;
        if (data[id].rect == null)
          this.calcFeatureBounds(feat);
      }
    }
  }
  
  calcFeatureBounds(feat) {
    let id = feat.properties.id;
    let largest = Geo.getLargestPolygon(feat.geometry);
    let d = this.data[id];
    d.rect = Geo.AABB(largest);
    d.centroid = Geo.centroid(largest);
  }
  
  calcRegionBounds(id, res) {
    let d = this.data[id];
    let list = d.children;
    let cur = d.rect;
    if (list) {
      let tmp;
      for (let i = 0; i < list.length; i++)
        tmp = this.calcRegionBounds(list[i], tmp);
      if (tmp && cur)
        cur = Geo.mergeAABB(cur, tmp);
      else if (tmp)
        cur = tmp;
    }
    if (cur) {
      d.rect = {...cur};
      if (res)
        res = Geo.mergeAABB(res, cur);
      else
        res = cur;
    }
    return res;
  }
  
  fetchMap(file, name, delayed) {
    console.log(file);
    let map = this;
    map.requested ++;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        map.loaded ++;
        if (this.responseText) {
          try {
            let json = JSON.parse(this.responseText);
            map.loadCollection(json, name, json.features.length > 1);
          } catch (e) {}
        }
      }
    };
    xmlhttp.open("GET", file, delayed);
    xmlhttp.send();
  }

  fetchFlag(code) {
    if (this.flags[code])
      return;
    let file = `flags/${code.toLowerCase()}.svg`;
    console.log(file);
    let img = new Image();
    this.flags[code] = img;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let base64 = btoa(this.responseText);
        img.src = `data:image/svg+xml;base64,${base64}`;
      }
    }
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
  }

  fetchText(id, show, delayed) {
    if (delayed == null)
      delayed = false;
    if (show) {
      this.hideText();
      if (this.text[id])
        this.showText(id);
    }
    if (this.text[id]) return;
    let file = `text/${id.toLowerCase()}.html`;
    console.log(file);
    let map = this;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState != 4) return;
      if (xmlhttp.status == 200)
        map.text[id] = xmlhttp.responseText;
      if (show)
        map.showText(id);
    };
    xmlhttp.open("GET", file, delayed);
    xmlhttp.send();
  }
  
  fetchData(file) {
    console.log(file);
    let map = this;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let data = JSON.parse(this.responseText);
        for (let k in data) {
          let v = data[k];
          v.ISO = k;
          v.iso = k.toLowerCase();
          v.NAME = v.name.toUpperCase();
          v.url = v.name.replaceAll(/\s/g, '-');
          // path to top
          let path = [];
          let d = v;
          while (d && d.region) {
            path.unshift(d.region);
            d = data[d.region];
          }
          v.path = path;
          // region lists
          if (v.region) {
            let p = data[v.region];
            if (!p.children)
              p.children = [];
            p.children.push(k);
          }
          // search keywords
          //let name = v.name.toLowerCase();
          //v.keywords = name+' '+v.iso;
        }
        
        map.data = data;
      }
    }
    xmlhttp.open("GET", file, false);
    xmlhttp.send();
  }
  
  hideText() {
    for (let i = 0; i < elements.length; i++) {
      let e = document.getElementById(elements[i]);
      e.innerHTML = "";
      e.style["display"] = "none";
    }
    speech.style.display = "none";
    content.style.display = "none";
    navbar.style.display = "none";
    search.value = null;
  }
  
  showText(id) {
    let d = this.data[id];
    if (d) {
      let path = this.path;
      if (!d.study && !d.children) {
        map.loadPage("noservice", id);
      } else {
        for (let i = 0; i < path.length; i++)
          map.loadPage(path[i], path[i]);
        if (!d.children)
          map.loadPage("country", id);
      }
      map.loadPage(id, id);
      
      /*
      // related
      let left = document.getElementById("left");
      if (!left.innerHTML && map.data[id].centroid) {
        let adj = this.findAdjacent(id);
        let out = '<div class="box"><h2>Related</h2>';
        out += "<table>";
        for (let i = 0; i < 10; i++) {
          let v = adj[i];
          let d = map.data[v];
          let url = `javascript:map.selectFeature('${v}');`;
          out += `<tr>`;
          out += `<td width="20%"><a href="${url}"><div style="height:2em; background: url('flags/${v.toLowerCase()}.svg'); background-repeat: no-repeat; background-size: cover; background-position: center;"></div></a></td>`;
          out += `<td width="80%"><a href="${url}">${d.name}</a></td>`;
          out += `</tr>`;
        }
        out += "</table>";
        out += '</div>';
        left.innerHTML = out;
        left.style["display"] = "block";
      }
      */
    }
    map.resyncPage(id);
    if (message.innerHTML && map.presenter)
      map.presenter.speak(`voice/${id.toLowerCase()}.mp3`);
  }
  
  resyncPage(id) {
    /*
    // replace URLs
    let loc = window.location;
    let cur = loc.protocol+'//'+loc.host+loc.pathname+"?c=";
    let links = document.getElementsByTagName("A");
    for (let i = 0; i < links.length; i++) {
      let a = links[i].href.toLowerCase();
      if (a.substring(0,cur.length) == cur)
        links[i].setAttribute("href", "javascript:map.selectFeature('"+a.substring(cur.length)+"')");
    }
    */
  }
  
  getPage(page, id) {
    let text = this.text[page];
    if (!text) return;
    // replace ids and names
    let row = this.data[id];
    if (row)
      text = text.replaceAll(/\$\{(.+?)\}/g, function(m, s) { return row[s]; });
    return new DOMParser().parseFromString(text, "text/html");
  }
  
  loadPage(page, id) {
    let doc = this.getPage(page, id);
    if (!doc) return;
    for (let i = 0; i < elements.length; i++) {
      let id = elements[i];
      let e1 = document.getElementById(id);
      let e2 = doc.getElementById(id);
      if (e1 && e2 && e2.innerHTML) {
        e1.innerHTML = e2.innerHTML;
        e1.style["display"] = "block";
      }
    }
    return doc;
  }

  queryFeatures(lp) {
    let collection = this.collection["low"];
    if (!collection)
      return;
    let features = collection.features;
    if (!features)
      return;
    for (let i = 0; i < features.length; i++) {
      let feat = features[i];
      let id = feat.properties.id;
      //if (continents[id] || regions[id]) continue;
      let rect = this.data[id].rect;
      if (lp.x < rect.x || lp.x > rect.x + rect.width)
        continue;
      if (lp.y < rect.y || lp.y > rect.y + rect.height)
        continue;
      if (Geo.pointInGeo(feat.geometry, lp))
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
    if (delay == null)
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

  press(button, x, y) { }
  
  resetZoom(delay) {
    this.deselectAll();
    let rect = Geo.AABB([[-140,-20], [180, 80]]);
    this.focusOnRect(rect, delay, 1);
    this.updateURL();
  }

  click(button, x, y) {
    if (this.modal != null) {
      map.closePopup();
      return;
    }
    if (this.anim && !this.anim.done) return;
    let lp = this.toWorld(x, y);
    let id1 = this.selected;
    for (let i = 0; i < logos.length; i++) {
      let logo = logos[i];
      if (logo.base != id1) continue;
      let c = logo.centroid || this.data[logo.id].centroid;
      let dx = lp[0] - c[0];
      let dy = lp[1] - c[1];
      if (Math.abs(dx) <= 15 && Math.abs(dy) <= 15) {
        this.selectFeature(logo.go);
        return;
      }
    }
    let targ;
    let path1 = this.path;
    let feat = this.queryFeatures(lp);
    if (feat) {
      let id2 = feat.properties.id;
      let path2 = this.data[id2].path;
      let i = path2.indexOf(id1);
      if (i > -1) {
        // expand current selection
        targ = path2[i + 1] || id2;
      } else if (path1.length == 0) {
        // start new selection
        targ = path2[0];
      } else {
        // feature not in selection
        targ = path1.pop();
      }
    } else {
      // click outside all features
      targ = path1.pop();
    }
    if (targ)
      this.selectFeature(targ);
    else
      this.resetZoom(1.5);
  }
  
  updateURL() {
    let title = "Trademark Registration Worldwide";
    let url = "./";
    let targ = this.selected;
    if (targ && this.data[targ]) {
      let d = this.data[targ];
      title = `Trademark Registration in ${d.name}`;
      url = d.url;
    }
    //let map = this;
    //window.history.replaceState({ "selected": targ }, title, url);
    window.history.pushState({ "selected":targ }, title, url);
    document.title = title;
  }
  
  move(id, x, y, dx, dy) {
    let mp = this.mouse;
    mp.x = x;
    mp.y = y;
  }
  
  release(id, x, y) { }

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

  deselectAll() {
    if (this.selected) {
      this.selected = null;
      this.tselected = this.time;
    }
    this.tswipe = null;
    if (this.anim)
      this.anim.done = true;;
    while (this.path.length > 0)
      this.path.pop();
    content.style["display"] = "none";
  }
  
  selectFeature(id2, delay, scale) {
    if (delay == null)
      delay = 1;
    let id1 = this.selected;
    if (id2 == id1) return;
    
    this.selected = null;
    this.tselected = this.time;
    this.tswipe = null;
    
    // fetch map
    let d = this.data[id2];
    if (!d) return;
    if (!this.getFeatureById(id2, "medium"))
      this.fetchMap(`geo/${id2}.geo.json`, "medium", false);
      //this.fetchMap(`./fetch.php?c=${id2}`, "medium", false);
    
    this.selected = id2;
    let path = d.path;
    this.path = [...path];

    this.focusOnRegion(id2, delay, scale);
    this.fetchFlag(id2);
    
    if (this.presenter)
      this.presenter.setAction("gesture3");

    // fetch text
    for (let i = 0; i < path.length; i++)
      this.fetchText(path[i], false, false);
    this.fetchText(id2, true, false);

    this.updateURL();
  }
  
  startWithFeature(id) {
    this.focusOnRegion(id, 0, 1/4);
    this.selectFeature(id, 3);
  }
  
  getFeatureById(id, q) {
    if (!id) return;
    id = id.toUpperCase();
    let collection = this.collection[q];
    if (!collection) return;
    let features = collection.features;
    if (!features) return;
    for (let i = 0; i < features.length; i++) {
      let feat = features[i];
      if (id == feat.properties.id)
        return feat;
    }
    console.log(`${id} not found`);
  }

  focusOnRect(rect, delay, scale) {
    let cz = scale*Math.min(this.w/rect.width, this.h/rect.height);
    cz = Math.min(cz, 4000);
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

  focusOnRegion(id, delay, scale) {
    let d = this.data[id];
    if (d && d.rect) {
      if (scale == null) {
        scale = 0.75;
        //if (!d.children)
          //scale = 1/2;
        if (!d.children)
          scale = 1;
      }
      this.focusOnRect(d.rect, delay, scale);
    }
  }
  
  suggest(s) {
    s = s.toUpperCase();
    s = s.trim();
    let words = s.split(/\s/);
    let found = {};
    let list = [];
    for (let i = 0; i < words.length; i++) {
      let w = words[i];
      if (w.length <= 1) continue;
      for (let k in this.data) {
        let d = this.data[k];
        let j = d.NAME.indexOf(w);
        if (j == -1) continue;
        let e = found[k];
        if (!e) {
          e = { id:k, name:d.name, index:j, count:0 };
          found[k] = e;
          list.push(e);
        }
        e.count ++;
      }
    }
    list.sort(function(a, b) {
      return ((a.index + 1)/a.count) - ((b.index + 1)/b.count);
    });
    let res = document.getElementById("results");
    let out = '';
    if (list.length > 0) {
      out = '<br>';
      for (let i = 0; i < Math.min(list.length, 5); i++) {
        let v = list[i];
      out += `<p><img src="img/pinpoint.png" class="icon" /> <a href="javascript:map.chooseResult('${v.id}');" class="large">${v.name}</a></p>`;
      }
    }
    res.innerHTML = out;
    return list;
  }
  
  chooseResult(id) {
    this.selectFeature(id);
    let res = document.getElementById("results");
    res.innerHTML = '';
    //search.value = null;
  }
  
  drawSelectedGroup(canvas, group, ratio) {
    let ratio1 = Math.max(ratio - 0.25, 0)/0.75;
    let ratio2 = ratio*ratio; //Math.sin(ratio*Math.PI);

    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.scale(this.z, -this.z);
    ctx.translate(-this.x, -this.y);

    let q = this.quality;
    let features = this.collection[q].features;
    let list = [];
    for (let i = 0; i < features.length; i++) {
      let feat = features[i];
      let id = feat.properties.id;
      let d = this.data[id];
      if (!d.children && d.path.indexOf(group) >= 0 && d.centroid)
        list.push(feat);
    }
    
    // cool outline effect
    ctx.lineJoin = "round";
    ctx.lineWidth = 1/this.z*2;
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < list.length; i++) {
      let feat = list[i];
      let r = (i + 1)/list.length;
      let a = ratio2/r;
      ctx.globalAlpha = a*a;
      ctx.fillStyle = colors[feat.properties.id] || land;
      this.plotGeometry(ctx, feat.geometry);
      ctx.fill();
      this.outlineGeometry(ctx, feat.geometry, a*a);
    }

    // hover
    let hover = this.hover;
    if (hover)
      list = [ hover ];
    let a = ratio1*ratio1;
    if (this.thover)
      a = Math.min((this.time - this.thover)/0.25, a);

    ctx.globalAlpha = a;

    // country labels
    ctx.resetTransform();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 32px Arial";

    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    for (let i = 0; i < list.length; i++) {
      let feat = list[i];
      let id = feat.properties.id;
      let d = this.data[id];
      let cp = d.centroid;
      let lp = this.toLocal(cp[0], cp[1]);
      let maxw = d.rect.width*this.z*0.6;
      if (maxw >= 60 || list.length == 1)
        ctx.scaleText(d.NAME, lp[0], lp[1], maxw, 0.5, 0.75);
    }
    
    ctx.restore();

    this.resizeContent();
  }
  
  drawSelectedCountry(canvas, id, ratio) {
    let feat = this.getFeatureById(id, "medium");
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    
    let fadeoutbg = ratio;
    let extrusion = 0;
    let fadeinflag = 0;
    let swipecover = 0;
    let fadeintext = 0;
    let img = this.flags[this.selected];
    if (img && img.complete && img.naturalHeight !== 0) {
      if (ratio >= 1) {
        if (!this.tswipe)
          this.tswipe = this.time;
        let ts = this.time - this.tswipe;
        fadeinflag = Math.min(ts/1, 1);
        swipecover = Math.min(Math.max(ts - 1, 0)/0.75, 1);
        fadeintext = Math.min(Math.max(ts - 2, 0)/0.25, 1);
        extrusion = swipecover;
      }
    }

    // fade
    ctx.globalAlpha = 0.5*fadeoutbg;
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    ctx.translate(w/2, h/2);
    ctx.scale(this.z, -this.z);
    ctx.translate(-this.x, -this.y);
    
    // background flag
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
        let b = this.data[feat.properties.id].rect;
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
    
    if (fadeintext > 0) {
      // blur background
      let blurred = Math.floor(fadeintext*4);
      for (let k in svgs)
        svgs[k].style.filter = `blur(${blurred}px)`;
      // content area
      this.resizeContent();
    }
  }
  
  resizeContent() {
    // content area
    let anim = this.anim;
    if (!anim || anim.done) {
      let delay = this.time;
      if (anim.done && anim.stop)
        delay = this.time - anim.stop;      
      let alpha = Math.min(delay/1, 1);
        
      let b = this.rect;
      let cw = b.width/3;
      let ch = b.height*0.8;
      let cx = b.x + b.width/2;
      let cy = b.y + b.height/2;
      let pw = cw*0.75;
      
      this.resizeElement("center", cx - cw/2, cy + ch/2, cw, ch);
      this.resizeElement("left", cx - cw/2 - cw, b.y + b.height, pw, b.height);
      this.resizeElement("right", cx + cw/2 + cw - pw, b.y + b.height, pw, b.height);
      
      content.style.display = "block";
      content.style.opacity = alpha;
      
      let id = this.selected;
      if (id) {
        let d = this.data[id];
        if (d.children) {
          navbar.style.display = "block";
          navbar.style.opacity = alpha;
        }
      }
    }
  }
  
  resizeElement(id, x, y, w, h, pad) {
    let e = document.getElementById(id);
    let x1 = x;
    let y1 = y - h;
    let x2 = x + w;
    let y2 = y;
    if (pad == null)
      pad = 0;
    let pt1 = this.toLocal(x1, y2);
    let pt2 = this.toLocal(x2, y1);

    let rx = Math.floor(pt1[0] + pad);
    let ry = Math.floor(pt1[1] + pad);
    let rw = Math.floor(pt2[0] - pt1[0] - pad*2);
    let rh = Math.floor(pt2[1] - pt1[1] - pad*2);

    e.style.left = `${rx}px`;
    e.style.top = `${ry}px`;
    e.style.width = `${rw}px`;
    //e.style.height = `${rh}px`;
  }
  
  findAdjacent(id) {
    let data = this.data;
    let origin = data[id].centroid;
    let list = [];
    for (let k in data)
      if (k != id && data[k].centroid)
        list.push(k);
    let dist = {};
    for (let i = 0; i < list.length; i++) {
      let v = list[i];
      dist[v] = Geo.distance(origin, data[v].centroid);
    }
    list.sort(function(a, b) {
      return dist[a] - dist[b];
    });
    return list;
  }
  
  openPopup(url) {
    this.modal = 0;
    popup.innerHTML = `<iframe style="border:0; border-radius:1em; position:absolute; width:100%; height:100%;" src="${url}" allowfullscreen volume="0" frameborder="0"></iframe>`;
    popup.style.display = "block";
    popup.classList.add("expand");
  }
  
  closePopup() {
    this.modal = null;
    popup.innerHTML = null;
    popup.style.display = "none";
    popup.classList.remove("expand");
  }

  drawCanvas(canvas) {
    let ctx = canvas.getContext("2d");
    
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let k in svgs)
      svgs[k].style.filter = "none";

    let id = this.selected;
    if (id) {
      let tt = this.time - this.tselected;
      if (!this.data[id].children) {
        let ratio = Math.min(tt/1, 1);
        this.drawSelectedCountry(canvas, id, ratio);
      } else {
        let ratio = Math.min(Math.max(tt - 1, 0)/3, 1);
        this.drawSelectedGroup(canvas, id, ratio);
      }
    }

    ctx.save();
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    for (let i = 0; i < logos.length; i++) {
      let logo = logos[i];
      if (logo.base != id) continue;
      let img = logo.img;
      if (img.complete && img.naturalHeight !== 0) {
        let d = this.data[logo.id];
        let c = logo.centroid || d.centroid;
        let lp = this.toLocal(c[0], c[1]);
        let s = (this.time + 1)*5;
        s = (Math.sin(s + i) + 1)/2;
        s = s*20 + 40;
        ctx.drawImage(img, 0, 0, img.width, img.height, lp[0] - s, lp[1] - s, s*2, s*2);
      }
    }
    ctx.restore();

  }

  update(dt) {
    if (this.modal != null) {
      this.modal += dt;
      let ratio = Math.min(this.modal/0.25, 1);
      popup.style.transform = `scale(${ratio})`;
    }

    if (this.presetner)
      this.presenter.update(dt);
    this.time += dt;
    
    // panning and zoom
    let anim = this.anim;
    if (anim && !anim.done) {
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

    // hover
    let mp = this.mouse;
    let lp = this.toWorld(mp.x, mp.y);
    let hover = this.queryFeatures(lp);
    let id = this.selected;
    if (id && hover) {
      let children = this.data[id].children;
      if (children) {
        let exists = false;
        let hid = hover.properties.id;
        let d = this.data[hid];
        if (children.indexOf(hid) != -1)
          exists = true;
        for (let i = 0; i < d.path.length; i++)
          if (d.path[i] == id)
            exists = true;
        if (!exists)
          hover = null;
      }
    }
    if (hover != this.hover) {
      this.hover = hover;
      this.thover = this.time;
    }
    
    // resolution increase
    let medium = this.collection["medium"];
    if (this.requested == this.loaded)
      if (this.tselected && this.time - this.tselected > 10)
        if (!this.anim || this.anim.done)
          if (!medium || !medium.overwrite)
            this.fetchMap("geo/medium.geo.json", "medium", true);
  }
  
  draw() {
    let z = this.z;
    let sw = this.w/z;
    let sh = this.h/z;

    let r = this.rect;
    r.x = this.x - sw/2;
    r.y = this.y - sh/2;
    r.width = sw;
    r.height = sh;
    
    this.drawCanvas(this.canvas);

    if (this.presenter)
      this.presenter.draw(this.canvas2);

    let q = "low";
    let medium = this.collection["medium"];
    if (z > 20 && medium && medium.overwrite)
      q = "medium";
    this.quality = q;
    
    for (let k in svgs) {
      let svg = svgs[k];
      svg.style.display = (k == q) ? "block" : "none";
      svg.setAttribute("viewBox", `${r.x} ${r.y} ${r.width} ${r.height}`);
      let linew = 0;
      if (!this.anim || this.anim.done)
        linew = 1/z;
      svg.setAttributeNS(null, "stroke-width", linew);
    }
  }
}
