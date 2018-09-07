<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />

    <title><?php bloginfo('name'); ?></title>

    <meta name="keywords" content="" />
    <meta name="description" content="" />
    <meta name="author" content="mathieu bruno" />

    <meta name="viewport" content="width = device-width, initial-scale = 1.0" />
    
    <link rel="icon" href="favicon.ico" />
    <link rel="icon" type="image/png" href="favicon.png" />

    <!--[if lt IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <link rel="stylesheet" type="text/css" href="<?php bloginfo("stylesheet_directory"); ?>/styles/min.css?jim2vi4s" />

    <?php //wp_head(); ?> 

</head>
<body>


    <h1><a href="/">home</a></h1>
    <pre>
    <p><a href="/" class="ajax-link">home</a></p><?php 


    // $post = get_posts( array() );
    $page = get_pages( array('parent' => 0,) );

    // print_r($post);
    // print_r($page);


    foreach ($page as $key => $value) {
        $url = get_bloginfo("url") .'/'. $value->post_name . '/';
        echo "<p><a href=\"{$url}\" class=\"ajax-link\" >{$value->post_title}</a></p>";
    }

    ?><p><a href="/caca" class="ajax-link">404</a></p>

</pre>