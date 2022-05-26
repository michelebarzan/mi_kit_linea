<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    $kit=$_REQUEST['kit'];
    $posizione=$_REQUEST['posizione'];
    $codice_pannello=$_REQUEST['codice_pannello'];
    $i=$_REQUEST['i'];
    $cabine=$_REQUEST['cabine'];
    $id_utente=$_REQUEST['id_utente'];

    foreach ($cabine as $numero_cabina)
    {
        $query0="DELETE FROM dbo.pannelli_prelievo WHERE lotto='$lotto' AND disegno_cabina='$disegno_cabina' AND kit='$kit' AND posizione='$posizione' AND codice_pannello='$codice_pannello' AND i=$i AND numero_cabina='$numero_cabina'";
        $result0=sqlsrv_query($conn,$query0);
        if(!$result0)
            die("error");
    }

?>