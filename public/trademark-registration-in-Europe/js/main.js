var interactive = document.getElementById("interactive");
var canvas = document.getElementById("canvas");
var canvas2 = document.getElementById("canvas2");
var content = document.getElementById("content");
var overlay = document.getElementById("overlay");
var lpanel = document.getElementById("lpanel");
var cpanel = document.getElementById("cpanel");
var rpanel = document.getElementById("rpanel");
var message = document.getElementById("message");
var navi = document.getElementById("navi");
var speech = document.getElementById("speech");
var low = document.getElementById("low");
var medium = document.getElementById("medium");
var svgs = { low: low, medium: medium };

var map = new MapViewer();
map.fetchMap("js/low.geo.json", "low", false);
map.fetchPrices("js/prices.csv");
for (let k in continents)
  map.fetchText(k);
map.fetchText("price");
map.setCanvas(canvas, canvas2);
map.resize(window.innerWidth, window.innerHeight);

let url = new URL(window.location.href);
let targ = url.searchParams.get("c");
if (targ)
  targ = targ.toUpperCase();
else
  map.focusOnFeature("EM");
if (!targ || !map.selectFeature(targ, 0))
  map.resetZoom(3);
map.showPresenter();

var lastupdate = Date.now();
function loop() {
  let now = Date.now();
  requestAnimationFrame(()=>loop(), canvas);
  let dt = (now - lastupdate)/1000;
  lastupdate = Date.now();

  map.resize(window.innerWidth, window.innerHeight);
  map.update(dt);
  map.draw();
}
loop();

interactive.addEventListener("click", function(e) {
  map.click(e.button, e.clientX, e.clientY, false);
  e.preventDefault();
});
interactive.addEventListener("mousedown", function(e) {
  map.press(e.button, e.clientX, e.clientY, false);
  e.preventDefault();
});
interactive.addEventListener("mousemove", function(e) {
  map.move(e.button, e.clientX, e.clientY, e.movementX, e.movementY, false);
  e.preventDefault();
});
interactive.addEventListener("mouseup", function(e) {
  map.release(e.button, e.clientX, e.clientY, false);
  e.preventDefault();
});
interactive.addEventListener("wheel", function(e) {
  map.scroll(e.deltaX, e.deltaY);
  e.preventDefault();
});