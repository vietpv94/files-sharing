'use strict';

var app = angular.module('dsp', ['ui.router']);

app.config(function($urlRouterProvider, $stateProvider, $locationProvider) {

  $urlRouterProvider.when('', '/home');

  $stateProvider
    .state('home', {
      url: '/home',
      views: {
        '': {
          templateUrl: '/views/home'
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

app.run(function($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        if (rejection === 'not authorized') {
            $location.path('/');
        }
    });
});
