<?php

    include "connessione.php";

    set_time_limit(120);

    $id_checklist=$_REQUEST["id_checklist"];
    $checked=$_REQUEST["checked"];
    $id_utente=$_REQUEST["id_utente"];

    if($checked=="true")
        $query2="UPDATE checklist SET checked='$checked',utente=".$id_utente.",dataOra=GETDATE() WHERE id_checklist=$id_checklist";
    else
        $query2="UPDATE checklist SET checked='$checked',utente=NULL,dataOra=NULL WHERE id_checklist=$id_checklist";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error".$query2);

?>