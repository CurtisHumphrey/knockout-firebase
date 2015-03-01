(function() {
  define('fire_list',['require','knockout'],function(require) {
    var Fire_Add, Fire_Add_Make, Fire_Changed, Fire_Dispose, Fire_Find_n_Exec, Fire_Load, Fire_Remove, Ko_No_Supported, Ko_Pop, Ko_Push, Ko_Remove, Ko_Shift, Ko_Splice, ko, _Fire_Changed, _Fire_Remove;
    ko = require('knockout');
    Fire_Add_Make = function(snapshot, options) {
      var fire_ref, init, item, key, model_obj, real_ko, val, _ref;
      if (options.read_only == null) {
        options.read_only = false;
      }
      model_obj = {};
      model_obj._key = snapshot.key();
      fire_ref = snapshot.ref();
      _ref = options.keys_inits;
      for (key in _ref) {
        init = _ref[key];
        val = snapshot.child(key).val();
        real_ko = ko.observable(val != null ? val : init);
        item = ko.pureComputed({
          read: real_ko,
          write: function(value) {
            if (value === void 0) {
              value = null;
            }
            fire_ref.child(key).set(value);
            return value;
          }
        });
        item.write_locally = real_ko;
        model_obj[key] = item;
      }
      return model_obj;
    };
    Fire_Find_n_Exec = function(target, snapshot, exec_fn) {
      var index, item, _i, _len, _ref;
      _ref = target.peek();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        if (item._key === snapshot.key()) {
          exec_fn(target, snapshot, item, index);
          return;
        }
      }
    };
    Fire_Add = function(snapshot, prev_child_key) {
      var index, item, _i, _len, _ref, _ref1;
      _ref = this.peek();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        if (prev_child_key && item._key === prev_child_key) {
          if (((_ref1 = _ref[index + 1]) != null ? _ref1._key : void 0) === snapshot.key()) {
            return;
          }
          this._splice(index + 1, 0, Fire_Add_Make(snapshot, this));
          return;
        }
        if (item._key === snapshot.key()) {
          return;
        }
      }
      this._push(Fire_Add_Make(snapshot, this));
    };
    _Fire_Changed = function(target, snapshot, model_obj, index) {
      var key;
      for (key in target.keys_inits) {
        model_obj[key].write_locally(snapshot.child(key).val());
      }
    };
    Fire_Changed = function(snapshot) {
      return Fire_Find_n_Exec(this, snapshot, _Fire_Changed);
    };
    _Fire_Remove = function(target, snapshot, item, index) {
      return target._splice(index, 1);
    };
    Fire_Remove = function(snapshot) {
      return Fire_Find_n_Exec(this, snapshot, _Fire_Remove);
    };
    Fire_Dispose = function() {
      var fire_sub, _i, _len, _ref;
      _ref = this._fire_subs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fire_sub = _ref[_i];
        this.fire_ref.off(fire_sub.type, fire_sub.fn, this);
      }
    };
    Ko_Push = function(item) {
      return this.fire_ref.push(ko.toJS(item));
    };
    Ko_Remove = function(item) {
      var index;
      index = this.indexOf(item);
      if (index === -1) {
        return;
      }
      return this.splice(index, 1);
    };
    Ko_Splice = function(index, count) {
      var i, list, _i, _ref;
      list = this.peek();
      for (i = _i = index, _ref = index + count - 1; index <= _ref ? _i <= _ref : _i >= _ref; i = index <= _ref ? ++_i : --_i) {
        if (list[i]) {
          this.fire_ref.child(list[i]._key).remove();
        }
      }
    };
    Ko_Pop = function() {
      return this.splice(this.peek().length - 1, 1);
    };
    Ko_Shift = function() {
      return this.splice(0, 1);
    };
    Ko_No_Supported = function() {
      throw new Error('ko method called is not currently implemented for fire lists');
    };
    Fire_Load = function(list_snapshot) {
      var fn, last_key, new_list, target;
      new_list = [];
      last_key = null;
      target = this;
      list_snapshot.forEach(function(child_snapshot) {
        new_list.push(Fire_Add_Make(child_snapshot, target));
        return last_key = child_snapshot.key();
      });
      target._fire_subs.push({
        type: 'child_removed',
        fn: target.fire_ref.on('child_removed', Fire_Remove, void 0, target)
      });
      if (last_key) {
        fn = target.fire_ref.startAt(null, last_key).on('child_added', Fire_Add, void 0, target);
      } else {
        fn = target.fire_ref.on('child_added', Fire_Add, void 0, target);
      }
      target._fire_subs.push({
        type: 'child_added',
        fn: fn
      });
      target._fire_subs.push({
        type: 'child_changed',
        fn: target.fire_ref.on('child_changed', Fire_Changed, void 0, target)
      });
      return target(new_list);
    };
    ko.extenders.fireList = function(target, options) {
      var fire_ref, method, _i, _len, _ref, _ref1;
      fire_ref = options.fire_ref;
      target.keys_inits = options.keys_inits;
      target.read_only = (_ref = options.read_only) != null ? _ref : false;
      target.fire_ref = fire_ref;
      target._fire_subs = [];
      target.dispose = Fire_Dispose;
      target._push = target.push;
      target.push = Ko_Push;
      target._remove = target.remove;
      target.remove = Ko_Remove;
      target._splice = target.splice;
      target.splice = Ko_Splice;
      target.pop = Ko_Pop;
      target.shift = Ko_Shift;
      _ref1 = ['unshift', 'reverse', 'sort', 'removeAll', 'destroy', 'destroyAll'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        method = _ref1[_i];
        target[method] = Ko_No_Supported;
      }
      fire_ref.once("value", Fire_Load, void 0, target);
      return target;
    };
    return ko.fireList = function(options) {
      var target;
      return target = ko.observableArray([]).extend({
        fireList: options
      });
    };
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define('fire_value',['require','knockout'],function(require) {
    var Fire_Value, ko;
    ko = require('knockout');
    Fire_Value = (function() {
      function Fire_Value(target, options) {
        this.Once_Loaded = __bind(this.Once_Loaded, this);
        this.Get_Fire_Ref = __bind(this.Get_Fire_Ref, this);
        this.Change_Fire_Ref = __bind(this.Change_Fire_Ref, this);
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
        if (value === null && this.target() === null) {

        } else if (value === null && !this.read_only) {
          value = this.target();
          write_back = true;
        } else {
          this.target(value);
        }
        _ref = this._once_loaded;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          callback(value);
        }
        this._once_loaded.length = 0;
        this._has_loaded = true;
        if (write_back) {
          return this.Fire_Write(value);
        }
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

      Fire_Value.prototype.Fire_Write = function(value) {
        if (value === void 0) {
          value = null;
        }
        if (!this.read_only && this.fire_ref && this._has_loaded) {
          if (this.read_once || value === null) {
            this.target(value);
          }
          this.fire_ref.set(value);
        } else {
          this.target(value);
        }
        return value;
      };

      Fire_Value.prototype.Change_Fire_Ref = function(fire_ref) {
        if (fire_ref) {
          this.fire_ref = fire_ref;
          this.Fire_Sync();
        } else {
          this.Fire_Off();
          this.fire_ref = false;
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

(function() {
  define('fire_model',['require','knockout','fire_value'],function(require) {
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

(function() {
  define('fire_model_by_ref',['require','knockout','fire_model'],function(require) {
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
            return;
          }
          ref = fire_ref.child(id);
          if (child_path) {
            ref = ref.child(child_path);
          }
          target.Change_Fire_Ref(ref.child(key));
        }
      };
      ref_obs_id.subscribe(id_changed);
      id_changed(ref_obs_id());
      return model_obj;
    };
  });

}).call(this);

(function() {
  define('fire_value_by_ref',['require','knockout','fire_value'],function(require) {
    var ko;
    ko = require('knockout');
    require('fire_value');
    ko.extenders.fireValueByRef = function(target, options) {
      var child_path, fire_ref, ref_obs_id, _ref, _ref1, _ref2;
      fire_ref = (_ref = options.fire_ref) != null ? _ref : console.error('requires a firebase ref as fire_ref');
      ref_obs_id = (_ref1 = options.ref_obs_id) != null ? _ref1 : console.error('requires a observable as ref_obs_id');
      child_path = (_ref2 = options.child_path) != null ? _ref2 : '';
      options.fire_ref = false;
      target = target.extend({
        fireValue: options
      });
      ref_obs_id.subscribe(function(id) {
        var ref;
        if (id == null) {
          target.Change_Fire_Ref(false);
          return;
        }
        ref = fire_ref.child(id);
        if (child_path) {
          ref = ref.child(child_path);
        }
        return target.Change_Fire_Ref(ref);
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

(function() {
  define('knockout_firebase',['require','fire_list','fire_model','fire_model_by_ref','fire_value','fire_value_by_ref'],function(require) {
    require('fire_list');
    require('fire_model');
    require('fire_model_by_ref');
    require('fire_value');
    return require('fire_value_by_ref');
  });

}).call(this);

