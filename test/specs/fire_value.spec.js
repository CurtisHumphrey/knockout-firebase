(function() {
  define(function(require) {
    var MockFirebase, ko, _;
    ko = require('knockout');
    require('fire_value');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    return describe('Fire Value', function() {
      beforeEach(function() {});
      describe('Exports', function() {
        it('Should add a knockout extender "fireValue" function', function() {
          return expect(_.isFunction(ko.extenders.fireValue)).toBeTruthy();
        });
        it('Should add a knockout function "fireObservable" function', function() {
          return expect(_.isFunction(ko.fireObservable)).toBeTruthy();
        });
        it('Should add a Change_Fire_Ref function to the extended observable', function() {
          var target;
          target = ko.fireObservable(false, {});
          return expect(_.isFunction(target.Change_Fire_Ref)).toBeTruthy();
        });
        it('Should add a Get_Fire_Ref function to the extended observable', function() {
          var target;
          target = ko.fireObservable(false, {});
          return expect(_.isFunction(target.Get_Fire_Ref)).toBeTruthy();
        });
      });
      describe('defaults with no fire_ref', function() {
        var target;
        target = null;
        beforeEach(function() {
          return target = ko.fireObservable(false, {});
        });
        it('Should have a value of null', function() {
          return expect(target()).toBeNull();
        });
        it('Should have a Fire_Ref of false', function() {
          return expect(target.Get_Fire_Ref()).toEqual(false);
        });
        it('Should accept writes', function() {
          target(true);
          return expect(target()).toBeTruthy();
        });
        it('Should protect firebase against undefined be replacing with null', function() {
          target(void 0);
          return expect(target()).toBeNull();
        });
      });
      return describe('Working with a fire_ref', function() {
        var fire_ref, target;
        target = null;
        fire_ref = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          return fire_ref.set({
            key: "test"
          });
        });
        describe('Only Reading Once', function() {
          beforeEach(function() {
            return target = ko.fireObservable(false, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the value "test" from the firebase', function() {
            return expect(target()).toEqual("test");
          });
          it('Should NOT load the next value "next" from the firebase', function() {
            fire_ref.set({
              key: "next"
            });
            return expect(target()).toEqual("test");
          });
          return it('Should NOT save back to firebase', function() {
            target("next");
            expect(fire_ref.child('key').getData()).toEqual("test");
            return expect(target()).toEqual("next");
          });
        });
        describe('Only Reading but always syncing', function() {
          beforeEach(function() {
            return target = ko.fireObservable(false, {
              read_only: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the value "test" from the firebase', function() {
            return expect(target()).toEqual("test");
          });
          it('Should load the next value "next" from the firebase', function() {
            fire_ref.set({
              key: "next"
            });
            return expect(target()).toEqual("next");
          });
          return it('Should NOT save back to firebase', function() {
            target("next");
            expect(fire_ref.child('key').getData()).toEqual("test");
            return expect(target()).toEqual("next");
          });
        });
        describe('Reading Once with writing', function() {
          beforeEach(function() {
            return target = ko.fireObservable(false, {
              read_once: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the value "test" from the firebase', function() {
            return expect(target()).toEqual("test");
          });
          it('Should NOT load the next value "next" from the firebase', function() {
            fire_ref.set({
              key: "next"
            });
            return expect(target()).toEqual("test");
          });
          return it('Should save back to firebase', function() {
            target("next");
            expect(fire_ref.child('key').getData()).toEqual("next");
            return expect(target()).toEqual("next");
          });
        });
        describe('Reading and Writing', function() {
          beforeEach(function() {
            return target = ko.fireObservable(false, {
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the value "test" from the firebase', function() {
            return expect(target()).toEqual("test");
          });
          it('Should load the next value "next" from the firebase', function() {
            fire_ref.set({
              key: "next"
            });
            return expect(target()).toEqual("next");
          });
          return it('Should save back to firebase', function() {
            target("next");
            expect(fire_ref.child('key').getData()).toEqual("next");
            return expect(target()).toEqual("next");
          });
        });
        return describe('Handling non-happy paths', function() {
          beforeEach(function() {
            fire_ref.set({
              key: null
            });
            return target = ko.fireObservable(false, {
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should be able to handle if the location does not exists - returns null', function() {
            return expect(target()).toBeNull();
          });
          it('Should be able to go from null to value from firebase', function() {
            fire_ref.set({
              key: "next"
            });
            return expect(target()).toEqual("next");
          });
          it('Should be able to go from null to value from target', function() {
            target("next");
            expect(fire_ref.child('key').getData()).toEqual("next");
            return expect(target()).toEqual("next");
          });
          return it('Should be able to go from value to null from target', function() {
            target(null);
            expect(fire_ref.child('key').getData()).toBeNull();
            return expect(target()).toBeNull();
          });
        });
      });
    });
  });

}).call(this);
