<?php

    session_start();

    $name=$_REQUEST ['name'];
    
    if(isset($_SESSION[$name]))
        echo $_SESSION[$name];

?>