(function() {
  define(function(require) {
    var MockFirebase, ko, _;
    ko = require('knockout');
    require('fire_model_by_ref');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    return describe('Fire Model By Reference', function() {
      var model;
      model = null;
      beforeEach(function() {
        return model = {
          apples: ko.observable(1),
          oranges: ko.observable(2)
        };
      });
      describe('Exports', function() {
        it('Should add a knockout function "fireModelByRef" function', function() {
          return expect(_.isFunction(ko.fireModelByRef)).toBeTruthy();
        });
      });
      describe('Working with a fire_ref', function() {
        var fire_ref, obs_id;
        fire_ref = null;
        obs_id = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          fire_ref.set({
            user_1: {
              apples: 21,
              oranges: 22,
              fruit: {
                apples: 221,
                oranges: 222
              }
            },
            user_2: {
              apples: 31,
              oranges: 32,
              fruit: {
                apples: 331,
                oranges: 332
              }
            }
          });
          return obs_id = ko.observable();
        });
        describe('Setup with a key already set', function() {
          beforeEach(function() {
            obs_id = ko.observable('user_1');
            return ko.fireModelByRef(model, model, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref,
              ref_obs_id: obs_id
            });
          });
          return it('Should load values for user_1', function() {
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
        });
        describe('Switching without a child_path', function() {
          beforeEach(function() {
            return ko.fireModelByRef(model, model, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref,
              ref_obs_id: obs_id
            });
          });
          it('Should have only default value', function() {
            expect(model.apples()).toEqual(1);
            return expect(model.oranges()).toEqual(2);
          });
          it('When switch to user_1 it should load values', function() {
            obs_id('user_1');
            expect(model.apples()).toEqual(21);
            return expect(model.oranges()).toEqual(22);
          });
          it('When switch to user_1 then user_2 it should load values', function() {
            obs_id('user_1');
            expect(model.apples()).toEqual(21);
            expect(model.oranges()).toEqual(22);
            obs_id('user_2');
            expect(model.apples()).toEqual(31);
            return expect(model.oranges()).toEqual(32);
          });
          return it('When switch to user_3 it should load null', function() {
            obs_id('user_3');
            expect(model.apples()).toBeNull();
            return expect(model.oranges()).toBeNull();
          });
        });
        return describe('Switching with a child_path', function() {
          beforeEach(function() {
            return ko.fireModelByRef(model, model, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref,
              ref_obs_id: obs_id,
              child_path: 'fruit'
            });
          });
          it('Should have only default value', function() {
            expect(model.apples()).toEqual(1);
            return expect(model.oranges()).toEqual(2);
          });
          it('When switch to user_1 it should load values', function() {
            obs_id('user_1');
            expect(model.apples()).toEqual(221);
            return expect(model.oranges()).toEqual(222);
          });
          it('When switch to user_1 then user_2 it should load values', function() {
            obs_id('user_1');
            expect(model.apples()).toEqual(221);
            expect(model.oranges()).toEqual(222);
            obs_id('user_2');
            expect(model.apples()).toEqual(331);
            return expect(model.oranges()).toEqual(332);
          });
          return it('When switch to user_3 it should load null', function() {
            obs_id('user_3');
            expect(model.apples()).toBeNull();
            return expect(model.oranges()).toBeNull();
          });
        });
      });
    });
  });

}).call(this);
