<?php

    include "connessione.php";

    $linee=[];

    $query2="SELECT * FROM dbo.anagrafica_linee";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $linea["id_linea"]=$row2['id_linea'];
            $linea["nome"]=$row2['nome'];
            $linea["label"]=$row2['label'];
            $linea["numero"]=$row2['numero'];

            array_push($linee,$linea);
        }
    }
    else
        die("error");

    echo json_encode($linee);

?>