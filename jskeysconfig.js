/*
 * Keys config generator
 * http://github.com/summerstyle/keysconfig
 *
 * Copyright 2013 Vera Lobacheva (summerstyle.ru)
 * Released under the GPL3 (GPL3.txt)
 *
 * Thu May 15 2013 15:15:27 GMT+0400
 */

'use strict';

var keysConfig = (function() {
	var keyboard = document.getElementById('keys'),
		keys_els = keyboard.getElementsByTagName('li'),
		keys = [],
		settings = {
			columns : false,
			order_by : 0 // 0 - by added, 1 - by alphabet, 4 - by codes , 3 - by blocks
		};

	var app = (function() {
		var events = {};
		
		return {
			on : function(event_name, callback) {
				var event_callbacks = events[events_name];
				
				if(!event_callbacks) {
					event_callbacks = [];
				}
				
				event_callbacks.push(callback);
			},
			off : function(event_name, callback) {
				var event_callbacks = events[events_name];
				
				if(!event_callbacks) {
					return;
				}
				
				var index = events_callback.indexOf(callback);
				
				if (index >= 0) {
					events_callback.splice(index, 1);
				}
			},
			run : function(event_name, data) {
				var callbacks = events[event_name];
				
				if (!callbacks || !callbacks.length) {
					return;
				}
				
				for (var i = 0, c = callbacks.length; i < c; i++) {
					callbacks[i](data);
				}
			}
		};
	})();
	
	var pressed_keys = (function(){
		var keys = [];
		
		return {
			add : function(key) {
				var index = keys.indexOf(key);
				
				if (index >= 0) {
					return;
				}
				
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
				var result = 'var KEYS = {<br />';
				
				for (var i = 0, len = keys.length, last = len - 1; i < len; i++) {
					result += '&nbsp;&nbsp;&nbsp;&nbsp;'
						+ keys[i].get_config();
						
					if (i !== last) {
						result += ',<br />';
					}
				}
				
				result += '<br />};';
				
				return result;
			}
		}
	})();

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
			}
		},
		foreachReverse : function(arr, func) {
			for(var i = arr.length - 1; i >= 0; i--) {
				func(arr[i], i);
			}
		},
		debug : (function() {
			var output = document.getElementById('debug');
			return function() {
				output.innerHTML = [].join.call(arguments, ' ');
			}
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
				}
			}
			
			return target;
		}
	};

	/* Key constructor */
	function Key(el) {
		this.el = el;
		this.code = el.dataset['keycode'];
		this.name = el.dataset['name'];
	}

	Key.prototype = {
		constructor : Key,

		select : function(without_pressed_keys) {
			this.el.classList.add('selected');
			if (!without_pressed_keys) {
				pressed_keys.add(this);
			};
		},
		deselect : function(without_pressed_keys) {
			this.el.classList.remove('selected');
			if (!without_pressed_keys) {
				pressed_keys.add(this);
			}
			pressed_keys.remove(this);
		},
		toggle : function(without_pressed_keys) {
			if (this.el.classList.contains('selected')) {
				this.deselect(without_pressed_keys);
			} else {
				this.select(without_pressed_keys);
			}
		},
		
		get_config : function() {
			return this.name.toUpperCase() + ' : ' + this.code;
		}
	};

	for(var i = 0, len = keys_els.length; i < len; i++) {
		keys.push(new Key(keys_els[i]));
		keys_els[i].dataset['id'] = i;
	}

	/* Buttons and actions */
	var buttons = (function() {
		var all = utils.id('nav').getElementsByTagName('li'),
			clear = utils.id('clear_button'),
			generate = utils.id('generate_button'),
			show_help = utils.id('help_button');
		
		function onClearButtonClick(e) {
			// Clear all
			if (confirm('Clear all?')) {
				pressed_keys.clear();
			}
			
			e.preventDefault();
		};
		
		function onGenerateButtonClick(e) {
			// Generate html code only
            code.print();
			
			e.preventDefault();
		};
		
		function onShowHelpButtonClick(e) {
			help.show();
			
			e.preventDefault();
		};
		
		clear.addEventListener('click', onClearButtonClick, false);
		generate.addEventListener('click', onGenerateButtonClick, false);
		show_help.addEventListener('click', onShowHelpButtonClick, false);
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
	
	/* For html code of keys config */
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
				content.innerHTML = pressed_keys.generate_config();
				utils.show(block);
			},
			hide: function() {
				utils.hide(block);
			}
		};
	})();



	keyboard.addEventListener('click', function(e) {
		var parent = e.target;

		while(parent) {
			if(parent.classList.contains('key')) {
				keys[parent.dataset['id']].toggle();

				break;
			}
			
			if(parent === keyboard) {
				break;
			}

			parent = parent.parentNode;
		}
			
	}, false);
})();