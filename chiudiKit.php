<?php

    include "connessione.php";
    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $cabina=$_REQUEST['cabina'];
    $kit=$_REQUEST['kit'];
    $posizione=$_REQUEST['posizione'];
    $id_utente=$_REQUEST['id_utente'];
    $stazione=$_REQUEST['stazione'];
    $linea=$_REQUEST['linea'];

    $query10="DELETE FROM dbo.kit_linea WHERE lotto='$lotto' AND cabina='$cabina' AND posizione='$posizione' AND stazione=$stazione";	
    $result10=sqlsrv_query($conn,$query10);
    if($result10==FALSE)
        die("error");

    $query11="SELECT COUNT(*) AS numero FROM dbo.kit_linea WHERE linea=$linea";	
    $result11=sqlsrv_query($conn,$query11);
    if($result11==TRUE)
    {
        while($row11=sqlsrv_fetch_array($result11))
        {
            $numeroMontaggio=$row11['numero']+1;
        }
    }
    else
        die("error");

    $query12="INSERT INTO [dbo].[kit_linea]
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
                ($numeroMontaggio
                ,'$lotto'
                ,'$cabina'
                ,'$kit'
                ,$stazione
                ,$id_utente
                ,$linea
                ,GETDATE()
                ,'$posizione')";	
    $result12=sqlsrv_query($conn,$query12);
    if($result12==FALSE)
        die("error");

    //controlla se ce la registrazione per la staione caricamento e in caso aggingila
    $q6="SELECT dbo.kit_linea.id_kit_linea, dbo.kit_linea.numero, dbo.kit_linea.lotto, dbo.kit_linea.cabina, dbo.kit_linea.kit, dbo.kit_linea.stazione, dbo.kit_linea.utente, dbo.kit_linea.linea, dbo.kit_linea.dataOra, dbo.kit_linea.posizione, 
            dbo.anagrafica_stazioni.id_stazione, dbo.anagrafica_stazioni.nome, dbo.anagrafica_stazioni.label, dbo.anagrafica_stazioni.stazione_precedente, dbo.anagrafica_stazioni.pagina
        FROM dbo.kit_linea INNER JOIN
            dbo.anagrafica_stazioni ON dbo.kit_linea.stazione = dbo.anagrafica_stazioni.id_stazione
        WHERE (dbo.kit_linea.kit = '$kit') AND (dbo.kit_linea.lotto = '$lotto') AND (dbo.kit_linea.cabina = '$cabina') AND (dbo.anagrafica_stazioni.nome = 'caricamento')";
    $r6=sqlsrv_query($conn,$q6);
    if($r6==FALSE)
    {
        die("error");
    }
    else
    {
        $rows6 = sqlsrv_has_rows( $r6 );
        if ($rows6 === false)
        {
            $query9="INSERT INTO [dbo].[kit_linea]
                        ([numero]
                        ,[lotto]
                        ,[cabina]
                        ,[kit]
                        ,[stazione]
                        ,[utente]
                        ,[linea]
                        ,[dataOra]
                        ,[posizione])
                    SELECT
                        (SELECT COUNT(*) AS numero FROM dbo.kit_linea WHERE linea=$linea)
                        ,'$lotto'
                        ,'$cabina'
                        ,'$kit'
                        ,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'caricamento')
                        ,$id_utente
                        ,$linea
                        ,GETDATE()
                        ,'$posizione'";	
            $result9=sqlsrv_query($conn,$query9);
            if($result9==FALSE)
                die("error");
        }
    }

    //controlla se ce la registrazione per la staione traversine e in caso aggingila
    $q7="SELECT dbo.kit_linea.id_kit_linea, dbo.kit_linea.numero, dbo.kit_linea.lotto, dbo.kit_linea.cabina, dbo.kit_linea.kit, dbo.kit_linea.stazione, dbo.kit_linea.utente, dbo.kit_linea.linea, dbo.kit_linea.dataOra, dbo.kit_linea.posizione, 
                    dbo.anagrafica_stazioni.id_stazione, dbo.anagrafica_stazioni.nome, dbo.anagrafica_stazioni.label, dbo.anagrafica_stazioni.stazione_precedente, dbo.anagrafica_stazioni.pagina
                FROM dbo.kit_linea INNER JOIN
                    dbo.anagrafica_stazioni ON dbo.kit_linea.stazione = dbo.anagrafica_stazioni.id_stazione
                WHERE (dbo.kit_linea.kit = '$kit') AND (dbo.kit_linea.lotto = '$lotto') AND (dbo.kit_linea.cabina = '$cabina') AND (dbo.anagrafica_stazioni.nome = 'traversine')";
    $r7=sqlsrv_query($conn,$q7);
    if($r7==FALSE)
    {
        die("error");
    }
    else
    {
        $rows7 = sqlsrv_has_rows( $r7 );
        if ($rows7 === false)
        {
            $query8="INSERT INTO [dbo].[kit_linea]
                        ([numero]
                        ,[lotto]
                        ,[cabina]
                        ,[kit]
                        ,[stazione]
                        ,[utente]
                        ,[linea]
                        ,[dataOra]
                        ,[posizione])
                    SELECT
                        (SELECT COUNT(*) AS numero FROM dbo.kit_linea WHERE linea=$linea)
                        ,'$lotto'
                        ,'$cabina'
                        ,'$kit'
                        ,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'traversine')
                        ,$id_utente
                        ,$linea
                        ,GETDATE()
                        ,'$posizione'";	
            $result8=sqlsrv_query($conn,$query8);
            if($result8==FALSE)
                die("error");
        }
    }

    //inserisci tutte le righe di kit_linea di questo kit in storico kit
    $query2="INSERT INTO [dbo].[storico_kit]
                    ([lotto]
                    ,[cabina]
                    ,[kit]
                    ,[stazione]
                    ,[utente]
                    ,[linea]
                    ,[dataOra]
                    ,[posizione])
            SELECT lotto, cabina, kit, stazione, utente, linea, dataOra, posizione
            FROM dbo.kit_linea
            WHERE (lotto = '$lotto') AND (cabina = '$cabina') AND (kit = '$kit') AND (posizione = '$posizione')";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error");

    //elimina tutte le righe di questo kit da kit linea
    $query1="DELETE FROM kit_linea WHERE lotto='$lotto' AND cabina='$cabina' AND kit='$kit' AND posizione='$posizione'";	
    $result1=sqlsrv_query($conn,$query1);
    if($result1==FALSE)
        die("error");

    //controlla se la cabina è chiusa
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

?>