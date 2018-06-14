
const projectName = 'boilerplate';

const tablePrefix = 'wp_';

const environment = {

	development: {
		domain: 'http://wp-gulp.test',
		mysql: {
		  host     : 'localhost',
		  database : 'wp_gulp',
		  user     : 'root',
		  password : 'root',
		  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
		}
	},

	staging: {
		domain: 'http://wp-gulp-preprod.matdev.fr',
		/*server: {
			host     : '0.0.0.0',
			user     : 'login',
			password : 'password',
		},*/
		mysql: {
		  host     : 'wp-gulp-preprod.mysql.db:35518',
		  database : 'wp-gulp-preprod',
		  user     : 'wp-gulp-preprod',
		  password : '123456'
		}
	},

	production: {
		domain: 'http://wp-gulp.com',
		/*server: {
			host     : '0.0.0.0',
			user     : 'login',
			password : 'password',
		},*/
		mysql: {
		  host     : 'wp-gulp.mysql.db',
		  database : 'wp-gulp',
		  user     : 'wp-gulp',
		  password : '123456'
		}
	},

}

// const env = process.env.npm_config_argv.includes("--stag") ? 'staging' : false || process.env.npm_config_argv.includes("--prod") ? 'production' : false || 'development';
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
const livereload = require('gulp-livereload');
const rename = require("gulp-rename");
const plumber = require('gulp-plumber');
const file = require('gulp-file');
const uniqid = require('uniqid').time();
const clean = require('gulp-clean');
const replace = require('gulp-string-replace');
const symlink = require('gulp-symlink');

const less = require('gulp-less');
const mcss = require('gulp-mcss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const spritesmith = require('gulp.spritesmith');

const webpack = require('gulp-webpack');
const uglify = require('gulp-uglify');

const es = require('event-stream');
const open = require('gulp-open');
const prompt = require('gulp-prompt');
/*if(process.env.npm_config_log){
	console.log('\x1b[41m\x1b[37m');
	console.log('|-----------------------------------|');
	console.log('| Warning : control log disable !!! |');
	console.log('|-----------------------------------|');
	console.log('\x1b[0m');
}*/


/*const { exec } = require('child_process');
exec('pwd', (err, stdout, stderr) => console.log(`stdout: ${stdout}`) );*/





// srpites
gulp.task('sprite', () => {

	fs.readdir(path.resolve(__dirname, './src/img/'), (err, files) => {

		let spriteFolder = [];

		for (let i = 0; i < files.length; i++) {

			if( /^sprite/.test(files[i]) && !/.*\..*/.test(files[i]) ){

				spriteFolder.push('@import \''+files[i]+'\';');

				let spriteData = gulp.src(`./src/img/${files[i]}/*.png`).pipe(spritesmith({
						padding: 2,
						cssSpritesheetName: files[i],
						cssTemplate: (data) => {
							let template  = `.stitches-${data.spritesheet.name}(@x, @y, @width, @height, @scale:1) {\n`;
								template += `	background-position: @x*@scale @y*@scale;\n`;
								template += `	width: @width*@scale;\n`;
								template += `	height: @height*@scale;\n`;
								template += `	background-size : ${data.spritesheet.width}px*@scale ${data.spritesheet.height}px*@scale;\n`;
								template += `	background-image: url(datas/img/${data.spritesheet.name}.png);\n`;
								template += `	background-repeat: no-repeat;\n`;
								template += `}\n\n`;
								for (let i = 0; i < data.sprites.length; i++) {
									let sprite = data.sprites[i];
									template += `.sprite-${sprite.name}(@scale:1) { .stitches-${data.spritesheet.name}(${sprite.offset_x}px, ${sprite.offset_y}px, ${sprite.width}px, ${sprite.height}px, @scale); }\n`;
								}
								template += `\n\n`;
							return template;
						},
						imgName: `${files[i]}.png`,
						cssName: `${files[i]}.less`
					}
				));

				// create sprite image file
        spriteData.img.pipe(gulp.dest('./src/img/'));

				// create sprite less file
        spriteData.css.pipe(gulp.dest('./src/styles/'));

			}

		}

		// update style.less
		gulp.src('./src/styles/app.less')
	 		.pipe(replace(/\/\*\ssprites\s\*\/.*/g, '/* sprites */ ' + spriteFolder.join(' ')))
			.pipe(gulp.dest('./src/styles/'));

	});

});

// less : concat + autoprefix + minify
gulp.task('less', () => {

	if(process.env.NODE_ENV===''){

	 	return gulp.src('./src/styles/app.less')
	 		.pipe(plumber({
      	errorHandler: (err) => {
      		console.log(err.toString());
            // this.emit('end');
        }
	    }))
	    .pipe(less())
	    .pipe(postcss([
        autoprefixer({browsers: ['> 1%', 'IE 11', 'last 2 versions']})
	    ]))
	    .pipe(rename("./bundle.css"))
	    .pipe(gulp.dest(`${themePath}/styles`))
	    .pipe(livereload());

	}else{

	 	return gulp.src('./src/styles/app.less')
	    .pipe(less())
	    .pipe(rename(`./min-${uniqid}.css`))
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
	 		.pipe(webpack(require('./webpack.config.js')))
	    .pipe(rename("./bundle.js"))
	    .pipe(gulp.dest(`${themePath}/js`))
	    .pipe(livereload());

	}else{

	 	return gulp.src(['./src/js/app.js'])
	 		.pipe(webpack(require('./webpack.config.js')))
	 		.pipe(replace(/log\.(loop|green|Green|info|red|orange|yellow|green|Green|blue|violet|white|grey|black|time|size|key|button|range|show)\(/g, function(a,b,c){

				if(!process.env.npm_config_argv.includes("--mylog") || env==='production'){
	 				console.log('\x1b[41m\x1b[37m','Error : log.'+b+'() found !!!', '\x1b[0m');
	 				process.exit();
	 			}
	 			return a;

	 		}))
		    // .pipe(uglify())
		    .pipe(rename("./min-"+uniqid+".js"))
		    .pipe(gulp.dest(`${themePath}/js`))
		    .pipe(livereload());


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
 		.pipe(replace(`$table_prefix  = 'wp_';`, `$table_prefix  = '${tablePrefix}';`))
 		.pipe(gulp.dest('./wordpress'));

	if(process.env.NODE_ENV==='dev'){
		
		if( !process.env.npm_config_argv.includes("--no-help") ){
			devtools += '<style type="text/css">a:empty:not([title]){border: dashed 2px blue;}</style>';
			devtools += '<style type="text/css">img:not([width]),img[width=""]{border: dashed 2px orange;}</style>';
			devtools += '<style type="text/css">img:not([height]),img[height=""]{border: dashed 2px orange;}</style>';
			devtools += '<style type="text/css">img:not([alt]){border: dashed 2px red;}</style>';
		}

		if( process.env.npm_config_argv.includes("--mylog") ){
			devtools += '<script src="http://log.matdev.fr/mylog.dev-6.0.0.js"></script>';
		}
		
	 	concat_2 = gulp.src(['./src/**/*.php'])
	 		.pipe(replace(/\{\@filename\@\}/g, 'bundle'))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, devtools))
	    .pipe(gulp.dest(themePath))
	    .pipe(livereload());

	}else{

		if(!process.env.npm_config_argv.includes("--mylog") && !env==='production'){
			devtools += '<script src="http://log.matdev.fr/mylog.dev-6.0.0.js"></script>';
		}

	  concat_2 = gulp.src(['./src/**/*.php'])
	 		.pipe(replace(/\{\@filename\@\}/g, 'min-'+uniqid))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, devtools))
		  .pipe(gulp.dest(themePath));


	}
   
  return es.concat(concat_1, concat_2);

});

