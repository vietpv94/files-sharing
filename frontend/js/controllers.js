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
        $window.location.reload();
        $state.go('home');
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

  profileAPI.user(userId).then(function(profile) {
    console.log(profile)
  })
})

.controller('myFileController', function($modal) {
  var self = this;

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
  }
})

.controller('addFolderController', function() {
  var self = this;

  self.folder;

  self.add = function() {
    console.log(self.folder)
  }
})

.controller('listFolderController', function() {

});
