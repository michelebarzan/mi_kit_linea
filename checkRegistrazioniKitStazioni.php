<?php

    include "connessione.php";
	
    $lotto= $_POST['lotto'];
    $cabina= $_POST['cabina'];
    $kit= $_POST['kit'];

    $registrato=false;

    $q1="SELECT dbo.kit_linea.id_kit_linea, dbo.kit_linea.numero, dbo.kit_linea.lotto, dbo.kit_linea.cabina, dbo.kit_linea.kit, dbo.kit_linea.stazione, dbo.kit_linea.utente, dbo.kit_linea.linea, dbo.kit_linea.dataOra, dbo.kit_linea.posizione, 
            dbo.anagrafica_stazioni.id_stazione, dbo.anagrafica_stazioni.nome, dbo.anagrafica_stazioni.label, dbo.anagrafica_stazioni.stazione_precedente, dbo.anagrafica_stazioni.pagina
        FROM dbo.kit_linea INNER JOIN
            dbo.anagrafica_stazioni ON dbo.kit_linea.stazione = dbo.anagrafica_stazioni.id_stazione
        WHERE (dbo.kit_linea.kit = '$kit') AND (dbo.kit_linea.lotto = '$lotto') AND (dbo.kit_linea.cabina = '$cabina') AND (dbo.anagrafica_stazioni.nome = 'caricamento')";
    $r1=sqlsrv_query($conn,$q1);
    if($r1==FALSE)
    {
        die("error");
    }
    else
    {
        $rows1 = sqlsrv_has_rows( $r1 );
        if ($rows1 === true)
        {
            $registrato=true;
            /*$q2="SELECT dbo.kit_linea.id_kit_linea, dbo.kit_linea.numero, dbo.kit_linea.lotto, dbo.kit_linea.cabina, dbo.kit_linea.kit, dbo.kit_linea.stazione, dbo.kit_linea.utente, dbo.kit_linea.linea, dbo.kit_linea.dataOra, dbo.kit_linea.posizione, 
                    dbo.anagrafica_stazioni.id_stazione, dbo.anagrafica_stazioni.nome, dbo.anagrafica_stazioni.label, dbo.anagrafica_stazioni.stazione_precedente, dbo.anagrafica_stazioni.pagina
                FROM dbo.kit_linea INNER JOIN
                    dbo.anagrafica_stazioni ON dbo.kit_linea.stazione = dbo.anagrafica_stazioni.id_stazione
                WHERE (dbo.kit_linea.kit = '$kit') AND (dbo.kit_linea.lotto = '$lotto') AND (dbo.kit_linea.cabina = '$cabina') AND (dbo.anagrafica_stazioni.nome = 'traversine')";
            $r2=sqlsrv_query($conn,$q2);
            if($r2==FALSE)
            {
                die("error");
            }
            else
            {
                $rows2 = sqlsrv_has_rows( $r2 );
                if ($rows2 === true)
                {
                    $registrato=true;
                }
            }*/
        }
    }

    echo json_encode($registrato);

?>