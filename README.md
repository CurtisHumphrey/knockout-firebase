[![Build Status](https://travis-ci.org/CurtisHumphrey/knockout-firebase.svg?branch=master)](https://travis-ci.org/CurtisHumphrey/knockout-firebase)

#knockout-firebase
Knockout tools for using Firebase as its DB, inspired by [FireBind by tyrsius](https://github.com/tyrsius/FireBind). This is not an offical library from firebase.

# Goals
 1. Sync just a value (done)
 2. Sync an object i.e., a collection of values (done)
 3. Sync an firebase list (done)
 4. Sync a value based on the path being an observable i.e., referenced value (done)
 5. Sync a object based on the path being an observable i.e., referenced object (done)
 6. Sync a combination of 1-3 (3,1 done, 3,2 done)
 7. Sync can be read-only or bi-directional (for 1,2,4,5 done)
 8. Sync can be read-once or continue reading (for 1,2,4,5 done)

# Tests
There are 85 test currently

# Usage
This package is designed to be used with a requirejs type project. Include the dist/knockout-firebase file to get all the components
## dependences
 1. "knockout" defined for requirejs
 2. "firebase" defined for requirejs
 3. requirejs

## Install
via ```bower install knockout-firebase```

# Using Fire Value
Fire value is a observable linked to a firebase path.

## Setup Version 1
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_value = ko.fireObservable 'inital_value',
  read_only: true
  read_once: true
  fire_ref: new Firebase('path')
```
via javascript:
``` javascript
var Firebase, my_value;

Firebase = require('firebase');

require('knockout-firebase');

my_value = ko.fireObservable('inital_value', {
  read_only: true,
  read_once: true,
  fire_ref: new Firebase('path')
});
```
## Setup Version 2
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_value = ko.observable 'inital_value'
.extend
  fireValue:
   read_only: true
   read_once: true
   fire_ref: new Firebase('path')
```
via javascript:
``` javascript
var Firebase, my_value;

Firebase = require('firebase');

require('knockout-firebase');

my_value = ko.observable('inital_value').extend({
  fireValue: {
   read_only: true,
   read_once: true,
   fire_ref: new Firebase('path')
}});
```
## Options & Notes
1. ko.fireValue is an alias for ko.fireObservable
2. read_only if not provided defaults to false
3. read_once if not provided defaults to false
4. fire_ref can be provided (or changed) later with an optional callback via 
``` coffeescript
# via coffeescript
my_value.Change_Fire_Ref new Firebase('path'), callback
```
5. undefineds are auto replace with null to protect firebase
6. if read_only is true, one can still write to the observable but it will not write to firebase
7. if read_only is false and firebase has no value (i.e., is null) the inital value will be written to that location
8. Use the dispose() function to make sure memory is cleaned up when removing a fireValue

## Additional APIs
1. the observable has a Once_Loaded(callback) function that will call the callback provided once the value has been loaded (like a simple promise)
2. Get_Fire_Ref() will return the firebase refrence object

# Using Fire Model
Fire model add fireValues to an object

## Setup Verion 1
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_values = {}
keys_and_defaults =
  apples: 11
  oranges: 12

ko.fireModel my_values, keys_and_defaults,
  read_only: true
  read_once: true
  fire_ref: new Firebase('path')
```
via javascript:
``` javascript
var Firebase, keys_and_defaults, my_values;

Firebase = require('firebase');

require('knockout-firebase');

my_values = {};

keys_and_defaults = {
  apples: 11,
  oranges: 12
};

ko.fireModel(my_values, keys_and_defaults, {
  read_only: true,
  read_once: true,
  fire_ref: new Firebase('path')
});
```

## Setup Version 2
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_values = 
  apples: ko.observable 11
  oranges: ko.observable 12

ko.fireModel my_values, my_values,
  read_only: true
  read_once: true
  fire_ref: new Firebase('path')
```
via javascript:
``` javascript
var Firebase, my_values;

Firebase = require('firebase');

require('knockout-firebase');

my_values = {
  apples: ko.observable(11),
  oranges: ko.observable(12)
};

ko.fireModel(my_values, my_values, {
  read_only: true,
  read_once: true,
  fire_ref: new Firebase('path')
});
```

## Options & Notes
1. first input is the object to attach the fireValues onto
2. first input is NOT optional but can be {} as fireModel returns the object back
3. first input can already have elements on it and fireModel will not overwrite them but use the observables
4. second input is an object of desired keys with their defaults
5. read_only if not provided defaults to false
6. read_once if not provided defaults to false
7. fire_ref is not optional
8. fireModel adds fireValues so all of fireValues features can be used on the keys later
9. It is possible to mix two different fireModels into the same object and each key will update to the correct place. For example:
``` coffeescript
# via coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_values = 
  apples: ko.observable 11
  oranges: ko.observable 12

ko.fireModel my_values, {apples: null},
  read_only: true
  read_once: true
  fire_ref: new Firebase('path/stone_fruit')

ko.fireModel my_values, {oranges: null},
  read_only: true
  read_once: true
  fire_ref: new Firebase('path/citrus')
```

# Using Fire List
Fire list extends observableArray to support default ordered firebase lists. Default order is no prority by key which is timestamp or creation order.

### Setup
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

list = ko.fireList
  fire_ref: new Firebase('path')
  keys_inits:
    type: 'apple'
    count: 2

```
via javascript:
``` javascript
var Firebase, list;

Firebase = require('firebase');

require('knockout-firebase');

list = ko.fireList({
  fire_ref: new Firebase('path'),
  keys_inits: {
    type: 'apple',
    count: 2
  }
});
```

## Options & Notes
1. fire_ref can be provided (or changed) later via 
``` coffeescript
# via coffeescript
my_value.Change_Fire_Ref new Firebase('path')
```
2. keys_inits is an object of firebase keys and default values
3. Unlike fireModel the defaults are not written back if the firebase values are null
4. One can also extend an observableArray with extend: {fireList: options}
5. internally the data is fetch with a once('value') and then kept in sync by other listners.
6. internally the objects are NOT fireModels nor fireValues
7. dispose() works and will remove any firebase listners
8. unlike fireValue and fireModel there is not any options for read_only or read_once

## Additional APIs
1. push, remove, splice, and shift all work
2. unshift, reverse, sort, removeAll, destroy, destroyAll do NOT work


# Using Fire Value by Refrence
Fire Value that switchs firebase paths based on an observable

## Setup
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_key = ko.observable 'path'

my_value = ko.fireValueByRef 'inital_value',
  read_only: true
  read_once: true
  fire_ref: new Firebase('path')
  ref_obs_id: my_key
```
via javascript:
``` javascript
var Firebase, my_key, my_value;

Firebase = require('firebase');

require('knockout-firebase');

my_key = ko.observable('path');

my_value = ko.fireValueByRef('inital_value', {
  read_only: true,
  read_once: true,
  fire_ref: new Firebase('path'),
  ref_obs_id: my_key
  child_path: 'child'
});
```

## Options & Notes
1. just like FireValue expect fire_ref and ref_obs_id are not optional
2. if ref_obs_id() is null or undefined it will disconnect from firebase
3. the path of the value is fire_ref + ref_obs_id() + child
4. child_path is optional
5. every time ref_obs_id changes it will re-read the value from firebase (even if read_once is true)
6. fireValueByRef return a fireValue object

# Using Fire Model by Refrence
Fire Model that switchs firebase paths based on an observable

## Setup
via coffeescript:
``` coffeescript
Firebase = require 'firebase'
require 'knockout-firebase'

my_values = 
  apples: ko.observable 11
  oranges: ko.observable 12

my_key = ko.observable 'path'

ko.fireModelByRef my_values, my_values,
  read_only: true
  read_once: true
  fire_ref: new Firebase('path')
  ref_obs_id: my_key
  child_path: 'path'
```
via javascript:
``` javascript
var Firebase, my_values, my_key;

Firebase = require('firebase');

require('knockout-firebase');

my_values = {
  apples: ko.observable(11),
  oranges: ko.observable(12)
};

my_key = ko.observable('path');

ko.fireModelByRef(my_values, my_values, {
  read_only: true,
  read_once: true,
  fire_ref: new Firebase('path'),
  ref_obs_id: my_key,
  child_path: 'path'
});
```

## Options & Notes
1. just like FireModel expect ref_obs_id is added and not optional
2. if ref_obs_id() is null or undefined it will disconnect from firebase
3. the path of the value is fire_ref + ref_obs_id() + child + keys
4. child_path is optional
5. every time ref_obs_id changes it will re-read the value from firebase 
6. FireModelByRef return a FireModel object

#License
Copyright © 2015 Curtis M. Humphrey and is licensed under the terms of the MIT License.
