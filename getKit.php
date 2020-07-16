<?php

    include "connessione.php";

    set_time_limit(3000);

    $id_linea=$_REQUEST['id_linea'];
    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $numero_cabina=$_REQUEST['numero_cabina'];
    $filtroStazione=$_REQUEST['filtroStazione'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $id_stazione_precedente=$_REQUEST['id_stazione_precedente'];
    $id_stazione=$_REQUEST['id_stazione'];
    $ordinamentoKit=$_REQUEST['ordinamentoKit'];
    $mostraMisureTraversine=$_REQUEST['mostraMisureTraversine'];
    
    $kit=[];
    $kit_in="";

    if($filtroAvanzamento=="attivo")
    {
        $view_cabine="view_cabine_aperte";
        $view_corridoi="view_corridoi_aperti";
    }
    else
    {
        $view_cabine="view_cabine";
        $view_corridoi="view_corridoi";
    }

    if($filtroStazione=="attivo")
    {
        $query2="SELECT t.commessa, t.lotto, t.numero_cabina, t.disegno_cabina, t.kit, t.posizione, t.qnt, dbo.kit_linea.stazione, dbo.kit_linea.linea,t.tipo
                FROM (SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt,'corridoio' AS tipo
                    FROM dbo.[".$view_corridoi."]
                    WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')
                    UNION ALL
                    SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt,'cabina' AS tipo
                    FROM dbo.[".$view_cabine."]
                    WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')) AS t INNER JOIN
                    dbo.kit_linea ON t.lotto = dbo.kit_linea.lotto AND t.numero_cabina = dbo.kit_linea.cabina AND t.kit = dbo.kit_linea.kit AND t.posizione = dbo.kit_linea.posizione
                WHERE (dbo.kit_linea.stazione = $id_stazione_precedente) AND (dbo.kit_linea.linea = $id_linea) ORDER BY $ordinamentoKit";	
        $result2=sqlsrv_query($conn,$query2);
        if($result2==TRUE)
        {
            while($row2=sqlsrv_fetch_array($result2))
            {
                aggiungiKit($kit,$row2['tipo'],$row2['kit'],$row2['posizione'],intval($row2['qnt']),$filtroAvanzamento,$lotto,$numero_cabina,$id_stazione,$conn,$kit_in);
            }
        }
        else
            die("error".$query2);
    }
    else
    {
        $query1="SELECT DISTINCT * FROM dbo.[".$view_cabine."] WHERE lotto='$lotto' AND commessa='$commessa' AND numero_cabina='$numero_cabina' ORDER BY $ordinamentoKit";
        $result1=sqlsrv_query($conn,$query1);
        if($result1==TRUE)
        {
            while($row1=sqlsrv_fetch_array($result1))
            {
                aggiungiKit($kit,"cabina",$row1['kit'],$row1['posizione'],intval($row1['qnt']),$filtroAvanzamento,$lotto,$numero_cabina,$id_stazione,$conn,$kit_in);
            }
        }
        else
            die("error".$query1);

        $query2="SELECT DISTINCT * FROM dbo.[".$view_corridoi."] WHERE lotto='$lotto' AND commessa='$commessa' AND numero_cabina='$numero_cabina' ORDER BY $ordinamentoKit";
        $result2=sqlsrv_query($conn,$query2);
        if($result2==TRUE)
        {
            while($row2=sqlsrv_fetch_array($result2))
            {
                aggiungiKit($kit,"corridoio",$row2['kit'],$row2['posizione'],intval($row2['qnt']),$filtroAvanzamento,$lotto,$numero_cabina,$id_stazione,$conn,$kit_in);
            }
        }
        else
            die("error".$query2);
    }

    if($mostraMisureTraversine=="true")
    {
        $kit_in=substr($kit_in, 0, -1);

        $query4="SELECT codkit,traversine.CODMAT, traversine.LUNG, traversine.posizione_traversina
                FROM db_tecnico.dbo.kitpan INNER JOIN
                    (SELECT CODTRI, DESCRIZIONE, CODMAT, LUNG, UM, PDX, PSX, 'inferiore' AS posizione_traversina
                    FROM db_tecnico.dbo.travinf
                    UNION ALL
                    SELECT CODTRI, DESCRIZIONE, CODMAT, LUNG, UM, PDX, PSX, 'superiore' AS posizione_traversina
                    FROM db_tecnico.dbo.travsup) AS traversine ON db_tecnico.dbo.kitpan.CODELE = traversine.CODTRI where codkit in ($kit_in) ORDER BY codkit OPTION ( QUERYTRACEON 9481 )";
        $result4=sqlsrv_query($conn,$query4);
        if($result4==TRUE)
        {
            $traversine=[];

            while($row4=sqlsrv_fetch_array($result4))
            {
                $traversina["CODMAT"]=$row4["CODMAT"];
                $traversina["LUNG"]=number_format($row4['LUNG'],2,",",".");
                $traversina["posizione_traversina"]=$row4["posizione_traversina"];
                $traversina["codkit"]=$row4["codkit"];

                array_push($traversine,$traversina);
            }
        }
        else
            die("error".$query4);

        $i=0;
        foreach($kit as $kitItem)
        {
            $traversinekit=[];
            foreach($traversine as $traversina)
            {
                if($traversina["codkit"]==$kitItem["kit"])
                {
                    array_push($traversinekit,$traversina);
                }
            }
            $kit[$i]["traversine"]=$traversinekit;
            $i++;
        }
    }

    echo json_encode($kit);

    function aggiungiKit(&$kit,$appartenenza,$codiceKit,$posizione,$qnt,$filtroAvanzamento,$lotto,$numero_cabina,$id_stazione,$conn,&$kit_in)
    {
        if($filtroAvanzamento=="attivo")
        {
            $query2="SELECT COUNT(*) AS n_kit
                    FROM dbo.kit_linea
                    WHERE (lotto = '$lotto') AND (cabina = '$numero_cabina') AND (posizione = '$posizione') AND (kit = '$codiceKit') AND (stazione = $id_stazione)";	
            $result2=sqlsrv_query($conn,$query2);
            if($result2==TRUE)
            {
                while($row2=sqlsrv_fetch_array($result2))
                {
                    if(intval($row2["n_kit"])==0)
                    {
                        $kitItem["appartenenza"]=$appartenenza;
                        $kitItem["kit"]=$codiceKit;
                        $kitItem["posizione"]=$posizione;
                        $kitItem["qnt"]=$qnt;

                        $kit_in.="'$codiceKit',";

                        array_push($kit,$kitItem);
                    }
                }
            }
            else
                die("error");
        }
        else
        {
            $query2="SELECT COUNT(*) AS n_kit
                    FROM dbo.kit_linea
                    WHERE (lotto = '$lotto') AND (cabina = '$numero_cabina') AND (posizione = '$posizione') AND (kit = '$codiceKit') AND (stazione = $id_stazione)";	
            $result2=sqlsrv_query($conn,$query2);
            if($result2==TRUE)
            {
                while($row2=sqlsrv_fetch_array($result2))
                {
                    if(intval($row2["n_kit"])==0)
                    {
                        $kitItem["registrato"]=false;
                    }
                    else
                    {
                        $kitItem["registrato"]=true;
                    }
                }
                $kitItem["appartenenza"]=$appartenenza;
                $kitItem["kit"]=$codiceKit;
                $kitItem["posizione"]=$posizione;
                $kitItem["qnt"]=$qnt;

                $kit_in.="'$codiceKit',";
                
                array_push($kit,$kitItem);
            }
            else
                die("error");
        }
    }

?>