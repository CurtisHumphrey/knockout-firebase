(function() {
  define(function(require) {
    var Fire_Add, Fire_Add_Make, Fire_Changed, Fire_Dispose, Fire_Find_n_Exec, Fire_Remove, ko;
    ko = require('knockout');
    Fire_Add_Make = function(snapshot) {
      var fire_ref, item, real_ko;
      real_ko = ko.observable(snapshot.val());
      fire_ref = snapshot.ref();
      item = ko.pureComputed({
        read: real_ko,
        write: function(value) {
          if (value === void 0) {
            value = null;
          }
          fire_ref.set(value);
          return value;
        }
      });
      item.write_locally = real_ko;
      item.key = snapshot.key();
      return item;
    };
    Fire_Find_n_Exec = function(target, snapshot, exec_fn) {
      var index, item, _i, _len, _ref;
      _ref = target.peek();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        if (item.key === snapshot.key()) {
          exec_fn(target, snapshot, item, index);
          return;
        }
      }
    };
    Fire_Add = function(target, snapshot, prev_child_key) {
      var index, item, _i, _len, _ref;
      if (prev_child_key) {
        _ref = target.peek();
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          item = _ref[index];
          if (item.key === prev_child_key) {
            target.splice(index + 1, 0, Fire_Add_Make(snapshot));
            return;
          }
        }
      }
      target.push(Fire_Add_Make(snapshot));
    };
    Fire_Changed = function(target, snapshot, item, index) {
      return item(snapshot.val());
    };
    Fire_Remove = function(target, snapshot, item, index) {
      return target.splice(index, 1);
    };
    Fire_Dispose = function(target) {
      var fire_sub, _i, _len, _ref;
      _ref = target._fire_subs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fire_sub = _ref[_i];
        target.fire_ref.off(fire_sub.type, fire_sub.fn);
      }
    };
    ko.extenders.fireList = function(target, options) {
      var fire_ref, last_key, read_once, read_only, _ref, _ref1;
      fire_ref = options.fire_ref;
      read_only = (_ref = options.read_only) != null ? _ref : false;
      read_once = (_ref1 = options.read_once) != null ? _ref1 : false;
      target.fire_ref = fire_ref;
      target._fire_subs = [];
      target.dispose = function() {
        return Fire_Dispose(target);
      };
      last_key = null;
      fire_ref.once("value", function(list_snapshot) {
        var fn, new_list;
        new_list = [];
        list_snapshot.forEach(function(child_snapshot) {
          var item;
          item = Fire_Add_Make(child_snapshot);
          new_list.push(item);
          return last_key = child_snapshot.key();
        });
        target._fire_subs.push({
          type: 'child_removed',
          fn: fire_ref.on('child_removed', function(snapshot) {
            return Fire_Find_n_Exec(target, snapshot, Fire_Remove);
          })
        });
        if (last_key) {
          fn = fire_ref.on('child_added', function(snapshot, prev_child_key) {
            return Fire_Add(target, snapshot, prev_child_key);
          });
        } else {
          fn = fire_ref.on('child_added', function(snapshot, prev_child_key) {
            return Fire_Add(target, snapshot, prev_child_key);
          });
        }
        target._fire_subs.push({
          type: 'child_added',
          fn: fn
        });
        target._fire_subs.push({
          type: 'child_changed',
          fn: fire_ref.on('child_changed', function(snapshot) {
            return Fire_Find_n_Exec(target, snapshot, Fire_Changed);
          })
        });
        return target(new_list);
      });
      return target;
    };
    return ko.fireList = function(options) {
      var target;
      return target = ko.observableArray().extend({
        fireList: options
      });
    };
  });

}).call(this);
