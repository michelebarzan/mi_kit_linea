<?php

    include "connessione.php";

    $kitObjs=json_decode($_REQUEST["JSONkit"]);
    $lotto=$_REQUEST["lotto"];
    $cabina=$_REQUEST["cabina"];
    $disegno_cabina=$_REQUEST["disegno_cabina"];

    $data=[];

    $kit=[];
    foreach ($kitObjs as $JSONkitObj)
    {
        $kitObj=json_decode(json_encode($JSONkitObj,true),true);
        array_push($kit,$kitObj["kit"]);
    }
    $kit_in="'".implode("','",$kit)."'";

    $query3="SELECT   t2.posizione, t.LUNG, t.CODMAT, t.CODKIT, t.posizione_traversina, t2.lotto, t3.qnt_kit_lotto, t3.cabine_lotto, t2.disegno_cabina
    FROM         (SELECT   lotto, kit, posizione, COUNT(kit) AS qnt_kit_lotto, STRING_AGG(numero_cabina, ', ') WITHIN GROUP (ORDER BY numero_cabina) AS cabine_lotto
                               FROM         dbo.view_corridoi
                               WHERE     (lotto = '$lotto') AND disegno_cabina = '$disegno_cabina'
                               GROUP BY lotto, kit, posizione
                               UNION
                               SELECT   lotto, kit, posizione, COUNT(kit) AS qnt_kit_lotto, STRING_AGG(numero_cabina, ', ') WITHIN GROUP (ORDER BY numero_cabina) AS cabine_lotto
                               FROM         dbo.view_cabine
                               WHERE     (lotto = '$lotto') AND disegno_cabina = '$disegno_cabina'
                               GROUP BY lotto, kit, posizione) AS t3 INNER JOIN
                                 (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM         dbo.view_cabine AS view_cabine_1
                                    WHERE     (lotto = '$lotto') AND (numero_cabina = '$cabina')
                                    UNION
                                    SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM         dbo.view_corridoi AS view_corridoi_1
                                    WHERE     (lotto = '$lotto') AND (numero_cabina = '$cabina')) AS t2 INNER JOIN
                                 (SELECT   mi_db_tecnico.dbo.kit.codice_kit AS CODKIT, mi_db_tecnico.dbo.materie_prime.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_superiori.lung AS LUNG, 
                                                             'superiore' AS posizione_traversina
                                    FROM         mi_db_tecnico.dbo.traversine_superiori INNER JOIN
                                                             mi_db_tecnico.dbo.traversine_superiori_kit ON 
                                                             mi_db_tecnico.dbo.traversine_superiori.id_traversina_superiore = mi_db_tecnico.dbo.traversine_superiori_kit.id_traversina_superiore INNER JOIN
                                                             mi_db_tecnico.dbo.materie_prime ON mi_db_tecnico.dbo.traversine_superiori.id_materia_prima = mi_db_tecnico.dbo.materie_prime.id_materia_prima INNER JOIN
                                                             mi_db_tecnico.dbo.kit ON mi_db_tecnico.dbo.traversine_superiori_kit.id_kit = mi_db_tecnico.dbo.kit.id_kit
                                    WHERE     (mi_db_tecnico.dbo.traversine_superiori.lung > 0)
                                    UNION ALL
                                    SELECT   kit_1.codice_kit AS CODKIT, materie_prime_1.codice_materia_prima AS CODMAT, mi_db_tecnico.dbo.traversine_inferiori.lung AS LUNG, 
                                                             'inferiore' AS posizione_traversina
                                    FROM         mi_db_tecnico.dbo.traversine_inferiori INNER JOIN
                                                             mi_db_tecnico.dbo.traversine_inferiori_kit ON 
                                                             mi_db_tecnico.dbo.traversine_inferiori.id_traversina_inferiore = mi_db_tecnico.dbo.traversine_inferiori_kit.id_traversina_inferiore INNER JOIN
                                                             mi_db_tecnico.dbo.kit AS kit_1 ON mi_db_tecnico.dbo.traversine_inferiori_kit.id_kit = kit_1.id_kit INNER JOIN
                                                             mi_db_tecnico.dbo.materie_prime AS materie_prime_1 ON mi_db_tecnico.dbo.traversine_inferiori.id_materia_prima = materie_prime_1.id_materia_prima
                                    WHERE     (mi_db_tecnico.dbo.traversine_inferiori.lung > 0)) AS t ON t2.kit = t.CODKIT COLLATE SQL_Latin1_General_CP1_CI_AS ON t3.kit = t2.kit AND t3.posizione = t2.posizione
    WHERE     (t.CODKIT IN ($kit_in))";
    $result3=sqlsrv_query($conn,$query3);
    if($result3==TRUE)
    {
        while($row3=sqlsrv_fetch_array($result3))
        {
            $rowKit["POS"]=utf8_encode($row3['posizione']);
            $lung = $row3["LUNG"];
            $lung = floatval($lung);
            $rowKit["LUNG"]=$lung;
            $rowKit["CODMAT"]=utf8_encode($row3['CODMAT']);
            $rowKit["CODKIT"]=utf8_encode($row3['CODKIT']);
            $rowKit["LOTTO"]=$row3['lotto'];
            $rowKit["QNT_CABINE"]=$row3['qnt_kit_lotto'];
            $rowKit["CABINE"]=$row3['cabine_lotto'];
            $rowKit["DISEGNO_CABINA"]=$row3['disegno_cabina'];

            array_push($data,$rowKit);
        }
    }
    else
        die("error".$query3);

    echo json_encode($data);

?>