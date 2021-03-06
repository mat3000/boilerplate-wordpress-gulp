
const projectName = 'boilerplate';

const tablePrefix = 'wp_';

const environment = {

	development: {
		domain: 'http://wp-gulp.test',
		mysql: {
		  host     : 'localhost',
		  database : 'wp_test',
		  user     : 'root',
		  password : 'root',
		  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
		}
	},

	staging: {
		domain: 'http://wp-gulp-preprod.matdev.fr',
		mysql: {
		  host     : 'wp-gulp-preprod.mysql.db:35518',
		  database : 'wp-gulp-preprod',
		  user     : 'wp-gulp-preprod',
		  password : '123456'
		}
	},

	production: {
		domain: 'http://wp-gulp.com',
		mysql: {
		  host     : 'xxxxxx',
		  database : 'xxxxxx',
		  user     : 'xxxxxx',
		  password : 'xxxxxx'
		}
	},

}

let env = 'development';
const themeName = projectName + (process.env.NODE_ENV==='dev' ? '-dev' : '');
const themePath = `./wordpress/wp-content/themes/${themeName}`;
const themeInfo = `/*
	Theme Name: ${themeName}
	Author: mathieu bruno
	Version: 1.0
*/`;

const gulp = require('gulp');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');  
const rename = require("gulp-rename");
const plumber = require('gulp-plumber');
const file = require('gulp-file');
const uniqid = require('uniqid').time();
const clean = require('gulp-clean');
const replace = require('gulp-string-replace');
const symlink = require('gulp-symlink');

