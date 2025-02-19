<?php

    include "connessione.php";

    $lotto=$_REQUEST['lotto'];
    $disegno_cabina=$_REQUEST['disegno_cabina'];
    $commessa=$_REQUEST['commessa'];
    
    $dati_linea_t=[];

    $values = "";

    $query3="SELECT id_utente FROM utenti_stazioni WHERE username = 'linea_t'";	
    $result3=sqlsrv_query($conn,$query3);
    if (!$result3)
        die("error".$query3);
    while($row3=sqlsrv_fetch_array($result3))
    {
        $id_utente = $row3["id_utente"];
    }

    $query1 = "SELECT   TOP (100) PERCENT t.lotto, t.codice_pannello, t.codice_kit, t.numero_cabina, t.disegno_cabina, t.pos, t.prelevato, t.stato, alf.l AS pos_kit_l
FROM         (SELECT   TOP (100) PERCENT Lotto AS lotto, Codice AS codice_pannello, CodiceKit AS codice_kit, REPLACE(CodiceCabina, '+V' + CONVERT(varchar(MAX), Commessa) + '_', '') 
                                                    AS numero_cabina, TipoCabinaCorrid AS disegno_cabina, PosRastrelliera AS pos, CASE WHEN StatoArea LIKE '9000%' THEN 'true' ELSE 'false' END AS prelevato, 
                                                    StatoArea AS stato, CONVERT(int, OrdinaCabinaKit) AS pos_kit_n
                           FROM         dbo.dati_linea_t AS dati_linea_t_1
                           WHERE     (Lotto = '$lotto') AND (TipoCabinaCorrid = '$disegno_cabina')) AS t INNER JOIN
                             (SELECT   0 AS n, '0' AS l
                                UNION
                                SELECT   1 AS n, 'A' AS l
                                UNION
                                SELECT   2 AS n, 'B' AS l
                                UNION
                                SELECT   3 AS n, 'C' AS l
                                UNION
                                SELECT   4 AS n, 'D' AS l
                                UNION
                                SELECT   5 AS n, 'E' AS l
                                UNION
                                SELECT   6 AS n, 'F' AS l
                                UNION
                                SELECT   7 AS n, 'G' AS l
                                UNION
                                SELECT   8 AS n, 'H' AS l
                                UNION
                                SELECT   9 AS n, 'I' AS l
                                UNION
                                SELECT   10 AS n, 'L' AS l
                                UNION
                                SELECT   11 AS n, 'M' AS l
                                UNION
                                SELECT   12 AS n, 'N' AS l
                                UNION
                                SELECT   13 AS n, 'O' AS l
                                UNION
                                SELECT   14 AS n, 'P' AS l
                                UNION
                                SELECT   15 AS n, 'Q' AS l
                                UNION
                                SELECT   16 AS n, 'R' AS l
                                UNION
                                SELECT   17 AS n, 'S' AS l
                                UNION
                                SELECT   18 AS n, 'T' AS l
                                UNION
                                SELECT   19 AS n, 'U' AS l
                                UNION
                                SELECT   20 AS n, 'V' AS l
                                UNION
                                SELECT   21 AS n, 'Z' AS l
                                UNION
                                SELECT   22 AS n, 'A1' AS l
                                UNION
                                SELECT   23 AS n, 'B1' AS l
                                UNION
                                SELECT   24 AS n, 'C1' AS l
                                UNION
                                SELECT   25 AS n, 'D1' AS l
                                UNION
                                SELECT   26 AS n, 'E1' AS l
                                UNION
                                SELECT   27 AS n, 'F1' AS l
                                UNION
                                SELECT   28 AS n, 'G1' AS l
                                UNION
                                SELECT   29 AS n, 'H1' AS l
                                UNION
                                SELECT   30 AS n, 'I1' AS l
                                UNION
                                SELECT   31 AS n, 'L1' AS l
                                UNION
                                SELECT   32 AS n, 'M1' AS l
                                UNION
                                SELECT   33 AS n, 'N1' AS l
                                UNION
                                SELECT   34 AS n, 'O1' AS l
                                UNION
                                SELECT   35 AS n, 'P1' AS l
                                UNION
                                SELECT   36 AS n, 'Q1' AS l
                                UNION
                                SELECT   37 AS n, 'R1' AS l
                                UNION
                                SELECT   38 AS n, 'S1' AS l
                                UNION
                                SELECT   39 AS n, 'T1' AS l
                                UNION
                                SELECT   40 AS n, 'U1' AS l
                                UNION
                                SELECT   41 AS n, 'V1' AS l
                                UNION
                                SELECT   42 AS n, 'Z1' AS l
                                UNION
                                SELECT   43 AS n, 'A2' AS l
                                UNION
                                SELECT   44 AS n, 'B2' AS l
                                UNION
                                SELECT   45 AS n, 'C2' AS l
                                UNION
                                SELECT   46 AS n, 'D2' AS l
                                UNION
                                SELECT   47 AS n, 'E2' AS l
                                UNION
                                SELECT   48 AS n, 'F2' AS l
                                UNION
                                SELECT   49 AS n, 'G2' AS l
                                UNION
                                SELECT   50 AS n, 'H2' AS l
                                UNION
                                SELECT   51 AS n, 'I2' AS l
                                UNION
                                SELECT   52 AS n, 'L2' AS l
                                UNION
                                SELECT   53 AS n, 'M2' AS l
                                UNION
                                SELECT   54 AS n, 'N2' AS l
                                UNION
                                SELECT   55 AS n, 'O2' AS l
                                UNION
                                SELECT   56 AS n, 'P2' AS l
                                UNION
                                SELECT   57 AS n, 'Q2' AS l
                                UNION
                                SELECT   58 AS n, 'R2' AS l
                                UNION
                                SELECT   59 AS n, 'S2' AS l
                                UNION
                                SELECT   60 AS n, 'T2' AS l
                                UNION
                                SELECT   61 AS n, 'U2' AS l
                                UNION
                                SELECT   62 AS n, 'V2' AS l
                                UNION
                                SELECT   63 AS n, 'Z2' AS l
                                UNION
                                SELECT   64 AS n, 'A3' AS l
                                UNION
                                SELECT   65 AS n, 'B3' AS l
                                UNION
                                SELECT   66 AS n, 'C3' AS l
                                UNION
                                SELECT   67 AS n, 'D3' AS l
                                UNION
                                SELECT   68 AS n, 'E3' AS l
                                UNION
                                SELECT   69 AS n, 'F3' AS l
                                UNION
                                SELECT   70 AS n, 'G3' AS l
                                UNION
                                SELECT   71 AS n, 'H3' AS l
                                UNION
                                SELECT   72 AS n, 'I3' AS l
                                UNION
                                SELECT   73 AS n, 'L3' AS l
                                UNION
                                SELECT   74 AS n, 'M3' AS l
                                UNION
                                SELECT   75 AS n, 'N3' AS l
                                UNION
                                SELECT   76 AS n, 'O3' AS l
                                UNION
                                SELECT   77 AS n, 'P3' AS l
                                UNION
                                SELECT   78 AS n, 'Q3' AS l
                                UNION
                                SELECT   79 AS n, 'R3' AS l
                                UNION
                                SELECT   80 AS n, 'S3' AS l
                                UNION
                                SELECT   81 AS n, 'T3' AS l
                                UNION
                                SELECT   82 AS n, 'U3' AS l
                                UNION
                                SELECT   83 AS n, 'V3' AS l
                                UNION
                                SELECT   84 AS n, 'Z3' AS l
                                UNION
                                SELECT   85 AS n, 'A4' AS l
                                UNION
                                SELECT   86 AS n, 'B4' AS l
                                UNION
                                SELECT   87 AS n, 'C4' AS l
                                UNION
                                SELECT   88 AS n, 'D4' AS l
                                UNION
                                SELECT   89 AS n, 'E4' AS l
                                UNION
                                SELECT   90 AS n, 'F4' AS l
                                UNION
                                SELECT   91 AS n, 'G4' AS l
                                UNION
                                SELECT   92 AS n, 'H4' AS l
                                UNION
                                SELECT   93 AS n, 'I4' AS l
                                UNION
                                SELECT   94 AS n, 'L4' AS l
                                UNION
                                SELECT   95 AS n, 'M4' AS l
                                UNION
                                SELECT   96 AS n, 'N4' AS l
                                UNION
                                SELECT   97 AS n, 'O4' AS l
                                UNION
                                SELECT   98 AS n, 'P4' AS l
                                UNION
                                SELECT   99 AS n, 'Q4' AS l
                                UNION
                                SELECT   100 AS n, 'R4' AS l
                                UNION
                                SELECT   101 AS n, 'S4' AS l
                                UNION
                                SELECT   102 AS n, 'T4' AS l
                                UNION
                                SELECT   103 AS n, 'U4' AS l
                                UNION
                                SELECT   104 AS n, 'V4' AS l
                                UNION
                                SELECT   105 AS n, 'Z4' AS l
                                UNION
                                SELECT   106 AS n, 'A5' AS l
                                UNION
                                SELECT   107 AS n, 'B5' AS l
                                UNION
                                SELECT   108 AS n, 'C5' AS l
                                UNION
                                SELECT   109 AS n, 'D5' AS l
                                UNION
                                SELECT   110 AS n, 'E5' AS l
                                UNION
                                SELECT   111 AS n, 'F5' AS l
                                UNION
                                SELECT   112 AS n, 'G5' AS l
                                UNION
                                SELECT   113 AS n, 'H5' AS l
                                UNION
                                SELECT   114 AS n, 'I5' AS l
                                UNION
                                SELECT   115 AS n, 'L5' AS l
                                UNION
                                SELECT   116 AS n, 'M5' AS l
                                UNION
                                SELECT   117 AS n, 'N5' AS l
                                UNION
                                SELECT   118 AS n, 'O5' AS l
                                UNION
                                SELECT   119 AS n, 'P5' AS l
                                UNION
                                SELECT   120 AS n, 'Q5' AS l
                                UNION
                                SELECT   121 AS n, 'R5' AS l
                                UNION
                                SELECT   122 AS n, 'S5' AS l
                                UNION
                                SELECT   123 AS n, 'T5' AS l
                                UNION
                                SELECT   124 AS n, 'U5' AS l
                                UNION
                                SELECT   125 AS n, 'V5' AS l
                                UNION
                                SELECT   126 AS n, 'Z5' AS l
                                UNION
                                SELECT   127 AS n, 'A6' AS l
                                UNION
                                SELECT   128 AS n, 'B6' AS l
                                UNION
                                SELECT   129 AS n, 'C6' AS l
                                UNION
                                SELECT   130 AS n, 'D6' AS l
                                UNION
                                SELECT   131 AS n, 'E6' AS l
                                UNION
                                SELECT   132 AS n, 'F6' AS l
                                UNION
                                SELECT   133 AS n, 'G6' AS l
                                UNION
                                SELECT   134 AS n, 'H6' AS l
                                UNION
                                SELECT   135 AS n, 'I6' AS l
                                UNION
                                SELECT   136 AS n, 'L6' AS l
                                UNION
                                SELECT   137 AS n, 'M6' AS l
                                UNION
                                SELECT   138 AS n, 'N6' AS l
                                UNION
                                SELECT   139 AS n, 'O6' AS l
                                UNION
                                SELECT   140 AS n, 'P6' AS l
                                UNION
                                SELECT   141 AS n, 'Q6' AS l
                                UNION
                                SELECT   142 AS n, 'R6' AS l
                                UNION
                                SELECT   143 AS n, 'S6' AS l
                                UNION
                                SELECT   144 AS n, 'T6' AS l
                                UNION
                                SELECT   145 AS n, 'U6' AS l
                                UNION
                                SELECT   146 AS n, 'V6' AS l
                                UNION
                                SELECT   147 AS n, 'Z6' AS l
                                UNION
                                SELECT   148 AS n, 'A7' AS l
                                UNION
                                SELECT   149 AS n, 'B7' AS l
                                UNION
                                SELECT   150 AS n, 'C7' AS l
                                UNION
                                SELECT   151 AS n, 'D7' AS l
                                UNION
                                SELECT   152 AS n, 'E7' AS l
                                UNION
                                SELECT   153 AS n, 'F7' AS l
                                UNION
                                SELECT   154 AS n, 'G7' AS l
                                UNION
                                SELECT   155 AS n, 'H7' AS l
                                UNION
                                SELECT   156 AS n, 'I7' AS l
                                UNION
                                SELECT   157 AS n, 'L7' AS l
                                UNION
                                SELECT   158 AS n, 'M7' AS l
                                UNION
                                SELECT   159 AS n, 'N7' AS l
                                UNION
                                SELECT   160 AS n, 'O7' AS l
                                UNION
                                SELECT   161 AS n, 'P7' AS l
                                UNION
                                SELECT   162 AS n, 'Q7' AS l
                                UNION
                                SELECT   163 AS n, 'R7' AS l
                                UNION
                                SELECT   164 AS n, 'S7' AS l
                                UNION
                                SELECT   165 AS n, 'T7' AS l
                                UNION
                                SELECT   166 AS n, 'U7' AS l
                                UNION
                                SELECT   167 AS n, 'V7' AS l
                                UNION
                                SELECT   168 AS n, 'Z7' AS l
                                UNION
                                SELECT   169 AS n, 'A8' AS l
                                UNION
                                SELECT   170 AS n, 'B8' AS l
                                UNION
                                SELECT   171 AS n, 'C8' AS l
                                UNION
                                SELECT   172 AS n, 'D8' AS l
                                UNION
                                SELECT   173 AS n, 'E8' AS l
                                UNION
                                SELECT   174 AS n, 'F8' AS l
                                UNION
                                SELECT   175 AS n, 'G8' AS l
                                UNION
                                SELECT   176 AS n, 'H8' AS l
                                UNION
                                SELECT   177 AS n, 'I8' AS l
                                UNION
                                SELECT   178 AS n, 'L8' AS l
                                UNION
                                SELECT   179 AS n, 'M8' AS l
                                UNION
                                SELECT   180 AS n, 'N8' AS l
                                UNION
                                SELECT   181 AS n, 'O8' AS l
                                UNION
                                SELECT   182 AS n, 'P8' AS l
                                UNION
                                SELECT   183 AS n, 'Q8' AS l
                                UNION
                                SELECT   184 AS n, 'R8' AS l
                                UNION
                                SELECT   185 AS n, 'S8' AS l
                                UNION
                                SELECT   186 AS n, 'T8' AS l
                                UNION
                                SELECT   187 AS n, 'U8' AS l
                                UNION
                                SELECT   188 AS n, 'V8' AS l
                                UNION
                                SELECT   189 AS n, 'Z8' AS l
                                UNION
                                SELECT   190 AS n, 'A9' AS l
                                UNION
                                SELECT   191 AS n, 'B9' AS l
                                UNION
                                SELECT   192 AS n, 'C9' AS l
                                UNION
                                SELECT   193 AS n, 'D9' AS l
                                UNION
                                SELECT   194 AS n, 'E9' AS l
                                UNION
                                SELECT   195 AS n, 'F9' AS l
                                UNION
                                SELECT   196 AS n, 'G9' AS l
                                UNION
                                SELECT   197 AS n, 'H9' AS l
                                UNION
                                SELECT   198 AS n, 'I9' AS l
                                UNION
                                SELECT   199 AS n, 'L9' AS l
                                UNION
                                SELECT   200 AS n, 'M9' AS l
                                UNION
                                SELECT   201 AS n, 'N9' AS l
                                UNION
                                SELECT   202 AS n, 'O9' AS l
                                UNION
                                SELECT   203 AS n, 'P9' AS l
                                UNION
                                SELECT   204 AS n, 'Q9' AS l
                                UNION
                                SELECT   205 AS n, 'R9' AS l
                                UNION
                                SELECT   206 AS n, 'S9' AS l
                                UNION
                                SELECT   207 AS n, 'T9' AS l
                                UNION
                                SELECT   208 AS n, 'U9' AS l
                                UNION
                                SELECT   209 AS n, 'V9' AS l
                                UNION
                                SELECT   210 AS n, 'Z9' AS l
                                UNION
                                SELECT   211 AS n, 'A10' AS l
                                UNION
                                SELECT   212 AS n, 'B10' AS l
                                UNION
                                SELECT   213 AS n, 'C10' AS l
                                UNION
                                SELECT   214 AS n, 'D10' AS l
                                UNION
                                SELECT   215 AS n, 'E10' AS l
                                UNION
                                SELECT   216 AS n, 'F10' AS l
                                UNION
                                SELECT   217 AS n, 'G10' AS l
                                UNION
                                SELECT   218 AS n, 'H10' AS l
                                UNION
                                SELECT   219 AS n, 'I10' AS l
                                UNION
                                SELECT   220 AS n, 'L10' AS l
                                UNION
                                SELECT   221 AS n, 'M10' AS l
                                UNION
                                SELECT   222 AS n, 'N10' AS l
                                UNION
                                SELECT   223 AS n, 'O10' AS l
                                UNION
                                SELECT   224 AS n, 'P10' AS l
                                UNION
                                SELECT   225 AS n, 'Q10' AS l
                                UNION
                                SELECT   226 AS n, 'R10' AS l
                                UNION
                                SELECT   227 AS n, 'S10' AS l
                                UNION
                                SELECT   228 AS n, 'T10' AS l
                                UNION
                                SELECT   229 AS n, 'U10' AS l
                                UNION
                                SELECT   230 AS n, 'V10' AS l
                                UNION
                                SELECT   231 AS n, 'Z10' AS l) AS alf ON t.pos_kit_n = alf.n
            ORDER BY t.pos";
    $result1=sqlsrv_query($conn,$query1);
    $prefix = "";
    if($result1==TRUE)
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $row["lotto"] = utf8_encode($row1['lotto']);
            $row["codice_pannello"] = utf8_encode($row1['codice_pannello']);
            $row["codice_kit"] = utf8_encode($row1['codice_kit']);
            $row["numero_cabina"] = utf8_encode($row1['numero_cabina']);
            $row["disegno_cabina"] = utf8_encode($row1['disegno_cabina']);
            $row["pos"] = $row1['pos'];
            $row["prelevato"] = filter_var($row1['prelevato'], FILTER_VALIDATE_BOOLEAN);
            $row["stato"] = $row1['stato'];
            $row["pos_kit_l"] = utf8_encode($row1['pos_kit_l']);

            if($row["prelevato"])
            {
                $values .= $prefix . "('" . $row['lotto'] . "'
                    ,'" . $row['disegno_cabina'] . "'
                    ,'" . $row['codice_kit'] . "'
                    ,'" . $row['pos_kit_l'] . "'
                    ,'" . $row['codice_pannello'] . "'
                    ," . $row["pos"] . "
                    ,'" . $row["numero_cabina"] . "'
                    ,GETDATE()
                    ," . $id_utente . ")";

                $prefix = ",";
            }

            array_push($dati_linea_t,$row);
        }
    }
    else
        die("phperror".$query2);
    
        ///DELETEEEEEEEEEEEEEEEEEEEEEEEEEEEE
    $query2="INSERT INTO [dbo].[pannelli_prelievo]
                    ([lotto]
                    ,[disegno_cabina]
                    ,[kit]
                    ,[posizione]
                    ,[codice_pannello]
                    ,[i]
                    ,[numero_cabina]
                    ,[dataOra]
                    ,[utente]) VALUES $values";
    $result2=sqlsrv_query($conn,$query2);
    if (!$result2)
        die("phperror".$query2);

    echo json_encode($dati_linea_t);

?>