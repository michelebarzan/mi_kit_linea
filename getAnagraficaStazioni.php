<?php

    include "connessione.php";

    $stazioni=[];

    $query2="SELECT * FROM dbo.anagrafica_stazioni";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $stazione["id_stazione"]=$row2['id_stazione'];
            $stazione["nome"]=$row2['nome'];
            $stazione["label"]=$row2['label'];
            $stazione["stazione_precedente"]=$row2['stazione_precedente'];
            $stazione["pagina"]=$row2['pagina'];

            array_push($stazioni,$stazione);
        }
    }
    else
        die("error");

    echo json_encode($stazioni);

?>