// medias
gulp.task('medias', () => {

	if(process.env.NODE_ENV==='dev'){

	  let concat_1 = gulp.src('./src/styles/datas')
			.pipe(symlink(`${themePath}/styles/datas`, {force: true}));

	  let concat_2 = gulp.src('./src/img')
			.pipe(symlink(`${themePath}/img`, {force: true}));

    return es.concat(concat_1, concat_2);

	}else{

	  	return gulp.src([
	  			'./src/**/*.jpg',
	  			'./src/**/*.jpeg',
	  			'./src/**/*.gif',
	  			'./src/**/*.png',
	  			'./src/**/*.woff',
	  			'./src/**/*.woff2',
	  			'./src/**/*.ttf',
	  			'./src/**/*.svg',
	  			'./src/**/*.eot',
	  			'!./src/styles/datas/img/sprites/*',
	  			'!./src/**/favicon.*'
	  		])
		    .pipe(gulp.dest(themePath));

	}

});

// wordpress style file
gulp.task('styleFile', () => { 
	return file('style.css', themeInfo, { src: true })
	    .pipe(gulp.dest(themePath));
});

// clean
gulp.task('clean', function() {

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
gulp.task('finish', ['mysql', 'less', 'webpack', 'php', 'medias', 'sprite', 'watch'], function() {

	if(process.env.NODE_ENV==='dev'){

		if(!process.env.npm_config_argv.includes("--no-open")){
			gulp.src(__filename)
			  .pipe(open({uri: environment.dev.domain}));
		}

		setTimeout( () => {
			console.log('\nReady for work ! 🤓\n');
		}, 100);

	}else{

		setTimeout( () => {
			console.log('\nFinish ! 🤪\n');
		}, 100);

	}

});



// watch
gulp.task('watch', ['clean', 'styleFile', 'less', 'webpack', 'php', 'medias', 'sprite'], () => {

	if(process.env.NODE_ENV!=='dev') return;

	livereload.listen();

	gulp.watch('./src/styles/**/*.less', ['less']);
	gulp.watch(['./src/**/*.php'], ['php']);
	gulp.watch('./src/js/**/*.js', ['webpack']);

});

gulp.task('prompt', ['clean'], function() {

	return gulp.src( './package.json' )
    .pipe(prompt.prompt({
      type: 'list',
      name: 'environment',
      message: 'Which environment would you like to run ?',
      choices: ['staging', 'production']
    }, function(res){
  		env = res.environment;
  		console.log(res + '\n')
    }));

})

gulp.task('start', ['prompt'], function() {

	gulp.start(['styleFile', 'less', 'webpack', 'php', 'medias', 'sprite', 'watch', 'finish']);


});

gulp.task('default', ['clean', 'start']);



