(function() {
  define(function(require) {
    var MockFirebase, ko, _;
    ko = require('knockout');
    require('fire_model');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    return describe('Fire Model', function() {
      var model;
      model = null;
      beforeEach(function() {
        return model = {
          apples: ko.observable(1),
          oranges: ko.observable(2)
        };
      });
      describe('Exports', function() {
        it('Should add a knockout function "fireModel" function', function() {
          return expect(_.isFunction(ko.fireModel)).toBeTruthy();
        });
      });
      describe('defaults with no fire_ref', function() {
        var target;
        target = null;
        beforeEach(function() {});
        it('Should have values to be inits', function() {
          target = ko.fireModel({}, {
            apples: 11,
            oranges: 12
          }, {});
          expect(target.apples()).toEqual(11);
          return expect(target.oranges()).toEqual(12);
        });
        it('Should be able to use a model with observables already', function() {
          2;
          target = ko.fireModel(model, model, {});
          expect(target.apples()).toEqual(1);
          return expect(target.oranges()).toEqual(2);
        });
      });
      return describe('Working with a fire_ref', function() {
        var fire_ref;
        fire_ref = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          return fire_ref.set({
            key: {
              apples: 21,
              oranges: 22
            }
          });
        });
        describe('Only Reading Once', function() {
          beforeEach(function() {
            return model = ko.fireModel(model, model, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the values from the firebase', function() {
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          it('Should NOT load the next values from the firebase', function() {
            fire_ref.set;
            ({
              key: {
                apples: 31,
                oranges: 32
              }
            });
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          return it('Should NOT save back to firebase', function() {
            model.apples(200);
            expect(fire_ref.child('key/apples').getData()).toEqual(21);
            return expect(model.apples()).toEqual(200);
          });
        });
        describe('Only Reading but always syncing', function() {
          beforeEach(function() {
            return model = ko.fireModel(model, model, {
              read_only: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the values from the firebase', function() {
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          it('Should load the next values from the firebase', function() {
            fire_ref.set({
              key: {
                apples: 31,
                oranges: 32
              }
            });
            expect(model.apples()).toEqual(31);
            return expect(model.oranges()).toEqual(32);
          });
          return it('Should NOT save back to firebase', function() {
            model.apples(200);
            expect(fire_ref.child('key/apples').getData()).toEqual(21);
            return expect(model.apples()).toEqual(200);
          });
        });
        describe('Reading Once with writing', function() {
          beforeEach(function() {
            return model = ko.fireModel(model, model, {
              read_once: true,
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the values from the firebase', function() {
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          it('Should NOT load the next values from the firebase', function() {
            fire_ref.set({
              key: {
                apples: 31,
                oranges: 32
              }
            });
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          return it('Should save back to firebase', function() {
            model.apples(200);
            expect(fire_ref.child('key/apples').getData()).toEqual(200);
            return expect(model.apples()).toEqual(200);
          });
        });
        return describe('Reading and Writing', function() {
          beforeEach(function() {
            return model = ko.fireModel(model, model, {
              fire_ref: fire_ref.child('key')
            });
          });
          it('Should load the values from the firebase', function() {
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          it('Should load the next values from the firebase', function() {
            fire_ref.set({
              key: {
                apples: 31,
                oranges: 32
              }
            });
            expect(model.apples()).toEqual(31);
            return expect(model.oranges()).toEqual(32);
          });
          return it('Should save back to firebase', function() {
            model.apples(200);
            expect(fire_ref.child('key/apples').getData()).toEqual(200);
            return expect(model.apples()).toEqual(200);
          });
        });
      });
    });
  });

}).call(this);
