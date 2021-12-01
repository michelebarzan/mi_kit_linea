<?php

    include "connessione.php";

    set_time_limit(120);

    $carrello=$_REQUEST["carrello"];
    
    $q="SELECT MAX(descrizione) AS descrizione
        FROM mi_db_tecnico.dbo.carrelli
        WHERE (codice_carrello = '$carrello')";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error".$q);
    }
    else
    {
        while($row=sqlsrv_fetch_array($r))
        {
            echo $row["descrizione"];
        }
    }

?>