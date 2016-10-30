'use strict';

var app = angular.module('dspApp', ['ui.router']);

app.config(function($urlRouterProvider, $stateProvider, $locationProvider) {

  $urlRouterProvider.when('', '/home');

  $stateProvider
    .state('home', {
      url: '/home',
      views: {
        '': {
          templateUrl: '/views/layout'
        }
      }
    })
    .state('files', {
      url: '/files',
      templateUrl: '/views/files/my-files'
    })
    .state('about', {
      url: '/about',
      templateUrl: '/frontend/views/about'
    });

  $locationProvider.html5Mode(true);
});
