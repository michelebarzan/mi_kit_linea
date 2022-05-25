<?php
	
    $target_file = basename($_FILES["file"]["name"]);
    $imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
    
    //$path = "\\\\192.168.6.31\\share";
    $path = "C:\\xampp\\htdocs\\mi_amministrazione_produzione_files\linea_kit\checklist";
    define ('SITE_ROOT', $path);

    if (!move_uploaded_file($_FILES["file"]["tmp_name"], SITE_ROOT.'\\'.$target_file)) 
    {
        die("error");
    }

?>