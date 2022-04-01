<?php

    include "connessione.php";

    set_time_limit(3000);

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    $numero_cabina=$_REQUEST['numero_cabina'];
    $filtroAvanzamento=$_REQUEST['filtroAvanzamento'];
    $ordinamentoKit=$_REQUEST['ordinamentoKit'];
    $id_stazione=$_REQUEST['id_stazione'];
    
    $kit=[];

    /*
    SELECT        TOP (100) PERCENT commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, LEN(posizione) AS len, 
                         REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '') AS lettera, REPLACE(posizione, 
                         REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', ''), '') AS numero, LEN(REPLACE(posizione, 
                         REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(posizione, '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', ''), '')) AS len_numero
FROM            dbo.view_cabine
WHERE        (numero_cabina = '13808') AND (lotto = '6298N218')
ORDER BY len_numero, numero, lettera
    */
    
    $query1="SELECT DISTINCT 
    t.commessa, t.lotto, t.numero_cabina, t.disegno_cabina, t.kit, t.posizione, t.qnt, t.appartenenza, LEN(t.$ordinamentoKit) AS Expr1, CASE WHEN kit_linea.id_kit_linea IS NULL 
    THEN 'false' ELSE 'true' END AS registrato, CASE WHEN kit_caricamento.id_kit_linea IS NULL THEN 'false' ELSE 'true' END AS registrato_caricamento
FROM         (SELECT   id_kit_linea, lotto, cabina, kit, stazione, utente, linea, dataOra, posizione
      FROM         dbo.kit_linea AS kit_linea_1
      WHERE     (stazione = $id_stazione)) AS kit_linea RIGHT OUTER JOIN
        (SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'cabina' AS appartenenza
           FROM         dbo.view_cabine
           UNION
           SELECT   commessa, lotto, numero_cabina, disegno_cabina, kit, posizione, qnt, 'corridoio' AS appartenenza
           FROM         dbo.view_corridoi) AS t LEFT OUTER JOIN
        (SELECT   id_kit_linea, lotto, cabina, kit, stazione, utente, linea, dataOra, posizione
           FROM         dbo.kit_linea AS kit_linea_2
           WHERE     (stazione =
                                        (SELECT   id_stazione
                                           FROM         dbo.anagrafica_stazioni
                                           WHERE     (nome = 'caricamento')))) AS kit_caricamento ON t.lotto = kit_caricamento.lotto AND t.numero_cabina = kit_caricamento.cabina AND t.kit = kit_caricamento.kit AND 
    t.posizione = kit_caricamento.posizione ON kit_linea.lotto = t.lotto AND kit_linea.kit = t.kit AND kit_linea.cabina = t.numero_cabina AND kit_linea.posizione = t.posizione
                        WHERE (t.lotto = '$lotto') AND (t.commessa = '$commessa') AND (t.numero_cabina = '$numero_cabina')
                        ORDER BY LEN(t.$ordinamentoKit), t.$ordinamentoKit";
    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $kitItem["appartenenza"]=$row1["appartenenza"];
            $kitItem["kit"]=$row1['kit'];
            $kitItem["posizione"]=$row1['posizione'];

            if($filtroAvanzamento=="attivo")
            {
                if($row1['registrato'] == 'false')
                    array_push($kit,$kitItem);
            }
            else
            {
                $kitItem["registrato"]=filter_var($row1['registrato'], FILTER_VALIDATE_BOOLEAN);
                $kitItem["registrato_caricamento"]=filter_var($row1['registrato_caricamento'], FILTER_VALIDATE_BOOLEAN);

                array_push($kit,$kitItem);
            }
        }
    }
    else
        die("error".$query1);

    echo json_encode($kit);

?>