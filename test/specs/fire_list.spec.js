(function() {
  define(function(require) {
    var MockFirebase, ko, _;
    ko = require('knockout');
    require('fire_list');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    return describe('Fire List', function() {
      beforeEach(function() {});
      describe('Exports', function() {
        it('Should add a knockout extender "fireList" function', function() {
          return expect(_.isFunction(ko.extenders.fireList)).toBeTruthy();
        });
        it('Should add a knockout function "fireList" function', function() {
          return expect(_.isFunction(ko.fireList)).toBeTruthy();
        });
        it('Should add a dispose function to the extended observable', function() {
          var fire_ref, target;
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          target = ko.fireList({
            fire_ref: fire_ref
          });
          return expect(_.isFunction(target.dispose)).toBeTruthy();
        });
      });
      describe('Working with a fire_ref', function() {
        var fire_ref, last_ref, target;
        target = null;
        fire_ref = null;
        last_ref = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          fire_ref.child('fruit').push({
            type: 'apples',
            count: 3
          });
          last_ref = fire_ref.child('fruit').push({
            type: 'oranges',
            count: 4
          });
          return target = ko.fireList({
            fire_ref: fire_ref.child('fruit'),
            keys_inits: {
              type: null,
              count: 0
            }
          });
        });
        describe('Reading from firebase', function() {
          beforeEach(function() {});
          it('Should load the 2 values from the firebase', function() {
            return expect(target().length).toEqual(2);
          });
          it('Should have each value be an observable', function() {
            expect(ko.isObservable(target()[0].type)).toBeTruthy();
            return expect(ko.isObservable(target()[0].count)).toBeTruthy();
          });
          it('Should have each value be from firebase', function() {
            expect(target()[0].type()).toBe('apples');
            return expect(target()[1].type()).toBe('oranges');
          });
          it('Should load the next model "pears" from the firebase', function() {
            fire_ref.child('fruit').push({
              type: 'pears',
              count: 11
            });
            return expect(target()[2].type()).toEqual('pears');
          });
          it('Should notify watchers', function() {
            var watcher;
            watcher = ko.computed(function() {
              var model, result, _i, _len, _ref;
              result = [];
              _ref = target();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                model = _ref[_i];
                result.push(model);
              }
              return result;
            });
            console.log(watcher());
            fire_ref.child('fruit').push({
              type: 'pears',
              count: 11
            });
            console.log(watcher());
            return expect(watcher().length).toEqual(3);
          });
          it('Should update value when firebase changes', function() {
            last_ref.set({
              type: 'grapes',
              count: 7
            });
            expect(target()[1].type()).toEqual('grapes');
            return expect(target()[1].count()).toEqual(7);
          });
          return it('Should remove value when firebase changes', function() {
            last_ref.remove();
            return expect(target().length).toEqual(1);
          });
        });
        describe('Writing to firebase', function() {
          beforeEach(function() {});
          it('Should write value to firebase and ko', function() {
            target()[1].count(2);
            expect(last_ref.child('count').getData()).toEqual(2);
            return expect(target()[1].count()).toEqual(2);
          });
          it('Should add (push) a value to firebase and ko', function() {
            var data, lastKey;
            target.push({
              type: "grapes",
              count: 2
            });
            data = fire_ref.child('fruit').getData();
            lastKey = _.last(_.keys(data).sort());
            expect(data[lastKey].type).toEqual("grapes");
            expect(data[lastKey].count).toEqual(2);
            expect(target()[2].type()).toEqual("grapes");
            return expect(target()[2].count()).toEqual(2);
          });
          it('Should remove a value (pop) to firebase and ko', function() {
            var data, lastKey;
            target.pop();
            expect(_.keys(fire_ref.child('fruit').getData()).length).toEqual(1);
            expect(target().length).toEqual(1);
            data = fire_ref.child('fruit').getData();
            lastKey = _.last(_.keys(data).sort());
            return expect(data[lastKey].type).not.toEqual("oranges");
          });
          return it('Should remove a value (shift) to firebase and ko', function() {
            var data, firstKey;
            target.shift();
            expect(_.keys(fire_ref.child('fruit').getData()).length).toEqual(1);
            expect(target().length).toEqual(1);
            data = fire_ref.child('fruit').getData();
            firstKey = _.first(_.keys(data).sort());
            return expect(data[firstKey].type).not.toEqual("apples");
          });
        });
      });
    });
  });

}).call(this);
