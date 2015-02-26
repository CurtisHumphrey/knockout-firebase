(function() {
  define(function(require) {
    require('fire_list');
    require('fire_model');
    require('fire_model_by_ref');
    require('fire_value');
    return require('fire_value_by_ref');
  });

}).call(this);
