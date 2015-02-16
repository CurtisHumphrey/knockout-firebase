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

    describe 'Working with a fire_ref', ->
      target = null
      fire_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.set
          key: "test"

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

      describe 'Handling non-happy paths', ->
        beforeEach ->
          fire_ref.set
            key: null

          target = ko.fireObservable false, 
            fire_ref: fire_ref.child 'key'

        it 'Should be able to handle if the location does not exists - returns null', ->
          expect(target()).toBeNull()

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