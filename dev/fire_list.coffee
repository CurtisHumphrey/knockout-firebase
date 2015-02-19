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

  Fire_Add = (target, snapshot, prev_child_key) ->
    if prev_child_key
      for item, index in target.peek()
        if item.key is prev_child_key
          target.splice index+1, 0, Fire_Add_Make snapshot
          return
    #else prev_child_key was not present or found
    target.push Fire_Add_Make snapshot
    return


  Fire_Changed = (target, snapshot, item, index) ->
    item snapshot.val()

  Fire_Remove = (target, snapshot, item, index) ->
    target.splice index, 1

  Fire_Dispose = (target) ->
    for fire_sub in target._fire_subs
      target.fire_ref.off fire_sub.type, fire_sub.fn
    return


  ko.extenders.fireList = (target, options) ->
    fire_ref = options.fire_ref
    read_only = options.read_only ? false
    read_once = options.read_once ? false

    target.fire_ref = fire_ref
    target._fire_subs = []
    target.dispose = () -> Fire_Dispose target

    last_key = null
    fire_ref.once "value", (list_snapshot) ->
      new_list = []


      list_snapshot.forEach (child_snapshot) ->
        item = Fire_Add_Make child_snapshot
        new_list.push item
       
        last_key = child_snapshot.key()

      target._fire_subs.push
        type: 'child_removed'
        fn: fire_ref.on 'child_removed', (snapshot) ->
          Fire_Find_n_Exec target, snapshot, Fire_Remove

      if last_key
        fn = fire_ref
          #.startAt null, last_key
          .on 'child_added', (snapshot, prev_child_key) ->
            Fire_Add target, snapshot, prev_child_key
      else #there is no list so start at the begining
        fn = fire_ref
          .on 'child_added', (snapshot, prev_child_key) ->
            Fire_Add target, snapshot, prev_child_key

      target._fire_subs.push
        type: 'child_added'
        fn: fn

      target._fire_subs.push
        type: 'child_changed'
        fn: fire_ref.on 'child_changed', (snapshot) -> 
          Fire_Find_n_Exec target, snapshot, Fire_Changed

      target new_list

    return target

  ko.fireList = (options) ->
      target = ko.observableArray().extend
         fireList: options