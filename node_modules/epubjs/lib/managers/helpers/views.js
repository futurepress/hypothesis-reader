"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Views = function () {
	function Views(container) {
		_classCallCheck(this, Views);

		this.container = container;
		this._views = [];
		this.length = 0;
		this.hidden = false;
	}

	_createClass(Views, [{
		key: "all",
		value: function all() {
			return this._views;
		}
	}, {
		key: "first",
		value: function first() {
			return this._views[0];
		}
	}, {
		key: "last",
		value: function last() {
			return this._views[this._views.length - 1];
		}
	}, {
		key: "indexOf",
		value: function indexOf(view) {
			return this._views.indexOf(view);
		}
	}, {
		key: "slice",
		value: function slice() {
			return this._views.slice.apply(this._views, arguments);
		}
	}, {
		key: "get",
		value: function get(i) {
			return this._views[i];
		}
	}, {
		key: "append",
		value: function append(view) {
			this._views.push(view);
			if (this.container) {
				this.container.appendChild(view.element);
			}
			this.length++;
			return view;
		}
	}, {
		key: "prepend",
		value: function prepend(view) {
			this._views.unshift(view);
			if (this.container) {
				this.container.insertBefore(view.element, this.container.firstChild);
			}
			this.length++;
			return view;
		}
	}, {
		key: "insert",
		value: function insert(view, index) {
			this._views.splice(index, 0, view);

			if (this.container) {
				if (index < this.container.children.length) {
					this.container.insertBefore(view.element, this.container.children[index]);
				} else {
					this.container.appendChild(view.element);
				}
			}

			this.length++;
			return view;
		}
	}, {
		key: "remove",
		value: function remove(view) {
			var index = this._views.indexOf(view);

			if (index > -1) {
				this._views.splice(index, 1);
			}

			this.destroy(view);

			this.length--;
		}
	}, {
		key: "destroy",
		value: function destroy(view) {
			if (view.displayed) {
				view.destroy();
			}

			if (this.container) {
				this.container.removeChild(view.element);
			}
			view = null;
		}

		// Iterators

	}, {
		key: "each",
		value: function each() {
			return this._views.forEach.apply(this._views, arguments);
		}
	}, {
		key: "clear",
		value: function clear() {
			// Remove all views
			var view;
			var len = this.length;

			if (!this.length) return;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				this.destroy(view);
			}

			this._views = [];
			this.length = 0;
		}
	}, {
		key: "find",
		value: function find(section) {

			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed && view.section.index == section.index) {
					return view;
				}
			}
		}
	}, {
		key: "displayed",
		value: function displayed() {
			var displayed = [];
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					displayed.push(view);
				}
			}
			return displayed;
		}
	}, {
		key: "show",
		value: function show() {
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					view.show();
				}
			}
			this.hidden = false;
		}
	}, {
		key: "hide",
		value: function hide() {
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					view.hide();
				}
			}
			this.hidden = true;
		}
	}]);

	return Views;
}();

exports.default = Views;
module.exports = exports["default"];