<?php
header('Content-Type: text/html');
$cont = file_get_contents('./js/data.json');
$data = json_decode($cont, true);
$keys = ["region","name","office","office2","study","study2","registration","registration2","certificate","certificate2","wait","wait2"];

echo '<table>';
echo '<tr>';
echo "<td>id</td>";
foreach ($keys as $j => $w)
  echo "<td>$w</td>";
echo '</tr>';
foreach ($data as $k => $v) {
  echo '<tr>';
  echo "<td>$k</td>";
  foreach ($keys as $j => $w) {
    if (!isset($v[$w]) || !$v[$w])
      echo '<td style="background-color:#f00">&nbsp;</td>';
    else
      echo "<td>$v[$w]</td>";
  }
  echo '</tr>';
}
echo '</table>';
exit;
?>