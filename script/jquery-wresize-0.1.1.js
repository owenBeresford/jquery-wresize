/*jslint white: true, browser: true, devel: true,  nomen: true, todo: true */
/**
 *  jquery-wresize
 * 
 * Copyright (c) 2014 Owen Beresford, All rights reserved.
 * I have not signed a total rights contract, my employer isn't relevant.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * jquery-wresize ~ a very simple module to collapse stacks of events.
 *
 * @author: Owen beresford owencanprogram@fastmail.fm
 * @version: 0.1.1
 * @date: 01/04/2014
 * @licence: AGPL <http://www.gnu.org/licenses/agpl-3.0.html> 
 * 
 * deps: 
 *  jQuery must already be loaded 
 *
These are the options that are currently supported

   ** retryDelay (default 100) ~ how often to poll, in milliseconds. 
			Set to smaller for more responsive. Set to larger for less taxing on the CPU
   ** activation (default 500) ~ how to to wait before assuming the resizing is done, in milliseconds.  
			Set to smaller for more responsive, set to larger for less CPU usage

   ** debug (default 0) ~ write log messages?
   ** _continue (default 1) ~ after processing the event, continue polling?  MSIE had some issues with this being a bool, so its now an int. Use 0 for false etc etc.
   ** type (default 'resize') ~ which event?, please refer to a JS manual for the names.  Makes most sense to leave as 'resize'.
   ** realElement ~ Some browsers don't behave correctly for resize when not registered to the window.  Set this to use your element, or the code will force the use of window
   ** context (default null) ~ allow callbacks to be methods on objects, by passing a reference to the object.  Matches rest of jQuery.
   ** lastPoint ~ internal don't set
   ** callback ~ set this via wait()
   ** _hndl ~ internal, don't set
   ** killed ~ set this via abort()

PS, on FF this works best attached to the window, not the document.  Its a browser thing.

*/

(function($){
	"use strict";
	/**
	 * wresize ~ jQuery style constructor 
	 * 
	 * @param DOMElement el
	 * @param array options ~ see doc header
	 * @access public
	 * @return <object>
	 */
	$.wresize = function(el, options) {
// msie 8
		if (window.attachEvent && !window.addEventListener) {
			if(options.debug) {
				console.log("wresize() WARNING: Ancient browser, hopefully everything still computes.");
			}

		}


		function BufferedEvent(el, options) {
			this.$el  = $(el);
			this.el   = el;
			this.$el.data("wresize", this);
	         this.options = $.extend({}, $.wresize.defaultOptions, options);
			if(this.options.debug) {
				console.log("wresize() Created a BufferedEvent.");
			}
			return this; 	
		}

	/**
	 * wait ~ start the waiting process
	 * 
	 * @param function callback
	 * @param array param ~ optional param to the callback when its used
	 * @access public
	 * @return the object
	 */ 
	   BufferedEvent.prototype.wait = function(callback, param) {
			this.options.callback=callback;
			this.options.param=param;
			this._register(this.el, this.options.type, this._flush);
			this._wait();
			return this;
	    };
	    
	/**
	 * abort ~ abort timers and callbacks
	 * 
	 * @access public
	 * @return the object
	 */ 
	   BufferedEvent.prototype.abort=function() {
			this.options.killed=true;
			window.clearTimeout(this.options._hndl);
			if(this.options.debug) {
				console.log("wresize() ABORTED!!! ");
			}
			return this;
		};

	/**
	 * _register ~ a hidden function to add an event handler regardless of browser.
		  doing this by hand on purpose....
	 * 
	 * @param DOMElement ele ~ on what to register
	 * @param string type ~ which event to register
	 * @param function callback
	 * @access private
	 * @return void;
	 */ 
		BufferedEvent.prototype._register=function(ele, type, callback) {

			if (typeof ele === 'undefined') {
				if(this.options.debug) {
					console.log("wresize() was passed a null element.");
				}
				return;
			}
			if(typeof ele.jquery === 'string') {
				ele=ele[0];
			}
			if (typeof ele.addEventListener === 'function') {
				ele.addEventListener( type, callback.bind(this), false );
			} else if (typeof ele.attachEvent === 'function') {
				ele.attachEvent( "on" + type, callback );
			} else {
				if(this.options.debug) {
					console.log("wresize() failed over to single handler mode.  Please update your interpreter.");
				}
				ele["on"+type]=callback;
			}
		};

	/**
	 * _wait ~ a hidden function to delay until the stack of events has triggered
	 * 
	 * @access private
	 * @return void;
	 */ 
		BufferedEvent.prototype._wait =function() {
			var now= new Date().getTime();
			if(this.options.lastPoint>0 && now - this.options.activation > this.options.lastPoint) {
				if(this.options.debug) {
					console.log("wresize() triggering actual event now.");
				}

				this.options.callback.apply(
					this.options.context, 
					[ this.options.param ]
										);
				this.options.lastPoint=0;
				if(typeof this.options._continue === 'number' && this.options._continue && ! this.options.killed) {
// don't wipe... may wish to run again
					this.options._hndl=	window.setTimeout(this._wait.bind(this), this.options.retryDelay );
				}
			} else {
				if(! this.options.killed) {
					this.options._hndl=	window.setTimeout(this._wait.bind(this), this.options.retryDelay );
				}
			}
		};

	/**
	 * _flush ~ process the actual browser event
	 * 
	 * @access private
	 * @return void;
	 */ 
		BufferedEvent.prototype._flush=function() {
			if(this.options.debug) {
				console.log("wresize() have got a browser event ");
			}
			this.options.lastPoint=new Date().getTime();
		};

	    return new BufferedEvent(el, options);
	};

// pls see doc header 
	$.wresize.defaultOptions = {
	    retryDelay:100,
		activation:500,
		debug:1,
		type:'resize',
		lastPoint:0,
		_continue:1,
		context:null,
		callback:null,
		_hndl:null,
		killed:false,
	};
	
	/**
	 * wresize ~ only makes sense for singular objects
	 * 
	 * @param array options
	 * @access public
	 * @return void;
	 */ 
	$.fn.wresize = function(options) { 
		if(! options.realElement) {
	    	return new $.wresize(window, options);
		} 
	   	return new $.wresize(this, options);
	};
	
}(jQuery));
