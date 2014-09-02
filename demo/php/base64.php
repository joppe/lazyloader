<?php

$image = file_get_contents('blank.png');
echo base64_encode($image);