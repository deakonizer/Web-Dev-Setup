// Import Gulp
const gulp = require('gulp');
const plumber = require('gulp-plumber');

// SASS
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const autoprefixer = require("autoprefixer");
const sourcemaps = require('gulp-sourcemaps'); 
const rename = require('gulp-rename');

// HTML
const htmlmin = require('gulp-htmlmin');

// JS
const terser = require('gulp-terser');
const concat = require('gulp-concat');


// Images
// import gulp from 'gulp';
// const change = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');




// Folder Variables
const src = './src';
const dest = './dest';

// Browser Sync und Reload
// Serve the dev-server in the browser
const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: `${dest}`
        }
    });
    done();
};


// Reload the browser
const reload = (done) => {
    browserSync.reload();
    done();
};

// clean HTML and minify
const html = () => {
    // Finde HTML
    return gulp.src(`${src}/*.html`)
        // Init Plumber
        .pipe(plumber())
        // HTMLclean
        .pipe(htmlmin({
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            sortAttributes: true,
            sortClassName: true
        }))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}`));
};

// SCCS ->CSS
const css = () => {
    // find scss files 
    return gulp.src(`${src}/scss/**/*.scss`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(`${dest}/css`))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dest}/css`));
};

//minify JS
const jsscript = () => {
    return gulp.src(`${src}/js/**/*.js`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dest}/js`));
};

// Optimize images


const images = () =>{
    return gulp.src('src/images/**/*.{jpg,png}')
    .pipe(plumber())
    .pipe(changed(`${dest}/images`))
    .pipe (imagemin())
    .pipe(gulp.dest('dest/images'));
};

// Watch changes and refresh page
const watch = () => gulp.watch(
    [
        `${src}/*.html`,
        `${src}/js/**/*.(js|ts)`,
        `${src}/scss/**/*.{sass,scss}`,
        `${src}/images/**/*.{png,jpg,gif}`
    ],

    gulp.series(css, jsscript, html, images, reload)
);

/* 
// Default Gulp Task
const dev = gulp.series(html, css);
// Default function (used when type "gulp")
exports.default = dev;
exports.dev = dev;
 */

// Development tasks
const dev = gulp.task('default', gulp.series(gulp.parallel(css, html, jsscript, images), serve, watch));

// Build tasks
const build = gulp.task('build',
    gulp.parallel(
        html,
        css,
        jsscript,
        images
    ));

// Default function (used when type "gulp")
exports.default = dev;
exports.dev = dev;
exports.build = build;