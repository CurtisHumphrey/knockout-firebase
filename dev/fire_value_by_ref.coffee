define (require) ->
   ko = require 'knockout'
   require 'fire_value'

   ko.extenders.fireValueByRef = (target, options) ->
      fire_ref = options.fire_ref ? console.error 'requires a firebase ref as fire_ref'
      ref_obs_id = options.ref_obs_id ? console.error 'requires a observable as ref_obs_id'
      child_path = options.child_path ? ''

      options.fire_ref = false
      target.extend
         fireValue: options


      ref_obs_id.subscribe (id) ->
         unless id?
            target.Change_Ref false
            return

         target.Change_Ref fire_ref.child(id).child(child_path)

      return target

   ko.fireValueByRef = (init_val, options) ->
      target = ko.observable(init_val).extend
         fireValueByRef: options
