'use strict';

angular.module('dsp.session', [])
  .factory('SessionService', function($window) {
    var sessionStorage = $window.sessionStorage;

    var get = function(key) {
      return sessionStorage.getItem(key);
    };

    var set = function(key, value) {
      sessionStorage.setItem(key, value);
    };

    var unset = function(key) {
      sessionStorage.removeItem(key);
    };

    return {
      get: get,
      set: set,
      unset: unset
    }
  });
