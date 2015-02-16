define (require) ->
  ko = require 'knockout'
  require 'fire_model'
  _  = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  describe 'Fire Model', ->
    model = null
    beforeEach ->
      model =
        apples: ko.observable 1
        oranges: ko.observable 2

    describe 'Exports', ->
    
      it 'Should add a knockout function "fireModel" function', ->
        expect _.isFunction ko.fireModel 
          .toBeTruthy()

      return    

    describe 'defaults with no fire_ref', ->
      target = null
      beforeEach ->

      it 'Should have values to be inits', ->
        target = ko.fireModel {}, {apples: 11, oranges:12}, {}

        expect(target.apples()).toEqual(11)
        expect(target.oranges()).toEqual(12)

      it 'Should be able to use a model with observables already', ->
        2
        target = ko.fireModel model, model, {}

        expect(target.apples()).toEqual(1)
        expect(target.oranges()).toEqual(2)
      return

    describe 'Working with a fire_ref', ->
      fire_ref = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.set
          key:
            apples: 21
            oranges: 22

      describe 'Only Reading Once', ->
        beforeEach ->
          model = ko.fireModel model, model, 
            read_only: true
            read_once: true
            fire_ref: fire_ref.child 'key'

        it 'Should load the values from the firebase', ->
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should NOT load the next values from the firebase', ->
          fire_ref.set
          key:
            apples: 31
            oranges: 32

          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should NOT save back to firebase', ->
          model.apples 200

          expect(fire_ref.child('key/apples').getData()).toEqual 21
          expect(model.apples()).toEqual 200

      describe 'Only Reading but always syncing', ->
        beforeEach ->
          model = ko.fireModel model, model, 
            read_only: true
            fire_ref: fire_ref.child 'key'

          
        it 'Should load the values from the firebase', ->
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should load the next values from the firebase', ->
          fire_ref.set
            key:
              apples: 31
              oranges: 32

          expect(model.apples()).toEqual(31)
          expect(model.oranges()).toEqual(32)

        it 'Should NOT save back to firebase', ->
          model.apples 200

          expect(fire_ref.child('key/apples').getData()).toEqual 21
          expect(model.apples()).toEqual 200

      describe 'Reading Once with writing', ->
        beforeEach ->
          model = ko.fireModel model, model, 
            read_once: true
            fire_ref: fire_ref.child 'key'

        it 'Should load the values from the firebase', ->
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should NOT load the next values from the firebase', ->
          fire_ref.set
            key:
              apples: 31
              oranges: 32

          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should save back to firebase', ->
          model.apples 200

          expect(fire_ref.child('key/apples').getData()).toEqual 200
          expect(model.apples()).toEqual 200

      describe 'Reading and Writing', ->
        beforeEach ->
          model = ko.fireModel model, model, 
            fire_ref: fire_ref.child 'key'

        it 'Should load the values from the firebase', ->
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'Should load the next values from the firebase', ->
          fire_ref.set
            key:
              apples: 31
              oranges: 32

          expect(model.apples()).toEqual(31)
          expect(model.oranges()).toEqual(32)

        it 'Should save back to firebase', ->
          model.apples 200

          expect(fire_ref.child('key/apples').getData()).toEqual 200
          expect(model.apples()).toEqual 200