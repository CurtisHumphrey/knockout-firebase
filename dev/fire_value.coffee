define (require) ->
   ko = require 'knockout'

   ko.extenders.fireValue = (target, options) ->
      read_only = options.read_only ? false
      read_once = options.read_once ? false

      target.fire_sync_on = !read_once

      On_Value_Change = (snapshot) ->
         target snapshot.val()

      target.Fire_Off = () ->
         return if not target.fire_sync_on
         target.fire_sync_on = false
         target.fire_ref.off "value", On_Value_Change

         return

      target.Fire_Sync = () ->
         target.Fire_Off()

         fire_fn = if read_once then 'on' else 'once'
         target.fire_ref[fire_fn] "value", On_Value_Change

         target.fire_sync_on = !read_once

         return

      target.Change_Ref = (fire_ref) ->
         target.Fire_Off()

         if fire_ref
            target.fire_ref = fire_ref
            target.Fire_Sync()
         else
            target.fire_ref = false
            target null

         return

      # setup sync
      target.Change_Ref options.fire_ref

      if read_only
         #writing does not sync the value back to firebase
         return target

      new_target = ko.pureComputed
         read: target
         write: (value) ->
            #firebase undefined protection
            value = null if value is undefined
            if target.fire_ref
               target.fire_ref.set value
            else
               target value

            #TODO handle error
            return value

      new_target.Change_Ref = (fire_ref) -> 
         target.Change_Ref fire_ref
      
      old_dispose = new_target.dispose
      new_target.dispose = () ->
         target.Fire_Off()
         old_dispose()

      return new_target

   ko.fireObservable = (init_val, options) ->
      target = ko.observable(init_val).extend
         fireValue: options
