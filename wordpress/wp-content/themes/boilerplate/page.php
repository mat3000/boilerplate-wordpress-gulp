<?php  

  	/* Template Name: page */

  	// var_dump($ajax);die;

  	$ajax = isset($_GET['ajax']) ? ($_GET['ajax'] ==='1' ? 1 : 0) : 0;

  	if(!$ajax) get_header();

?>

   	<h1><?php the_title(); ?></h1>
   	<img src="http://media.matdev.fr/?i=0&sleep=0" />
   	<img src="http://media.matdev.fr/?i=1&sleep=1" />
   	<img src="http://media.matdev.fr/?i=2&sleep=2" />
   	<img src="http://media.matdev.fr/?i=3&sleep=3" />
   	<img src="not-found" />


<?php if(!$ajax) get_footer(); ?>