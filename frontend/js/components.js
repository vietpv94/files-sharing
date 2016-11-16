'use strict';

angular.module('dsp')

.component('fileFolder', {
  templateUrl: '/views/files/file-folder',
  controller: 'listFolderController',
  bindings: {
    folder: '<'
  }
});
