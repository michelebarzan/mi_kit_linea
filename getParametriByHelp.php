<?php

    include "connessione.php";

    $help=$_REQUEST["help"];
    $parametri=[];

    $qParametri="SELECT * FROM [mi_linea_kit_parametri].[dbo].[parametri] WHERE help='$help'";
    $rParametri=sqlsrv_query($conn,$qParametri);
    if($rParametri==FALSE)
    {
        die("error");
    }
    else
    {
        while($rowParametri=sqlsrv_fetch_array($rParametri))
        {
            $parametro['id_parametro']=$rowParametri['id_parametro'];
            $parametro['nome']=$rowParametri['nome'];
            $parametro['valore']=$rowParametri['valore'];
            $parametro['descrizione']=$rowParametri['descrizione'];

            array_push($parametri,$parametro);
        }
        echo json_encode($parametri);
    }
?>