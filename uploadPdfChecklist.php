<?php
	
    $target_file = basename($_FILES["file"]["name"]);
    $imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
    
    define ('SITE_ROOT', 'C:\\xampp\\htdocs\\mi_amministrazione_produzione_files\linea_kit\checklist');

    if (!move_uploaded_file($_FILES["file"]["tmp_name"], SITE_ROOT.'\\'.$target_file)) 
    {
        die("error");
    }

?>