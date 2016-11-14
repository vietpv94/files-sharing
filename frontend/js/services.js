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

.factory('profileAPI', function(dspRestangular) {
  function user(uuid) {
    return dspRestangular.one('profile', uuid).get();
  }

  function updateProfileField(fieldName, fieldValue) {
    var payload = {
      value: fieldValue
    };
    return dspRestangular.one('account/profile', fieldName).customPUT(payload);
  }

  function updateProfile(profile) {
    return dspRestangular.one('account/profile').customPUT(profile);
  }

  return {
    user: user,
    updateProfileField: updateProfileField,
    updateProfile: updateProfile
  };
});