define (require) ->
  ko           = require 'knockout'
  require 'fire_value_by_ref'
  _ = require 'lodash'

  window.ko = ko
  MockFirebase = require('mockfirebase').MockFirebase


  describe 'Fire Value By Reference', ->

    beforeEach ->

    describe 'Exports', ->
      
      it 'Should add a knockout extender "fireValueByRef" function', ->
        expect _.isFunction ko.extenders.fireValueByRef 
          .toBeTruthy()

      it 'Should add a knockout function "fireValueByRef" function', ->
        expect _.isFunction ko.fireValueByRef 
          .toBeTruthy()

      return    

    describe 'Working with a fire_ref', ->
      target = null
      fire_ref = null
      obs_id = null

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_ref.set
          apples: 21
          oranges: 22
          fruit:
            apples:
              count: 31
            oranges:
              count: 32

        obs_id = ko.observable()

      describe 'Switching without a child_path', ->
        beforeEach ->
          target = ko.fireValueByRef false, 
            read_only: true
            read_once: true
            fire_ref: fire_ref
            ref_obs_id: obs_id

        it 'Should have only default value', ->
          expect(target()).toEqual false

        it 'When switch to apples it should load value', ->
          obs_id 'apples'
          expect(target()).toEqual 21

        it 'When switch to apples next oranges it should load value', ->
          obs_id 'apples'
          expect(target()).toEqual 21

          obs_id 'oranges'
          expect(target()).toEqual 22

        it 'When switch to pears it should load null', ->
          obs_id 'pears'
          expect(target()).toBeNull()

      describe 'Switching with a child_path', ->
        beforeEach ->
          target = ko.fireValueByRef false, 
            read_only: true
            read_once: true
            fire_ref: fire_ref.child('fruit')
            ref_obs_id: obs_id
            child_path: 'count'

        it 'Should have only default value', ->
          expect(target()).toEqual false

        it 'When switch to apples it should load value', ->
          obs_id 'apples'
          expect(target()).toEqual 31

        it 'When switch to apples next oranges it should load value', ->
          obs_id 'apples'
          expect(target()).toEqual 31

          obs_id 'oranges'
          expect(target()).toEqual 32

        it 'When switch to pears it should load null', ->
          obs_id 'pears'
          expect(target()).toBeNull()
    return