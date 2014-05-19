'use strict';

angular.module('ProbabilityApp')
  .controller('MainCtrl', function ($scope) {

        $scope.dice  = "DICE";
        $scope.coin  = "COIN";
        $scope.spin  = "SPIN";
        $scope.cards = "CARDS";

        $scope.tabs = [
            { title:'Dice', content:$scope.dice },
            { title:'Coin Toss', content:$scope.coin},
            { title:'Spinner', content:$scope.spin},
            { title:'Cards', content:$scope.cards},
        ];
    });
