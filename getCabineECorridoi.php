<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $filtroLinea=$_REQUEST['filtroLinea'];
    $stazione=$_REQUEST['stazione'];
    if(isset($_REQUEST['id_linea']))
        $id_linea=$_REQUEST['id_linea'];
    else
        $id_linea=0;

    if($filtroLinea == "attivo")
        $filtroLineaCondition = "IS NOT NULL";
    else
        $filtroLineaCondition = "IS NULL";

    $cabine_corridoi=[];

    /*$query1=<<<EOD
    SELECT DISTINCT t_3.numero_cabina, t_3.disegno_cabina, CASE WHEN t_1.cabina IS NULL THEN 'false' ELSE 'true' END AS chiusa, t_3.tipo, t_2.numeri_cabinaJSON
    FROM (SELECT lotto, cabina, stazione
                            FROM dbo.cabine_chiuse
                            WHERE (stazione = $stazione) OR
                                                        (stazione IS NULL)) AS t_1 RIGHT OUTER JOIN
                                (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS tipo
                                    FROM dbo.view_cabine AS view_cabine_1
                                    UNION
                                    SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS tipo
                                    FROM dbo.view_corridoi AS view_corridoi_1) AS t_3 INNER JOIN
                                (SELECT lotto, '["' + STRING_AGG(numero_cabina, '","') + '"]' AS numeri_cabinaJSON, disegno_cabina
                                    FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS tipo
                                                            FROM dbo.view_cabine
                                                            UNION
                                                            SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS tipo
                                                            FROM dbo.view_corridoi) AS t
                                    GROUP BY lotto, disegno_cabina) AS t_2 ON t_3.disegno_cabina = t_2.disegno_cabina AND t_3.lotto = t_2.lotto ON t_1.lotto = t_3.lotto AND t_1.cabina = t_3.numero_cabina
    WHERE (t_3.lotto = '$lotto') AND (t_3.commessa = '$commessa')
    EOD;*/

    $query1=<<<EOD
    SELECT DISTINCT t_3.numero_cabina, t_3.disegno_cabina, CASE WHEN t_1.cabina IS NULL THEN 'false' ELSE 'true' END AS chiusa, t_3.tipo, t_2.numeri_cabinaJSON, cabine_linee.id_cabina_linea
    FROM (SELECT id_cabina_linea, cabina, linea, lotto
                            FROM dbo.cabine_linee AS cabine_linee_1
                            WHERE (linea = $id_linea)) AS cabine_linee RIGHT OUTER JOIN
                            dbo.lotti INNER JOIN
                                (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS tipo
                                FROM            dbo.view_cabine AS view_cabine_1
                                UNION
                                SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS tipo
                                FROM dbo.view_corridoi AS view_corridoi_1) AS t_3 INNER JOIN
                                (SELECT lotto, '["' + STRING_AGG(numero_cabina, '","') + '"]' AS numeri_cabinaJSON, disegno_cabina
                                FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS tipo
                                                            FROM dbo.view_cabine
                                                            UNION
                                                            SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS tipo
                                                            FROM dbo.view_corridoi) AS t
                                GROUP BY lotto, disegno_cabina) AS t_2 ON t_3.disegno_cabina = t_2.disegno_cabina AND t_3.lotto = t_2.lotto ON dbo.lotti.lotto = t_3.lotto ON cabine_linee.lotto = dbo.lotti.id_lotto AND 
                            cabine_linee.cabina = t_3.numero_cabina LEFT OUTER JOIN
                                (SELECT lotto, cabina, stazione
                                FROM dbo.cabine_chiuse
                                WHERE (stazione = $stazione) OR
                                                            (stazione IS NULL)) AS t_1 ON t_3.lotto = t_1.lotto AND t_3.numero_cabina = t_1.cabina
    WHERE (t_3.lotto = '$lotto') AND (t_3.commessa = '$commessa') AND (cabine_linee.id_cabina_linea $filtroLineaCondition)
    EOD;

    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $cabina_corridoio["tipo"]=$row1['tipo'];
            $cabina_corridoio["numero_cabina"]=$row1['numero_cabina'];
            $cabina_corridoio["disegno_cabina"]=$row1['disegno_cabina'];
            $cabina_corridoio["chiusa"]=filter_var($row1['chiusa'], FILTER_VALIDATE_BOOLEAN);
            $cabina_corridoio["numeri_cabina"]=json_decode($row1['numeri_cabinaJSON']);

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
        die("error".$query1);

    echo json_encode($cabine_corridoi);

?>