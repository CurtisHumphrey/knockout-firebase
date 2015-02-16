(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    ko.extenders.fireValue = function(target, options) {
      var On_Value_Change, new_target, old_dispose, read_once, read_only, _ref, _ref1;
      read_only = (_ref = options.read_only) != null ? _ref : false;
      read_once = (_ref1 = options.read_once) != null ? _ref1 : false;
      target.fire_sync_on = !read_once;
      On_Value_Change = function(snapshot) {
        return target(snapshot.val());
      };
      target.Fire_Off = function() {
        if (!target.fire_sync_on) {
          return;
        }
        target.fire_sync_on = false;
        target.fire_ref.off("value", On_Value_Change);
      };
      target.Fire_Sync = function() {
        var fire_fn;
        target.Fire_Off();
        fire_fn = read_once ? 'on' : 'once';
        target.fire_ref[fire_fn]("value", On_Value_Change);
        target.fire_sync_on = !read_once;
      };
      target.Change_Ref = function(fire_ref) {
        target.Fire_Off();
        if (fire_ref) {
          target.fire_ref = fire_ref;
          target.Fire_Sync();
        } else {
          target.fire_ref = false;
          target(null);
        }
      };
      target.Change_Ref(options.fire_ref);
      if (read_only) {
        return target;
      }
      new_target = ko.pureComputed({
        read: target,
        write: function(value) {
          if (value === void 0) {
            value = null;
          }
          if (target.fire_ref) {
            target.fire_ref.set(value);
          } else {
            target(value);
          }
          return value;
        }
      });
      new_target.Change_Ref = function(fire_ref) {
        return target.Change_Ref(fire_ref);
      };
      old_dispose = new_target.dispose;
      new_target.dispose = function() {
        target.Fire_Off();
        return old_dispose();
      };
      return new_target;
    };
    return ko.fireObservable = function(init_val, options) {
      var target;
      return target = ko.observable(init_val).extend({
        fireValue: options
      });
    };
  });

}).call(this);
