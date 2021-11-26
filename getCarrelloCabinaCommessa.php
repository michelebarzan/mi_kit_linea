<?php

    include "connessione.php";

    $numero_cabina = $_REQUEST["numero_cabina"];
    $commessa = $_REQUEST["commessa"];

    set_time_limit(120);
    
    $q="SELECT DISTINCT codcar FROM [mi_linea_kit].[dbo].[carrelli_cabine] where numero_cabina = '$numero_cabina' and commessa ='$commessa'";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error".$q);
    }
    else
    {
        while($row=sqlsrv_fetch_array($r))
        {
            echo $row["codcar"];
        }
    }

?>