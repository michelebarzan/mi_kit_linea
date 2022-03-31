<?php

    include "connessione.php";

    set_time_limit(3000);

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $numero_cabina=$_REQUEST['numero_cabina'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $ordinamentoKit=$_REQUEST['ordinamentoKit'];
    $mostraMisureTraversine=$_REQUEST['mostraMisureTraversine'];
    
    $kit=[];
    
    $query1="SELECT DISTINCT t.commessa, t.lotto, t.numero_cabina, t.disegno_cabina, t.kit, t.posizione, t.qnt, t.appartenenza, LEN(t.$ordinamentoKit), CASE WHEN id_kit_linea IS NULL THEN 'false' ELSE 'true' END AS registrato
            FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS appartenenza FROM dbo.view_cabine
                UNION
                SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS appartenenza FROM dbo.view_corridoi) AS t LEFT OUTER JOIN
            dbo.kit_linea ON t.lotto = dbo.kit_linea.lotto AND t.kit = dbo.kit_linea.kit AND t.numero_cabina = dbo.kit_linea.cabina AND t.posizione = dbo.kit_linea.posizione
            WHERE (t.lotto = '$lotto') AND (t.commessa = '$commessa') AND (t.numero_cabina = '$numero_cabina')
            ORDER BY LEN(t.$ordinamentoKit), t.$ordinamentoKit";
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $kitItem["appartenenza"]=$row1["appartenenza"];
            $kitItem["kit"]=$row1['kit'];
            $kitItem["posizione"]=$row1['posizione'];
            $kitItem["qnt"]=intval($row1['qnt']);

            if($filtroAvanzamento=="attivo")
            {
                if($row1['registrato'] == 'false')
                    array_push($kit,$kitItem);
            }
            else
            {
                $kitItem["registrato"]=filter_var($row1['registrato'], FILTER_VALIDATE_BOOLEAN);

                array_push($kit,$kitItem);
            }
        }
    }
    else
        die("error".$query1);
 
    if($mostraMisureTraversine=="true")
    {
        $kit_in=substr($kit_in, 0, -1);

        if(count($kit) > 0)
        {
            $query4="SELECT CODKIT, CODMAT, LUNG, posizione_traversina
                    FROM (SELECT mi_db_tecnico.dbo.kit.codice_kit AS CODKIT, mi_db_tecnico.dbo.materie_prime.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_superiori.lung AS LUNG, 'superiore' AS posizione_traversina
                            FROM mi_db_tecnico.dbo.traversine_superiori INNER JOIN mi_db_tecnico.dbo.traversine_superiori_kit ON mi_db_tecnico.dbo.traversine_superiori.id_traversina_superiore = mi_db_tecnico.dbo.traversine_superiori_kit.id_traversina_superiore INNER JOIN mi_db_tecnico.dbo.materie_prime ON mi_db_tecnico.dbo.traversine_superiori.id_materia_prima = mi_db_tecnico.dbo.materie_prime.id_materia_prima INNER JOIN mi_db_tecnico.dbo.kit ON mi_db_tecnico.dbo.traversine_superiori_kit.id_kit = mi_db_tecnico.dbo.kit.id_kit WHERE mi_db_tecnico.dbo.traversine_superiori.lung>0
                        UNION ALL
                        SELECT kit_1.codice_kit AS CODKIT, materie_prime_1.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_inferiori.lung AS LUNG, 'inferiore' AS posizione_traversina
                            FROM mi_db_tecnico.dbo.traversine_inferiori INNER JOIN mi_db_tecnico.dbo.traversine_inferiori_kit ON mi_db_tecnico.dbo.traversine_inferiori.id_traversina_inferiore = mi_db_tecnico.dbo.traversine_inferiori_kit.id_traversina_inferiore INNER JOIN mi_db_tecnico.dbo.kit AS kit_1 ON mi_db_tecnico.dbo.traversine_inferiori_kit.id_kit = kit_1.id_kit INNER JOIN mi_db_tecnico.dbo.materie_prime AS materie_prime_1 ON mi_db_tecnico.dbo.traversine_inferiori.id_materia_prima = materie_prime_1.id_materia_prima WHERE mi_db_tecnico.dbo.traversine_inferiori.lung>0) AS t
                    WHERE CODKIT in ($kit_in) 
                    ORDER BY CODKIT";
            $result4=sqlsrv_query($conn,$query4);
            if($result4==TRUE)
            {
                $traversine=[];
    
                while($row4=sqlsrv_fetch_array($result4))
                {
                    $traversina["CODMAT"]=$row4["CODMAT"];
                    $traversina["LUNG"]=number_format($row4['LUNG'],2,",",".");
                    $traversina["posizione_traversina"]=$row4["posizione_traversina"];
                    $traversina["CODKIT"]=$row4["CODKIT"];
    
                    array_push($traversine,$traversina);
                }
            }
            else
                die("error".$query4);
        }

        $i=0;
        foreach($kit as $kitItem)
        {
            $traversinekit=[];
            foreach($traversine as $traversina)
            {
                if($traversina["CODKIT"]==$kitItem["kit"])
                {
                    array_push($traversinekit,$traversina);
                }
            }
            $kit[$i]["traversine"]=$traversinekit;
            $i++;
        }
    }

    echo json_encode($kit);

?>