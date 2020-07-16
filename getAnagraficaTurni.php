<?php

    include "connessione.php";

    $turni=[];

    $query2="SELECT * FROM dbo.anagrafica_turni";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $turno["id_turno"]=$row2['id_turno'];
            $turno["nome"]=$row2['nome'];
            $turno["label"]=$row2['label'];

            array_push($turni,$turno);
        }
    }
    else
        die("error");

    echo json_encode($turni);

?>