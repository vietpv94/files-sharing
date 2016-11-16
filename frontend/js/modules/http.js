'use strict';

angular.module('dsp.http', ['restangular'])

  .factory('dspRestangular', function(Restangular, httpErrorHandler) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
      RestangularConfigurer.setBaseUrl('/api');
      RestangularConfigurer.setErrorInterceptor(function(response) {
        if (response.status === 401) {
          httpErrorHandler.redirectToLogin();
        }
        return true;
      });
    });
  })
  .factory('httpErrorHandler', function($window, $location, $log) {

    function redirectToLogin() {
      var current = $location.path();
      $log.debug('User is not logged, redirecting to login page from', current);
      $window.location.href = '/login?continue=' + current;
    }

    return {
      redirectToLogin: redirectToLogin
    };
  });
