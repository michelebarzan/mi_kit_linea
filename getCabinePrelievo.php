<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    
    $cabine=[];

    $query1=<<<EOD
    SELECT t.disegno_cabina, '["' + STRING_AGG(t.numero_cabina, '","') + '"]' AS numeri_cabinaJSON, t.commessa, t.lotto
    FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina
            FROM dbo.view_cabine
            UNION
            SELECT commessa, lotto, numero_cabina, disegno_cabina
            FROM dbo.view_corridoi) AS t
    WHERE (t.lotto = '$lotto') AND (t.commessa = '$commessa')
    GROUP BY t.disegno_cabina, t.commessa, t.lotto ORDER BY t.disegno_cabina
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