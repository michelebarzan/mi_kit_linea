<?php

    include "connessione.php";


    $lotto=$_REQUEST['lotto'];
    $cabina=$_REQUEST['cabina'];
    $id_stazione=$_REQUEST['id_stazione'];
    $posizione=$_REQUEST['posizione'];

    $query0="DELETE FROM dbo.kit_linea WHERE lotto='$lotto' AND cabina='$cabina' AND posizione='$posizione' AND stazione=$id_stazione";	
    $result0=sqlsrv_query($conn,$query0);
    if (!$result0)
        die("error");

?>