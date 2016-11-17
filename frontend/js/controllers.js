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

.controller('myFileController', function($modal, $scope, SessionService, folderAPI) {
  var self = this;
  var userId = JSON.parse(SessionService.get('user'))._id;

  folderAPI.getFolders(userId).then(function(folders) {
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

.controller('addFolderController', function(folderAPI, SessionService, $window) {
  var self = this;

  self.folderName = "";
  var userId = JSON.parse(SessionService.get('user'))._id;

  self.add = function() {
    if(self.folderName) {
      var folder = {
        name: self.folderName,
        userId: userId,
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
    $state.go('folder', { folderId: folderId });
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
})

.controller('uploadController', function($scope, $stateParams, fileUploadService, _, DEFAULT_FILE_TYPE) {

  var UPLOADING = 'uploading';
  var ERROR = 'error';
  var UPLOADED = 'uploaded';
  var MAX_SIZE_UPLOAD_BYTES = 10*1024*1024;
  var self = this;

  function _updateFileUploadStatus() {
    $scope.fileUploadStatus = {
      number: _.filter($scope.files, {isInline: false}).length,
      uploading: _.some($scope.files, {status: UPLOADING}),
      error: _.some($scope.files, {status: ERROR})
    }
  }

  this.upload =  function(file) {
    var uploader = fileUploadService.get(),
      uploadTask = uploader.addFile(file);

    file.status = UPLOADING;
    file.upload = {
      progress: 0,
      cancel: uploadTask.cancel
    };

    file.upload.promise = uploadTask.defer.promise.then(function(task) {
      file.status = UPLOADED;
      file.blobId = task.response.blobId;
      file.url = task.response.url;
    }, function() {
      file.status = ERROR;
    }, function(uploadTask) {
      file.upload.progress = uploadTask.progress;
    }).finally(_updateFileUploadStatus);

    _updateFileUploadStatus();
    uploader.start();
  };

  self.onFilesSelect = function($files) {
    if (!$files || $files.length === 0) {
      return;
    }

    $scope.files = $scope.files || []; //never undefined

    _.forEach($files, function(file) {
      if (file.size > MAX_SIZE_UPLOAD_BYTES) {
        self.errorMessage = 'file\'s size exceeds the limit, please try again with file\'s size under 10Mb'
      }

      var fileStore = {
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE
      };

      $scope.files.push(fileStore);
      self.upload(fileStore);
    });
  };

  function _cancelFile(file) {
    file.upload && file.upload.cancel();
    _updateAttachmentStatus();
  }

  self.removeFile= function(file) {
    _.pull($scope.files, file);
    _cancelFile(file);
  };
});

