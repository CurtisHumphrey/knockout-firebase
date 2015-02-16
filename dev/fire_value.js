(function() {
  define(function(require) {
    var Change_Fire_Ref, Fire_Off, Fire_Sync, Fire_Write, ko;
    ko = require('knockout');
    Fire_Off = function(target, On_Value_Change) {
      target.fire_sync_on = false;
      if (target.fire_ref && target.fire_sync_on) {
        target.fire_ref.off("value", On_Value_Change);
      }
    };
    Fire_Sync = function(target, On_Value_Change, read_once) {
      var fire_fn;
      Fire_Off(target, On_Value_Change);
      fire_fn = read_once ? 'once' : 'on';
      target.fire_ref[fire_fn]("value", On_Value_Change);
      target.fire_sync_on = !read_once;
    };
    Change_Fire_Ref = function(fire_ref, target, On_Value_Change, read_once) {
      if (fire_ref) {
        target.fire_ref = fire_ref;
        Fire_Sync(target, On_Value_Change, read_once);
      } else {
        Fire_Off(target, On_Value_Change);
        target.fire_ref = false;
        target(null);
      }
    };
    Fire_Write = function(target, value, read_only, read_once) {
      if (value === void 0) {
        value = null;
      }
      if (!read_only && target.fire_ref) {
        target.fire_ref.set(value);
        if (read_once) {
          target(value);
        }
      } else {
        target(value);
      }
      return value;
    };
    ko.extenders.fireValue = function(target, options) {
      var On_Value_Change, new_target, old_dispose, read_once, read_only, _ref, _ref1;
      read_only = (_ref = options.read_only) != null ? _ref : false;
      read_once = (_ref1 = options.read_once) != null ? _ref1 : false;
      target.fire_sync_on = false;
      On_Value_Change = function(snapshot) {
        return target(snapshot.val());
      };
      new_target = ko.pureComputed({
        read: target,
        write: function(value) {
          return Fire_Write(target, value, read_only, read_once);
        }
      });
      new_target.Change_Fire_Ref = function(fire_ref) {
        return Change_Fire_Ref(fire_ref, target, On_Value_Change, read_once);
      };
      new_target.Get_Fire_Ref = function() {
        return target.fire_ref;
      };
      old_dispose = new_target.dispose;
      new_target.dispose = function() {
        target.Fire_Off();
        return old_dispose();
      };
      new_target.Change_Fire_Ref(options.fire_ref);
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
