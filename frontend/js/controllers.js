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
        $scope.failMessage = err.data.error.details;
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

.controller('listFolderController', function($state, $scope, $modal) {
  var self = this;

  self.viewInside = function(folderId) {
    $state.go('folder', { folderId: folderId });
  };

  self.rename = function(folderId) {
    var scope = $scope.$new();
    scope.folderId = folderId;

    var addModal = $modal({
      templateUrl: '/views/files/rename-modal',
      backdrop: 'static',
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'updateFolderController',
      scope: scope,
      show: false
    });

    addModal.$promise.then(addModal.show);
  };

  self.deleteFolder = function(folderId) {
    var scope =  $scope.$new();
    scope.fileId = folderId;
    var comfirmModal = $modal({
      templateUrl: '/views/files/confirm-delete-modal',
      backdrop: 'static',
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'removeFolderController',
      scope: scope,
      show: false
    });

    comfirmModal.$promise.then(comfirmModal.show);
  }

})
.controller('removeFolderController', function($state, $scope, folderAPI) {
  var id = $scope.fileId;
  var self = this;

  self.delete = function() {
    folderAPI.remove(id).then(function() {
      $state.reload();
    });
  };
})
.controller('updateFolderController', function($scope, $state, folderAPI) {
  var self = this;
  var id = $scope.folderId;

  self.saveUpdate = function() {
    var data = {
      name: $scope.name
    };

    if (id) {
      folderAPI.updateFolder(id, data).then(function() {
        $state.reload();
      });
    }
  }
})

.controller('listFilesController', function($window, $scope, $stateParams, $state, $modal, folderAPI, filesAPI, _) {
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

  self.deleteFile = function(id) {
    var scope =  $scope.$new();
    scope.fileId = id;
    var comfirmModal = $modal({
      templateUrl: '/views/files/confirm-delete-modal',
      backdrop: 'static',
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'removeFilesController',
      scope: scope,
      show: false
    });

    comfirmModal.$promise.then(comfirmModal.show);
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

  self.note = function(file) {
    var scope = $scope.$new();
    scope.metadata = file.metadata;
    scope.fileId = file._id;

    var addModal = $modal({
      templateUrl: '/views/files/add-note-modal',
      backdrop: 'static',
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'addNoteController',
      scope: scope,
      show: false
    });

    addModal.$promise.then(addModal.show);
  };

  self.share = function(file) {
    var scope = $scope.$new();
    scope.metadata = file.metadata;
    scope.fileId = file._id;

    var addModal = $modal({
      templateUrl: '/views/files/add-sharing-people-modal',
      backdrop: 'static',
      placement: 'center',
      controllerAs: '$ctrl',
      controller: 'sharingController',
      scope: scope,
      show: false
    });

    addModal.$promise.then(addModal.show);
  }
})

.controller('sharingController', function($scope, $state, profileAPI, filesAPI) {
  var self = this;

  self.share = function() {
    profileAPI.getUserByEmail($scope.metadata.reader)
      .then(function(user) {
        if (!user) {
          return;
        }
        var readers = $scope.metadata.readers || [];

        readers.push(user._id);
        var metadata = {
          metadata: {
            readers:  readers
          }
        };

        filesAPI.update($scope.fileId, metadata).then(function(){
          $state.reload();
        });
      });
  }
})

.controller('removeFilesController', function($scope, filesAPI, $state) {
  var id = $scope.fileId;
  var self = this;

  self.delete = function() {
    filesAPI.remove(id).then(function() {
      $state.reload();
    });
  };
})
.controller('addNoteController', function($scope, filesAPI) {
  var self = this;

  self.saveNote = function() {
    var metadata = {
      metadata: {
        note: $scope.metadata.note
      }
    };

    filesAPI.update($scope.fileId, metadata);
  }
})

.controller('uploadFileController', function($scope, $window, fileUploadService, _) {
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

  self.done = function() {
    $window.history.back();
  }
})

.controller('sharedFileController', function($scope, filesAPI) {
  filesAPI.getFilesShared().then(function(files) {
    $scope.files = files;
  });
});