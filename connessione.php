<?php
$serverName = 'web.azure.servizioglobale.it';
$connectionInfo=array("Database"=>"mi_linea_kit", "UID"=>"sa", "PWD"=>"Serglo123");
$conn = sqlsrv_connect($serverName,$connectionInfo);
?>