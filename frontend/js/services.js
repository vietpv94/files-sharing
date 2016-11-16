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

  function getFolders() {
    return dspRestangular.all('folders').getList().then(function(res) {
      return Restangular.stripRestangular(res.data);
    });
  }

  function getFolder(id) {
    return dspRestangular.one('folders', id).get().then(function(res) {console.log(res.data)
      return Restangular.stripRestangular(res.data);
    });
  }

  return {
    addFolder: addFolder,
    getFolders: getFolders,
    getFolder: getFolder
  }
});