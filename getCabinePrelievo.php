<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    
    $cabine=[];

    $query1=<<<EOD
    SELECT disegno_cabina, '["' + STRING_AGG(numero_cabina, '","') + '"]' AS numeri_cabinaJSON, commessa, lotto
    FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina
    FROM dbo.view_cabine
    UNION
    SELECT commessa, lotto, numero_cabina, disegno_cabina
    FROM dbo.view_corridoi) AS t
    WHERE (lotto = '$lotto') AND (commessa = '$commessa')
    GROUP BY disegno_cabina, commessa, lotto
    EOD;

    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $cabina["disegno_cabina"]=$row1['disegno_cabina'];
            $cabina["numeri_cabina"]=json_decode($row1['numeri_cabinaJSON']);

            array_push($cabine,$cabina);
        }
    }
    else
        die("error".$query1);

    echo json_encode($cabine);

?>