<?php

    include "connessione.php";

    set_time_limit(120);

    $CODCAR=$_REQUEST["CODCAR"];
    $lotto=$_REQUEST["lotto"];

    $componenti=[];

    $query2="SELECT dbo.checklist.id_checklist, dbo.checklist.lotto, dbo.checklist.codice_carrello, dbo.checklist.numero_cabina, dbo.checklist.codice_cabina, dbo.checklist.codice_componente, dbo.checklist.posizione, dbo.checklist.descrizione, dbo.checklist.checked, dbo.checklist.utente, dbo.checklist.dataOra, dbo.checklist.commessa, dbo.checklist.qnt, ISNULL(mi_db_tecnico.dbo.kit.fori,'') AS fori, ISNULL(mi_db_tecnico.dbo.kit.lung,'') AS lung
            FROM dbo.checklist LEFT OUTER JOIN mi_db_tecnico.dbo.kit ON dbo.checklist.codice_componente COLLATE Latin1_General_CI_AS = mi_db_tecnico.dbo.kit.codice_kit
            WHERE (dbo.checklist.lotto = '$lotto') AND (dbo.checklist.codice_carrello = '$CODCAR') ORDER BY numero_cabina,posizione";
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
            $componente["fori"]=$row2['fori'];
            $componente["lung"]=$row2['lung'];
            $componente["checked"]= $row2['checked'] === 'true'? true: false;

            array_push($componenti,$componente);
        }
    }
    else
        die("error".$query2);

    echo json_encode($componenti);

?>