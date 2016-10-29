var gulp = require('gulp');
var concat = require('gulp-concat');
var glob = require('glob-all');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');
var gulpFilter = require('gulp-filter');
var gulpBowerFiles = require('gulp-main-bower-files');
var browserSync = require('browser-sync');
var child = require('child_process');
var fs = require('fs');
var FRONTEND_JS_PATH = __dirname + '/frontend/';
var dest = 'build/';
var reload = browserSync.reload;

var frontendJsFiles = glob.sync([
        FRONTEND_JS_PATH + '**/*.module.js',
        FRONTEND_JS_PATH + '**/!(*spec).js'
      ]).map(function(filepath) {
        return filepath.replace(FRONTEND_JS_PATH, '');
      });

gulp.task('scripts', function() {

  return gulp.src(frontendJsFiles)
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dest + 'js'));
});

gulp.task('sass', function() {
    return gulp.src(FRONTEND_JS_PATH + '**/*.scss', {style: 'compressed'})
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dest + 'css'))
        .pipe(reload({stream: true}));
});

 gulp.task('images', function() {
  return gulp.src(FRONTEND_JS_PATH + 'images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(dest + 'img'));
});

gulp.task('main-bower-files', function() {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
        .pipe(gulpBowerFiles({
            overrides: {
                bootstrap: {
                    main: [
                        './dist/js/bootstrap.js',
                        './dist/css/*.min.*',
                        './dist/fonts/*.*'
                    ]
                }
            }
        }))
        .pipe(filterJS)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(filterJS.restore)
        .pipe(gulp.dest(dest + 'bower-components'))
        .pipe(reload({stream: true}));
});

// gulp.task('server', function() {
//   var server = child.spawn('node', ['app.js']);
//   var log = fs.createWriteStream('server.log', {flags: 'a'});
//   server.stdout.pipe(log);
//   server.stderr.pipe(log);
// });

 // Watch for changes in files
gulp.task('watch', function() {
   // Watch .js files
  gulp.watch(FRONTEND_JS_PATH + 'js/*.js', ['scripts'], reload);
   // Watch .scss files
  gulp.watch(FRONTEND_JS_PATH + 'css/*.scss', ['sass'], reload);
   // Watch image files
  gulp.watch(FRONTEND_JS_PATH + 'images/**/*', ['images'], reload);

  reload();
 });
 // Default Task
gulp.task('default', ['scripts', 'sass', 'images', 'watch', 'main-bower-files']);
