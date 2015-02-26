(function() {
  define(function(require) {
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
