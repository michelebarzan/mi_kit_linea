<?php

    include "connessione.php";


    $lotto=$_REQUEST['lotto'];
    $cabina=$_REQUEST['cabina'];
    $kit=$_REQUEST['kit'];
    $id_stazione=$_REQUEST['id_stazione'];
    $id_linea=$_REQUEST['id_linea'];
    $id_utente=$_REQUEST['id_utente'];
    $posizione=$_REQUEST['posizione'];

    $query1="SELECT COUNT(*) AS numero FROM dbo.kit_linea WHERE linea=$id_linea";	
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $numero=$row1['numero']+1;
        }
    }
    else
        die("error");

    $query2="INSERT INTO [dbo].[kit_linea]
                ([numero]
                ,[lotto]
                ,[cabina]
                ,[kit]
                ,[stazione]
                ,[utente]
                ,[linea]
                ,[dataOra]
                ,[posizione])
            VALUES
                ($numero
                ,'$lotto'
                ,'$cabina'
                ,'$kit'
                ,$id_stazione
                ,$id_utente
                ,$id_linea
                ,GETDATE()
                ,'$posizione')";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        echo "ok";
    }
    else
        die("error");

?>