<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wp_gulp');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'root');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '5Id =3Fl4efhcq?S}LL_o8RH[JAnnRCF_1z+X<rW}No65_P/i VPX!m2S8:= S<g');
define('SECURE_AUTH_KEY',  '$$E:eR-$ffS/EHfa7.^eF,Ax42Z4KD1LKm!BvtKu*bdG#v~gRWl-4-IsIe/AZsl`');
define('LOGGED_IN_KEY',    '[ZjpO?@Wta~Q{]whvnX7,OC9]-iIV`*I1`uAN@ G=+ZR0VvaG*l h+^dso$EtK]a');
define('NONCE_KEY',        'iLg|y!]H`/;CpAU1<qK#pBT:O_Pj?P(i`<]J1Wb;$&qF!_tk+]]4#mFt)sADscGe');
define('AUTH_SALT',        'i@?+(At]my3* Os2qPcF~.}isp(xFvoKaD|Q,wxGr(h2R+UrZ=J(OU~{I;8#nG{W');
define('SECURE_AUTH_SALT', '>dahT.;R|~PE2cty,h,q:7lnDbo;4*MyI#A=>uY;4qw^#+,Tnr}^a1-d~Us_cE,X');
define('LOGGED_IN_SALT',   '!ev_5dODOlM!Kwcs{29raR+4MIvp-IpX|v<dH<p_GTG:%)[H*VEVG[~ iwUlhJa ');
define('NONCE_SALT',       '9V<a[1{By*vs_#TtyMWV$I>@+`A;:xFCq2K[0jNS(3hKyfpsy`p52a>As5i&SPFe');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'gulp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
