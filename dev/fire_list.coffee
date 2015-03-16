define (require) ->
  ko = require 'knockout'

  class Fire_List
    constructor: (target, options) ->
      @fire_ref = options.fire_ref
      @keys_inits = options.keys_inits
      @target = target

      @target._class = @

      @_fire_subs = []

      @target.dispose = @Fire_Dispose

      @_push = @target.push
      @target.push = @Ko_Push

      @target.remove = @Ko_Remove

      @_splice = @target.splice
      @target.splice = @Ko_Splice

      @target.pop = @Ko_Pop
      @target.shift = @Ko_Shift

      for method in ['unshift','reverse','sort','removeAll','destroy','destroyAll']
        @target[method] = @Ko_No_Supported

      @fire_ref.once "value", @Fire_Load, @Fire_Error, @

    Create_New_Target: () ->
      return @target

    Fire_Error: (error) ->
      console.log error

    Fire_Add_Make: (snapshot) ->
      model_obj = {}
      model_obj._key = snapshot.key()

      fire_ref = snapshot.ref()

      for key, init of @keys_inits
        val = snapshot.child(key).val()

        real_ko = ko.observable val ? init

        item = ko.pureComputed
          read: real_ko
          write: (value) ->
            value = null if value is undefined
            fire_ref.child(key).set value
            return value
        item.write_locally = real_ko

        model_obj[key] = item

      return model_obj

    Fire_Find_n_Exec: (snapshot, exec_fn) ->
      for item, index in @target.peek()
        if item._key is snapshot.key()
          exec_fn.call @, snapshot, item, index
          return
      return

    Fire_Add: (snapshot, prev_child_key) ->
      #this is target
      for item, index in @target.peek()
        if prev_child_key and item._key is prev_child_key
          #check if key is next
          return if _ref[index+1]?._key is snapshot.key()

          @_splice.call @target, index+1, 0, @Fire_Add_Make snapshot
          return
        return if item._key is snapshot.key() #exists already

      #else prev_child_key was not present or found
      @_push.call @target, @Fire_Add_Make(snapshot)
      return


    _Fire_Changed: (snapshot, model_obj, index) ->
      for key of @keys_inits
        value = snapshot.child(key).val()
        if value is null and @target() isnt null
          model_obj[key] model_obj[key]() #write back
        else if value isnt null
          model_obj[key].write_locally value
      return

    Fire_Changed: (snapshot) ->
      @Fire_Find_n_Exec snapshot, @_Fire_Changed

    _Fire_Remove: (snapshot, item, index) ->
      @_splice.call @target, index, 1

    Fire_Remove: (snapshot) ->
      @Fire_Find_n_Exec snapshot, @_Fire_Remove

    Fire_Dispose: () ->
      #in target context
      for fire_sub in @_class._fire_subs
        @_class.fire_ref.off fire_sub.type, fire_sub.fn, @
      @_class = undefined
      return

    Ko_Push: (item) ->
      #in target context
      @_class.fire_ref.push ko.toJS item

    Ko_Remove: (item) ->
      #in target context
      index = @indexOf item
      return if index is -1
      @splice index, 1

    Ko_Splice: (index, count) ->
      #in target context
      list = @peek()
      for i in [index..index+count-1]
        if list[i]
          @_class.fire_ref.child(list[i]._key).remove()
      return

    Ko_Pop: () ->
      #in target context
      @splice @peek().length - 1, 1

    Ko_Shift: () ->
      #in target context
      @splice 0, 1

    Ko_No_Supported: () ->
      throw new Error('ko method called is not currently implemented for fire lists')

    Fire_Load: (list_snapshot) ->
      new_list = []
      last_key = null

      self = this
      list_snapshot.forEach (child_snapshot) ->
        new_list.push self.Fire_Add_Make child_snapshot
        last_key = child_snapshot.key()
      @target new_list #must be before watches

      @_fire_subs.push
        type: 'child_removed'
        fn: @fire_ref.on 'child_removed', @Fire_Remove, @Fire_Error, @

      if last_key
        fn = @fire_ref.startAt(null, last_key).on 'child_added', @Fire_Add, @Fire_Error, @
      else
        fn = @fire_ref.on 'child_added', @Fire_Add, @Fire_Error, @

      @_fire_subs.push
        type: 'child_added'
        fn: fn

      @_fire_subs.push
        type: 'child_changed'
        fn: @fire_ref.on 'child_changed', @Fire_Changed, @Fire_Error, @

      return

  ko.extenders.fireList = (target, options) ->
    fire_list = new Fire_List(target, options)
    return fire_list.Create_New_Target()

  ko.fireList = (options) ->
    target = ko.observableArray([]).extend
      fireList: options