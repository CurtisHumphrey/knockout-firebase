(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
    var Fire_Value, ko;
    ko = require('knockout');
    Fire_Value = (function() {
      function Fire_Value(target, options) {
        this.Once_Loaded = __bind(this.Once_Loaded, this);
        this.Get_Fire_Ref = __bind(this.Get_Fire_Ref, this);
        this.Change_Fire_Ref = __bind(this.Change_Fire_Ref, this);
        this.Fire_Write_Callback = __bind(this.Fire_Write_Callback, this);
        var _ref, _ref1;
        this.read_only = (_ref = options.read_only) != null ? _ref : false;
        this.read_once = (_ref1 = options.read_once) != null ? _ref1 : false;
        this.fire_ref = false;
        this.fire_sync_on = false;
        this._once_loaded = [];
        this._has_loaded = false;
        if (target() === void 0) {
          target(null);
        }
        this.target = target;
      }

      Fire_Value.prototype.Create_New_Target = function(fire_ref) {
        var fire_value, new_target, old_dispose;
        new_target = ko.pureComputed({
          read: this.target,
          write: this.Fire_Write,
          owner: this
        });
        new_target.Change_Fire_Ref = this.Change_Fire_Ref;
        new_target.Get_Fire_Ref = this.Get_Fire_Ref;
        old_dispose = new_target.dispose;
        fire_value = this;
        new_target.dispose = function() {
          fire_value.Fire_Off();
          return old_dispose();
        };
        new_target.Once_Loaded = this.Once_Loaded;
        new_target.Change_Fire_Ref(fire_ref);
        return new_target;
      };

      Fire_Value.prototype.Fire_On_Value_Change = function(snapshot) {
        var callback, value, write_back, _i, _len, _ref;
        write_back = false;
        value = snapshot.val();
        if (value === null && (this.target() !== null || this.target() !== void 0) && !this.read_only) {
          value = this.target();
          write_back = true;
        } else {
          this.target(value);
        }
        this._has_loaded = true;
        if (write_back) {
          this.Fire_Write(value);
        }
        _ref = this._once_loaded;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          callback(value);
        }
        return this._once_loaded.length = 0;
      };

      Fire_Value.prototype.Fire_Off = function() {
        if (this.fire_ref && this.fire_sync_on) {
          this.fire_ref.off("value", this.Fire_On_Value_Change, this);
        }
        this.fire_sync_on = false;
        this._has_loaded = false;
      };

      Fire_Value.prototype.Fire_Sync = function() {
        var fire_fn;
        this.Fire_Off();
        fire_fn = this.read_once ? 'once' : 'on';
        this.fire_ref[fire_fn]("value", this.Fire_On_Value_Change, this.Fire_Error, this);
        this.fire_sync_on = !this.read_once;
      };

      Fire_Value.prototype.Fire_Error = function(error) {
        return console.log(error);
      };

      Fire_Value.prototype.Fire_Write_Callback = function(error) {
        if (!error) {
          return;
        }
        this.Fire_Error(error);
        return this.read_only = true;
      };

      Fire_Value.prototype.Fire_Write = function(value) {
        if (value === void 0) {
          value = null;
        }
        if (!this.read_only && this.fire_ref && this._has_loaded) {
          if (this.read_once || value === null) {
            this.target(value);
          }
          this.fire_ref.set(value, this.Fire_Write_Callback);
        } else {
          this.target(value);
        }
        return value;
      };

      Fire_Value.prototype.Change_Fire_Ref = function(fire_ref, default_value, callback) {
        if (fire_ref) {
          if (callback) {
            this._once_loaded.push(callback);
          }
          this.fire_ref = fire_ref;
          if (default_value != null) {
            this.target(default_value);
          }
          this.Fire_Sync();
        } else {
          this.Fire_Off();
          this.fire_ref = false;
          if (default_value != null) {
            this.target(default_value);
          }
        }
      };

      Fire_Value.prototype.Get_Fire_Ref = function() {
        return this.fire_ref;
      };

      Fire_Value.prototype.Once_Loaded = function(callback) {
        if (this._has_loaded) {
          callback(this.target());
        } else {
          this._once_loaded.push(callback);
        }
      };

      return Fire_Value;

    })();
    ko.extenders.fireValue = function(target, options) {
      var fire_value;
      fire_value = new Fire_Value(target, options);
      return fire_value.Create_New_Target(options.fire_ref);
    };
    ko.fireObservable = function(init_val, options) {
      var target;
      return target = ko.observable(init_val).extend({
        fireValue: options
      });
    };
    return ko.fireValue = ko.fireObservable;
  });

}).call(this);
