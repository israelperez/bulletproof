<?php

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$email = $request->email;
$pass = $request->password;
session_start();
$sessionId = session_id();

if( $email ==="admin@webwarrior.me" && $pass === "p@55w0rd"){
	$arr = array('status' => 'ok', 'id' => $sessionId, 'user' => array('id' => 'Administrator', 'role' => 'guest'));
}else{
	$arr = array('status' => 'error');
}
echo json_encode($arr);	//"', user:{ id:'Administrator', role:'guest' } }");
?>