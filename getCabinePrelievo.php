<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    
    $cabine=[];

    $query1=<<<EOD
    SELECT t.disegno_cabina, '["' + STRING_AGG(t.numero_cabina, '","') + '"]' AS numeri_cabinaJSON, t.commessa, t.lotto, CASE WHEN cabine_chiuse_prelievo.lotto IS NULL THEN 'false' ELSE 'true' END AS chiusa
    FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina
            FROM dbo.view_cabine
            UNION
            SELECT commessa, lotto, numero_cabina, disegno_cabina
            FROM dbo.view_corridoi) AS t LEFT OUTER JOIN
            dbo.cabine_chiuse_prelievo ON t.lotto = dbo.cabine_chiuse_prelievo.lotto AND t.disegno_cabina = dbo.cabine_chiuse_prelievo.disegno_cabina
    WHERE (t.lotto = '$lotto') AND (t.commessa = '$commessa')
    GROUP BY t.disegno_cabina, t.commessa, t.lotto, CASE WHEN cabine_chiuse_prelievo.lotto IS NULL THEN 'false' ELSE 'true' END
    EOD;

    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $cabina["disegno_cabina"]=$row1['disegno_cabina'];
            $cabina["numeri_cabina"]=json_decode($row1['numeri_cabinaJSON']);
            $cabina["chiusa"]=filter_var($row1['chiusa'], FILTER_VALIDATE_BOOLEAN);

            array_push($cabine,$cabina);
        }
    }
    else
        die("error".$query1);

    echo json_encode($cabine);

?>