(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
    var Fire_List, ko;
    ko = require('knockout');
    Fire_List = (function() {
      function Fire_List(target, options) {
        this.Fire_Write_Callback = __bind(this.Fire_Write_Callback, this);
        this.Fire_Change_Ref = __bind(this.Fire_Change_Ref, this);
        var method, _i, _len, _ref, _ref1;
        this.fire_ref = options.fire_ref;
        this.keys_inits = options.keys_inits;
        this.read_only = (_ref = options.read_only) != null ? _ref : false;
        this.target = target;
        this.target._class = this;
        this._fire_subs = [];
        this.target.dispose = this.Fire_Dispose;
        this.target.Change_Fire_Ref = this.Fire_Change_Ref;
        this._push = this.target.push;
        this.target.push = this.Ko_Push;
        this.target.remove = this.Ko_Remove;
        this._splice = this.target.splice;
        this.target.splice = this.Ko_Splice;
        this.target.pop = this.Ko_Pop;
        this.target.shift = this.Ko_Shift;
        _ref1 = ['unshift', 'reverse', 'sort', 'removeAll', 'destroy', 'destroyAll'];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          method = _ref1[_i];
          this.target[method] = this.Ko_No_Supported;
        }
        this.Fire_Change_Ref(this.fire_ref);
      }

      Fire_List.prototype.Create_New_Target = function() {
        return this.target;
      };

      Fire_List.prototype.Fire_Error = function(error) {
        return console.log(error);
      };

      Fire_List.prototype.Fire_Change_Ref = function(fire_ref) {
        var fire_sub, _i, _len, _ref;
        _ref = this._fire_subs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fire_sub = _ref[_i];
          this.fire_ref.off(fire_sub.type, fire_sub.fn, this.target);
        }
        this._fire_subs = [];
        this.target([]);
        if (fire_ref) {
          this.fire_ref = fire_ref;
          return this.fire_ref.once("value", this.Fire_Load, this.Fire_Error, this);
        } else {
          return this.fire_ref = false;
        }
      };

      Fire_List.prototype.Fire_Write_Callback = function(error) {
        if (!error) {
          return;
        }
        this.Fire_Error(error);
        return this.read_only = true;
      };

      Fire_List.prototype.Fire_Add_Make = function(snapshot) {
        var init, item, key, model_obj, real_ko, val, _ref;
        model_obj = {};
        model_obj._key = snapshot.key();
        model_obj._ref = snapshot.ref();
        _ref = this.keys_inits;
        for (key in _ref) {
          init = _ref[key];
          val = snapshot.child(key).val();
          real_ko = ko.observable(val != null ? val : init);
          item = ko.pureComputed({
            read: real_ko,
            write: function(value) {
              console.log("read_only:" + this.read_only);
              if (this.read_only) {
                return real_ko();
              } else {
                if (value === void 0) {
                  value = null;
                }
                model_obj._ref.child(key).set(value, this.Fire_Write_Callback);
                return value;
              }
            },
            owner: this
          });
          item.write_locally = real_ko;
          model_obj[key] = item;
        }
        return model_obj;
      };

      Fire_List.prototype.Fire_Find_n_Exec = function(snapshot, exec_fn) {
        var index, item, _i, _len, _ref;
        _ref = this.target.peek();
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          item = _ref[index];
          if (item._key === snapshot.key()) {
            exec_fn.call(this, snapshot, item, index);
            return;
          }
        }
      };

      Fire_List.prototype.Fire_Add = function(snapshot, prev_child_key) {
        var index, item, _i, _len, _ref, _ref1;
        _ref = this.target.peek();
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          item = _ref[index];
          if (prev_child_key && item._key === prev_child_key) {
            if (((_ref1 = _ref[index + 1]) != null ? _ref1._key : void 0) === snapshot.key()) {
              return;
            }
            this._splice.call(this.target, index + 1, 0, this.Fire_Add_Make(snapshot));
            return;
          }
          if (item._key === snapshot.key()) {
            return;
          }
        }
        this._push.call(this.target, this.Fire_Add_Make(snapshot));
      };

      Fire_List.prototype._Fire_Changed = function(snapshot, model_obj, index) {
        var key, value;
        for (key in this.keys_inits) {
          value = snapshot.child(key).val();
          if (value === null && (this.target() !== null && this.target() !== void 0) && !this.read_only) {
            model_obj[key](model_obj[key]());
          } else if (value !== null) {
            model_obj[key].write_locally(value);
          }
        }
      };

      Fire_List.prototype.Fire_Changed = function(snapshot) {
        return this.Fire_Find_n_Exec(snapshot, this._Fire_Changed);
      };

      Fire_List.prototype._Fire_Remove = function(snapshot, item, index) {
        return this._splice.call(this.target, index, 1);
      };

      Fire_List.prototype.Fire_Remove = function(snapshot) {
        return this.Fire_Find_n_Exec(snapshot, this._Fire_Remove);
      };

      Fire_List.prototype.Fire_Dispose = function() {
        var fire_sub, _i, _len, _ref;
        _ref = this._class._fire_subs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fire_sub = _ref[_i];
          this._class.fire_ref.off(fire_sub.type, fire_sub.fn, this._class);
        }
        this._class = void 0;
      };

      Fire_List.prototype.Ko_Push = function(item) {
        if (!this._class.fire_ref) {
          throw new Error("pushed without a fire_ref set");
          return;
        }
        return this._class.fire_ref.push(ko.toJS(item));
      };

      Fire_List.prototype.Ko_Remove = function(item) {
        var index;
        index = this.indexOf(item);
        if (index === -1) {
          return;
        }
        return this.splice(index, 1);
      };

      Fire_List.prototype.Ko_Splice = function(index, count) {
        var i, list, _i, _ref;
        if (!this._class.fire_ref) {
          throw new Error("spliced without a fire_ref set");
          return;
        }
        list = this.peek();
        for (i = _i = index, _ref = index + count - 1; index <= _ref ? _i <= _ref : _i >= _ref; i = index <= _ref ? ++_i : --_i) {
          if (list[i]) {
            list[i]._ref.remove();
          }
        }
      };

      Fire_List.prototype.Ko_Pop = function() {
        return this.splice(this.peek().length - 1, 1);
      };

      Fire_List.prototype.Ko_Shift = function() {
        return this.splice(0, 1);
      };

      Fire_List.prototype.Ko_No_Supported = function() {
        throw new Error('ko method called is not currently implemented for fire lists');
      };

      Fire_List.prototype.Fire_Load = function(list_snapshot) {
        var fn, last_key, new_list, self;
        new_list = [];
        last_key = null;
        self = this;
        list_snapshot.forEach(function(child_snapshot) {
          new_list.push(self.Fire_Add_Make(child_snapshot));
          return last_key = child_snapshot.key();
        });
        this.target(new_list);
        this._fire_subs.push({
          type: 'child_removed',
          fn: this.fire_ref.on('child_removed', this.Fire_Remove, this.Fire_Error, this)
        });
        if (last_key) {
          fn = this.fire_ref.startAt(null, last_key).on('child_added', this.Fire_Add, this.Fire_Error, this);
        } else {
          fn = this.fire_ref.on('child_added', this.Fire_Add, this.Fire_Error, this);
        }
        this._fire_subs.push({
          type: 'child_added',
          fn: fn
        });
        this._fire_subs.push({
          type: 'child_changed',
          fn: this.fire_ref.on('child_changed', this.Fire_Changed, this.Fire_Error, this)
        });
      };

      return Fire_List;

    })();
    ko.extenders.fireList = function(target, options) {
      var fire_list;
      fire_list = new Fire_List(target, options);
      return fire_list.Create_New_Target();
    };
    return ko.fireList = function(options) {
      var target;
      return target = ko.observableArray([]).extend({
        fireList: options
      });
    };
  });

}).call(this);
