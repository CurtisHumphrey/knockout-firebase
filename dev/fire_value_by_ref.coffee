define (require) ->
   ko = require 'knockout'
   require 'fire_value'

   ko.extenders.fireValueByRef = (target, options) ->
      fire_ref = options.fire_ref ? console.error 'requires a firebase ref as fire_ref'
      ref_obs_id = options.ref_obs_id ? console.error 'requires a observable as ref_obs_id'
      child_path = options.child_path ? ''

      options.fire_ref = false
      target = target.extend
         fireValue: options


      ref_obs_id.subscribe (id) ->
         unless id?
            target.Change_Ref false
            return

         ref = fire_ref.child(id)
         ref = ref.child(child_path) if child_path
         target.Change_Fire_Ref ref

      return target

   ko.fireValueByRef = (init_val, options) ->
      target = ko.observable(init_val).extend
         fireValueByRef: options
