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
        it('Should add a Once_Loaded function to the extended observable', function() {
          var target;
          target = ko.fireObservable(false, {});
          console.log(target);
          return expect(_.isFunction(target.Once_Loaded)).toBeTruthy();
        });
      });
      describe('defaults with no fire_ref', function() {
        var target;
        target = null;
        beforeEach(function() {
          return target = ko.fireObservable("start", {});
        });
        it('Should have the initial value', function() {
          return expect(target()).toEqual("start");
        });
        it('Should have a Fire_Ref of false', function() {
          return expect(target.Get_Fire_Ref()).toEqual(false);
        });
        it('Should accept writes', function() {
          target(true);
          return expect(target()).toBeTruthy();
        });
        it('Should protect firebase against undefined be replacing with null', function() {
          var target1;
          target(void 0);
          expect(target()).toBeNull();
          target1 = ko.observable();
          target1.extend({
            fireValue: {}
          });
          return expect(target1()).toBeNull();
        });
      });
      describe('Working with Once Loaded', function() {
        var fire_ref, obj, target;
        fire_ref = null;
        obj = null;
        target = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.set({
            key: "test"
          });
          fire_ref.flush();
          obj = {
            callback: function() {}
          };
          spyOn(obj, 'callback');
          return target = ko.fireObservable(false, {
            read_only: true,
            read_once: true,
            fire_ref: fire_ref.child('key')
          });
        });
        it('Should call back a function after it has loaded values', function() {
          target.Once_Loaded(obj.callback);
          expect(obj.callback).not.toHaveBeenCalled();
          fire_ref.flush();
          return expect(obj.callback).toHaveBeenCalledWith("test");
        });
        return it('Should call back right way if the values are already loaded', function() {
          fire_ref.flush();
          target.Once_Loaded(obj.callback);
          return expect(obj.callback).toHaveBeenCalledWith("test");
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
        describe('Writing with initial value', function() {
          beforeEach(function() {
            return target = ko.fireObservable("starting value", {
              fire_ref: fire_ref.child('key2')
            });
          });
          it('Should not reset the initial value if the firebase has no record', function() {
            return expect(target()).toEqual("starting value");
          });
          return it('Should update firebase with the inital value if firebase has no record', function() {
            return expect(fire_ref.child('key2').getData()).toEqual("starting value");
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
            console.log(fire_ref.getData());
            target(null);
            console.log(fire_ref.getData());
            expect(fire_ref.child('key').getData()).toBeNull();
            return expect(target()).toBeNull();
          });
        });
      });
    });
  });

}).call(this);
