<?php

    include "connessione.php";

    $prefissi=[];

    $query3="SELECT * FROM mi_db_tecnico.dbo.codici_di_riferimento WHERE tabella = 'pannelli'";
    $result3=sqlsrv_query($conn,$query3);
    if($result3==TRUE)
    {
        while($row3=sqlsrv_fetch_array($result3))
        {
            $prefisso["profilo"]=$row3['profilo'];
            $prefisso["codice"]=$row3['codice'];

            array_push($prefissi,$prefisso);
        }
    }
    else
        die("error".$query2);

    echo json_encode($prefissi);
?>