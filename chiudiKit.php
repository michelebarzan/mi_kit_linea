<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $cabina=$_REQUEST['cabina'];
    $kit=$_REQUEST['kit'];
    $posizione=$_REQUEST['posizione'];

    $query1="DELETE FROM kit_linea WHERE lotto='$lotto' AND cabina='$cabina' AND kit='$kit' AND posizione='$posizione'";	
    $result1=sqlsrv_query($conn,$query1);
    if($result1==FALSE)
        die("error");

    $query2="INSERT INTO [dbo].[kit_chiusi]
                ([lotto]
                ,[cabina]
                ,[kit]
                ,[posizione])
            VALUES
                ('$lotto'
                ,'$cabina'
                ,'$kit'
                ,'$posizione')";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        $query3="SELECT COUNT(*) AS n_kit_chiusi
                FROM dbo.kit_chiusi
                WHERE (lotto = '$lotto') AND (cabina = '$cabina')";	
        $result3=sqlsrv_query($conn,$query3);
        if($result3==TRUE)
        {
            while($row3=sqlsrv_fetch_array($result3))
            {
                $n_kit_chiusi=intval($row3["n_kit_chiusi"]);
            }
        }
        else
            die("error");

        $query5="SELECT COUNT(*) AS n_kit
                FROM (SELECT DISTINCT * FROM view_cabine UNION ALL SELECT DISTINCT * FROM view_corridoi) AS t
                WHERE (lotto = '$lotto') AND (numero_cabina = '$cabina')";	
        $result5=sqlsrv_query($conn,$query5);
        if($result5==TRUE)
        {
            while($row5=sqlsrv_fetch_array($result5))
            {
                $n_kit=intval($row5["n_kit"]);
            }
        }
        else
            die("error");

        if($n_kit==$n_kit_chiusi)
        {
            $query4="INSERT INTO [dbo].[cabine_chiuse]
                        ([lotto]
                        ,[cabina])
                    VALUES 
                        ('$lotto'
                        ,'$cabina')";	
            $result4=sqlsrv_query($conn,$query4);
            if($result4==FALSE)
                die("error");
        }
    }
    else
        die("error");

?>