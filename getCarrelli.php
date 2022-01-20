<?php

    include "connessione.php";

    set_time_limit(120);

    $lotto=$_REQUEST["lotto"];
    $commessa=$_REQUEST["commessa"];

    $carrelli_cabine=[];

    $query1="SELECT DISTINCT dbo.carrelli_cabine.CODCAR, dbo.carrelli_cabine.numero_cabina
            FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM dbo.view_cabine
                                    UNION ALL
                                    SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM dbo.view_corridoi) AS derivedtbl_1 INNER JOIN
                                    dbo.carrelli_cabine ON derivedtbl_1.disegno_cabina COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.disegno_cabina AND 
                                    derivedtbl_1.numero_cabina COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.numero_cabina AND RIGHT(derivedtbl_1.commessa, 4) COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.commessa
            WHERE (derivedtbl_1.lotto = '$lotto') AND (derivedtbl_1.commessa = '$commessa')
            ORDER BY CODCAR";	
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $carrello_cabina["CODCAR"]=$row1['CODCAR'];
            $carrello_cabina["numero_cabina"]=$row1['numero_cabina'];

            array_push($carrelli_cabine,$carrello_cabina);
        }
    }
    else
        die("error");

    $carrelli=[];

    $query2="SELECT DISTINCT dbo.carrelli_cabine.CODCAR
            FROM (SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM dbo.view_cabine
                                    UNION ALL
                                    SELECT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt
                                    FROM dbo.view_corridoi) AS derivedtbl_1 INNER JOIN
                                    dbo.carrelli_cabine ON derivedtbl_1.disegno_cabina COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.disegno_cabina AND 
                                    derivedtbl_1.numero_cabina COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.numero_cabina AND RIGHT(derivedtbl_1.commessa, 4) COLLATE Latin1_General_CI_AS = dbo.carrelli_cabine.commessa
            WHERE (derivedtbl_1.lotto = '$lotto') AND (derivedtbl_1.commessa = '$commessa')
            ORDER BY CODCAR";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $carrello["CODCAR"]=$row2['CODCAR'];
            $carrello["id_CODCAR"]=str_replace("+","",$row2['CODCAR']);

            $cabine = [];
            foreach ($carrelli_cabine as $carrello_cabinaLcl)
            {
                if($carrello_cabinaLcl["CODCAR"] == $row2['CODCAR'])
                {
                    array_push($cabine,$carrello_cabinaLcl["numero_cabina"]);
                }
            }
            $carrello["cabine"]=$cabine;

            array_push($carrelli,$carrello);
        }
    }
    else
        die("error");

    echo json_encode($carrelli);

?>