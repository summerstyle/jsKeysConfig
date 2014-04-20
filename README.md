jsKeysConfig generator
======================

A simple generator of keys config for javascript browser apps (keydown and keyup events)

[http://github.com/summerstyle/jsKeysConfig] (http://github.com/summerstyle/jsKeysConfig)

Released under the GPL3 (GPL3.txt)


1. Set settings
---------------
A sorting type (by default - groups and alphabetical) and columns


2. Select keys
--------------
Press and select keys (a second click - deselect key)


3. Get config
-------------
and copy it in your js-code


4. Use config
-------------
switch (e.keyCode) {
    case KEYS.ENTER:
        // code
    case KEYS.DELETE:
        // code
}