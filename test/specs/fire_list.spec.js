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
        var fire_ref, target;
        target = null;
        fire_ref = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          fire_ref.child('key').push('apples');
          return fire_ref.child('key').push('oranges');
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
          it('Should have each value be an from firebase', function() {
            expect(target()[0]()).toBe('apples');
            return expect(target()[1]()).toBe('oranges');
          });
          it('Should load the next value "pears" from the firebase', function() {
            fire_ref.child('key').once('value', function(snapshot) {
              return console.log(snapshot.val());
            });
            fire_ref.child('key').push('pears');
            fire_ref.child('key').push('pears');
            fire_ref.child('key').push('pears');
            fire_ref.child('key').once('value', function(snapshot) {
              return console.log(snapshot.val());
            });
            console.log(target());
            return expect(target()[2]()).toEqual('pears');
          });
          return xit('Should update value from firebase', function() {
            fire_ref.child('key').limitToLast(1).once('value', function(snapshot) {
              return snapshot.ref().update('grapes');
            });
            return expect(target()[1]()).toEqual('grapes');
          });
        });
      });
    });
  });

}).call(this);
