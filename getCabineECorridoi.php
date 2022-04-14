<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $stazione=$_REQUEST['stazione'];
    
    $cabine_corridoi=[];

    $query1="SELECT DISTINCT t.numero_cabina, t.disegno_cabina, CASE WHEN t_1.cabina IS NULL THEN 'false' ELSE 'true' END AS chiusa, t.tipo
FROM            (SELECT        commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS tipo
                          FROM            dbo.view_cabine
                          UNION
                          SELECT        commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS tipo
                          FROM            dbo.view_corridoi) AS t LEFT OUTER JOIN
                             (SELECT        lotto, cabina, stazione
                               FROM            dbo.cabine_chiuse
                               WHERE        (stazione = $stazione) OR
                                                         (stazione IS NULL)) AS t_1 ON t.lotto = t_1.lotto AND t.numero_cabina = t_1.cabina
WHERE        (t.lotto = '$lotto') AND (t.commessa = '$commessa')";
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $cabina_corridoio["tipo"]=$row1['tipo'];
            $cabina_corridoio["numero_cabina"]=$row1['numero_cabina'];
            $cabina_corridoio["disegno_cabina"]=$row1['disegno_cabina'];
            $cabina_corridoio["chiusa"]=filter_var($row1['chiusa'], FILTER_VALIDATE_BOOLEAN);

            if($filtroAvanzamento=="attivo")
            {
                if($row1['chiusa'] == 'false')
                    array_push($cabine_corridoi,$cabina_corridoio); 
            }
            else
                array_push($cabine_corridoi,$cabina_corridoio);
        }
    }
    else
        die("error");

    echo json_encode($cabine_corridoi);

?>