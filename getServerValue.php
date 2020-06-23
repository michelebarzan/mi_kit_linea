<?php

    session_start();

    $name=$_REQUEST ['name'];
    
    if(isset($_SERVER[$name]))
        echo $_SERVER[$name];

?>