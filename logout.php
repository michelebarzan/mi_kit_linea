<?php
session_start();
$_SESSION=array();
session_destroy();
$hour = time() + 3600 * 24 * 30;
setcookie('username',"", $hour);
?>