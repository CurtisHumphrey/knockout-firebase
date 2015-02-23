define (require) ->
   ko = require 'knockout'
   require 'fire_model'

   ko.fireModelByRef = (model_obj, keys_inits, options) ->
      fire_ref = options.fire_ref ? console.error 'requires a firebase ref as fire_ref'
      ref_obs_id = options.ref_obs_id ? console.error 'requires a observable as ref_obs_id'
      child_path = options.child_path ? ''

      options.fire_ref = false
      ko.fireModel model_obj, keys_inits, options

      ref_obs_id.subscribe (id) ->
         for key of keys_inits
            target = model_obj[key]
            unless id?
               target.Change_Fire_Ref false 
               return

            ref = fire_ref.child(id)
            ref = ref.child(child_path) if child_path
            target.Change_Fire_Ref ref.child(key)
         return


      return model_obj