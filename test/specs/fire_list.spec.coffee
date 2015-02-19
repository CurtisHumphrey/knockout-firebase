define (require) ->
  ko           = require 'knockout'
  require 'fire_list'
  _ = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  describe 'Fire List', ->

    beforeEach ->

    describe 'Exports', ->
      
      it 'Should add a knockout extender "fireList" function', ->
        expect _.isFunction ko.extenders.fireList 
          .toBeTruthy()

      it 'Should add a knockout function "fireList" function', ->
        expect _.isFunction ko.fireList 
          .toBeTruthy()

      it 'Should add a dispose function to the extended observable', ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        target = ko.fireList
          fire_ref: fire_ref

        expect _.isFunction target.dispose 
          .toBeTruthy()
      return    

    describe 'Working with a fire_ref', ->
      target = null
      fire_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.child('key').push 'apples'

        fire_ref.child('key').push 'oranges'
        
      describe 'Reading from firebase', ->
        beforeEach ->
          target = ko.fireList
            fire_ref: fire_ref.child('key')

        it 'Should load the 2 values from the firebase', ->
          expect(target().length).toEqual 2

        it 'Should have each value be an observable', ->
          expect ko.isObservable target()[0]
            .toBeTruthy()
          expect ko.isObservable target()[1]
            .toBeTruthy()

        it 'Should have each value be an from firebase', ->
          expect target()[0]()
            .toBe 'apples'
          expect target()[1]()
            .toBe 'oranges'

        it 'Should load the next value "pears" from the firebase', ->
          fire_ref.child('key').push 'pears'

          expect(target()[2]()).toEqual 'pears'

        xit 'Should update value from firebase', ->
          fire_ref.child('key').limitToLast(1).once 'value', (snapshot) ->
            snapshot.ref().update 'grapes'

          expect(target()[1]()).toEqual 'grapes'
      return
    return