<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $filtroLinea=$_REQUEST['filtroLinea'];
    $filtroStazione=$_REQUEST['filtroStazione'];
    $id_linea=$_REQUEST['id_linea'];
    $id_stazione_precedente=$_REQUEST['id_stazione_precedente'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    
    $cabine_corridoi=[];

    if($filtroLinea=="attivo")
    {
        $query2="SELECT derivedtbl_1.disegno_cabina, derivedtbl_1.numero_cabina,derivedtbl_1.tipo
                FROM dbo.linee_cabine_corridoi INNER JOIN
                    (SELECT DISTINCT disegno_cabina, numero_cabina,tipo
                    FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt,'cabina' AS tipo
                                                FROM dbo.view_cabine
                                                UNION ALL
                                                SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt,'corridoio' AS tipo
                                                FROM dbo.view_corridoi) AS derivedtbl_2) AS derivedtbl_1 ON dbo.linee_cabine_corridoi.cabina_corridoio = derivedtbl_1.numero_cabina
                WHERE (dbo.linee_cabine_corridoi.lotto = '$lotto') AND (dbo.linee_cabine_corridoi.commessa = '$commessa') AND (dbo.linee_cabine_corridoi.linea = $id_linea)";	
        $result2=sqlsrv_query($conn,$query2);
        if($result2==TRUE)
        {
            while($row2=sqlsrv_fetch_array($result2))
            {
                //controlla il filtro stazione, se nessun kit e visualizzabile in questa stazione (non è ancora passato per le stazioni precedenti) nascondi la cabina
                if($filtroStazione=="attivo")
                {
                    $numero_cabina=$row2['numero_cabina'];
                    $query3="SELECT COUNT(*) AS n_kit
                            FROM (SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_corridoi
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')
                                UNION ALL
                                SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_cabine
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')) AS t INNER JOIN
                                dbo.kit_linea ON t.lotto = dbo.kit_linea.lotto AND t.numero_cabina = dbo.kit_linea.cabina AND t.kit = dbo.kit_linea.kit AND t.posizione = dbo.kit_linea.posizione
                            WHERE (dbo.kit_linea.stazione = $id_stazione_precedente) AND (dbo.kit_linea.linea = $id_linea)";
                    $result3=sqlsrv_query($conn,$query3);
                    if($result3==TRUE)
                    {
                        while($row3=sqlsrv_fetch_array($result3))
                        {
                            if(intval($row3["n_kit"])>0)
                                aggiungiCabinaCorridoio($cabine_corridoi,$row2['tipo'],$row2['numero_cabina'],$row2['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                        }
                    }
                }
                else
                {
                    aggiungiCabinaCorridoio($cabine_corridoi,$row2['tipo'],$row2['numero_cabina'],$row2['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                }
            }
        }
        else
            die("error");
    }
    if($filtroLinea=="inattivo")
    {
        $query1="SELECT DISTINCT numero_cabina,disegno_cabina FROM dbo.view_cabine WHERE lotto='$lotto' AND commessa='$commessa'";	
        $result1=sqlsrv_query($conn,$query1);
        if($result1==TRUE)
        {
            while($row1=sqlsrv_fetch_array($result1))
            {
                //controlla il filtro stazione, se nessun kit e visualizzabile in questa stazione (non è ancora passato per le stazioni precedenti) nascondi la cabina
                if($filtroStazione=="attivo")
                {
                    $numero_cabina=$row1['numero_cabina'];
                    $query3="SELECT COUNT(*) AS n_kit
                            FROM (SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_corridoi
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')
                                UNION ALL
                                SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_cabine
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')) AS t INNER JOIN
                                dbo.kit_linea ON t.lotto = dbo.kit_linea.lotto AND t.numero_cabina = dbo.kit_linea.cabina AND t.kit = dbo.kit_linea.kit AND t.posizione = dbo.kit_linea.posizione
                            WHERE (dbo.kit_linea.stazione = $id_stazione_precedente) AND (dbo.kit_linea.linea = $id_linea)";	
                    $result3=sqlsrv_query($conn,$query3);
                    if($result3==TRUE)
                    {
                        while($row3=sqlsrv_fetch_array($result3))
                        {
                            if(intval($row3["n_kit"])>0)
                                aggiungiCabinaCorridoio($cabine_corridoi,"cabina",$row1['numero_cabina'],$row1['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                        }
                    }
                }
                else
                {
                    aggiungiCabinaCorridoio($cabine_corridoi,"cabina",$row1['numero_cabina'],$row1['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                }
            }
        }
        else
            die("error");
    
        $query2="SELECT DISTINCT numero_cabina,disegno_cabina FROM dbo.view_corridoi WHERE lotto='$lotto' AND commessa='$commessa'";	
        $result2=sqlsrv_query($conn,$query2);
        if($result2==TRUE)
        {
            while($row2=sqlsrv_fetch_array($result2))
            {
                //controlla il filtro stazione, se nessun kit e visualizzabile in questa stazione (non è ancora passato per le stazioni precedenti) nascondi la cabina
                if($filtroStazione=="attivo")
                {
                    $numero_cabina=$row2['numero_cabina'];
                    $query3="SELECT COUNT(*) AS n_kit
                            FROM (SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_corridoi
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')
                                UNION ALL
                                SELECT DISTINCT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                FROM dbo.view_cabine
                                WHERE (lotto = '$lotto') AND (commessa = '$commessa') AND (numero_cabina = '$numero_cabina')) AS t INNER JOIN
                                dbo.kit_linea ON t.lotto = dbo.kit_linea.lotto AND t.numero_cabina = dbo.kit_linea.cabina AND t.kit = dbo.kit_linea.kit AND t.posizione = dbo.kit_linea.posizione
                            WHERE (dbo.kit_linea.stazione = $id_stazione_precedente) AND (dbo.kit_linea.linea = $id_linea)";
                    $result3=sqlsrv_query($conn,$query3);
                    if($result3==TRUE)
                    {
                        while($row3=sqlsrv_fetch_array($result3))
                        {
                            if(intval($row3["n_kit"])>0)
                                aggiungiCabinaCorridoio($cabine_corridoi,"corridoio",$row2['numero_cabina'],$row2['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                        }
                    }
                }
                else
                {
                    aggiungiCabinaCorridoio($cabine_corridoi,"corridoio",$row2['numero_cabina'],$row2['disegno_cabina'],$filtroAvanzamento,$conn,$lotto);
                }
            }
        }
        else
            die("error");
    }    

    echo json_encode($cabine_corridoi);

    function aggiungiCabinaCorridoio(&$cabine_corridoi,$tipo,$numero_cabina,$disegno_cabina,$filtroAvanzamento,$conn,$lotto)
    {
        if($filtroAvanzamento=="attivo")
        {
            $query3="SELECT * FROM cabine_chiuse WHERE cabina='$numero_cabina' AND lotto='$lotto'";
            $result3=sqlsrv_query($conn,$query3);
            if($result3==TRUE)
            {
                $rows = sqlsrv_has_rows( $result3 );
                if ($rows !== true)
                {
                    $cabina_corridoio["tipo"]=$tipo;
                    $cabina_corridoio["numero_cabina"]=$numero_cabina;
                    $cabina_corridoio["disegno_cabina"]=$disegno_cabina;
        
                    array_push($cabine_corridoi,$cabina_corridoio);   
                }
            }
        }
        else
        {
            $cabina_corridoio["tipo"]=$tipo;
            $cabina_corridoio["numero_cabina"]=$numero_cabina;
            $cabina_corridoio["disegno_cabina"]=$disegno_cabina;

            array_push($cabine_corridoi,$cabina_corridoio);
        }
    }

?>