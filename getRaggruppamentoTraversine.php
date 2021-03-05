<?php

    include "connessione.php";

    //$raggruppamento=$_REQUEST["raggruppamentoTraversine"];
    $kitObjs=json_decode($_REQUEST["JSONkit"]);

    $data=[];

    $kit=[];
    foreach ($kitObjs as $JSONkitObj)
    {
        $kitObj=json_decode(json_encode($JSONkitObj,true),true);
        array_push($kit,$kitObj["kit"]);
    }
    $kit_in="'".implode("','",$kit)."'";

    $kitArray=[];
    $query3="SELECT CODKIT, CODMAT, LUNG, posizione_traversina
            FROM (SELECT mi_db_tecnico.dbo.kit.codice_kit AS CODKIT, mi_db_tecnico.dbo.materie_prime.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_superiori.lung AS LUNG, 'superiore' AS posizione_traversina
                                    FROM mi_db_tecnico.dbo.traversine_superiori INNER JOIN
                                                                mi_db_tecnico.dbo.traversine_superiori_kit ON mi_db_tecnico.dbo.traversine_superiori.id_traversina_superiore = mi_db_tecnico.dbo.traversine_superiori_kit.id_traversina_superiore INNER JOIN
                                                                mi_db_tecnico.dbo.materie_prime ON mi_db_tecnico.dbo.traversine_superiori.id_materia_prima = mi_db_tecnico.dbo.materie_prime.id_materia_prima INNER JOIN
                                                                mi_db_tecnico.dbo.kit ON mi_db_tecnico.dbo.traversine_superiori_kit.id_kit = mi_db_tecnico.dbo.kit.id_kit WHERE mi_db_tecnico.dbo.traversine_superiori.lung>0
                                    UNION ALL
                                    SELECT kit_1.codice_kit AS CODKIT, materie_prime_1.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_inferiori.lung AS LUNG, 'inferiore' AS posizione_traversina
                                    FROM mi_db_tecnico.dbo.traversine_inferiori INNER JOIN
                                                            mi_db_tecnico.dbo.traversine_inferiori_kit ON mi_db_tecnico.dbo.traversine_inferiori.id_traversina_inferiore = mi_db_tecnico.dbo.traversine_inferiori_kit.id_traversina_inferiore INNER JOIN
                                                            mi_db_tecnico.dbo.kit AS kit_1 ON mi_db_tecnico.dbo.traversine_inferiori_kit.id_kit = kit_1.id_kit INNER JOIN
                                                            mi_db_tecnico.dbo.materie_prime AS materie_prime_1 ON mi_db_tecnico.dbo.traversine_inferiori.id_materia_prima = materie_prime_1.id_materia_prima WHERE mi_db_tecnico.dbo.traversine_inferiori.lung>0) AS t
            WHERE (CODKIT IN ($kit_in))";
    $result3=sqlsrv_query($conn,$query3);
    if($result3==TRUE)
    {
        while($row3=sqlsrv_fetch_array($result3))
        {
            $rowKit["CODKIT"]=$row3['CODKIT'];
            $rowKit["CODMAT"]=$row3['CODMAT'];
            $rowKit["LUNG"]=$row3['LUNG'];
            $rowKit["posizione_traversina"]=$row3['posizione_traversina'];

            array_push($kitArray,$rowKit);
        }
    }
    else
        die("error".$query2);

    /*$query2="SELECT $raggruppamento, COUNT(CODKIT) AS n_kit
            FROM (SELECT CODKIT, CODMAT, LUNG, posizione_traversina
                                    FROM (SELECT mi_db_tecnico.dbo.kit.codice_kit AS CODKIT, mi_db_tecnico.dbo.materie_prime.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_superiori.lung AS LUNG, 
                                                                                        'superiore' AS posizione_traversina
                                                                FROM mi_db_tecnico.dbo.traversine_superiori INNER JOIN
                                                                                        mi_db_tecnico.dbo.traversine_superiori_kit ON mi_db_tecnico.dbo.traversine_superiori.id_traversina_superiore = mi_db_tecnico.dbo.traversine_superiori_kit.id_traversina_superiore INNER JOIN
                                                                                        mi_db_tecnico.dbo.materie_prime ON mi_db_tecnico.dbo.traversine_superiori.id_materia_prima = mi_db_tecnico.dbo.materie_prime.id_materia_prima INNER JOIN
                                                                                        mi_db_tecnico.dbo.kit ON mi_db_tecnico.dbo.traversine_superiori_kit.id_kit = mi_db_tecnico.dbo.kit.id_kit WHERE mi_db_tecnico.dbo.traversine_superiori.lung>0
                                                                UNION ALL
                                                                SELECT kit_1.codice_kit AS CODKIT, materie_prime_1.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_inferiori.lung AS LUNG, 'inferiore' AS posizione_traversina
                                                                FROM mi_db_tecnico.dbo.traversine_inferiori INNER JOIN
                                                                                        mi_db_tecnico.dbo.traversine_inferiori_kit ON mi_db_tecnico.dbo.traversine_inferiori.id_traversina_inferiore = mi_db_tecnico.dbo.traversine_inferiori_kit.id_traversina_inferiore INNER JOIN
                                                                                        mi_db_tecnico.dbo.kit AS kit_1 ON mi_db_tecnico.dbo.traversine_inferiori_kit.id_kit = kit_1.id_kit INNER JOIN
                                                                                        mi_db_tecnico.dbo.materie_prime AS materie_prime_1 ON mi_db_tecnico.dbo.traversine_inferiori.id_materia_prima = materie_prime_1.id_materia_prima WHERE mi_db_tecnico.dbo.traversine_inferiori.lung>0) AS t
                                    WHERE (CODKIT IN ($kit_in))) AS derivedtbl_1
            GROUP BY $raggruppamento
            ORDER BY $raggruppamento";*/
    $query2="SELECT LUNG,CODMAT, COUNT(CODKIT) AS n_kit
            FROM (SELECT CODKIT, CODMAT, LUNG, posizione_traversina
                                    FROM (SELECT mi_db_tecnico.dbo.kit.codice_kit AS CODKIT, mi_db_tecnico.dbo.materie_prime.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_superiori.lung AS LUNG, 
                                                                                        'superiore' AS posizione_traversina
                                                                FROM mi_db_tecnico.dbo.traversine_superiori INNER JOIN
                                                                                        mi_db_tecnico.dbo.traversine_superiori_kit ON mi_db_tecnico.dbo.traversine_superiori.id_traversina_superiore = mi_db_tecnico.dbo.traversine_superiori_kit.id_traversina_superiore INNER JOIN
                                                                                        mi_db_tecnico.dbo.materie_prime ON mi_db_tecnico.dbo.traversine_superiori.id_materia_prima = mi_db_tecnico.dbo.materie_prime.id_materia_prima INNER JOIN
                                                                                        mi_db_tecnico.dbo.kit ON mi_db_tecnico.dbo.traversine_superiori_kit.id_kit = mi_db_tecnico.dbo.kit.id_kit WHERE mi_db_tecnico.dbo.traversine_superiori.lung>0
                                                                UNION ALL
                                                                SELECT kit_1.codice_kit AS CODKIT, materie_prime_1.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_inferiori.lung AS LUNG, 'inferiore' AS posizione_traversina
                                                                FROM mi_db_tecnico.dbo.traversine_inferiori INNER JOIN
                                                                                        mi_db_tecnico.dbo.traversine_inferiori_kit ON mi_db_tecnico.dbo.traversine_inferiori.id_traversina_inferiore = mi_db_tecnico.dbo.traversine_inferiori_kit.id_traversina_inferiore INNER JOIN
                                                                                        mi_db_tecnico.dbo.kit AS kit_1 ON mi_db_tecnico.dbo.traversine_inferiori_kit.id_kit = kit_1.id_kit INNER JOIN
                                                                                        mi_db_tecnico.dbo.materie_prime AS materie_prime_1 ON mi_db_tecnico.dbo.traversine_inferiori.id_materia_prima = materie_prime_1.id_materia_prima WHERE mi_db_tecnico.dbo.traversine_inferiori.lung>0) AS t
                                    WHERE (CODKIT IN ($kit_in))) AS derivedtbl_1
            GROUP BY LUNG,CODMAT
            ORDER BY LUNG,CODMAT";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            //$row[$raggruppamento]=$row2[$raggruppamento];
            $row["LUNG"]=$row2['LUNG'];
            $row["CODMAT"]=$row2['CODMAT'];
            $row["n_kit"]=$row2['n_kit'];
            //$row["kit"]=getKit($kitArray,$raggruppamento,$row[$raggruppamento]);
            $row["kit"]=getKit($kitArray,$row2['LUNG'],$row2['CODMAT']);

            array_push($data,$row);
        }
    }
    else
        die("error".$query2);

    echo json_encode($data);

    /*function getKit($kitArray,$raggruppamento,$valore)
    {
        $kit=[];
        foreach ($kitArray as $rowKit)
        {
            if($rowKit[$raggruppamento]==$valore)
                array_push($kit,$rowKit["CODKIT"]);
        }
        return $kit;
    }*/
    function getKit($kitArray,$LUNG,$CODMAT)
    {
        $kit=[];
        foreach ($kitArray as $rowKit)
        {
            if($rowKit["LUNG"]==$LUNG && $rowKit["CODMAT"]==$CODMAT)
                array_push($kit,$rowKit["CODKIT"]);
        }
        return $kit;
    }
?>