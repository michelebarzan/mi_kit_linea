<?php

    include "connessione.php";

    set_time_limit(90);

    $profilo = $_REQUEST["profilo"];
    $codice_pannello = $_REQUEST["codice_pannello"];

    $data=[];

    $query3="SELECT DISTINCT t.lotto, t.numero_cabina, t.disegno_cabina, t.kit, t.posizione, mi_db_tecnico.dbo.pannelli.codice_pannello
    FROM (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS appartenenza
                               FROM         dbo.view_cabine
                               UNION
                               SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS appartenenza
                               FROM dbo.view_corridoi) AS t INNER JOIN
                             mi_db_tecnico.dbo.kit ON t.kit = mi_db_tecnico.dbo.kit.codice_kit COLLATE SQL_Latin1_General_CP1_CI_AS INNER JOIN
                             mi_db_tecnico.dbo.pannelli_kit ON mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.pannelli_kit.id_kit INNER JOIN
                             mi_db_tecnico.dbo.pannelli ON mi_db_tecnico.dbo.pannelli_kit.id_pannello = mi_db_tecnico.dbo.pannelli.id_pannello
    WHERE (mi_db_tecnico.dbo.pannelli.codice_pannello = '$codice_pannello')
    ORDER BY kit";
    $result3=sqlsrv_query($conn,$query3);
    if($result3==TRUE)
    {
        while($row3=sqlsrv_fetch_array($result3))
        {
            $item["lotto"]=utf8_encode($row3['lotto']);
            $item["numero_cabina"]=utf8_encode($row3['numero_cabina']);
            $item["disegno_cabina"]=utf8_encode($row3['disegno_cabina']);
            $item["kit"]=utf8_encode($row3['kit']);
            $item["posizione"]=utf8_encode($row3['posizione']);

            array_push($data,$item);
        }
    }
    else
        die("error".$query2);

    echo json_encode($data);

?>