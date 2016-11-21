'use strict';

angular.module('dsp')

.factory('loginAPI', function(dspRestangular) {

  function login(credentials) {
    return dspRestangular.all('login').post(credentials);
  }

  function askForPasswordReset(email) {
    return dspRestangular.all('passwordreset').post({email: email});
  }

  function updatePassword(password) {
    return dspRestangular.one('passwordreset').customPUT({password: password}, undefined);
  }

  function changePassword(oldpassword, newpassword) {
    return dspRestangular.one('passwordreset').one('changepassword').customPUT({oldpassword: oldpassword, newpassword: newpassword});
  }

  return {
    login: login,
    askForPasswordReset: askForPasswordReset,
    updatePassword: updatePassword,
    changePassword: changePassword
  };

})

.factory('signupAPI', function(dspRestangular) {

  function create(settings) {
    return dspRestangular.all('signup').post(settings);
  }

  return {
    create: create
  };
})

.factory('profileAPI', function($q, Restangular, dspRestangular) {
  function getUser(uuid) {
    return dspRestangular
      .one('profile', uuid).get().then(function(res) {
        if (res.status !== 200) {
          return $q.reject(res);
        }

        return Restangular.stripRestangular(res.data);
      });
  }

  return {
    getUser: getUser
  };
})

.factory('folderAPI', function(dspRestangular, Restangular) {
  function addFolder(folder) {
    return dspRestangular
      .all('folders').post(folder);
  }

  /*This fn will get list of folder created by user*/
  function getFolders(userId) {
    return dspRestangular.one('folders', userId).getList().then(function(res) {
      return Restangular.stripRestangular(res.data);
    });
  }

  /*This fn will get a folder info by folder ID*/
  function getFolder(id) {
    return dspRestangular.one('folder', id).get().then(function(res) {
      return Restangular.stripRestangular(res.data);
    });
  }

  return {
    addFolder: addFolder,
    getFolders: getFolders,
    getFolder: getFolder
  }
})

.factory('filesAPI', function(dspRestangular, Restangular) {
  function getFiles(folderId) {
    return dspRestangular.one('files', folderId).get().then(function(res) {
      return Restangular.stripRestangular(res.data);
    });
  }

  function get(id) {
    return dspRestangular.one('files', id).get();
  }

  function remove(id) {
    return dspRestangular.one('files', id).remove();
  }

  return {
    getFiles: getFiles,
    get: get,
    remove: remove
  }
});