'use strict';

var
  angular = require('angular')
;

module.exports = function(widgetDef){
  return angular.extend({}, {
    //defaults
    restrict: 'E',
    template: '',
    transclude: true,
    scope: {},

    //actual stuff
    compile: function(){
      return {
        pre: this.prelink.bind(this),
        post: this.link && this.link.bind(this)
      };
    },

    prelink: function($scope, $element, $attrs){
      for (var k in $attrs.$attr){
        $scope[k] = $attrs[k];

        if ($attrs.$$observers && $attrs.$$observers[k]){
          $attrs.$observe(k, dotSet($scope, k));
        }
      }
    }
  }, widgetDef);
};

function dotSet(obj, prop){
  return function(val){
    obj[prop] = val;
  };
}