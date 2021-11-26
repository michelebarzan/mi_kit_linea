<?php

    include "connessione.php";

    set_time_limit(120);

    $commessa_breve=$_REQUEST["commessa_breve"];

    $descrizioniEtichette=[];
    
    $q="SELECT * FROM [mi_produzione].[dbo].[descrizioni_etichette_carrelli] WHERE carrello = '$commessa_breve'";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error".$q);
    }
    else
    {
        while($row=sqlsrv_fetch_array($r))
        {
            $descrizione["id_descrizione"]=$row["id_descrizione"];
            $descrizione["carrello"]=$row["carrello"];
            $descrizione["nome"]=$row["nome"];
            $descrizione["descrizione"]=$row["descrizione"];
            $descrizione["label"]=$row["label"];

            array_push($descrizioniEtichette,$descrizione);
        }
    }

    echo json_encode($descrizioniEtichette);

?>