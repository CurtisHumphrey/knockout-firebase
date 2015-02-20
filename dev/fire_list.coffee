define (require) ->
  ko = require 'knockout'

  Fire_Add_Make = (snapshot) ->
    real_ko = ko.observable snapshot.val()
    fire_ref = snapshot.ref()

    item = ko.pureComputed
      read: real_ko
      write: (value) ->
        value = null if value is undefined
        fire_ref.set value
        return value
    item.write_locally = real_ko
    item.key = snapshot.key()

    return item

  Fire_Find_n_Exec = (target, snapshot, exec_fn) ->
    for item, index in target.peek()
      if item.key is snapshot.key()
        exec_fn target, snapshot, item, index
        return
    return

  Fire_Add = (snapshot, prev_child_key) ->
    if prev_child_key
      for item, index in this.peek()
        if item.key is prev_child_key
          this._splice index+1, 0, Fire_Add_Make snapshot
          return
    #else prev_child_key was not present or found
    this._push Fire_Add_Make snapshot
    return



  _Fire_Changed = (target, snapshot, item, index) ->
    item.write_locally snapshot.val()

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
        this.fire_ref.child(list[i].key).remove()
    return

  Ko_Pop = () ->
    this.splice this.peek().length - 1, 1

  Ko_Shift = () ->
    this.splice 0, 1

  Ko_No_Supported = () ->
    throw new Error('ko method called is not currently implemented for fire lists')

  Fire_Load = (list_snapshot) ->
    new_list = []

    list_snapshot.forEach (child_snapshot) ->
      new_list.push Fire_Add_Make child_snapshot

    this._fire_subs.push
      type: 'child_removed'
      fn: this.fire_ref.on 'child_removed', Fire_Remove, undefined, this

    this._fire_subs.push
      type: 'child_added'
      fn: this.fire_ref.on 'child_added', Fire_Add, undefined, this

    this._fire_subs.push
      type: 'child_changed'
      fn: this.fire_ref.on 'child_changed', Fire_Changed, undefined, this

    this new_list

  ko.extenders.fireList = (target, options) ->
    fire_ref = options.fire_ref
    read_only = options.read_only ? false
    read_once = options.read_once ? false

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