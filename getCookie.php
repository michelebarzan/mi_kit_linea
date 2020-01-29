<?php

    $name=$_REQUEST ['name'];
    
    if(isset($_COOKIE[$name]))
        echo $_COOKIE[$name];

?>