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
      last_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.child('key').push 'apples'
        last_ref = fire_ref.child('key').push 'oranges'
        
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

        it 'Should have each value be from firebase', ->
          expect target()[0]()
            .toBe 'apples'
          expect target()[1]()
            .toBe 'oranges'

        it 'Should load the next value "pears" from the firebase', ->
          fire_ref.child('key').push 'pears'
          console.log( fire_ref.getData())

          expect(target()[2]()).toEqual 'pears'

        it 'Should update value when firebase changes', ->
          last_ref.set 'grapes'

          # fire_ref.child('key').once 'value', (snapshot) -> console.log snapshot.val()
          expect(target()[1]()).toEqual 'grapes'

        it 'Should remove value when firebase changes', ->
          last_ref.remove()

          # fire_ref.child('key').once 'value', (snapshot) -> console.log snapshot.val()
          expect(target().length).toEqual 1

      describe 'Writing to firebase', ->
        beforeEach ->
          target = ko.fireList
            fire_ref: fire_ref.child('key')

        it 'Should write value to firebase and ko', ->
          target()[1] "grapes"

          # fire_ref.child('key').once 'value', (snapshot) -> console.log snapshot.val()
          expect(last_ref.getData()).toEqual "grapes"
          # console.log ko.toJSON target
          expect(target()[1]()).toEqual "grapes"

        it 'Should add (push) a value to firebase and ko', ->
          target.push "grapes"

          # fire_ref.child('key').once 'value', (snapshot) -> console.log snapshot.val()
          data = fire_ref.child('key').getData()
          lastKey = _.last _.keys(data).sort()
          
          expect(data[lastKey]).toEqual "grapes"
          # console.log ko.toJSON target
          expect(target()[2]()).toEqual "grapes"

        it 'Should remove a value (pop) to firebase and ko', ->
          target.pop()
          
          expect(_.keys(fire_ref.child('key').getData()).length).toEqual 1
          # console.log ko.toJSON target
          expect(target().length).toEqual 1

          data = fire_ref.child('key').getData()
          lastKey = _.last _.keys(data).sort()

          expect(data[lastKey]).not.toEqual "oranges"

        it 'Should remove a value (shift) to firebase and ko', ->
          target.shift()
          
          expect(_.keys(fire_ref.child('key').getData()).length).toEqual 1
          # console.log ko.toJSON target
          expect(target().length).toEqual 1

          data = fire_ref.child('key').getData()
          firstKey = _.first _.keys(data).sort()

          expect(data[firstKey]).not.toEqual "apples"
      return
    return