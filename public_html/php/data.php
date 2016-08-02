<?php
if(!empty($_POST['data'])){
    $data = $_POST['data'];
    $fname = $_GET['file'] . ".txt";

    //creates new file
    $file = fopen("../data/" .$fname, 'c'); 
    fwrite($file,    $data);
    fclose($file);
}

?>