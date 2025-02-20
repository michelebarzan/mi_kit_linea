<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    $commessa=$_REQUEST['commessa'];
    
    $dati_linea_t=[];

    $values = "";

    $query3="SELECT id_utente FROM utenti_stazioni WHERE username = 'linea_t'";	
    $result3=sqlsrv_query($conn,$query3);
    if (!$result3)
        die("error".$query3);
    while($row3=sqlsrv_fetch_array($result3))
    {
        $id_utente = $row3["id_utente"];
    }

    $query1 = "SELECT   TOP (100) PERCENT t.lotto, t.codice_pannello, t.codice_kit, t.numero_cabina, t.disegno_cabina, t.pos, t.prelevato, t.stato, CASE WHEN disegno_cabina LIKE '%CR%' THEN CONVERT(VARCHAR(MAX),alf.n) ELSE alf.l END AS pos_kit_l
                FROM (SELECT   TOP (100) PERCENT Lotto AS lotto, Codice AS codice_pannello, CodiceKit AS codice_kit, REPLACE(CodiceCabina, '+V' + CONVERT(varchar(MAX), Commessa) + '_', '') 
                                                    AS numero_cabina, CASE WHEN TipoCabinaCorrid LIKE '%CR%' THEN REPLACE(CodiceCabina, '+V' + CONVERT(varchar(MAX), Commessa) + '_', '')  ELSE TipoCabinaCorrid END AS disegno_cabina, PosRastrelliera AS pos, CASE WHEN StatoArea LIKE '9000%' THEN 'true' ELSE 'false' END AS prelevato, 
                                                    StatoArea AS stato, CONVERT(int, OrdinaCabinaKit) AS pos_kit_n
                           FROM         dbo.dati_linea_t AS dati_linea_t_1
                           WHERE     (Lotto = '$lotto')) AS t INNER JOIN
                             conversione_posizioni_kit AS alf ON t.pos_kit_n = alf.n
            WHERE (disegno_cabina = '$disegno_cabina')
            ORDER BY t.pos";
    $result1=sqlsrv_query($conn,$query1);
    $prefix = "";
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $row["lotto"] = utf8_encode($row1['lotto']);
            $row["codice_pannello"] = utf8_encode($row1['codice_pannello']);
            $row["codice_kit"] = utf8_encode($row1['codice_kit']);
            $row["numero_cabina"] = utf8_encode($row1['numero_cabina']);
            $row["disegno_cabina"] = utf8_encode($row1['disegno_cabina']);
            $row["pos"] = $row1['pos'];
            $row["prelevato"] = filter_var($row1['prelevato'], FILTER_VALIDATE_BOOLEAN);
            $row["stato"] = $row1['stato'];
            $row["pos_kit_l"] = utf8_encode($row1['pos_kit_l']);

            if($row["prelevato"])
            {
                $query0="DELETE FROM dbo.pannelli_prelievo WHERE lotto='" . $row['lotto'] . "' AND disegno_cabina='" . $row['disegno_cabina'] . "' AND kit='" . $row['codice_kit'] . "' AND posizione='" . $row['pos_kit_l'] . "' AND codice_pannello='" . $row['codice_pannello'] . "' AND i=" . $row["pos"] . " AND numero_cabina='" . $row["numero_cabina"] . "'";	
                $result0=sqlsrv_query($conn,$query0);
                if($result0==FALSE)
                    die("phperror".$query0);

                $values .= $prefix . "('" . $row['lotto'] . "'
                    ,'" . $row['disegno_cabina'] . "'
                    ,'" . $row['codice_kit'] . "'
                    ,'" . $row['pos_kit_l'] . "'
                    ,'" . $row['codice_pannello'] . "'
                    ," . $row["pos"] . "
                    ,'" . $row["numero_cabina"] . "'
                    ,GETDATE()
                    ," . $id_utente . ")";

                $prefix = ",";
            }

            array_push($dati_linea_t,$row);
        }
    }
    else
        die("phperror".$query2);
    
    $query2="INSERT INTO [dbo].[pannelli_prelievo]
                    ([lotto]
                    ,[disegno_cabina]
                    ,[kit]
                    ,[posizione]
                    ,[codice_pannello]
                    ,[i]
                    ,[numero_cabina]
                    ,[dataOra]
                    ,[utente]) VALUES $values";
    $result2=sqlsrv_query($conn,$query2);
    if (!$result2)
        die("phperror".$query2);

    echo json_encode($dati_linea_t);

?>