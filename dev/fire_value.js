(function() {
  define(function(require) {
    var Change_Fire_Ref, Fire_Off, Fire_On_Value_Change, Fire_Sync, Fire_Write, Once_Loaded, ko;
    ko = require('knockout');
    Fire_On_Value_Change = function(snapshot) {
      var callback, val, write_back, _i, _len, _ref;
      write_back = false;
      val = snapshot.val();
      if (val === null && this() === null) {

      } else if (val === null && !this.read_only) {
        val = this();
        write_back = true;
      } else {
        this(val);
      }
      _ref = this._once_loaded;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        callback(val);
      }
      this._once_loaded.length = 0;
      this._has_loaded = true;
      if (write_back) {
        return Fire_Write(this, this());
      }
    };
    Fire_Off = function(target) {
      if (target.fire_ref && target.fire_sync_on) {
        target.fire_ref.off("value", Fire_On_Value_Change, target);
      }
      target.fire_sync_on = false;
      target._has_loaded = false;
    };
    Fire_Sync = function(target) {
      var fire_fn;
      Fire_Off(target);
      fire_fn = target.read_once ? 'once' : 'on';
      target.fire_ref[fire_fn]("value", Fire_On_Value_Change, null, target);
      target.fire_sync_on = !target.read_once;
    };
    Change_Fire_Ref = function(fire_ref, target) {
      if (fire_ref) {
        target.fire_ref = fire_ref;
        Fire_Sync(target);
      } else {
        Fire_Off(target);
        target.fire_ref = false;
      }
    };
    Fire_Write = function(target, value) {
      if (value === void 0) {
        value = null;
      }
      if (!target.read_only && target.fire_ref && target._has_loaded) {
        if (target.read_once || value === null) {
          target(value);
        }
        target.fire_ref.set(value);
      } else {
        target(value);
      }
      return value;
    };
    Once_Loaded = function(target, callback) {
      if (target._has_loaded) {
        return callback(target());
      } else {
        return target._once_loaded.push(callback);
      }
    };
    ko.extenders.fireValue = function(target, options) {
      var new_target, old_dispose, _ref, _ref1;
      target.read_only = (_ref = options.read_only) != null ? _ref : false;
      target.read_once = (_ref1 = options.read_once) != null ? _ref1 : false;
      target.fire_sync_on = false;
      if (target() === void 0) {
        target(null);
      }
      new_target = ko.pureComputed({
        read: target,
        write: function(value) {
          return Fire_Write(target, value);
        }
      });
      new_target.Change_Fire_Ref = function(fire_ref) {
        return Change_Fire_Ref(fire_ref, target);
      };
      new_target.Get_Fire_Ref = function() {
        return target.fire_ref;
      };
      old_dispose = new_target.dispose;
      new_target.dispose = function() {
        target.Fire_Off();
        return old_dispose();
      };
      target._once_loaded = [];
      target._has_loaded = false;
      new_target.Once_Loaded = function(callback) {
        return Once_Loaded(target, callback);
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
