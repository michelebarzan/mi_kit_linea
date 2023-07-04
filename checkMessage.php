<?php

    include "connessione.php";

    $commessa = substr($_REQUEST["commessa"], 2);
    $lotto = $_REQUEST["lotto"];
    $numero_cabina = $_REQUEST["numero_cabina"];
    $disegno_cabina = $_REQUEST["disegno_cabina"];
    $kit = $_REQUEST["kit"];
    $stazione = $_REQUEST["stazione"];

    $messages=[];

    $query2="SELECT messaggio
            FROM dbo.messaggistica
            WHERE (commessa = '*' OR commessa LIKE '$commessa') AND (lotto = '*' OR
                lotto LIKE '$lotto') AND (numero_cabina = '*' OR
                numero_cabina LIKE '$numero_cabina') AND (disegno_cabina = '*' OR
                disegno_cabina LIKE '$disegno_cabina') AND (kit = '*' OR
                kit LIKE '$kit') AND (stazione = '$stazione')";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            array_push($messages,utf8_encode($row2['messaggio']));
        }
    }
    else
        die("error");

    echo json_encode($messages);

?>