'use strict';

angular.module('dsp', ['ui.router', 'mgcrea.ngStrap', 'dsp.session', 'dsp.http'])

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
