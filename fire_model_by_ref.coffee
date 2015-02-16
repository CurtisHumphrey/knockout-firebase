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
         for key, target of model_obj
            unless id?
               target.Change_Ref false 
               return

            target.Change_Ref fire_ref.child(id).child(key)
         return


      return model_obj