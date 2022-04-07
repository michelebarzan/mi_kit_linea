<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $cabine=$_REQUEST['cabine'];
    $kit=$_REQUEST['kit'];
    $id_stazione=$_REQUEST['id_stazione'];
    if(isset($_REQUEST['id_linea']))
        $id_linea=$_REQUEST['id_linea'];
    else
        $id_linea=0;
    $id_utente=$_REQUEST['id_utente'];
    $posizione=$_REQUEST['posizione'];

    foreach ($cabine as $cabina)
    {
        $query0="DELETE FROM dbo.kit_linea WHERE lotto='$lotto' AND cabina='".$cabina['numero_cabina']."' AND posizione='$posizione' AND stazione=$id_stazione";	
        $result0=sqlsrv_query($conn,$query0);
        if($result0==TRUE)
        {
            $query2="INSERT INTO [dbo].[kit_linea]
                        ([lotto]
                        ,[cabina]
                        ,[kit]
                        ,[stazione]
                        ,[utente]
                        ,[linea]
                        ,[dataOra]
                        ,[posizione])
                    SELECT
                        '$lotto'
                        ,'".$cabina['numero_cabina']."'
                        ,'$kit'
                        ,$id_stazione
                        ,$id_utente
                        ,CASE WHEN $id_linea=0 THEN NULL ELSE $id_linea END
                        ,GETDATE()
                        ,'$posizione'";	
            $result2=sqlsrv_query($conn,$query2);
            if (!$result2)
                die("error".$query2);
        }
        else
            die("error");
    }

?>