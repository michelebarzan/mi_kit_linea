<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $cabina=$_REQUEST['cabina'];
    $kit=$_REQUEST['kit'];
    $id_stazione=$_REQUEST['id_stazione'];
    $id_linea=$_REQUEST['id_linea'];
    $id_utente=$_REQUEST['id_utente'];
    $posizione=$_REQUEST['posizione'];

    $query0="DELETE FROM dbo.kit_linea WHERE lotto='$lotto' AND cabina='$cabina' AND posizione='$posizione' AND stazione=$id_stazione";	
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
                VALUES
                    ('$lotto'
                    ,'$cabina'
                    ,'$kit'
                    ,$id_stazione
                    ,$id_utente
                    ,$id_linea
                    ,GETDATE()
                    ,'$posizione')";	
        $result2=sqlsrv_query($conn,$query2);
        if (!$result2)
            die("error");
    }
    else
        die("error");

?>