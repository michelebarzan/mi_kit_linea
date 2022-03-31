<?php

    include "connessione.php";

    set_time_limit(3000);

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $numero_cabina=$_REQUEST['numero_cabina'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $ordinamentoKit=$_REQUEST['ordinamentoKit'];
    
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

    echo json_encode($kit);

?>