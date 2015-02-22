(function() {
  define(function(require) {
    var MockFirebase, ko, _;
    ko = require('knockout');
    require('fire_value_by_ref');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    return describe('Fire Value By Reference', function() {
      beforeEach(function() {});
      describe('Exports', function() {
        it('Should add a knockout extender "fireValueByRef" function', function() {
          return expect(_.isFunction(ko.extenders.fireValueByRef)).toBeTruthy();
        });
        it('Should add a knockout function "fireValueByRef" function', function() {
          return expect(_.isFunction(ko.fireValueByRef)).toBeTruthy();
        });
      });
      describe('Working with a fire_ref', function() {
        var fire_ref, obs_id, target;
        target = null;
        fire_ref = null;
        obs_id = null;
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          fire_ref.set({
            apples: 21,
            oranges: 22,
            fruit: {
              apples: {
                count: 31
              },
              oranges: {
                count: 32
              }
            }
          });
          return obs_id = ko.observable();
        });
        describe('Switching without a child_path', function() {
          beforeEach(function() {
            return target = ko.fireValueByRef(false, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref,
              ref_obs_id: obs_id
            });
          });
          it('Should have only default value', function() {
            return expect(target()).toEqual(false);
          });
          it('When switch to apples it should load value', function() {
            obs_id('apples');
            return expect(target()).toEqual(21);
          });
          it('When switch to apples next oranges it should load value', function() {
            obs_id('apples');
            expect(target()).toEqual(21);
            obs_id('oranges');
            return expect(target()).toEqual(22);
          });
          return it('When switch to pears it should load null', function() {
            obs_id('pears');
            return expect(target()).toBeNull();
          });
        });
        return describe('Switching with a child_path', function() {
          beforeEach(function() {
            return target = ko.fireValueByRef(false, {
              read_only: true,
              read_once: true,
              fire_ref: fire_ref.child('fruit'),
              ref_obs_id: obs_id,
              child_path: 'count'
            });
          });
          it('Should have only default value', function() {
            return expect(target()).toEqual(false);
          });
          it('When switch to apples it should load value', function() {
            obs_id('apples');
            return expect(target()).toEqual(31);
          });
          it('When switch to apples next oranges it should load value', function() {
            obs_id('apples');
            expect(target()).toEqual(31);
            obs_id('oranges');
            return expect(target()).toEqual(32);
          });
          return it('When switch to pears it should load null', function() {
            obs_id('pears');
            return expect(target()).toBeNull();
          });
        });
      });
    });
  });

}).call(this);
