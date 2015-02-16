(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    require('fire_value');
    return ko.fireModel = function(model_obj, keys_inits, options) {
      var fire_ref, init, key;
      fire_ref = options.fire_ref;
      for (key in keys_inits) {
        init = keys_inits[key];
        options.fire_ref = fire_ref ? fire_ref.child(key) : false;
        if (model_obj[key] === void 0) {
          model_obj[key] = ko.observable(init != null ? init : null);
        }
        model_obj[key] = model_obj[key].extend({
          fireValue: options
        });
      }
      return model_obj;
    };
  });

}).call(this);
