define (require) ->
   ko = require 'knockout'

   Fire_Off = (target, On_Value_Change) ->
      target.fire_sync_on = false
      if target.fire_ref and target.fire_sync_on
         target.fire_ref.off "value", On_Value_Change

      return

   Fire_Sync = (target, On_Value_Change, read_once) ->
      Fire_Off target, On_Value_Change

      fire_fn = if read_once then 'once' else 'on'
      target.fire_ref[fire_fn] "value", On_Value_Change

      target.fire_sync_on = !read_once

      return

   Change_Fire_Ref = (fire_ref, target, On_Value_Change, read_once) ->
      if fire_ref
         target.fire_ref = fire_ref
         Fire_Sync target, On_Value_Change, read_once
      else
         Fire_Off target, On_Value_Change
         target.fire_ref = false
         target null

      return

   Fire_Write = (target, value, read_only, read_once) ->
      #firebase undefined protection
      value = null if value is undefined
      if not read_only and target.fire_ref
         target.fire_ref.set value
         
         target value if read_once #else sync will take care of it  
      else
         target value

      #TODO handle error
      return value

   ko.extenders.fireValue = (target, options) ->
      read_only = options.read_only ? false
      read_once = options.read_once ? false
      #options.fire_ref will be use at the end

      target.fire_sync_on = false

      On_Value_Change = (snapshot) -> target snapshot.val()

      new_target = ko.pureComputed
         read: target
         write: (value) -> Fire_Write target, value, read_only, read_once

      new_target.Change_Fire_Ref = (fire_ref) -> 
         Change_Fire_Ref fire_ref, target, On_Value_Change, read_once
      
      new_target.Get_Fire_Ref = () -> target.fire_ref

      old_dispose = new_target.dispose
      new_target.dispose = () ->
         target.Fire_Off()
         old_dispose()

      # setup sync
      new_target.Change_Fire_Ref options.fire_ref

      return new_target

   ko.fireObservable = (init_val, options) ->
      target = ko.observable(init_val).extend
         fireValue: options
