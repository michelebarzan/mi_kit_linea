<?php

    include "connessione.php";

    set_time_limit(120);

    $CODCAR=$_REQUEST["CODCAR"];
    $lotto=$_REQUEST["lotto"];

    $componenti=[];

    $query2="SELECT * FROM checklist WHERE lotto = '$lotto' AND codice_carrello = '$CODCAR' ORDER BY numero_cabina";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $componente["codice_componente"]=$row2['codice_componente'];
            $componente["descrizione"]=utf8_encode($row2['descrizione']);
            $componente["posizione"]=$row2['posizione'];
            $componente["numero_cabina"]=$row2['numero_cabina'];
            $componente["qnt"]=$row2['qnt'];
            $componente["id_checklist"]=$row2['id_checklist'];
            $componente["checked"]= $row2['checked'] === 'true'? true: false;

            array_push($componenti,$componente);
        }
    }
    else
        die("error".$query2);

    echo json_encode($componenti);

?>