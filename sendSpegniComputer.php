<?php

    //Breve guida per abilitare i privilgi di spegnimento remoto sul client
    //https://www.youtube.com/watch?v=LyDBrKc1s4A&ab_channel=SSLDHL

    include "connessione.php";

    $ip = $_SERVER['REMOTE_ADDR'];
    $username = "";
    $password = "";

    $q = "SELECT TOP(1) * FROM [mi_produzione].[dbo].[mappa_rete] WHERE ip = '$ip'";
    $r = sqlsrv_query($conn, $q);
    if($r === false)
        die("error".$q);
    else
    {
        while($row=sqlsrv_fetch_array($r,SQLSRV_FETCH_ASSOC))
        {
            $username = $row["username"];
            $password = $row["password"];
        }
    }

    if($username != "" && $password != "" && $username != null && $password != null && isset($username) && isset($password))
    {
        $cmd1 = "net use \\\\$ip\IPC$ /delete";
        $cmd2 = 'net use \\\\'.$ip.' '.$password.' /user:"'.$username.'"';
        $cmd3 = "shutdown /s /f /t 0 /m \\\\$ip";
		
		/*echo $cmd1."\n\n";
		echo $cmd2."\n\n";
		echo $cmd3."\n\n";*/
        
        exec($cmd1);
        exec($cmd2);
        exec($cmd3);
    }
    else
        die("error".$q);

?>