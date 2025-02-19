<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    $commessa=$_REQUEST['commessa'];
    
    $dati_linea_t=[];

    $query2 = "SELECT TOP (100) PERCENT lotto, codice_pannello, codice_kit, numero_cabina, disegno_cabina, pos, prelevato, stato
                FROM (SELECT TOP (100) PERCENT Lotto AS lotto, Codice AS codice_pannello, CodiceKit AS codice_kit, REPLACE(CodiceCabina, '+V' + CONVERT(varchar(MAX), Commessa) + '_', '') 
                                                                    AS numero_cabina, TipoCabinaCorrid AS disegno_cabina, PosRastrelliera AS pos, CASE WHEN StatoArea LIKE '9000%' THEN 'true' ELSE 'false' END AS prelevato, 
                                                                    StatoArea AS stato
                                        FROM dbo.dati_linea_t AS dati_linea_t_1
                                        WHERE (Lotto = '$lotto') AND (TipoCabinaCorrid = '$disegno_cabina')) AS t
                ORDER BY pos";
            
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $row["lotto"] = utf8_encode($row2['lotto']);
            $row["codice_pannello"] = utf8_encode($row2['codice_pannello']);
            $row["codice_kit"] = utf8_encode($row2['codice_kit']);
            $row["numero_cabina"] = utf8_encode($row2['numero_cabina']);
            $row["disegno_cabina"] = utf8_encode($row2['disegno_cabina']);
            $row["pos"] = $row2['pos'];
            $row["prelevato"] = filter_var($row2['prelevato'], FILTER_VALIDATE_BOOLEAN);
            $row["stato"] = $row2['stato'];

            array_push($dati_linea_t,$row);
        }
    }
    else
        die("phperror".$query2);

    echo json_encode($dati_linea_t);

?>