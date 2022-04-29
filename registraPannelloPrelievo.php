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

    $query3="SELECT COUNT(*) AS n FROM dbo.pannelli_prelievo WHERE lotto='$lotto' AND disegno_cabina='$disegno_cabina' AND kit='$kit' AND posizione='$posizione' AND numero_cabina='".$cabine[0]."'";	
    $result3=sqlsrv_query($conn,$query3);
    while($row3=sqlsrv_fetch_array($result3))
    {
        echo $row3["n"];
    }

?>