'use strict';

angular.module('dsp')

.controller('headerCtrl', function($window, $scope) {
  $scope.reload = function() {
    $window.location.reload();
  };
})
.controller('login', function($scope, $window, loginAPI, $state, SessionService) {
  $scope.loginIn = false;

  $scope.loginTask = {
    running: false
  };

  $scope.reload = function() {
    $window.location.reload();
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

.controller('signup', function($scope, $window, $state, signupAPI, SessionService) {
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
      function(user) {
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

.controller('myFileController', function($modal, $scope, SessionService, folderAPI, _) {
  var self = this;
  var userId = JSON.parse(SessionService.get('user'))._id;

  folderAPI.getFolders(userId).then(function(folders) {
    self.folders = _.map(folders, function(folder) {
      if (!folder.parentId) {
        return folder;
      }
    }).filter(Boolean);
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

.controller('addFolderController', function(folderAPI, $stateParams, SessionService, $window) {
  var self = this;
  var folderId = $stateParams.folderId;

  self.folderName = "";
  var userId = JSON.parse(SessionService.get('user'))._id;

  self.add = function() {
    if(self.folderName) {
      var folder = {
        name: self.folderName,
        userId: userId,
        parentId: folderId,
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

.controller('listFilesController', function($scope, $stateParams, $state, $modal, folderAPI, filesAPI, _) {
  var folderId = $stateParams.folderId;
  var self = this;

  filesAPI.getFiles(folderId).then(function(data) {
    $scope.files = data || [];
  }, function(err) {
    console.log(err);
  });

  folderAPI.getFolder(folderId).then(function(data) {
    if (data) {
      $scope.folder = data;
      if (data.childId && data.childId.length > 0) {
        $scope.folder.childrenFolder = [];
        _.map(data.childId, function(id) {
          folderAPI.getFolder(id).then(function(dt) {
            $scope.folder.childrenFolder.push(dt);
          });
        }).filter(Boolean);
      }
    }
  });

  self.uploadFile = function() {
    $state.go('upload', { folderId: folderId });
  };

  self.download = function(file) {console.log(file._id)
    filesAPI.get(file._id).then(function(res) {
      console.log(res);
    })
  };

  var comfirmModal = $modal({
    templateUrl: '/views/files/confirm-delete-modal',
    backdrop: 'static',
    placement: 'center',
    controllerAs: '$ctrl',
    controller: 'listFilesController',
    show: false
  });

  self.deleteFile = function(id) {
    filesAPI.remove(id);
    $state.reload();
  };



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

.controller('uploadFileController', function($scope, fileUploadService, _, DEFAULT_FILE_TYPE) {
  var self = this;
  var UPLOADING = 'uploading';
  var ERROR = 'error';
  var UPLOADED = 'uploaded';
  var MAX_SIZE_UPLOAD_BYTES = 100*1024*1024;
  $scope.folder = {};

  function _updateFileUploadStatus() {
    $scope.fileUploadStatus = {
      number: _.filter($scope.folder.files, {isInline: false}).length,
      uploading: _.some($scope.folder.files, {status: UPLOADING}),
      error: _.some($scope.folder.files, {status: ERROR})
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

    $scope.folder.files = $scope.folder.files || []; //never undefined

    _.forEach($files, function(file) {
      if (file.size > MAX_SIZE_UPLOAD_BYTES) {
        self.errorMessage = 'file\'s size exceeds the limit, please try again with file\'s size under 10Mb'
      }

      $scope.folder.files.push(file);
      self.upload(file);
    });
  };

  function _cancelFile(file) {
    file.upload && file.upload.cancel();
    _updateFileUploadStatus();
  }

  self.removeFile= function(file) {
    _.pull($scope.folder.files, file);
    _cancelFile(file);
  };
});