const sass = require('gulp-sass');
const mcss = require('gulp-mcss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const spritesmith = require('gulp.spritesmith');

const webpack = require('gulp-webpack');
const uglify = require('gulp-uglify');

const es = require('event-stream');
const open = require('gulp-open');
const prompt = require('gulp-prompt');
const browserSync = require('browser-sync').create();

// srpites
gulp.task('sprite', () => {

	fs.readdir(path.resolve(__dirname, './src/img/'), (err, files) => {

		let spriteFolder = [];

		if(files){

			for (let i = 0; i < files.length; i++) {

				if( /^sprite/.test(files[i]) && !/.*\..*/.test(files[i]) ){

					spriteFolder.push(`@import 'tools/${files[i]}';`);

					let spriteData = gulp.src(`./src/img/${files[i]}/*.png`).pipe(spritesmith({
							padding: 2,
							cssSpritesheetName: files[i],
							cssTemplate: (data) => {
								let template  = `@mixin stitches-${data.spritesheet.name}($x, $y, $width, $height, $scale:1) {\n`;
										template += `	background-position: $x*$scale $y*$scale;\n`;
										template += `	width: $width*$scale;\n`;
										template += `	height: $height*$scale;\n`;
										template += `	background-size : ${data.spritesheet.width}px*$scale ${data.spritesheet.height}px*$scale;\n`;
										template += `	background-image: url(../img/${data.spritesheet.name}.png);\n`;
										template += `	background-repeat: no-repeat;\n`;
										template += `}\n\n`;
								for (let i = 0; i < data.sprites.length; i++) {
									let sprite = data.sprites[i];
									template += `@mixin sprite-${sprite.name}($scale:1) { @include stitches-${data.spritesheet.name}(${sprite.offset_x}px, ${sprite.offset_y}px, ${sprite.width}px, ${sprite.height}px, $scale); }\n`;
								}
								template += `\n\n`;
								return template;
							},
							imgName: `${files[i]}.png`,
							cssName: `${files[i]}.scss`
						}
					));

					// create sprite image file
	        spriteData.img.pipe(gulp.dest('./src/img/'));

					// create sprite scss file
	        spriteData.css.pipe(gulp.dest('./src/styles/tools/'));

				}

			}

		}

		// update style.scss
		gulp.src('./src/styles/app.scss')
	 		.pipe(replace(/\/\*\ssprites\s\*\/.*/g, '/* sprites */ ' + spriteFolder.join(' ')))
			.pipe(gulp.dest('./src/styles/'));

	});

});

// scss : concat + autoprefix + minify
gulp.task('scss', () => {

	if(process.env.NODE_ENV==='dev'){

	 	return gulp.src('./src/styles/app.scss')
	 		.pipe(plumber({
      	errorHandler: (err) => {
      		console.log(err.toString());
            // this.emit('end');
        }
	    }))
	    .pipe(sass().on('error', sass.logError))
	    .pipe(postcss([
        autoprefixer({browsers: ['> 1%', 'IE 11', 'last 2 versions']})
	    ]))
	    .pipe(rename("./bundle.css"))
	    .pipe(gulp.dest(`${themePath}/styles`))
	    .pipe(browserSync.stream());

	}else{

	 	return gulp.src('./src/styles/app.scss')
	    .pipe(sass().on('error', sass.logError))
	    .pipe(rename(`./min.css`))
	    .pipe(postcss([
        	autoprefixer({browsers: ['> 1%', 'last 2 versions']})
	    ]))
	    .pipe(mcss())
	    .pipe(gulp.dest(`${themePath}/styles`));

	}
});

// webpack
gulp.task('webpack', () => {

	if(process.env.NODE_ENV==='dev'){

	 	return gulp.src(['./src/js/app.js'])
	 		.pipe(webpack({

					devtool: 'cheap-module-eval-source-map',

					module: {
						loaders: [

							{
								test: /\.js$/,
								loader: 'babel-loader',
								exclude: /node_modules/,
								query: {
									presets: ['es2015']
								}
							},

						]
					}

				}))
	    .pipe(rename("./bundle.js"))
	    .pipe(gulp.dest(`${themePath}/js`))
	    .pipe(browserSync.stream());

	}else{

	 	return gulp.src(['./src/js/app.js'])
	 		.pipe(webpack({

				module: {
					loaders: [

						{
							test: /\.js$/,
							loader: 'babel-loader',
							exclude: /node_modules/,
							query: {
								presets: ['es2015']
							}
						},

					]
				}

			}))
	    .pipe(uglify())
	    .pipe(rename("./min.js"))
	    .pipe(gulp.dest(`${themePath}/js`))
	    .pipe(browserSync.stream());


	}

});

// php
gulp.task('php', () => {

	let devtools  = '';
	let concat_2;
	let concat_1 = gulp.src(['./wordpress/wp-config.php'])
 		.pipe(replace(/define\('DB_NAME', '.*'\);/g, `define\('DB_NAME', '${environment[env].mysql.database}'\);`))
 		.pipe(replace(/define\('DB_USER', '.*'\);/g, `define\('DB_USER', '${environment[env].mysql.user}'\);`))
 		.pipe(replace(/define\('DB_PASSWORD', '.*'\);/g, `define\('DB_PASSWORD', '${environment[env].mysql.password}'\);`))
 		.pipe(replace(/define\('DB_HOST', '.*'\);/g, `define\('DB_HOST', '${environment[env].mysql.host}'\);`))
 		.pipe(replace(/^$table_prefix.*/, `$table_prefix = '${tablePrefix}';`))
 		.pipe(gulp.dest('./wordpress'));

	if(process.env.NODE_ENV==='dev'){
		
		if( !process.env.npm_config_argv.includes("--no-help") ){
			devtools += '<style type="text/css">a:empty:not([title]){outline: dashed 2px blue;}</style>';
			devtools += '<style type="text/css">img:not([width]),img[width=""]{outline: dashed 2px orange;}</style>';
			devtools += '<style type="text/css">img:not([height]),img[height=""]{outline: dashed 2px orange;}</style>';
			devtools += '<style type="text/css">img:not([alt]){outline: dashed 2px red;}</style>';
		}

		if( process.env.npm_config_argv.includes("--mylog") ){
			devtools += '<script src="http://log.matdev.fr/mylog.dev-6.0.0.js"></script>';
		}
		
	 	concat_2 = gulp.src(['./src/**/*.php'])
 	 		.pipe(replace(/\{\@jsFilename\@\}/g, 'bundle.js'))
 	 		.pipe(replace(/\{\@cssFilename\@\}/g, 'bundle.css'))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, devtools))
	    .pipe(gulp.dest(themePath))
	    .pipe(browserSync.stream());

	}else{

		if(!process.env.npm_config_argv.includes("--mylog") && !env==='production'){
			devtools += '<script src="http://log.matdev.fr/mylog.dev-6.0.0.js"></script>';
		}

	  concat_2 = gulp.src(['./src/**/*.php'])
 	 		.pipe(replace(/\{\@jsFilename\@\}/g, 'min.js?'+uniqid))
 	 		.pipe(replace(/\{\@cssFilename\@\}/g, 'min.css?'+uniqid))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, devtools))
		  .pipe(gulp.dest(themePath));

	}
   
  return es.concat(concat_1, concat_2);

});

