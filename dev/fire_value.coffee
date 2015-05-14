define (require) ->
  ko = require 'knockout'

  class Fire_Value
    constructor: (target, options) ->
      @read_only = options.read_only ? false
      @read_once = options.read_once ? false
      @fire_ref = false
      @fire_sync_on = false
      @_once_loaded = []
      @_has_loaded = false

      if target() is undefined
        target null

      @target = target

    Create_New_Target: (fire_ref) ->
      new_target = ko.pureComputed
        read: @target
        write: @Fire_Write
        owner: @

      new_target.Change_Fire_Ref = @Change_Fire_Ref
      
      new_target.Get_Fire_Ref = @Get_Fire_Ref

      old_dispose = new_target.dispose
      fire_value = @
      new_target.dispose = () ->
        fire_value.Fire_Off()
        old_dispose()

      new_target.Once_Loaded = @Once_Loaded

      # setup sync
      new_target.Change_Fire_Ref fire_ref

      return new_target

    Fire_On_Value_Change: (snapshot) ->
      #this is a observable
      write_back = false
      value = snapshot.val()
      if value is null and (@target() isnt null or @target() isnt undefined) and not @read_only
        #write back the default value
        value = @target()
        write_back = true
      else
        @target value

      @_has_loaded = true
      @Fire_Write value if write_back

      callback value for callback in @_once_loaded
      @_once_loaded.length = 0

    Fire_Off: () ->
      if @fire_ref and @fire_sync_on
        @fire_ref.off "value", @Fire_On_Value_Change, @

      @fire_sync_on = false
      @_has_loaded = false
      return

    Fire_Sync: () ->
      @Fire_Off()

      fire_fn = if @read_once then 'once' else 'on'
      #ISSUE firebase will not expect this call 1) null 2) target is a function
      @fire_ref[fire_fn] "value", @Fire_On_Value_Change, @Fire_Error, @
      @fire_sync_on = !@read_once

      return

    Fire_Error: (error) ->
      console.log error

    Fire_Write_Callback: (error) => #need bacause of Firebase.set
      return unless error
      @Fire_Error error
      @read_only = true #stops repeat write attemps

    Fire_Write: (value) ->
      #firebase undefined protection
      value = null if value is undefined
      if not @read_only and @fire_ref and @_has_loaded         
        if @read_once or value is null 
          #else sync will take care of it 
          @target value 

        @fire_ref.set value, @Fire_Write_Callback
      else
        @target value

      return value

    # attached to new target
    Change_Fire_Ref: (fire_ref, default_value, callback) =>
      if fire_ref
        @_once_loaded.push callback if callback
        @fire_ref = fire_ref
        @target default_value if default_value?
        @Fire_Sync()
      else
        @Fire_Off()
        @fire_ref = false
        @target default_value if default_value?

      return

    # attached to new target
    Get_Fire_Ref: () =>
      @fire_ref

    # attached to new target
    Once_Loaded: (callback) =>
      if @_has_loaded
        callback @target()
      else
        @_once_loaded.push callback
      return

  ko.extenders.fireValue = (target, options) ->
    fire_value = new Fire_Value(target, options)

    return fire_value.Create_New_Target options.fire_ref

  ko.fireObservable = (init_val, options) ->
    target = ko.observable(init_val).extend
      fireValue: options

  ko.fireValue = ko.fireObservable #alias