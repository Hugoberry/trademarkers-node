<!doctype html>
<html lang="en-us">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,user-scalable=no">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>World Map</title>
  <style>
    body { padding:0; margin:0; overflow:hidden; background-color:#eee; font-size:70%; }
    body, input { font-family:'Helvetica',sans-serif; }
    input, select { border:0; padding:0.5em 1em; }
    input[type=button], button { background-color:#88d; color:#fff; text-transform:uppercase; font-weight:bold; border-radius:0.5em; }
    input:hover, button:hover { background-color:#ddf; color:#88d; }
    input:focus, select:focus, button:focus { outline: none; }
    a, a.visited { color: #000; text-decoration: none; }
    a:hover { text-decoration: underline }
    hr { border: 0; border-bottom: 2px solid #000 }
    h1, h2, h3, h4 { padding-top:0; margin:0; text-transform:uppercase; }
    .price { font-size:1.25em; font-weight:bold; color:#88d; }
    .align-right { text-align:right; }
    .align-center { text-align:center; }
    .float-left { float:left; padding-right:1em; }
    .float-right { float:right; padding-left:1em; }
    .nowrap { white-space:nowrap; }
    h1 img { height:1em; vertical-align:baseline; padding-right:0.5em; }
    table { width:100%; }
    p,br { clear: both; }
    #navbar { position:absolute; width:40%; left:30%; top:1em; display:none; }
    #navbar input[type=text] { font-size:1.5em; }
    #popup { position:absolute; left:20%; top:20%; width:60%; height:60%; scale(0); display:none; }
    #canvas, #canvas2, #low, #medium { border:0; margin:0; position:absolute; overflow:hidden; background:transparent; }
    #content, #speech { display:none; box-sizing:border-box; position:absolute; width:100%; }
    #speech { min-width:12em; max-height:40vh; }
    #message { overflow:hidden; overflow-y:auto; min-height:6em; max-height:30vh; }
    .full { width:100%; }
    .half { width:50%; }
    .third { width:33.33%; }
    .full, .half, .third, .column { box-sizing: border-box; float: left; }
    .large { font-size:1.25em; }
    .small, small { font-size:0.8em; }
    .icon { height: 2.5em; vertical-align: middle; }
    .icon:hover { opacity: 0.5 }
    .round { border-radius:0.5em; }
    .panel { position:absolute; box-sizing:border-box; padding:0.5em; width:33%; }
    .box, .speechbox { border-radius:1em; overflow:hidden; background-color:#fff; color:#000; box-shadow:0 4px 16px rgba(0,0,0,0.5); }
    .pad { padding:0.75em; }
    .gray { background-color:#ccc; color:#444 }
    .speechbox { overflow:visible; background-color:#88d; color:#fff; }
    #center { color:#000; font-size:1.5em; background: url('img/grad.png') no-repeat; background-size: 100% 100%; text-shadow: 0 .1em .2em #ccc, 0 .2em .4em #ccc; }
    #center h1 { color:#fff; text-shadow: 0 .1em .2em #000, 0 .2em .4em #000; }
    .shadow { filter: drop-shadow(5px 5px 5px #222); }
    ::-webkit-scrollbar { width:10px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #888; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }
    @media (min-width: 960px) {
      body { font-size:80%; }
      .panel { padding: 1em; }
      .pad { padding:1em }
    }
  </style>
</head>
<body>

<div id="container" oncontextmenu="event.preventDefault()">
  <div id="interactive">
    <svg id="low"></svg>
    <svg id="medium"></svg>
    <canvas id="canvas"></canvas>
  </div>
  <div id="content">
    <div id="left" class="panel"></div>
    <div id="center" class="panel"></div>
    <div id="right" class="panel"></div>
  </div>
  <div id="overlay">
    <canvas id="canvas2" style="pointer-events:none;"></canvas>
    <div id="speech" class="speechbox">
      <a href="javascript:map.presenter.hide();" class="float-right">
        <img id="close" src="img/close.png" class="small icon" />
      </a>
      <span id="message"></span>
      <img id="tail" src="img/tail.png" style="z-index:10; height:2em; position:absolute;" />
    </div>
  </div>
</div>

<div id="navbar" class="box">
  <input id="search" type="text" placeholder="Trademark search..." class="full" autocomplete="off" />
  <div id="results" class="gray pad"></div>
</div>

<div id="popup" class="box">
</div>

<script type="text/javascript" src="js/math.js"></script>
<script type="text/javascript" src="js/canvas.js"></script>
<script type="text/javascript" src="js/map.js"></script>
<script type="text/javascript" src="js/main.js"></script>


<script type="text/javascript">map.startWithFeature('BE')</script>

</body>
</html>