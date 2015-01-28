define (require) ->
   ko = require 'ko'
   require 'fire_value'

   ko.fireModel = (model_obj, keys, options) ->
      fire_ref = options.ref

      for key, value of keys
         options.ref = fire_ref.child key
         if model_obj[key] is undefined
            model_obj[key] = ko.observable(value ? null)
         
         model_obj[key].extend
            fireValue: options

      return model_obj
