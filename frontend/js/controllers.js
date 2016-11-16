'use strict';

angular.module('dsp')

.controller('login', function($scope, $window, loginAPI, $state, SessionService) {
  $scope.loginIn = false;

  $scope.loginTask = {
    running: false
  };

  $scope.login = function(form) {
    if (form.$invalid) {
      return;
    }

    $scope.loginTask.running = true;

    loginAPI.login($scope.credentials).then(
      function(user) {
        $scope.loginIn = true;
        $scope.loginTask.running = false;
        SessionService.set('user', JSON.stringify(user.data));
        $state.go('home');
        $window.location.reload();
      },
      function(err) {
        $scope.loginTask.running = false;
        $scope.credentials.password = '';
        $window.location.reload();
        console.log(err);
      }
    );
  };

  $scope.loginWithGoogle = function() {

  };

  $scope.isLogin = true;
  $scope.isRegister = false;
})

.controller('signup', function($scope, $window, $state, signupAPI) {
  $scope.loginIn = false;
  $scope.signupTask = {
    running: false
  };

  $scope.signup = function(form) {
    if (form.$invalid) {
      return;
    }
    $scope.signupTask.running = true;

    signupAPI.create($scope.settings).then(
      function() {
        $scope.loginIn = true;
        $scope.signupTask.running = false;
        SessionService.set('user', JSON.stringify(user.data));
        $state.go('home');
        $window.location.reload();
      },
      function(err) {
        $scope.signupTask.running = false;
        console.log(err);
      }
    );
  };
})

.controller('profile', function($scope, profileAPI, SessionService) {
  var userId = JSON.parse(SessionService.get('user'))._id;

  profileAPI.getUser(userId).then(function(profile) {
    $scope.user = profile;
  });
})

.controller('myFileController', function($modal,$scope, folderAPI) {
  var self = this;

  folderAPI.getFolders().then(function(folders) {
    self.folders = folders;
  });

  var addModal = $modal({
    templateUrl: '/views/files/add-folder-modal',
    backdrop: 'static',
    placement: 'center',
    controllerAs: '$ctrl',
    controller: 'addFolderController',
    show: false
  });

  self.addNewFolder = function() {
    addModal.$promise.then(addModal.show);
  };

})

.controller('addFolderController', function(folderAPI, $window) {
  var self = this;

  self.folderName = "";

  self.add = function() {
    if(self.folderName) {
      var folder = {
        name: self.folderName,
        createdAt: Date.now()
      };
      folderAPI.addFolder(folder);
    }
    $window.location.reload();
  }
})

.controller('listFolderController', function($state) {
  var self = this;

  self.viewInside = function(folderId) {
    $state.go('folders', { folderId: folderId });
  }
})

.controller('listFilesController', function($stateParams, $state, folderAPI) {
  var folderId = $stateParams.folderId;
  var self = this;

  folderAPI.getFolder(folderId).then(function(data) {
    self.folder = data;
  });

  self.uploadFile = function() {
    $state.go('upload');
  }
});

