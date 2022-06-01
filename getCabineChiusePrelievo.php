<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $commessa=$_REQUEST['commessa'];
    
    $cabine=[];

    $query1="SELECT [lotto],[disegno_cabina] FROM [mi_linea_kit].[dbo].[cabine_chiuse_prelievo]";

    $result1=sqlsrv_query($conn,$query1);
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $cabina["lotto"]=utf8_encode($row1['lotto']);
            $cabina["disegno_cabina"]=utf8_encode($row1['disegno_cabina']);

            array_push($cabine,$cabina);
        }
    }
    else
        die("error".$query1);

    echo json_encode($cabine);

?>