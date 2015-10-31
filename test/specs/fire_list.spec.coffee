define (require) ->
  ko           = require 'knockout'
  require 'fire_list'
  _ = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  fdescribe 'Fire List', ->

    beforeEach ->

    describe 'Exports', ->
      
      it 'Should add a knockout extender "fireList" function', ->
        expect _.isFunction ko.extenders.fireList 
          .toBeTruthy()

      it 'Should add a knockout function "fireList" function', ->
        expect _.isFunction ko.fireList 
          .toBeTruthy()

      it 'Should add a Change_Fire_Ref function to the extended observable', ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        target = ko.fireList
          fire_ref: fire_ref

        expect _.isFunction target.Change_Fire_Ref 
          .toBeTruthy()

      it 'Should add a dispose function to the extended observable', ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        target = ko.fireList
          fire_ref: fire_ref

        expect _.isFunction target.dispose 
          .toBeTruthy()
      return    

    describe 'defaults with no fire_ref', ->
      target = null
      beforeEach ->
        target = ko.fireList
          keys_inits:
            type: null
            count: 0

      it 'Should have the initial value', ->
        expect(target()).toEqual []

      it 'Should have an internal fire_ref of false', ->
        expect(target._class.fire_ref).toEqual false

      return

    describe 'Working with a fire_ref', ->
      target = null
      fire_ref = null
      last_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.child('fruit').push 
          type: 'apples'
          count: 3
        last_ref = fire_ref.child('fruit').push 
          type: 'oranges'
          count: 4
        
      describe 'Special keys', ->
        firebase_data = null
        beforeEach ->
          fire_ref.child('fruit').once "value", (dataSnapshot) ->
            firebase_data = dataSnapshot.val()

          target = ko.fireList
            fire_ref: fire_ref.child('fruit')

        it 'Should have a _key that is the list key', ->
          expect firebase_data[target()[0]._key]
            .toBeDefined()

          expect firebase_data[target()[1]._key]
            .toBeDefined()

        it 'Should have a _ref that is the firebase ref', ->
          expect target()[0]._ref
            .toBeDefined()

          expect target()[1]._ref
            .toBeDefined()
        
      describe 'Reading from firebase', ->
        beforeEach ->
          target = ko.fireList
            fire_ref: fire_ref.child('fruit')
            keys_inits:
              type: null
              count: 0

        it 'Should be able to switch references', ->
          fire_ref.child('fruit2').push 
            type: 'grapes'
            count: 1
          last_ref = fire_ref.child('fruit2').push 
            type: 'kiwi'
            count: 6

          target.Change_Fire_Ref fire_ref.child('fruit2')
          
          expect target()[0].type()
            .toBe 'grapes'
          expect target()[0].count()
            .toBe 1
          expect target()[1].type()
            .toBe 'kiwi'
          expect target()[1].count()
            .toBe 6

          expect _.values(fire_ref.child('fruit').getData()).length
            .toBe 2


        it 'Should load the 2 values from the firebase', ->
          expect(target().length).toEqual 2

        it 'Should have each value be an observable', ->
          expect ko.isObservable target()[0].type
            .toBeTruthy()
          expect ko.isObservable target()[0].count
            .toBeTruthy()

        it 'Should have each value be from firebase', ->
          expect target()[0].type()
            .toBe 'apples'
          expect target()[1].type()
            .toBe 'oranges'

        it 'Should load the next model "pears" from the firebase', ->
          fire_ref.child('fruit').push 
            type: 'pears'
            count: 11

          expect(target()[2].type()).toEqual 'pears'

        it 'Should notify watchers', ->
          watcher = ko.computed ->
            result = []
            for model in target()
              result.push model
            return result

          fire_ref.child('fruit').push 
            type: 'pears'
            count: 11
          
          expect(watcher().length).toEqual 3


        it 'Should update value when firebase changes', ->
          last_ref.set 
            type: 'grapes'
            count: 7

          # fire_ref.child('fruit').once 'value', (snapshot) -> console.log snapshot.val()
          expect(target()[1].type()).toEqual 'grapes'
          expect(target()[1].count()).toEqual 7

        it 'Should remove value when firebase changes', ->
          last_ref.remove()

          # fire_ref.child('fruit').once 'value', (snapshot) -> console.log snapshot.val()
          expect(target().length).toEqual 1

      describe 'Writing to firebase', ->
        beforeEach ->
          target = ko.fireList
            fire_ref: fire_ref.child('fruit')
            keys_inits:
              type: null
              count: 0

        it 'Should write value to firebase and ko', ->
          target()[1].count 2

          # fire_ref.child('fruit').once 'value', (snapshot) -> console.log snapshot.val()
          expect(last_ref.child('count').getData()).toEqual 2
          # console.log ko.toJSON target
          expect(target()[1].count()).toEqual 2

        it 'Should add (push) a value to firebase and ko', ->
          target.push 
            type: "grapes"
            count: 2

          # fire_ref.child('key').once 'value', (snapshot) -> console.log snapshot.val()
          data = fire_ref.child('fruit').getData()
          lastKey = _.last _.keys(data).sort()
          
          expect(data[lastKey].type).toEqual "grapes"
          expect(data[lastKey].count).toEqual 2
          # console.log ko.toJSON target
          expect(target()[2].type()).toEqual "grapes"
          expect(target()[2].count()).toEqual 2

        it 'Should remove a value (pop) to firebase and ko', ->
          target.pop()
          
          expect(_.keys(fire_ref.child('fruit').getData()).length).toEqual 1
          # console.log ko.toJSON target
          expect(target().length).toEqual 1

          data = fire_ref.child('fruit').getData()
          lastKey = _.last _.keys(data).sort()

          expect(data[lastKey].type).not.toEqual "oranges"

        it 'Should remove a value (shift) to firebase and ko', ->
          target.shift()
          
          expect(_.keys(fire_ref.child('fruit').getData()).length).toEqual 1
          # console.log ko.toJSON target
          expect(target().length).toEqual 1

          data = fire_ref.child('fruit').getData()
          firstKey = _.first _.keys(data).sort()

          expect(data[firstKey].type).not.toEqual "apples"
      return
    return