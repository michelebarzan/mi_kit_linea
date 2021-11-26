<?php

    include "connessione.php";

    set_time_limit(120);

    $carrello=$_REQUEST["carrello"];

    $cabine=[];
    
    $q="select distinct * from newpan.dbo.dibcar WHERE CODCAR = '$carrello'";
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