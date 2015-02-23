define (require) ->
   ko = require 'knockout'

   Fire_On_Value_Change = (snapshot) ->
      #this is a observable
      val = snapshot.val()
      if val is null and this() is null
         return #do nothing
      else if val is null and not this.read_only
         #write back the default value
         Fire_Write this, this()
      else
         this val

   Fire_Off = (target) ->
      if target.fire_ref and target.fire_sync_on
         target.fire_ref.off "value", Fire_On_Value_Change, target

      target.fire_sync_on = false
      return

   Fire_Sync = (target) ->
      Fire_Off target

      fire_fn = if target.read_once then 'once' else 'on'
      target.fire_ref[fire_fn] "value", Fire_On_Value_Change, null, target

      target.fire_sync_on = !target.read_once

      return

   Change_Fire_Ref = (fire_ref, target) ->
      if fire_ref
         target.fire_ref = fire_ref
         Fire_Sync target
      else
         Fire_Off target
         target.fire_ref = false

      return

   Fire_Write = (target, value) ->
      #firebase undefined protection
      value = null if value is undefined
      if not target.read_only and target.fire_ref         
         if target.read_once or value is null 
            #else sync will take care of it 
            target value 

         target.fire_ref.set value
      else
         target value

      #TODO handle error
      return value



   ko.extenders.fireValue = (target, options) ->
      target.read_only = options.read_only ? false
      target.read_once = options.read_once ? false
      #options.fire_ref will be use at the end

      target.fire_sync_on = false

      if target() is undefined
         target null

      new_target = ko.pureComputed
         read: target
         write: (value) -> Fire_Write target, value

      new_target.Change_Fire_Ref = (fire_ref) -> 
         Change_Fire_Ref fire_ref, target
      
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
