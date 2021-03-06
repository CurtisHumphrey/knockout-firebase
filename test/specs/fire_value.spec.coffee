define (require) ->
  ko           = require 'knockout'
  require 'fire_value'
  _ = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  describe 'Fire Value', ->

    beforeEach ->

    describe 'Exports', ->
      
      it 'Should add a knockout extender "fireValue" function', ->
        expect _.isFunction ko.extenders.fireValue 
          .toBeTruthy()

      it 'Should add a knockout function "fireObservable" function', ->
        expect _.isFunction ko.fireObservable 
          .toBeTruthy()

      it 'Should add a Change_Fire_Ref function to the extended observable', ->
        target = ko.fireObservable false, {}

        expect _.isFunction target.Change_Fire_Ref 
          .toBeTruthy()

      it 'Should add a Get_Fire_Ref function to the extended observable', ->
        target = ko.fireObservable false, {}

        expect _.isFunction target.Get_Fire_Ref 
          .toBeTruthy()

      it 'Should add a Once_Loaded function to the extended observable', ->
        target = ko.fireObservable false, {}

        expect _.isFunction target.Once_Loaded 
          .toBeTruthy()
      return    

    describe 'defaults with no fire_ref', ->
      target = null
      beforeEach ->
        target = ko.fireObservable "start", {}

      it 'Should have the initial value', ->
        expect(target()).toEqual "start"

      it 'Should have a Fire_Ref of false', ->
        expect(target.Get_Fire_Ref()).toEqual false

      it 'Should accept writes', ->
        target true

        expect(target()).toBeTruthy()

      it 'Should protect firebase against undefined be replacing with null', ->
        target undefined

        expect(target()).toBeNull()

        target1 = ko.observable()
        target1.extend
          fireValue: {}

        expect(target1()).toBeNull()

      return

    describe 'Working with Once Loaded', ->
      fire_ref = null
      obj = null
      target = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.set
          key: "test"
          key2: "different"


        fire_ref.flush()

        obj =
          callback: () -> return

        spyOn obj, 'callback'

        target = ko.fireObservable false, 
          read_only: true
          read_once: true
          fire_ref: fire_ref.child 'key'

      it 'Should call back a function after it has loaded values', ->
        target.Once_Loaded obj.callback

        expect(obj.callback).not.toHaveBeenCalled()

        fire_ref.flush()

        expect(obj.callback).toHaveBeenCalledWith "test"

      it 'Should call back right way if the values are already loaded', ->
        fire_ref.flush()

        target.Once_Loaded obj.callback

        expect(obj.callback).toHaveBeenCalledWith "test"

      it 'Should call back after a Fire_Ref change', ->
        fire_ref.flush()

        target.Change_Fire_Ref fire_ref.child('key2'), '', obj.callback

        expect(obj.callback).not.toHaveBeenCalled()

        fire_ref.flush()

        expect(obj.callback).toHaveBeenCalledWith "different"


    describe 'Working with a fire_ref', ->
      target = null
      fire_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.set
          key: "test"
          key3: "different"

      describe 'Only Reading Once', ->
        beforeEach ->
          target = ko.fireObservable false, 
            read_only: true
            read_once: true
            fire_ref: fire_ref.child 'key'

        it 'Should load the value "test" from the firebase', ->
          expect(target()).toEqual "test"

        it 'Should NOT load the next value "next" from the firebase', ->
          fire_ref.set
            key: "next"


          expect(target()).toEqual "test"

        it 'Should NOT save back to firebase', ->
          target "next"

          expect(fire_ref.child('key').getData()).toEqual "test"
          expect(target()).toEqual "next"
      
      describe 'Only Reading but always syncing', ->
        beforeEach ->
          target = ko.fireObservable false, 
            read_only: true
            fire_ref: fire_ref.child 'key'

          
        it 'Should load the value "test" from the firebase', ->
          expect(target()).toEqual "test"

        it 'Should load the next value "next" from the firebase', ->
          fire_ref.set
            key: "next"

          expect(target()).toEqual "next"

        it 'Should NOT save back to firebase', ->
          target "next"

          expect(fire_ref.child('key').getData()).toEqual "test"
          expect(target()).toEqual "next"
      
      describe 'Reading Once with writing', ->
        beforeEach ->
          target = ko.fireObservable false, 
            read_once: true
            fire_ref: fire_ref.child 'key'

        it 'Should load the value "test" from the firebase', ->
          expect(target()).toEqual "test"

        it 'Should NOT load the next value "next" from the firebase', ->
          fire_ref.set
            key: "next"

          expect(target()).toEqual "test"

        it 'Should save back to firebase', ->
          target "next"

          expect(fire_ref.child('key').getData()).toEqual "next"
          expect(target()).toEqual "next"
        
      describe 'Reading and Writing', ->
        beforeEach ->
          target = ko.fireObservable false, 
            fire_ref: fire_ref.child 'key'

        it 'Should load the value "test" from the firebase', ->
          expect(target()).toEqual "test"

        it 'Should load the next value "next" from the firebase', ->
          fire_ref.set
            key: "next"

          expect(target()).toEqual "next"

        it 'Should save back to firebase', ->
          target "next"

          expect(fire_ref.child('key').getData()).toEqual "next"
          expect(target()).toEqual "next"

      describe 'Writing with initial value', ->
        beforeEach ->
          target = ko.fireObservable "starting value", 
            fire_ref: fire_ref.child 'key2'

        it 'Should not reset the initial value if the firebase has no record', ->
          expect(target()).toEqual "starting value"

        it 'Should update firebase with the inital value if firebase has no record', ->
          expect(fire_ref.child('key2').getData()).toEqual "starting value"

      describe 'Interactions with Change_Fire_Ref', ->
        beforeEach ->
          target = ko.fireObservable "starting value", 
            fire_ref: fire_ref.child 'key2'

        it 'Should update firebase with the inital value if firebase has no record upon ref change', ->
          target.Change_Fire_Ref fire_ref.child('key4'), 'default'

          expect(fire_ref.child('key2').getData()).toEqual "starting value"
          expect(fire_ref.child('key4').getData()).toEqual "default"

        it 'Should not alter data linked before the switch', ->
          target.Change_Fire_Ref fire_ref.child('key4'), []

          expect(fire_ref.child('key2').getData()).toEqual "starting value"
          expect(fire_ref.child('key4').getData()).toEqual null
          expect(target()).toEqual []

          target [1, 2]

          expect(fire_ref.child('key2').getData()).toEqual "starting value"
          expect(_.values fire_ref.child('key4').getData()).toEqual [1, 2]


          target.Change_Fire_Ref fire_ref.child('key2'), []

          expect(fire_ref.child('key2').getData()).toEqual "starting value"
          expect(_.values fire_ref.child('key4').getData()).toEqual [1, 2]
          expect(target()).toEqual "starting value"

        it 'Should allow callback to change the value in DB', ->
          callback = () ->
            target 'callback'

          expect(fire_ref.child('key3').getData()).toEqual "different"

          target.Change_Fire_Ref fire_ref.child('key3'), '', callback

          expect(fire_ref.child('key3').getData()).toEqual "callback"
          expect(target()).toEqual "callback"

      describe 'Handling non-happy paths', ->
        beforeEach ->
          fire_ref.set
            key: null

          target = ko.fireObservable false, 
            fire_ref: fire_ref.child 'key'

        it 'Should be able to go from null to value from firebase', ->
          fire_ref.set
            key: "next"

          expect(target()).toEqual "next"

        it 'Should be able to go from null to value from target', ->
          target "next"

          expect(fire_ref.child('key').getData()).toEqual "next"
          expect(target()).toEqual "next"

        it 'Should be able to go from value to null from target', ->
          target null

          expect(fire_ref.child('key').getData()).toBeNull()
          expect(target()).toBeNull()