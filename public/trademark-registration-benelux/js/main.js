var interactive = document.getElementById("interactive");
var canvas = document.getElementById("canvas");
var canvas2 = document.getElementById("canvas2");
var search = document.getElementById("search");
var content = document.getElementById("content");
var overlay = document.getElementById("overlay");
var message = document.getElementById("message");
var navi = document.getElementById("navi");
var popup = document.getElementById("popup");
var speech = document.getElementById("speech");
var low = document.getElementById("low");
var medium = document.getElementById("medium");
var svgs = { low: low, medium: medium };

var map = new MapViewer();
map.fetchData("js/data.json");
map.fetchMap("js/low.geo.json", "low", false);
map.fetchText("country", false, false);
map.fetchText("noservice", false, false);
map.setCanvas(canvas, canvas2);
map.resize(window.innerWidth, window.innerHeight);
map.resetZoom(0);

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

search.addEventListener("input", function(e) {
  map.suggest(search.value);
});
search.addEventListener("keydown", function(e) {
  let found = map.suggest(search.value);
  e = e || window.event;
  if (e.keyCode == 13 && found.length > 0) {
    map.chooseResult(found[0].id);
  }
});

window.addEventListener("popstate", function(e) {
  if (e.state) {
    map.selectFeature(e.state.selected);
    e.preventDefault();
  }
});