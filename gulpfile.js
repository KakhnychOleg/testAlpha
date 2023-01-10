const {src, dest, parallel, series, watch} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webpack = require('webpack');
const uglify = require('gulp-uglify-es').default;
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();

function html() {
   return src(['./src/**/*.html'])
      .pipe(fileinclude({
         prefix: '@',
         basepath: '@file'
      }))
      .pipe(dest('./dist'))
      .pipe(browserSync.stream());
}

function scss() {
   return src('./src/scss/**.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoprefixer({
         cascade: false,
      }))
      .pipe(cleanCSS({
         level: 2 //уровень сжатия
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./dist/css/'))
      .pipe(browserSync.stream());
}

function image() {
   return src(['./src/img/*.jpg', './src/img/*.png', './src/img/*.jpeg'])
      .pipe(dest('./dist/img'))
}

function svgSprites() {
   return src('./src/img/**.svg')
      .pipe(svgSprite({
         mode: {
            stack: {
               sprite: "../sprite.svg"
            }
         }
      }))
      .pipe(dest('./dist/img'))
}

function scripts() {
   return src('./src/js/main.js')
      .pipe(webpackStream({
         output: {
            filename: 'main.js',
         },
         module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      ['@babel/preset-env', { targets: "defaults" }]
                    ]
                  }
                }
              }
            ]
          }
      }))
      .pipe(sourcemaps.init())
      .pipe(uglify().on("error", notify.onError()))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./dist/js'))
      .pipe(browserSync.stream());
}

function clean() {
   return del('./dist/*')
}

function fonts() {
   src('./src/fonts/**.ttf')
      .pipe(ttf2woff())
      .pipe(dest('./dist/fonts/'))
   return src('./src/fonts/**.ttf')
      .pipe(ttf2woff2())
      .pipe(dest('./dist/fonts/'))
}

function watcher() {
   browserSync.init({
      server: {
         baseDir: "./dist"
      }
   });

   watch('./src/scss/**/*.scss', scss);
   watch('./src/**/*.html', html);
   watch('./src/img/**.jpg', image);
   watch('./src/img/**.png', image);
   watch('./src/img/**.jpeg', image);
   watch('./src/img/**.svg', svgSprites);
   watch('./src/js/**/**.js', scripts);
   watch('./src/fonts/**.ttf', fonts);
}

exports.scss = scss;
exports.watcher = watcher;
exports.fileinclude = html;

exports.default = series(clean, parallel(html, fonts, scripts, image,  svgSprites), scss,  watcher);


function scssBuild() {
   return src('./src/scss/**.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoprefixer({
         cascade: false,
      }))
      .pipe(cleanCSS({
         level: 2 //уровень сжатия
      }))
      .pipe(dest('./dist/css/'))
}

function scriptsBuild() {
   return src('./src/js/main.js')
      .pipe(webpackStream({
         output: {
            filename: 'main.js',
         },
         module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      ['@babel/preset-env', { targets: "defaults" }]
                    ]
                  }
                }
              }
            ]
          }
      }))
      .pipe(uglify().on("error", notify.onError()))
      .pipe(dest('./dist/js'))
}


exports.build = series(clean, parallel(html, fonts, scriptsBuild, image,  svgSprites), scssBuild);