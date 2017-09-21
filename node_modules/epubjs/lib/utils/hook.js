"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are asycn.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
var Hook = function () {
	function Hook(context) {
		_classCallCheck(this, Hook);

		this.context = context || this;
		this.hooks = [];
	}

	/**
  * Adds a function to be run before a hook completes
  * @example this.content.register(function(){...});
  */


	_createClass(Hook, [{
		key: "register",
		value: function register() {
			for (var i = 0; i < arguments.length; ++i) {
				if (typeof arguments[i] === "function") {
					this.hooks.push(arguments[i]);
				} else {
					// unpack array
					for (var j = 0; j < arguments[i].length; ++j) {
						this.hooks.push(arguments[i][j]);
					}
				}
			}
		}

		/**
   * Triggers a hook to run all functions
   * @example this.content.trigger(args).then(function(){...});
   */

	}, {
		key: "trigger",
		value: function trigger() {
			var args = arguments;
			var context = this.context;
			var promises = [];

			this.hooks.forEach(function (task) {
				var executing = task.apply(context, args);

				if (executing && typeof executing["then"] === "function") {
					// Task is a function that returns a promise
					promises.push(executing);
				}
				// Otherwise Task resolves immediately, continue
			});

			return Promise.all(promises);
		}

		// Adds a function to be run before a hook completes

	}, {
		key: "list",
		value: function list() {
			return this.hooks;
		}
	}, {
		key: "clear",
		value: function clear() {
			return this.hooks = [];
		}
	}]);

	return Hook;
}();

exports.default = Hook;
module.exports = exports["default"];