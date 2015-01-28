define (require) ->
   ko = require 'ko'

   ko.extenders.fireValue = (target, options) ->
      target.fire_ref = options.ref
      read_only = options.read_only ? false
      read_once = options.read_once ? false

      fire_fn = if read_once then 'on' else 'once'

      on_value_change = (snapshot) ->
         target snapshot.val()

      target.fire_ref[fire_fn] "value", on_value_change

      target.dispose () ->
         target.fire_ref.off "value", on_value_change

      if read_only
         #writing does not sync the value back to firebase
         return target

      new_target = ko.pureComputed
         read: target
         write: (value) ->
            target.fire_ref.set value
            #TODO handle error
            return value

      old_dispose = new_target.dispose
      new_target.dispose = () ->
         target.dispose()
         old_dispose()

      return new_target

   ko.fireObservable = (default, options) ->
      target = ko.observable(default).extend
         fireValue: options
