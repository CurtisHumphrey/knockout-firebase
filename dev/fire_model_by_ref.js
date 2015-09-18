(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    require('fire_model');
    return ko.fireModelByRef = function(model_obj, keys_inits, options) {
      var child_path, fire_ref, id_changed, ref_obs_id, _ref, _ref1, _ref2;
      fire_ref = (_ref = options.fire_ref) != null ? _ref : console.error('requires a firebase ref as fire_ref');
      ref_obs_id = (_ref1 = options.ref_obs_id) != null ? _ref1 : console.error('requires a observable as ref_obs_id');
      child_path = (_ref2 = options.child_path) != null ? _ref2 : '';
      options.fire_ref = false;
      ko.fireModel(model_obj, keys_inits, options);
      id_changed = function(id) {
        var key, ref, target;
        for (key in keys_inits) {
          target = model_obj[key];
          if (id == null) {
            target.Change_Fire_Ref(false);
          } else {
            ref = fire_ref.child(id);
            if (child_path) {
              ref = ref.child(child_path);
            }
            target.Change_Fire_Ref(ref.child(key));
          }
        }
      };
      id_changed(ref_obs_id());
      ref_obs_id.subscribe(id_changed);
      return model_obj;
    };
  });

}).call(this);
