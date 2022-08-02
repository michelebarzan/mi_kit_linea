<?php

    include "connessione.php";

    set_time_limit(120);

    $testiEtichette=[];
    
    $q="SELECT [id_testo],[nome],[testo],[label] FROM [mi_produzione].[dbo].[testi_etichette_carrelli]";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error".$q);
    }
    else
    {
        while($row=sqlsrv_fetch_array($r))
        {
            $testo["id_testo"]=$row["id_testo"];
            $testo["nome"]=$row["nome"];
            $testo["testo"]=utf8_encode($row["testo"]);
            $testo["label"]=$row["label"];

            array_push($testiEtichette,$testo);
        }
    }

    echo json_encode($testiEtichette);

?>