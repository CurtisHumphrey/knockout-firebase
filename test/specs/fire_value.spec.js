(function() {
  define(function(require) {
    var ko;
    ko = require('knockout');
    require('fire_value');
    window.ko = ko;
    return describe('Fire Value', function() {
      beforeEach(function() {});
      return describe('Exports', function() {
        it('Should add a knockout extender "fireValue"', function() {
          return expect(ko.extenders.fireValue).toBeDefined();
        });
        it('Should add a knockout function "fireObservable"', function() {
          return expect(ko.fireObservable).toBeDefined();
        });
      });
    });
  });

}).call(this);
