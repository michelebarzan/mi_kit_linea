<?php

    include "connessione.php";

    $kit = $_REQUEST["kit"];
    $posizioni = $_REQUEST["posizioni"];
    $lotto = $_REQUEST["lotto"];
    $disegno_cabina = $_REQUEST["disegno_cabina"];

    $cabine=[];

    foreach ($posizioni as $posizioneObj)
    {
        $posizione=$posizioneObj["posizione"];

        $query3="SELECT numero_cabina
                FROM dbo.view_corridoi
                WHERE (lotto = '$lotto') AND (kit = '$kit') AND (posizione = '$posizione') AND disegno_cabina = '$disegno_cabina'
                UNION
                SELECT numero_cabina
                FROM dbo.view_cabine
                WHERE (lotto = '$lotto') AND (kit = '$kit') AND (posizione = '$posizione') AND disegno_cabina = '$disegno_cabina'";
        $result3=sqlsrv_query($conn,$query3);
        if($result3==TRUE)
        {
            while($row3=sqlsrv_fetch_array($result3))
            {
                $cabina['numero_cabina'] = $row3['numero_cabina'];
                $cabina['posizione'] = $posizione;

                array_push($cabine,$cabina);
            }
        }
        else
            die("error".$query3);
    }

    echo json_encode($cabine);
?>