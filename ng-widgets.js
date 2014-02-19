(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};'use strict';

var
  angular = require('angular'),
  ngWidgets = angular.module('ng-widgets', []),

  jQuery = global.jQuery
;

module.exports = ngWidgets;

//TODO: test
//quick and dirty
if ( ! jQuery){
  angular.element.prototype.find = require('./src/qsa.js');
}

ngWidgets
  .value('ngWidget', require('./src/ng-widget.js'))

  .filter('markdown', require('./src/markdown.js'))

  .directive('content', require('./src/content'))

  .directive('nwBtn', require('./src/nw-btn'))
  .directive('nwSaveBtn', require('./src/nw-save-btn'))
  .directive('nwDeleteBtn', require('./src/nw-delete-btn'))

  .directive('nwNavbar', require('./src/nw-navbar'))
  .directive('nwList', require('./src/nw-list'))
  .directive('nwItem', require('./src/nw-item'))
  .directive('nwField', require('./src/nw-field'))
  .directive('nwRow', require('./src/nw-row'))
  .directive('nwPanel', require('./src/nw-panel'))
  .directive('nwModal', require('./src/nw-modal'))

  .directive('nwLipsum', require('./src/nw-lipsum'))

  .directive('nwGrid', require('./src/nw-grid'))
  .directive('nwGridCol', require('./src/nw-grid-col'))

  .directive('nwTabs', require('./src/nw-tabs'))
  .directive('nwTab', require('./src/nw-tab'))
;
},{"./src/content":4,"./src/markdown.js":5,"./src/ng-widget.js":6,"./src/nw-btn":7,"./src/nw-delete-btn":8,"./src/nw-field":9,"./src/nw-grid":11,"./src/nw-grid-col":10,"./src/nw-item":12,"./src/nw-lipsum":13,"./src/nw-list":14,"./src/nw-modal":15,"./src/nw-navbar":16,"./src/nw-panel":17,"./src/nw-row":18,"./src/nw-save-btn":19,"./src/nw-tab":20,"./src/nw-tabs":21,"./src/qsa.js":22,"angular":2}],2:[function(require,module,exports){
'use strict';

module.exports = window.angular;
},{}],3:[function(require,module,exports){
'use strict';

module.exports = window.Showdown;
},{}],4:[function(require,module,exports){
'use strict';

module.exports = function(){
  return {
    restrict: 'E',
    link: function($scope, $element){
      $element.prop('$shadow', $scope);
      $element.append($scope.$host.contents());
    }
  };
};
},{}],5:[function(require,module,exports){
'use strict';

//TODO: test
try{
  var
    angular = require('angular'),
    showdown = require('showdown'),
    converter = new showdown.converter(),
    makeHtml = converter.makeHtml.bind(converter)
  ;
} catch(e){
  makeHtml = angular.identity;
}

module.exports = function($sce, $log){
  if ( ! showdown){
    $log.error('Showdown library not available.');
  }

  return function(source){
    return source && $sce.trustAsHtml(makeHtml(source));
  };
};
},{"angular":2,"showdown":3}],6:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};'use strict';

var
  angular = require('angular')
;

module.exports = WidgetDefinition;

function WidgetDefinition(cfg){
  if ((this === global) || (this === undefined)){
    return new WidgetDefinition(cfg);
  }

  angular.extend(this, cfg);
}

WidgetDefinition.prototype = {
  restrict: 'E',
  template: '',
  transclude: true,
  scope: {},
  defaults: {},

  //actual stuff
  compile: function(){
    return {
      pre: this.prelink.bind(this),
      post: this.link && this.link.bind(this)
    };
  },

  prelink: function($scope, $element, $attrs, ctrls, $transclude){
    //set shadow
    $scope.$shadow = $element.parent().prop('$shadow');

    angular.extend($scope, angular.copy(this.defaults));

    bindAttributes($scope, $attrs, this.defaults);
    transclude($scope, $transclude);
  }
};

function bindAttributes($scope, $attrs, defaults){
  for (var k in $attrs.$attr){
    $scope[k] = $attrs[k];

    //TODO: test (partially covered by nw-* widgets)
    //most wanted
    if (defaults[k] instanceof Object){
      $scope[k] = $scope.$parent.$eval($attrs[k]);
      $scope.$parent.$watchCollection($attrs[k], dotSet($scope, k));
      continue;
    }

    //string interpolation
    if ($attrs.$$observers && $attrs.$$observers[k]){
      $attrs.$observe(k, dotSet($scope, k));
    }
  }
}

