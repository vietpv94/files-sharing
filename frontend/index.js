'use strict';

  angular.module('dsp', ['ui.router', 'mgcrea.ngStrap', 'ngFileUpload', 'dsp.session', 'dsp.http', 'dsp.file'])
  .constant('_', window._)
  .config(function($urlRouterProvider, $stateProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          'root': {
            templateUrl: '/views/home'
          }
        }
      })
      .state('my-files', {
        url: '/my-files',
        views: {
          'root': {
            templateUrl: '/views/files/my-files'
          }
        }
      })
      .state('folder', {
        url: '/folder/:folderId',
        views: {
          'root': {
            templateUrl: '/views/files/list-files'
          }
        }
      })
      .state('upload', {
        url: '/upload',
        views: {
          'root': {
            templateUrl: '/views/files/upload'
          }
        }
      })
      .state('about', {
        url: '/about',
        views: {
          'root': {
            templateUrl: '/views/about'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          'root': {
            templateUrl: '/views/account/login'
          }
        },
        controller: 'login'
      })
      .state('signup', {
        url: '/signup',
        views: {
          'root': {
            templateUrl: '/views/account/signup'
          }
        }
      })
      .state('forgot', {
        url: '/forgot',
        views: {
          'root': {
            templateUrl: '/views/account/reset'
          }
        }
      })
      .state('profile', {
        url: '/profile',
        controller: 'profile',
        params: {user_id: {value: null, squash: true}},
        views: {
          'root': {
            templateUrl: '/views/account/profile'
          }
        }
      });

    $locationProvider.html5Mode(true);
  });
