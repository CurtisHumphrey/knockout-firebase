define (require) ->
  ko           = require 'knockout'
  require 'fire_value'

  window.ko = ko

  describe 'Fire Value', ->

    beforeEach ->

    describe 'Exports', ->
      
      it 'Should add a knockout extender "fireValue"', ->
        expect ko.extenders.fireValue 
          .toBeDefined()

      it 'Should add a knockout function "fireObservable"', ->
        expect ko.fireObservable 
          .toBeDefined()

      return
      

    