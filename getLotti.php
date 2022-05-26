<?php

    include "connessione.php";

    $lotti=[];

    $query2="SELECT * FROM dbo.lotti WHERE producibile='true' and chiuso='false' ORDER BY commessa ASC,lotto ASC";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $lotto["id_lotto"]=$row2['id_lotto'];
            $lotto["lotto"]=$row2['lotto'];
            $lotto["commessa"]=$row2['commessa'];

            array_push($lotti,$lotto);
        }
    }
    else
        die("error");

    echo json_encode($lotti);

?>