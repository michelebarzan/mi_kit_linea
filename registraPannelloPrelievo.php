<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    $kit=$_REQUEST['kit'];
    $posizione=$_REQUEST['posizione'];
    $codice_pannello=$_REQUEST['codice_pannello'];
    $i=$_REQUEST['i'];
    $cabine=$_REQUEST['cabine'];
    $id_utente=$_REQUEST['id_utente'];

    foreach ($cabine as $numero_cabina)
    {
        $query0="DELETE FROM dbo.pannelli_prelievo WHERE lotto='$lotto' AND disegno_cabina='$disegno_cabina' AND kit='$kit' AND posizione='$posizione' AND codice_pannello='$codice_pannello' AND i=$i AND numero_cabina='$numero_cabina'";	
        $result0=sqlsrv_query($conn,$query0);
        if($result0==TRUE)
        {
            $query2="INSERT INTO [dbo].[pannelli_prelievo]
                        ([lotto]
                        ,[disegno_cabina]
                        ,[kit]
                        ,[posizione]
                        ,[codice_pannello]
                        ,[i]
                        ,[numero_cabina]
                        ,[dataOra]
                        ,[utente])
                    SELECT
                        '$lotto'
                        ,'$disegno_cabina'
                        ,'$kit'
                        ,'$posizione'
                        ,'$codice_pannello'
                        ,$i
                        ,'$numero_cabina'
                        ,GETDATE()
                        ,$id_utente";	
            $result2=sqlsrv_query($conn,$query2);
            if (!$result2)
                die("error".$query2);
        }
        else
            die("error");
    }

    $query3="SELECT COUNT(DISTINCT codice_pannello) AS n FROM dbo.pannelli_prelievo WHERE lotto='$lotto' AND disegno_cabina='$disegno_cabina' AND kit='$kit' AND posizione='$posizione'";	
    $result3=sqlsrv_query($conn,$query3);
    if (!$result3)
        die("error".$query3);
    while($row3=sqlsrv_fetch_array($result3))
    {
        $responseObj["n"] = $row3["n"];
    }

    $numeri_cabina_pannello = [];
    $query4="SELECT numero_cabina FROM dbo.pannelli_prelievo WHERE lotto='$lotto' AND disegno_cabina='$disegno_cabina' AND kit='$kit' AND posizione='$posizione' AND codice_pannello='".$codice_pannello."' AND i=".$i."";	
    $result4=sqlsrv_query($conn,$query4);
    if (!$result4)
        die("error".$query4);
    while($row4=sqlsrv_fetch_array($result4))
    {
        array_push($numeri_cabina_pannello,$row4["numero_cabina"]);
    }

    $responseObj["numeri_cabina_pannello"] = $numeri_cabina_pannello;

    echo json_encode($responseObj);

?>