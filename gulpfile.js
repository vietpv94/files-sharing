const gulp = require('gulp');
const concat = require('gulp-concat');
const glob = require('glob-all');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const gulpFilter = require('gulp-filter');
const gulpBowerFiles = require('gulp-main-bower-files');
const browserSync = require('browser-sync');
const child = require('child_process');
const jade = require('gulp-jade');
const path = require('path');
const pluginLoader = require('gulp-load-plugins')();
const fs = require('fs');
const FRONTEND_JS_PATH = path.normalize(__dirname + '/../../frontend');
const dest = 'build/';
const reload = browserSync.reload;

const frontendJsFiles = glob.sync([
        FRONTEND_JS_PATH + '**/*.module.js',
        FRONTEND_JS_PATH + '**/!(*spec).js'
      ]).map(function(filepath) {
        return filepath.replace(FRONTEND_JS_PATH, '');
      });

gulp.task('scripts', function() {

  return gulp.src(frontendJsFiles)
    .pipe(concat('index.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dest + 'js'));
});

gulp.task('sass', function() {
    return gulp.src(FRONTEND_JS_PATH + '**/*.scss', {style: 'compressed'})
        .pipe(pluginLoader.sass({style: 'expanded'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dest + 'css'))
        .pipe(reload({stream: true}));
});

 gulp.task('images', function() {
  return gulp.src(FRONTEND_JS_PATH + '/images/**/*')
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
//   var server = child.spawn('node', ['server.js']);
//   var log = fs.createWriteStream('server.log', {flags: 'a'});
//   server.stdout.pipe(log);
//   server.stderr.pipe(log);
// });

gulp.task('jade', function buildHTML() {
  return gulp.src([FRONTEND_JS_PATH + '/views/**/*.jade'])
    .pipe(pluginLoader.jade({
      locals: '',
      pretty: true,
      doctype: 'html'
    }))
    .pipe(gulp.dest(dest));
});
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
gulp.task('default', ['scripts', 'sass', 'images', 'watch', 'main-bower-files', 'jade']);
