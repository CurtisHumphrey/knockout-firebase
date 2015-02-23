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
          fire_ref.child('key').push('apples');
          return last_ref = fire_ref.child('key').push('oranges');
        });
        describe('Reading from firebase', function() {
          beforeEach(function() {
            return target = ko.fireList({
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the 2 values from the firebase', function() {
            return expect(target().length).toEqual(2);
          });
          it('Should have each value be an observable', function() {
            expect(ko.isObservable(target()[0])).toBeTruthy();
            return expect(ko.isObservable(target()[1])).toBeTruthy();
          });
          it('Should have each value be from firebase', function() {
            expect(target()[0]()).toBe('apples');
            return expect(target()[1]()).toBe('oranges');
          });
          it('Should load the next value "pears" from the firebase', function() {
            fire_ref.child('key').push('pears');
            console.log(fire_ref.getData());
            return expect(target()[2]()).toEqual('pears');
          });
          it('Should update value when firebase changes', function() {
            last_ref.set('grapes');
            return expect(target()[1]()).toEqual('grapes');
          });
          return it('Should remove value when firebase changes', function() {
            last_ref.remove();
            return expect(target().length).toEqual(1);
          });
        });
        describe('Writing to firebase', function() {
          beforeEach(function() {
            return target = ko.fireList({
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should write value to firebase and ko', function() {
            target()[1]("grapes");
            expect(last_ref.getData()).toEqual("grapes");
            return expect(target()[1]()).toEqual("grapes");
          });
          it('Should add (push) a value to firebase and ko', function() {
            var data, lastKey;
            target.push("grapes");
            data = fire_ref.child('key').getData();
            lastKey = _.last(_.keys(data).sort());
            expect(data[lastKey]).toEqual("grapes");
            return expect(target()[2]()).toEqual("grapes");
          });
          it('Should remove a value (pop) to firebase and ko', function() {
            var data, lastKey;
            target.pop();
            expect(_.keys(fire_ref.child('key').getData()).length).toEqual(1);
            expect(target().length).toEqual(1);
            data = fire_ref.child('key').getData();
            lastKey = _.last(_.keys(data).sort());
            return expect(data[lastKey]).not.toEqual("oranges");
          });
          return it('Should remove a value (shift) to firebase and ko', function() {
            var data, firstKey;
            target.shift();
            expect(_.keys(fire_ref.child('key').getData()).length).toEqual(1);
            expect(target().length).toEqual(1);
            data = fire_ref.child('key').getData();
            firstKey = _.first(_.keys(data).sort());
            return expect(data[firstKey]).not.toEqual("apples");
          });
        });
      });
    });
  });

}).call(this);
