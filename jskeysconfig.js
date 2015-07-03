/*
 * jsKeysConfig generator
 * http://github.com/summerstyle/jsKeysConfig
 * 
 * Copyright 2014 Vera Lobacheva (http://summerstyle.ru)
 * Released under the GPL3 (GPL3.txt)
 * 
 * Sun April 20 2014 20:25:15 GMT+0400
 * 
 */

'use strict';

var keysConfig = (function() {
    /* Settings */
    var settings = {
        columns : true,
        sort_by : 0 // 0 - by groups and alphabet, 1 - by added, 2 - by codes
    };
    
    /* Utilities */
    var utils = {
        id : function (str) {
            return document.getElementById(str);
        },
        hide : function(node) {
            node.style.display = 'none';
            
            return this;
        },
        show : function(node) {
            node.style.display = 'block';
            
            return this;
        },
        foreach : function(arr, func) {
            for(var i = 0, count = arr.length; i < count; i++) {
                func(arr[i], i);
            };
        },
        foreachReverse : function(arr, func) {
            for(var i = arr.length - 1; i >= 0; i--) {
                func(arr[i], i);
            };
        },
        debug : (function() {
            var output = document.getElementById('debug');
            
            return function() {
                output.innerHTML = [].join.call(arguments, ' ');
            };
        })(),
        stopEvent : function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            return this;
        },
        extend : function(obj, options) {
            var target = {};
            
            for (name in obj) {
                if(obj.hasOwnProperty(name)) {
                    target[name] = options[name] ? options[name] : obj[name];
                };
            };
            
            return target;
        }
    };
    
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

    /* Buttons and actions */
    var buttons = (function() {
        var all = utils.id('nav').getElementsByTagName('li'),
            clear = utils.id('clear_button'),
            settings = utils.id('settings_button'),
            get_config = utils.id('get_config_button'),
            show_help = utils.id('help_button');
        
        function onClearButtonClick(e) {
            // Deselect all keys
            if (confirm('Clear all?')) {
                selected_keys.clear();
                code.hide();
            };
            
            e.preventDefault();
        };
        
        function onGetConfigButtonClick(e) {
            // JS config code
            code.print();
            
            e.preventDefault();
        };
        
        function onShowHelpButtonClick(e) {
            // Help block
            help.show();
            
            e.preventDefault();
        };
        
        function onShowSettingsFormButtonClick(e) {
            // Settings form
            settings_form.show();
            
            e.preventDefault();
        };
        
        clear.addEventListener('click', onClearButtonClick, false);
        get_config.addEventListener('click', onGetConfigButtonClick, false);
        show_help.addEventListener('click', onShowHelpButtonClick, false);
        settings.addEventListener('click', onShowSettingsFormButtonClick, false);
    })();

    /* Help block */
    var help = (function() {
        var block = utils.id('help'),
            overlay = utils.id('overlay'),
            close_button = block.querySelector('.close_button');
            
        function hide() {
            utils.hide(block);
            utils.hide(overlay);
        }
        
        function show() {
            utils.show(block);
            utils.show(overlay);
        }
            
        overlay.addEventListener('click', hide, false);
            
        close_button.addEventListener('click', hide, false);
            
        return {
            show : show,
            hide : hide
        };  
    })();
    
    /* For js code of keys config */
    var code = (function(){
        var block = utils.id('code'),
            content = utils.id('code_content'),
            close_button = block.querySelector('.close_button');
            
        close_button.addEventListener('click', function(e) {
            utils.hide(block);
            e.preventDefault();
        }, false);
            
        return {
            print: function() {
                content.innerHTML = selected_keys.generate_config();
                utils.show(block);
            },
            hide: function() {
                utils.hide(block);
            }
        };
    })();
    
    /* Settings form */
    var settings_form = (function() {
        var form = utils.id('settings_form'),
            overlay = utils.id('overlay'),
            /* 2 parameters - sort and columns */
            inputs = {
                sort : [
                    utils.id('sort_alph'),
                    utils.id('sort_add'),
                    utils.id('sort_codes')
                ],
                columns : utils.id('with_columns')
            },
            save_button = form.querySelector('.save_button'),
            close_button = form.querySelector('.close_button');
        
        function show() {
            load();
            
            utils.show(form);
            utils.show(overlay);
        }
        
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
        
        function hide() {
            utils.hide(form);
            utils.hide(overlay);
        }
        
        function save(e) {
            e.preventDefault();
            
            settings.sort_by = inputs.sort[1].checked ? 1 : inputs.sort[2].checked ? 2 : 0;
            
            settings.columns = inputs.columns.checked;
            
            hide();
        }
        
        overlay.addEventListener('click', hide, false);
        
        close_button.addEventListener('click', hide, false);
        
        save_button.addEventListener('click', save, false);
        
        return {
            show : show,
            hide : hide
        };
    })();
    
})();