// medias
gulp.task('medias', () => {

	if(process.env.NODE_ENV==='dev'){

	  let concat_1 = gulp.src('./src/styles/tools/fonts')
			.pipe(symlink(`${themePath}/styles/fonts`, {force: true}));

	  let concat_2 = gulp.src('./src/img')
			.pipe(symlink(`${themePath}/img`, {force: true}));

    return es.concat(concat_1, concat_2);

	}else{

	  	gulp.src([
	  			'./src/**/*.jpg',
	  			'./src/**/*.jpeg',
	  			'./src/**/*.gif',
	  			'./src/**/*.png',
	  			'!./src/styles/datas/img/sprites/*',
	  			'!./src/**/favicon.*'
	  		])
		    .pipe(gulp.dest(themePath));

	  	return gulp.src([
	  			'./src/styles/tools/fonts/**/*',
	  		])
		    .pipe(gulp.dest(`${themePath}/styles/fonts/`));

	}

});

// wordpress style file
gulp.task('styleFile', () => { 
	return file('style.css', themeInfo, { src: true })
	    .pipe(gulp.dest(themePath));
});

// clean
gulp.task('clean', () => {

  return gulp.src(themePath, {read: false})
    .pipe(clean());

});

// mysql
gulp.task('mysql', () => {

	const connection = mysql.createConnection(environment.development.mysql);
	connection.connect((err) => {
		if(err){

			console.log(err);

		}else{

			connection.query(`UPDATE ${tablePrefix}options SET option_value='${environment[env].domain}' WHERE option_name='siteurl'`);
			connection.query(`UPDATE ${tablePrefix}options SET option_value='${environment[env].domain}' WHERE option_name='home'`);
			connection.query(`UPDATE ${tablePrefix}options SET option_value='${themeName}' WHERE option_name='template'`);
			connection.query(`UPDATE ${tablePrefix}options SET option_value='${themeName}' WHERE option_name='stylesheet'`);
			connection.end();

		}
	});

});

// finish
gulp.task('finish', ['mysql', 'scss', 'webpack', 'php', 'medias', 'sprite', 'watch'], () => {

	if(process.env.NODE_ENV==='dev'){

	  browserSync.init({
	  	 open: process.env.npm_config_argv.includes("--no-open") ? false : 'external',
	     host: environment.development.domain.replace(/https?:\/\//, ''),
	     proxy: environment.development.domain.replace(/https?:\/\//, ''),
	     port: 8080,
	     notify: false
	  });

		setTimeout( () => console.log('\nReady for work ! 🤓\n'), 100);

	}else{

		setTimeout( () => console.log('\nFinish ! 🤪\n'), 100);

	}

});


// watch
gulp.task('watch', ['clean', 'styleFile', 'scss', 'webpack', 'php', 'medias', 'sprite'], () => {

	if(process.env.NODE_ENV!=='dev') return;

	browserSync.reload();

	gulp.watch('./src/styles/**/*.scss', ['scss']);
	gulp.watch(['./src/**/*.php'], ['php']);
	gulp.watch('./src/js/**/*.js', ['webpack']);

});

gulp.task('prompt', ['clean'], () => {


	if(process.env.NODE_ENV!=='dev') {

		return gulp.src( './package.json' )
	    .pipe(prompt.prompt({
	      type: 'list',
	      name: 'environment',
	      message: 'Which environment would you like to run ?',
	      choices: ['staging', 'production']
	    }, (res) => {
	  		env = res.environment;
	  		console.log(res + '\n')
	    }));
	  }

})

gulp.task('start', ['prompt'], () => {

	gulp.start(['styleFile', 'scss', 'webpack', 'php', 'medias', 'sprite', 'watch', 'finish']);


});

gulp.task('default', ['clean', 'start']);



