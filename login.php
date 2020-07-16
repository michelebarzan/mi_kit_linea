<?php

	include "connessione.php";
	
    $username= $_REQUEST ['username'];
    $turno= $_REQUEST ['turno'];
    $stazione= $_REQUEST ['stazione'];
    $linea= $_REQUEST ['linea'];

    $error=true;

    $q2="SELECT * FROM utenti_stazioni";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }
    else
    {
        while($row2=sqlsrv_fetch_array($r2))
        {
            if($row2['username']==$username)
			{
                session_start();
                $_SESSION['username']=$username;
                $_SESSION['id_utente']=$row2['id_utente'];
                $_SESSION['turno']=$turno;
                $_SESSION['stazione']=$stazione;
                $_SESSION['linea']=$linea;
                
                echo "ok";
                $error=false;
                break;
			}
        }
        if($error)
        {
            die("error");
        }
    }

?>