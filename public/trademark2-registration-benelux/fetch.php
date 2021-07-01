<?php
if (isset($_GET['c'])) {
  header("Content-Type: text/html");
  $id = $_GET['c'];
  $cont = file_get_contents("./js/medium.geo.json");
  $data = json_decode($cont, true);
  foreach ($data['features'] as $k => $v) {
    if ($v['properties']['id'] == $id) {
      $c = array();
      $c['type'] = 'FeatureCollection';
      $c['features'] = [$v];
      echo json_encode($c);
      break;
    }
  }
}
?>