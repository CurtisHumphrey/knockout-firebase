define (require) ->
  ko           = require 'knockout'
  require 'fire_model_by_ref'
  _ = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  describe 'Fire Model By Reference', ->
    model = null
    beforeEach ->
      model =
        apples: ko.observable 1
        oranges: ko.observable 2

    describe 'Exports', ->
      
      it 'Should add a knockout function "fireModelByRef" function', ->
        expect _.isFunction ko.fireModelByRef 
          .toBeTruthy()

      return    

    describe 'Working with a fire_ref', ->
      fire_ref = null
      obs_id = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.set
          user_1:
            apples: 21
            oranges: 22
            fruit:
              apples: 221
              oranges: 222
          user_2:
            apples: 31
            oranges: 32
            fruit:
              apples: 331
              oranges: 332

        obs_id = ko.observable()

      describe 'Setup with a key already set', ->
        beforeEach ->
          obs_id = ko.observable 'user_1'

          ko.fireModelByRef model, model, 
            read_only: true
            read_once: true
            fire_ref: fire_ref
            ref_obs_id: obs_id

        it 'Should load values for user_1', ->
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22) 

      describe 'Switching without a child_path', ->
        beforeEach ->
          ko.fireModelByRef model, model, 
            read_only: true
            read_once: true
            fire_ref: fire_ref
            ref_obs_id: obs_id

        it 'Should have only default value', ->
          expect(model.apples()).toEqual 1
          expect(model.oranges()).toEqual(2)

        it 'When switch to user_1 it should load values', ->
          obs_id 'user_1'
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

        it 'When switch to user_1 then user_2 it should load values', ->
          obs_id 'user_1'
          expect(model.apples()).toEqual(21)
          expect(model.oranges()).toEqual(22)

          obs_id 'user_2'
          expect(model.apples()).toEqual(31)
          expect(model.oranges()).toEqual(32)

        it 'When switch to user_3 it should load null', ->
          obs_id 'user_3'
          expect(model.apples()).toBeNull()
          expect(model.oranges()).toBeNull()

      describe 'Switching with a child_path', ->
        beforeEach ->
          ko.fireModelByRef model, model,  
            read_only: true
            read_once: true
            fire_ref: fire_ref
            ref_obs_id: obs_id
            child_path: 'fruit'

        it 'Should have only default value', ->
          expect(model.apples()).toEqual 1
          expect(model.oranges()).toEqual(2)

        it 'When switch to user_1 it should load values', ->
          obs_id 'user_1'
          expect(model.apples()).toEqual(221)
          expect(model.oranges()).toEqual(222)

        it 'When switch to user_1 then user_2 it should load values', ->
          obs_id 'user_1'
          expect(model.apples()).toEqual(221)
          expect(model.oranges()).toEqual(222)

          obs_id 'user_2'
          expect(model.apples()).toEqual(331)
          expect(model.oranges()).toEqual(332)

        it 'When switch to user_3 it should load null', ->
          obs_id 'user_3'
          expect(model.apples()).toBeNull()
          expect(model.oranges()).toBeNull()
        
    return