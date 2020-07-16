<?php

    include "connessione.php";

    $funzioni_tasti=[];

    $query2="SELECT * FROM mappatura_tasti";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $funzione_tasto["valore"]=strval($row2['keyCode']);
            $funzione_tasto["nome"]=$row2['funzione'];

            array_push($funzioni_tasti,$funzione_tasto);
        }
        echo json_encode($funzioni_tasti);
    }
    else
        die("error");

?>