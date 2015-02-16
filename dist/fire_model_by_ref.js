(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    require('fire_model');
    return ko.fireModelByRef = function(model_obj, keys_inits, options) {
      var child_path, fire_ref, ref_obs_id, _ref, _ref1, _ref2;
      fire_ref = (_ref = options.fire_ref) != null ? _ref : console.error('requires a firebase ref as fire_ref');
      ref_obs_id = (_ref1 = options.ref_obs_id) != null ? _ref1 : console.error('requires a observable as ref_obs_id');
      child_path = (_ref2 = options.child_path) != null ? _ref2 : '';
      options.fire_ref = false;
      ko.fireModel(model_obj, keys_inits, options);
      ref_obs_id.subscribe(function(id) {
        var key, ref, target;
        for (key in model_obj) {
          target = model_obj[key];
          if (id == null) {
            target.Change_Fire_Ref(false);
            return;
          }
          ref = fire_ref.child(id);
          if (child_path) {
            ref = ref.child(child_path);
          }
          target.Change_Fire_Ref(ref.child(key));
        }
      });
      return model_obj;
    };
  });

}).call(this);
