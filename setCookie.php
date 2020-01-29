<?php

    $name=$_REQUEST ['name'];
    $value=$_REQUEST ['value'];

    $hour = time() + 3600 * 24 * 30;

    setcookie($name,$value,$hour);

?>