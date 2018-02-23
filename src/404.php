<?php  

  	// var_dump($ajax);die;

  	$ajax = isset($_GET['ajax']) ? ($_GET['ajax'] ==='1' ? 1 : 0) : 0;

  	if(!$ajax) get_header();

?>

   	<h1>404</h1>


<?php if(!$ajax) get_footer(); ?>