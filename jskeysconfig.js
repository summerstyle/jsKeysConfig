/*
 * jsKeysConfig generator
 * http://github.com/summerstyle/jsKeysConfig
 * 
 * Copyright 2015 Vera Lobacheva (http://summerstyle.ru)
 * Released under the GPL3 (GPL3.txt)
 */

'use strict';

var keysConfig = (function() {
    /* Settings */
    var settings = {
        columns : true,
        sort_by : 0 // 0 - by groups and alphabet, 1 - by added, 2 - by codes
    };

    var utils = App.utils;
    
    /* Keyboard */
    var keyboard = (function() {
        var el = document.getElementById('keys'),
            keys_els = el.getElementsByClassName('key'),
            show_codes = document.getElementById('show_codes'),
            keys = {};
            
        /* Key constructor */
        function Key(el) {
            var code = parseInt(el.dataset['keycode']),
                key = keys[code];
            
            if (key) {
                key.add_el(el);
                return {};
            };
            
            this.els = [el];
            this.code = code;
            this.name = el.dataset['name'];
            this.group = el.dataset['group'];
            
            keys[code] = this;
        }
    
        Key.prototype = {
            constructor : Key,
            select : function(without_selected_keys) {
                for (var i = 0, c = this.els.length; i < c; i++) {
                    this.els[i].classList.add('selected');
                };
                
                if (!without_selected_keys) {
                    selected_keys.add(this);
                };
            },
            deselect : function(without_selected_keys) {
                for (var i = 0, c = this.els.length; i < c; i++) {
                    this.els[i].classList.remove('selected');
                };
                
                if (!without_selected_keys) {
                    selected_keys.remove(this);
                };
            },
            toggle : function(without_selected_keys) {
                if (this.els[0].classList.contains('selected')) {
                    this.deselect(without_selected_keys);
                } else {
                    this.select(without_selected_keys);
                };
            },
            /* config only for this key */
            get_config : function(width) {
                var spaces = '';
                
                if (width) {
                    for (var i = 0; i < width - this.name.length; i++) {
                        spaces += '&nbsp;';
                    };
                };
                
                return this.name.toUpperCase() + spaces + ' : ' + this.code;
            },
            /* For 2 keys with one code, for example, shift key */
            add_el : function(el) {
                this.els.push(el);
            }
        };
        
        for(var i = 0, len = keys_els.length; i < len; i++) {
            new Key(keys_els[i]);
        };
            
        // Select keys by click
        el.addEventListener('click', function(e) {
            var parent = e.target;
    
            while(parent) {
                if(parent.classList.contains('key')) {
                    keys[parent.dataset['keycode']].toggle();
    
                    break;
                };
                
                if(parent === el) {
                    break;
                };
    
                parent = parent.parentNode;
            };
                
        }, false);
        
        /* Show keyCodes switcher */
        show_codes.checked = false;
        show_codes.addEventListener('change', function(e) {
            if (show_codes.checked) {
                el.classList.add('with_codes');
            } else {
                el.classList.remove('with_codes');
            };
        }, false);
        
        return {
            
        };
    })();
    
    /* Selected keys */
    var selected_keys = (function(){
        var keys = [];
        
        return {
            add : function(key) {
                var index = keys.indexOf(key);
                
                if (index >= 0) {
                    return;
                };
                
                keys.push(key);
            },
            remove : function(key) {
                var index = keys.indexOf(key);

                if (index < 0) {
                    return;
                }
                
                keys.splice(index, 1);
            },
            clear : function() {
                for (var i = 0, len = keys.length; i < len; i++) {
                    keys[i].deselect(true);
                };
                
                keys.length = 0;
            },
            generate_config : function() {
                var result = 'var KEYS = {<br />',
                    max_code_name_length = 0,
                    arr;
                
                switch (settings.sort_by) {
                    case 0:
                        arr = keys.sort(function(a, b) {
                            if (a.group > b.group) {
                                return 1;
                            };
                            
                            if (a.group === b.group) {
                                /* F-group keys - sort by numbers */
                                if (a.group === 'f') {
                                    
                                    if (parseInt(a.name.replace('F', '')) > parseInt(b.name.replace('F', ''))) {
                                        return 1;
                                    };
                                    
                                    return -1;
                                };
                                
                                if (a.name > b.name) {
                                    return 1;
                                };
                            };
                            
                            return -1;
                        });
                        
                        break;
                    
                    case 1:
                        arr = keys;
                        break;
                    
                    case 2:
                        arr = keys.sort(function(a, b) {
                            if (a.code > b.code) {
                                return 1;
                            };
                            
                            return -1;
                        });
                        
                        break;
                };
                
                if (settings.columns) {
                    for (var i = 0, len = keys.length; i < len; i++) {
                        if (max_code_name_length < keys[i].name.length) {
                            max_code_name_length = keys[i].name.length;
                        };
                    };
                };
        
                for (var i = 0, len = arr.length, last = len - 1; i < len; i++) {
                    result += '&nbsp;&nbsp;&nbsp;&nbsp;'
                        + arr[i].get_config(settings.columns ? max_code_name_length : null);
                        
                    if (i !== last) {
                        result += ',<br />';
                    };
                };
                
                result += '<br />};';
                
                return result;
            }
        }
    })();

    // Menu
    var menu = new App.Menu(utils.dom.id('nav'), {
        'clear' : function() {
            // Deselect all keys
            if (confirm('Clear all?')) {
                selected_keys.clear();
                code.hide();
            };
        },
        'get_config' : function() {
            code.print();
        },
        'show_help' : function() {
            help.show();
        },
        'settings' : function() {
            settings_form.open();
        } 
    });

    /* Help block */
    var help = new App.Window({
        content_el : document.getElementById('help'),
        overlay : true
    });
    
    /* For js code of keys config */
    var code = new App.Window({
        content_el : utils.dom.id('code'),
        overlay : true,
        js_module : function(self) {
            return {
                print: function() {
                    self.content_el.innerHTML = selected_keys.generate_config();
                    self.show();
                }
            };
        }
    });
    
    /* Settings form */
    var settings_form = new App.Window({
        content_el : utils.dom.id('settings_form'),
        overlay : true,
        js_module : function(self) {
            var form = self.content_el;
            
            /* 2 parameters - sort and columns */
            var inputs = {
                sort : [
                    utils.dom.id('sort_alph'),
                    utils.dom.id('sort_add'),
                    utils.dom.id('sort_codes')
                ],
                columns : utils.dom.id('with_columns')
            },
            save_button = form.querySelector('.save_button');
        
            function load() {
                switch (settings.sort_by) {
                    case 1:
                        inputs.sort[0].checked = false;
                        inputs.sort[1].checked = true;
                        inputs.sort[2].checked = false;
                        break;
                    
                    case 2:
                        inputs.sort[0].checked = false;
                        inputs.sort[1].checked = false;
                        inputs.sort[2].checked = true;
                        break;
                    
                    default:
                        inputs.sort[0].checked = true;
                        inputs.sort[1].checked = false;
                        inputs.sort[2].checked = false;
                };
                
                inputs.columns.checked = settings.columns;
            }
            
            function save(e) {
                e.preventDefault();
                
                settings.sort_by = inputs.sort[1].checked ? 1 : inputs.sort[2].checked ? 2 : 0;
                
                settings.columns = inputs.columns.checked;
                
                self.hide();
            }
            
            save_button.addEventListener('click', save, false);
           
            return {
                open : function() {
                    load();
                    
                    self.show();
                }
            };
        }
    });

})();
