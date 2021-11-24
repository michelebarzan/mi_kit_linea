<?php
	$mi_kit_linea_params_file = fopen("C:\mi_kit_linea_params.json", "r") or die("error");
	$mi_kit_linea_params=json_decode(fread($mi_kit_linea_params_file,filesize("C:\mi_kit_linea_params.json")), true);
	fclose($mi_kit_linea_params_file);

	$connectionInfo=array("Database"=>"mi_linea_kit", "UID"=>$mi_kit_linea_params['sql_server_info']['username'], "PWD"=>$mi_kit_linea_params['sql_server_info']['password']);
	$conn = sqlsrv_connect($mi_kit_linea_params['sql_server_info']['ip'],$connectionInfo);
	if(!$conn)
    	die("error " . print_r( sqlsrv_errors(), true));
?>