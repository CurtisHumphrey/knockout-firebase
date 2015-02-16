(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    require('fire_value');
    ko.extenders.fireValueByRef = function(target, options) {
      var child_path, fire_ref, ref_obs_id, _ref, _ref1, _ref2;
      fire_ref = (_ref = options.fire_ref) != null ? _ref : console.error('requires a firebase ref as fire_ref');
      ref_obs_id = (_ref1 = options.ref_obs_id) != null ? _ref1 : console.error('requires a observable as ref_obs_id');
      child_path = (_ref2 = options.child_path) != null ? _ref2 : '';
      options.fire_ref = false;
      target.extend({
        fireValue: options
      });
      ref_obs_id.subscribe(function(id) {
        if (id == null) {
          target.Change_Ref(false);
          return;
        }
        return target.Change_Ref(fire_ref.child(id).child(child_path));
      });
      return target;
    };
    return ko.fireValueByRef = function(init_val, options) {
      var target;
      return target = ko.observable(init_val).extend({
        fireValueByRef: options
      });
    };
  });

}).call(this);