//always transclude - this makes tracing bugs little easier
function transclude($scope, $transclude){
  $transclude($scope.$parent, function(contents){
    //scope is the least evil, in future this will get replaced by shadow DOM + polyfill
    $scope.$host = angular.element('<host></host>').prop('$shadow', $scope).append(contents);
  });
}

function dotSet(obj, prop){
  return function(val){
    obj[prop] = val;
  };
}
},{"angular":2}],7:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<a class="btn btn-{{ type }}">' +
      '  <i class="fa fa-{{ icon }}" ng-show=" icon "></i>' +
      '  {{ name }}' +
      '</a>',

    defaults: {
      name: '',
      icon: '',
      type: 'default'
    }
  });
};
},{}],8:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<nw-btn icon="trash-o" ng-click=" record.$delete() "></nw-btn>',

    defaults: {
      record: {}
    }
  });
};
},{}],9:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<div class="form-group" ng-class=" {\'has-error\': ngModel.$dirty && ngModel.$invalid} ">' +
      '  <label ng-show=" label " class="control-label">{{ label }}</label>' +
      '  <content></content>' +
      '</div>',

    link: function($scope, $element){
      var control = $element.find('textarea, select, input:not([type="radio"]):not([type="checkbox"])');

      $scope.ngModel = control.controller('ngModel');

      control.addClass('form-control');
    }
  });
};
},{}],10:[function(require,module,exports){
'use strict';

var
  _ = require('./utils')
;

module.exports = function(ngWidget){
  return ngWidget({
    defaults: {
      name: '',
      index: ''
    },

    controller: function($scope){
      $scope.template = function(){
        return this.html || ('{{ it["' + this.index + '"] }}');
      };
    },

    link: function($scope){
      $scope.$shadow.cols.push($scope);

      $scope.$on('$destroy', function(){
        _.pull($scope.$shadow.cols, $scope);
      });

      $scope.html = $scope.$host.find('template').html();
    }
  });
};
},{"./utils":23}],11:[function(require,module,exports){
'use strict';

var angular = require('angular');

module.exports = function(ngWidget){
  return ngWidget({
    style:
      //hand + unselectable
      'nw-grid thead th{cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none}' +
      'nw-grid[ng-model] tbody tr{cursor: pointer}' +

      //carret visibility
      'nw-grid th i.fa{visibility: hidden}' +
      'nw-grid th.active i.fa{visibility: visible}' +

      //bootstrap bug? striped + hover + active
      'nw-grid tr.active td{background: #68c !important; color: #fff !important}',

    template:
      '<table class="table table-striped table-hover table-bordered">' +
      '  <thead>' +
      '    <tr>' +
      '    <th' +
      '      ng-repeat=" col in cols " ' +
      '      ng-class=" {active: col == sortCol} " ' +
      '      ng-click=" $parent.reverse = ((col == sortCol) && !reverse); $parent.sortCol = col " ' +
      '    >' +
      '      {{ col.name }} ' +
      '      <i class="fa fa-caret-{{ reverse ?\'down\' :\'up\' }} pull-right"></i>' +
      '    </th>' +
      '    </tr>' +
      '  </thead>' +
      '  <tbody>' +
      '    <tr><td>Value</td></tr>' +
      '  </tbody>' +
      '</table>',

    defaults: {
      items: [],
      cols: [],
      autosort: true
    },

    controller: function($scope, $compile){
      //TODO: injector during
      $scope.$compile = $compile;

      $scope.$watch('cols', function(){
        if ($scope.autosort){
          $scope.sortCol = $scope.cols[0];
        }
      });
    },

    link: function($scope, $element){
      //initialize using elements
      var
        tr = $element.find('tbody tr'),
        trHtml = ''
      ;

      //init repeater
      tr.attr('ng-repeat', ' it in items | orderBy:sortCol.index:reverse ');

      $scope.cols.forEach(function(col){
        trHtml += '<td>' + col.template() + '</td>';
      });

      //TODO: find better way to compile new elements in link phase
      $scope.$compile(tr.html(trHtml))($scope);
    }
  });
};
},{"angular":2}],12:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    defaults: {
      name: ''
    },

    link: function($scope){
      $scope.$shadow.items.push($scope);
    }
  });
};
},{}],13:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<p>{{ lipsum }}</p>',

    defaults: {
      lipsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  });
};
},{}],14:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<ul ng-show=" items " class="{{ listClass }}">' +
      '  <li ng-repeat=" it in items " ng-class="{ {{ activeClass }}: it == ngModel.$modelValue }">' +
      '    <a href="" ng-click=" ngModel.$setViewValue(it) ">{{ it.name }}</a>' +
      '  </li>' +
      '</ul>' +
      '<p ng-hide=" items ">{{ emptyText }}</p>',

    defaults: {
      items: [],
      emptyText: 'No items found',
      activeClass: 'active',
      listClass: ''
    },

    link: function($scope, $element){
      $scope.ngModel = $element.controller('ngModel');

      //if ('autoselect' in $scope){
      //
      //}
    }
  });
};
},{}],15:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    style: 'nw-modal .modal{display: block}',

    //optional full-height styles
    //TODO: consider introducing new element
    //TODO: consider relation to overlay
    //
    // nw-modal .modal-content{border-radius: 0; border: 0; height: 100%}
    // nw-modal .modal-dialog{position: fixed; width: 100%; height: 100%; margin: 0; top: 0; left: 0}

    template:
      '<div class="modal" role="dialog"><div class="modal-dialog"><div class="modal-content">' +
      '  <div class="modal-header" ng-show=" name "><h3 class="modal-title">{{ name }}</h3></div>' +
      '  <div class="modal-body">' +
      '    <content></content>' +
      '  </div>' +
      '  <div class="modal-footer" ng-show=" footer ">{{ footer }}</div>' +
      '</div></div></div>',

    defaults: {
      name: '',
      footer: ''
    }
  });
};
},{}],16:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<nav class="navbar navbar-{{ type }}" role="navigation">' +
      '  <a href="" class="navbar-brand" ng-show=" name ">{{ name }}</a>' +
      '  <content></content>' +
      '</nav>',

    defaults: {
      name: '',
      type: 'default'
    }
  });
};
},{}],17:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template:
      '<div class="panel panel-{{ type }}">' +
      '  <div class="panel-heading" ng-show=" name ">{{ name }}</div>' +
      '  <div class="panel-body">' +
      '    <content></content>' +
      '  </div>' +
      '</div>',

    defaults: {
      name: '',
      type: 'default'
    }
  });
};
},{}],18:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<div class="row"><content></content></div>',
    link: function($scope, $element, $attrs){
      $element.find('.row > content').children().addClass($attrs.itemClass);
    }
  });
};
},{}],19:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    template: '<nw-btn icon="save" ng-click=" record.$save() "></nw-btn>',

    defaults: {
      record: {}
    }
  });
};
},{}],20:[function(require,module,exports){
'use strict';

var
  _ = require('./utils')
;

//TODO: consider renaming to <nw-section
//  (introduce & support accordion)
module.exports = function(ngWidget){
  return ngWidget({
    template: '<content ng-show=" active "></content>',

    defaults: {
      name: ''
    },

    link: function($scope){
      $scope.$shadow.tabs.push($scope);

      $scope.$on('$destroy', function(){
        _.pull($scope.$shadow.tabs, $scope);
      });
    }
  });
};
},{"./utils":23}],21:[function(require,module,exports){
'use strict';

module.exports = function(ngWidget){
  return ngWidget({
    style: 'nw-tabs nw-list{display: block; margin-bottom: 1em}',

    template:
      '<nw-list items=" tabs " list-class="nav nav-tabs" ng-model=" activeTab "></nw-list>' +
      '<content></content>',

    defaults: {
      tabs: [],
      activeTab: null
    },

    controller: function($scope){
      //TODO: autoselect
      $scope.$watchCollection('tabs', function(tabs){
        $scope.activeTab = $scope.activeTab || tabs[0];
      });

      $scope.$watch('activeTab', function(activeTab){
        $scope.tabs.forEach(function(tab){
          tab.active = (tab === activeTab);
        });
      });
    }
  });
};
},{}],22:[function(require,module,exports){
'use strict';

var angular = require('angular');

module.exports = function(selector){
  var res = [];

  [].forEach.call(this, function(el){
    res.push.apply(res, el.querySelectorAll(selector));
  });

  return angular.element(res);
};
},{"angular":2}],23:[function(require,module,exports){
'use strict';

module.exports = {
  pull: function(arr, item){
    var idx = arr.indexOf(item);

    return (~idx) && arr.splice(idx, 1);
  }
};
},{}]},{},[1])