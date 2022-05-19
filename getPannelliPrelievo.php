<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    if(isset($_REQUEST["numeri_cabina"]))
        $numeri_cabina=$_REQUEST["numeri_cabina"];
    else
        $numeri_cabina=[];

    $numeri_cabina_in = "'".implode("','",$numeri_cabina)."'";
    
    $kit=[];
    $kit_cln=[];
    $pannelli=[];
    $kit_in_array=[];

    $query1="SELECT DISTINCT 
                kit, posizione, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '') AS lettera, 
                REPLACE(posizione, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', ''), '') AS numero, 
                LEN(REPLACE(posizione, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', ''), '')) 
                AS len_numero
            FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                FROM dbo.view_cabine
                UNION
                SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                FROM dbo.view_corridoi) AS t
            WHERE (lotto = '$lotto') AND (disegno_cabina = '$disegno_cabina')
            ORDER BY len_numero, numero, lettera";
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $kitObj["kit"]=$row1['kit'];
            $kitObj["posizione"]=$row1['posizione'];

            array_push($kit,$kitObj);
            array_push($kit_in_array,$row1['kit']);
        }
    }
    else
        die("error".$query1);

    $kit_in = "'".implode("','",$kit_in_array)."'";

    /*$query2="SELECT DISTINCT TOP (100) PERCENT codice_kit, codice_pannello, posx, halt, lung1, lung2, ang, n_fori, prelevato, pos_kit
            FROM (SELECT TOP (100) PERCENT mi_db_tecnico.dbo.kit.codice_kit, mi_db_tecnico.dbo.pannelli.codice_pannello, mi_db_tecnico.dbo.pannelli_kit.posx, mi_db_tecnico.dbo.lamiere.halt, mi_db_tecnico.dbo.lamiere.lung1, 
            mi_db_tecnico.dbo.lamiere.lung2, mi_db_tecnico.dbo.lamiere.ang, ISNULL(lavorazioni_lamiere_1.n_fori, 0) AS n_fori, CASE WHEN id_pannello_prelievo IS NULL THEN 'false' ELSE 'true' END AS prelevato, 
            mi_db_tecnico.dbo.kit_cabine.pos AS pos_kit
            FROM mi_db_tecnico.dbo.kit INNER JOIN
            mi_db_tecnico.dbo.pannelli_kit ON mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.pannelli_kit.id_kit INNER JOIN
            mi_db_tecnico.dbo.pannelli ON mi_db_tecnico.dbo.pannelli_kit.id_pannello = mi_db_tecnico.dbo.pannelli.id_pannello INNER JOIN
            mi_db_tecnico.dbo.lamiere ON mi_db_tecnico.dbo.pannelli.id_lamiera = mi_db_tecnico.dbo.lamiere.id_lamiera INNER JOIN
            mi_db_tecnico.dbo.kit_cabine ON mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.kit_cabine.id_kit AND mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.kit_cabine.id_kit INNER JOIN
            mi_db_tecnico.dbo.cabine ON mi_db_tecnico.dbo.kit_cabine.id_cabina = mi_db_tecnico.dbo.cabine.id_cabina AND mi_db_tecnico.dbo.kit_cabine.id_cabina = mi_db_tecnico.dbo.cabine.id_cabina INNER JOIN
            (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
            FROM dbo.view_cabine
            WHERE (lotto = '$lotto') AND (disegno_cabina = '$disegno_cabina')
            UNION
            SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
            FROM dbo.view_corridoi
            WHERE (lotto = '$lotto') AND (disegno_cabina = '$disegno_cabina')) AS t ON mi_db_tecnico.dbo.cabine.codice_cabina COLLATE SQL_Latin1_General_CP1_CI_AS = t.disegno_cabina AND 
            mi_db_tecnico.dbo.kit.codice_kit COLLATE SQL_Latin1_General_CP1_CI_AS = t.kit AND mi_db_tecnico.dbo.kit_cabine.pos = t.posizione COLLATE Latin1_General_CI_AS LEFT OUTER JOIN
            dbo.pannelli_prelievo ON t.lotto = dbo.pannelli_prelievo.lotto AND t.disegno_cabina = dbo.pannelli_prelievo.disegno_cabina AND t.kit = dbo.pannelli_prelievo.kit AND 
            t.posizione = dbo.pannelli_prelievo.posizione AND mi_db_tecnico.dbo.pannelli.codice_pannello COLLATE SQL_Latin1_General_CP1_CI_AS = dbo.pannelli_prelievo.codice_pannello LEFT OUTER JOIN
            (SELECT COUNT(*) AS n_fori, id_lamiera
            FROM mi_db_tecnico.dbo.lavorazioni_lamiere
            GROUP BY id_lamiera) AS lavorazioni_lamiere_1 ON mi_db_tecnico.dbo.lamiere.id_lamiera = lavorazioni_lamiere_1.id_lamiera
            UNION
            SELECT TOP (100) PERCENT kit_1.codice_kit, pannelli_1.codice_pannello, pannelli_kit_1.posx, lamiere_1.halt, lamiere_1.lung1, lamiere_1.lung2, lamiere_1.ang, ISNULL(lavorazioni_lamiere_1_1.n_fori, 0) AS n_fori, 
            CASE WHEN id_pannello_prelievo IS NULL THEN 'false' ELSE 'true' END AS prelevato, mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.pos AS pos_kit
            FROM mi_db_tecnico.dbo.kit AS kit_1 INNER JOIN
            mi_db_tecnico.dbo.pannelli_kit AS pannelli_kit_1 ON kit_1.id_kit = pannelli_kit_1.id_kit INNER JOIN
            mi_db_tecnico.dbo.pannelli AS pannelli_1 ON pannelli_kit_1.id_pannello = pannelli_1.id_pannello INNER JOIN
            mi_db_tecnico.dbo.lamiere AS lamiere_1 ON pannelli_1.id_lamiera = lamiere_1.id_lamiera INNER JOIN
            (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
            FROM dbo.view_cabine AS view_cabine_1
            WHERE (lotto = '$lotto') AND (disegno_cabina = '$disegno_cabina')
            UNION
            SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
            FROM dbo.view_corridoi AS view_corridoi_1
            WHERE (lotto = '$lotto') AND (disegno_cabina = '$disegno_cabina')) AS t_1 ON kit_1.codice_kit COLLATE SQL_Latin1_General_CP1_CI_AS = t_1.kit INNER JOIN
            mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi ON kit_1.id_kit = mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.id_kit AND 
            t_1.posizione COLLATE Latin1_General_CI_AS = mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.pos INNER JOIN
            mi_db_tecnico.dbo.sottoinsiemi_corridoi ON mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.id_sottoinsieme_corridoio = mi_db_tecnico.dbo.sottoinsiemi_corridoi.id_sottoinsieme_corridoio AND 
            t_1.disegno_cabina = mi_db_tecnico.dbo.sottoinsiemi_corridoi.codice_sottoinsieme_corridoio COLLATE SQL_Latin1_General_CP1_CI_AS LEFT OUTER JOIN
            dbo.pannelli_prelievo AS pannelli_prelievo_1 ON t_1.lotto = pannelli_prelievo_1.lotto AND t_1.disegno_cabina = pannelli_prelievo_1.disegno_cabina AND t_1.kit = pannelli_prelievo_1.kit AND 
            t_1.posizione = pannelli_prelievo_1.posizione AND pannelli_1.codice_pannello COLLATE SQL_Latin1_General_CP1_CI_AS = pannelli_prelievo_1.codice_pannello LEFT OUTER JOIN
            (SELECT COUNT(*) AS n_fori, id_lamiera
            FROM mi_db_tecnico.dbo.lavorazioni_lamiere AS lavorazioni_lamiere_2
            GROUP BY id_lamiera) AS lavorazioni_lamiere_1_1 ON lamiere_1.id_lamiera = lavorazioni_lamiere_1_1.id_lamiera) AS t_u
            ORDER BY posx DESC";*/
    $query2="SELECT   TOP (100) PERCENT codice_kit, codice_pannello, posx, halt, lung1, lung2, ang, n_fori, pos_kit, STRING_AGG(numero_cabina, ',')  AS numeri_cabina
    FROM         (SELECT   TOP (100) PERCENT mi_db_tecnico.dbo.kit.codice_kit, mi_db_tecnico.dbo.pannelli.codice_pannello, mi_db_tecnico.dbo.pannelli_kit.posx, mi_db_tecnico.dbo.lamiere.halt, 
                                                        mi_db_tecnico.dbo.lamiere.lung1, mi_db_tecnico.dbo.lamiere.lung2, mi_db_tecnico.dbo.lamiere.ang, ISNULL(lavorazioni_lamiere_1.n_fori, 0) AS n_fori, 
                                                        mi_db_tecnico.dbo.kit_cabine.pos AS pos_kit, dbo.pannelli_prelievo.numero_cabina
                               FROM         mi_db_tecnico.dbo.kit INNER JOIN
                                                        mi_db_tecnico.dbo.pannelli_kit ON mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.pannelli_kit.id_kit INNER JOIN
                                                        mi_db_tecnico.dbo.pannelli ON mi_db_tecnico.dbo.pannelli_kit.id_pannello = mi_db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                                                        mi_db_tecnico.dbo.lamiere ON mi_db_tecnico.dbo.pannelli.id_lamiera = mi_db_tecnico.dbo.lamiere.id_lamiera INNER JOIN
                                                        mi_db_tecnico.dbo.kit_cabine ON mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.kit_cabine.id_kit AND 
                                                        mi_db_tecnico.dbo.kit.id_kit = mi_db_tecnico.dbo.kit_cabine.id_kit INNER JOIN
                                                        mi_db_tecnico.dbo.cabine ON mi_db_tecnico.dbo.kit_cabine.id_cabina = mi_db_tecnico.dbo.cabine.id_cabina AND 
                                                        mi_db_tecnico.dbo.kit_cabine.id_cabina = mi_db_tecnico.dbo.cabine.id_cabina INNER JOIN
                                                            (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                                               FROM         dbo.view_cabine
                                                               WHERE     (lotto = '$lotto') AND (numero_cabina IN ($numeri_cabina_in))
                                                               UNION
                                                               SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                                               FROM         dbo.view_corridoi
                                                               WHERE     (lotto = '$lotto') AND (numero_cabina IN ($numeri_cabina_in))) AS t ON 
                                                        mi_db_tecnico.dbo.cabine.codice_cabina COLLATE SQL_Latin1_General_CP1_CI_AS = t.disegno_cabina AND 
                                                        mi_db_tecnico.dbo.kit.codice_kit COLLATE SQL_Latin1_General_CP1_CI_AS = t.kit AND 
                                                        mi_db_tecnico.dbo.kit_cabine.pos = t.posizione COLLATE Latin1_General_CI_AS LEFT OUTER JOIN
                                                        dbo.pannelli_prelievo ON t.lotto = dbo.pannelli_prelievo.lotto AND t.disegno_cabina = dbo.pannelli_prelievo.disegno_cabina AND t.kit = dbo.pannelli_prelievo.kit AND 
                                                        t.posizione = dbo.pannelli_prelievo.posizione AND 
                                                        mi_db_tecnico.dbo.pannelli.codice_pannello COLLATE SQL_Latin1_General_CP1_CI_AS = dbo.pannelli_prelievo.codice_pannello LEFT OUTER JOIN
                                                            (SELECT   COUNT(*) AS n_fori, id_lamiera
                                                               FROM         mi_db_tecnico.dbo.lavorazioni_lamiere
                                                               GROUP BY id_lamiera) AS lavorazioni_lamiere_1 ON mi_db_tecnico.dbo.lamiere.id_lamiera = lavorazioni_lamiere_1.id_lamiera
                               UNION
                               SELECT   TOP (100) PERCENT kit_1.codice_kit, pannelli_1.codice_pannello, pannelli_kit_1.posx, lamiere_1.halt, lamiere_1.lung1, lamiere_1.lung2, lamiere_1.ang, 
                                                        ISNULL(lavorazioni_lamiere_1_1.n_fori, 0) AS n_fori, mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.pos AS pos_kit, pannelli_prelievo_1.numero_cabina
                               FROM         mi_db_tecnico.dbo.kit AS kit_1 INNER JOIN
                                                        mi_db_tecnico.dbo.pannelli_kit AS pannelli_kit_1 ON kit_1.id_kit = pannelli_kit_1.id_kit INNER JOIN
                                                        mi_db_tecnico.dbo.pannelli AS pannelli_1 ON pannelli_kit_1.id_pannello = pannelli_1.id_pannello INNER JOIN
                                                        mi_db_tecnico.dbo.lamiere AS lamiere_1 ON pannelli_1.id_lamiera = lamiere_1.id_lamiera INNER JOIN
                                                            (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                                               FROM         dbo.view_cabine AS view_cabine_1
                                                               WHERE     (lotto = '$lotto') AND (numero_cabina IN ($numeri_cabina_in))
                                                               UNION
                                                               SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                                               FROM         dbo.view_corridoi AS view_corridoi_1
                                                               WHERE     (lotto = '$lotto') AND (numero_cabina IN ($numeri_cabina_in))) AS t_1 ON 
                                                        kit_1.codice_kit COLLATE SQL_Latin1_General_CP1_CI_AS = t_1.kit INNER JOIN
                                                        mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi ON kit_1.id_kit = mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.id_kit AND 
                                                        t_1.posizione COLLATE Latin1_General_CI_AS = mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.pos INNER JOIN
                                                        mi_db_tecnico.dbo.sottoinsiemi_corridoi ON 
                                                        mi_db_tecnico.dbo.kit_sottoinsiemi_corridoi.id_sottoinsieme_corridoio = mi_db_tecnico.dbo.sottoinsiemi_corridoi.id_sottoinsieme_corridoio AND 
                                                        t_1.disegno_cabina = mi_db_tecnico.dbo.sottoinsiemi_corridoi.codice_sottoinsieme_corridoio COLLATE SQL_Latin1_General_CP1_CI_AS LEFT OUTER JOIN
                                                        dbo.pannelli_prelievo AS pannelli_prelievo_1 ON t_1.lotto = pannelli_prelievo_1.lotto AND t_1.disegno_cabina = pannelli_prelievo_1.disegno_cabina AND 
                                                        t_1.kit = pannelli_prelievo_1.kit AND t_1.posizione = pannelli_prelievo_1.posizione AND 
                                                        pannelli_1.codice_pannello COLLATE SQL_Latin1_General_CP1_CI_AS = pannelli_prelievo_1.codice_pannello LEFT OUTER JOIN
                                                            (SELECT   COUNT(*) AS n_fori, id_lamiera
                                                               FROM         mi_db_tecnico.dbo.lavorazioni_lamiere AS lavorazioni_lamiere_2
                                                               GROUP BY id_lamiera) AS lavorazioni_lamiere_1_1 ON lamiere_1.id_lamiera = lavorazioni_lamiere_1_1.id_lamiera) AS t_u
    GROUP BY codice_kit, codice_pannello, posx, halt, lung1, lung2, ang, n_fori, pos_kit
    ORDER BY posx DESC";
            
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannelloObj["codice_kit"]=$row2['codice_kit'];
            $pannelloObj["pos_kit"]=$row2['pos_kit'];
            $pannelloObj["codice_pannello"]=$row2['codice_pannello'];
            $pannelloObj["posx"]=$row2['posx'];
            $pannelloObj["halt"]=$row2['halt'];
            $pannelloObj["lung1"]=$row2['lung1'];
            $pannelloObj["lung2"]=$row2['lung2'];
            $pannelloObj["ang"]=$row2['ang'];
            $pannelloObj["n_fori"]=$row2['n_fori'];
            $numeri_cabina_pannello = [];
            $numeri_cabina_pannello=explode(",",$row2['numeri_cabina']);
            if(count($numeri_cabina_pannello) == 1 && $numeri_cabina_pannello[0] == "")
                $pannelloObj["numeri_cabina"] = [];
            else
                $pannelloObj["numeri_cabina"] = $numeri_cabina_pannello;
            //$pannelloObj["numeri_cabinaString"]=json_encode($row2['numeri_cabina']);
            //$pannelloObj["prelevato"]=filter_var($row2['prelevato'], FILTER_VALIDATE_BOOLEAN);

            array_push($pannelli,$pannelloObj);
        }
    }
    else
        die("error".$query2);

    foreach ($kit as $kitObj)
    {
        $pannelli_lcl = [];
        foreach ($pannelli as $pannelloObj)
        {
            if($pannelloObj["codice_kit"] == $kitObj["kit"] && $pannelloObj["pos_kit"] == $kitObj["posizione"])
                array_push($pannelli_lcl,$pannelloObj);
        }
        $kitObj_cln = $kitObj;
        $kitObj_cln["pannelli"] = $pannelli_lcl;

        array_push($kit_cln,$kitObj_cln);
    }

    echo json_encode($kit_cln);

?>