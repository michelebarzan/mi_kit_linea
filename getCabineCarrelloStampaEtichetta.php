<?php

    include "connessione.php";

    set_time_limit(120);

    $carrello=$_REQUEST["carrello"];

    $cabine=[];
    
    $q="SELECT mi_db_tecnico.dbo.carrelli.n_cab AS NCAB, mi_db_tecnico.dbo.cabine.codice_cabina AS CODCAB, mi_db_tecnico.dbo.cabine_carrelli.qnt AS QNT
        FROM mi_db_tecnico.dbo.cabine INNER JOIN mi_db_tecnico.dbo.cabine_carrelli ON mi_db_tecnico.dbo.cabine.id_cabina = mi_db_tecnico.dbo.cabine_carrelli.id_cabina INNER JOIN mi_db_tecnico.dbo.carrelli ON mi_db_tecnico.dbo.cabine_carrelli.id_carrello = mi_db_tecnico.dbo.carrelli.id_carrello
        WHERE (mi_db_tecnico.dbo.carrelli.codice_carrello = '$carrello')";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error".$q);
    }
    else
    {
        while($row=sqlsrv_fetch_array($r))
        {
            $cabina["NCAB"]=$row["NCAB"];
            $cabina["CODCAB"]=$row["CODCAB"];
            $cabina["QNT"]=$row["QNT"];

            array_push($cabine,$cabina);
        }
    }

    echo json_encode($cabine);

?>