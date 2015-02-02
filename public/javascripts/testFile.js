/**
 * Created by kevin on 2/1/15.
 */
var bubbletest = angular.module('bubbletest', ['LocalStorageModule']);

//Configure LocalStorage
bubbletest.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('Bubble')
        .setStorageType('localstorage')
        .setNotify(true, true)
});
bubbletest.controller('bubbleCtrl', function ($scope) {
    $scope.bubbleList = ['dick', 'shit', 'fuck'];
    // HTTP request to grab the token from the host from the
});

