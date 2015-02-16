define (require) ->
   ko = require 'knockout'
   require 'fire_value'

   ko.fireModel = (model_obj, keys_inits, options) ->
      fire_ref = options.fire_ref

      for key, init of keys_inits
         options.fire_ref = if fire_ref then fire_ref.child key else false

         if model_obj[key] is undefined
            model_obj[key] = ko.observable init ? null
         
         model_obj[key] = model_obj[key].extend
            fireValue: options

      return model_obj
