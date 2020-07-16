<?php

    $serverName = '192.168.6.196';
    $connectionInfo=array("Database"=>"mi_linea_kit", "UID"=>"sa", "PWD"=>"Serglo123");
    $conn = sqlsrv_connect($serverName,$connectionInfo);
	
    $password= $_POST['password'];

    $q2="SELECT * FROM parametri WHERE nome='password_cambia_linea_stazione'";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }
    else
    {
        while($row2=sqlsrv_fetch_array($r2))
        {
            if($row2['valore']==$password)
                echo "OK";
            else
                echo "KO";
        }
    }

?>