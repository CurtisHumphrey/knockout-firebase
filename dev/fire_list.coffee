define (require) ->
  ko = require 'knockout'

  Fire_Add_Make = (snapshot, options) ->
    options.read_only ?= false
    #expecting options.keys_inits
    
    model_obj = {}
    model_obj._key = snapshot.key()

    fire_ref = snapshot.ref()

    for key, init of options.keys_inits
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

  Fire_Find_n_Exec = (target, snapshot, exec_fn) ->
    for item, index in target.peek()
      if item._key is snapshot.key()
        exec_fn target, snapshot, item, index
        return
    return

  Fire_Add = (snapshot, prev_child_key) ->
    #this is target
    for item, index in this.peek()
      if prev_child_key and item._key is prev_child_key
        #check if key is next
        return if _ref[index+1]?._key is snapshot.key()

        this._splice index+1, 0, Fire_Add_Make(snapshot, this)
        return
      return if item._key is snapshot.key() #exists already

    #else prev_child_key was not present or found
    this._push Fire_Add_Make(snapshot, this)
    return


  _Fire_Changed = (target, snapshot, model_obj, index) ->
    for key of target.keys_inits
      model_obj[key].write_locally snapshot.child(key).val()
    return

  Fire_Changed = (snapshot) ->
    Fire_Find_n_Exec this, snapshot, _Fire_Changed

  _Fire_Remove = (target, snapshot, item, index) ->
    target._splice index, 1

  Fire_Remove = (snapshot) ->
    Fire_Find_n_Exec this, snapshot, _Fire_Remove

  Fire_Dispose = () ->
    for fire_sub in this._fire_subs
      this.fire_ref.off fire_sub.type, fire_sub.fn, this
    return

  Ko_Push = (item) ->
    this.fire_ref.push ko.toJS item

  Ko_Remove = (item) ->
    index = this.indexOf item
    return if index is -1
    this.splice index, 1

  Ko_Splice = (index, count) ->
    list = this.peek()
    for i in [index..index+count-1]
      if list[i]
        this.fire_ref.child(list[i]._key).remove()
    return

  Ko_Pop = () ->
    this.splice this.peek().length - 1, 1

  Ko_Shift = () ->
    this.splice 0, 1

  Ko_No_Supported = () ->
    throw new Error('ko method called is not currently implemented for fire lists')

  Fire_Load = (list_snapshot) ->
    new_list = []
    last_key = null
    target = this

    list_snapshot.forEach (child_snapshot) ->
      new_list.push Fire_Add_Make(child_snapshot, target)
      last_key = child_snapshot.key()

    target._fire_subs.push
      type: 'child_removed'
      fn: target.fire_ref.on 'child_removed', Fire_Remove, undefined, target

    if last_key
      fn = target.fire_ref.startAt(null, last_key).on 'child_added', Fire_Add, undefined, target
    else
      fn = target.fire_ref.on 'child_added', Fire_Add, undefined, target

    target._fire_subs.push
      type: 'child_added'
      fn: fn

    target._fire_subs.push
      type: 'child_changed'
      fn: target.fire_ref.on 'child_changed', Fire_Changed, undefined, target

    target new_list

  ko.extenders.fireList = (target, options) ->
    fire_ref = options.fire_ref
    target.keys_inits = options.keys_inits
    target.read_only = options.read_only ? false

    target.fire_ref = fire_ref
    target._fire_subs = []
    target.dispose = Fire_Dispose

    target._push = target.push
    target.push = Ko_Push

    target._remove = target.remove
    target.remove = Ko_Remove

    target._splice = target.splice
    target.splice = Ko_Splice

    target.pop = Ko_Pop
    target.shift = Ko_Shift

    for method in ['unshift','reverse','sort','removeAll','destroy','destroyAll']
      target[method] = Ko_No_Supported

    fire_ref.once "value", Fire_Load, undefined, target

    return target

  ko.fireList = (options) ->
      target = ko.observableArray().extend
         fireList: options