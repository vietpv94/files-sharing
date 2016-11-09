'use strict';

angular.module('dsp', ['mgcrea.ngStrap'])

.controller('myFileController', function($scope, $modal) {
  var self = this;

  var addModal = $modal({
    templateUrl: 'add-folder-modal',
    backdrop: 'static',
    placement: 'center',
    controllerAs: '$ctrl',
    controller: 'addFolderController',
    show: false
  });

  self.addNewFolder = function() {
    addModal.$promise.then(addModal.show);
  }
})

.controller('addFolderController', function() {
  var self = this;
  self.folder;

  self.addFolder = function() {
    console.log('test');
  }
});
