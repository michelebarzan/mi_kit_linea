<?php
	$mi_kit_linea_params_file = fopen("C:\mi_kit_linea_params.json", "r") or die("error");
	echo fread($mi_kit_linea_params_file,filesize("C:\mi_kit_linea_params.json"));
	fclose($mi_kit_linea_params_file);
?>