<?php

    include "connessione.php";

    set_time_limit(3000);

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $numero_cabina=$_REQUEST['numero_cabina'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $ordinamentoKit=$_REQUEST['ordinamentoKit'];
    $mostraMisureTraversine=$_REQUEST['mostraMisureTraversine'];
    $raggruppaKit=$_REQUEST['raggruppaKit'];
    $id_stazione=$_REQUEST['id_stazione'];
    
    $kit=[];
    
    if($raggruppaKit=="false")
    {
        $query1="SELECT DISTINCT 
                    t.commessa, t.lotto, t.numero_cabina, t.disegno_cabina, t.kit, t.posizione, t.qnt, t.appartenenza, LEN(t.$ordinamentoKit) AS Expr1, CASE WHEN id_kit_linea IS NULL 
                    THEN 'false' ELSE 'true' END AS registrato
                FROM (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS appartenenza
                    FROM dbo.view_cabine
                    UNION
                    SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS appartenenza
                    FROM dbo.view_corridoi) AS t LEFT OUTER JOIN
                        (SELECT id_kit_linea, lotto, cabina, kit, stazione, utente, linea, dataOra, posizione
                        FROM dbo.kit_linea AS kit_linea_1
                        WHERE (stazione = $id_stazione)) AS kit_linea ON t.lotto = kit_linea.lotto AND t.kit = kit_linea.kit AND t.numero_cabina = kit_linea.cabina AND t.posizione = kit_linea.posizione
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
    }
    else
    {
        $posizioni=[];
        $query2="SELECT   TOP (100) PERCENT t.kit, t.posizione, CASE WHEN id_kit_linea IS NULL THEN 'false' ELSE 'true' END AS registrato
                FROM         (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, qnt, 'cabina' AS appartenenza, posizione
                                           FROM         dbo.view_cabine
                                           UNION
                                           SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, qnt, 'corridoio' AS appartenenza, posizione
                                           FROM         dbo.view_corridoi) AS t LEFT OUTER JOIN
                                             (SELECT   id_kit_linea, lotto, cabina, kit, stazione, utente, linea, dataOra, posizione
                                                FROM         dbo.kit_linea AS kit_linea_1
                                                WHERE     (stazione = 3)) AS kit_linea ON t.lotto = kit_linea.lotto AND t.kit = kit_linea.kit AND t.numero_cabina = kit_linea.cabina AND t.posizione = kit_linea.posizione
                WHERE     (t.lotto = '$lotto') AND (t.commessa = '$commessa') AND (t.numero_cabina = '$numero_cabina')";
        $result2=sqlsrv_query($conn,$query2);
        if($result2==TRUE)
        {
            while($row2=sqlsrv_fetch_array($result2))
            {
                $posizione_lcl["registrato"]=filter_var($row2['registrato'], FILTER_VALIDATE_BOOLEAN);
                $posizione_lcl["posizione"]=$row2['posizione'];
                $posizione_lcl["kit"]=$row2['kit'];

                array_push($posizioni,$posizione_lcl);
            }
        }
        else
            die("error".$query1);

        $query1="SELECT   TOP (100) PERCENT t_1.commessa, t_1.lotto, t_1.numero_cabina, t_1.disegno_cabina, t_1.kit, t_1.qnt, t_1.appartenenza, COUNT(*) AS n
                                        FROM         (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, qnt, 'cabina' AS appartenenza,posizione
                                                                    FROM         dbo.view_cabine
                                                                    UNION
                                                                    SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, qnt, 'corridoio' AS appartenenza,posizione
                                                                    FROM         dbo.view_corridoi) AS t_1
                                        WHERE     (t_1.lotto = '$lotto') AND (t_1.commessa = '$commessa') AND (t_1.numero_cabina = '$numero_cabina')
                GROUP BY commessa, lotto, numero_cabina, disegno_cabina, kit, qnt, appartenenza
                ORDER BY kit";
        $result1=sqlsrv_query($conn,$query1);
        if($result1==TRUE)
        {
            while($row1=sqlsrv_fetch_array($result1))
            {
                $kitItem["appartenenza"]=$row1["appartenenza"];
                $kitItem["kit"]=$row1['kit'];
                $kitItem["n"]=$row1['n'];
                $kitItem["posizioni"]=[];

                $posizione_lcl=null;
                foreach ($posizioni as $posizione_lcl)
                {
                    if($posizione_lcl["kit"] == $row1['kit'])
                    {
                        $posizione["registrato"]=filter_var($posizione_lcl['registrato'], FILTER_VALIDATE_BOOLEAN);
                        $posizione["posizione"]=$posizione_lcl['posizione'];
    
                        array_push($kitItem["posizioni"],$posizione);
                    }
                }

                array_push($kit,$kitItem);
            }
        }
    }
 
    if($mostraMisureTraversine=="true")
    {
        $codici_kit = [];
        $kitItem=null;
        foreach($kit as $kitItem)
        {
            array_push($codici_kit,$kitItem["kit"]);
        }
        $kit_in="'".implode("','",$codici_kit)."'";

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
        $kitItem=null;
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