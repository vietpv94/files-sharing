'use strict';

angular.module('dsp')

.directive('fallbackSrc', function() {
  return {
    link: function postLink(scope, element, attrs) {
      element.bind('error', function() {
        angular.element(this).attr('src', attrs.fallbackSrc);
      });
    }
  };
});