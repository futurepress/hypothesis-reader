"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = require("./utils/url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Themes = function () {
	function Themes(rendition) {
		_classCallCheck(this, Themes);

		this.rendition = rendition;
		this._themes = {
			"default": {
				"rules": {},
				"url": "",
				"serialized": ""
			}
		};
		this._overrides = {};
		this._current = "default";
		this._injected = [];
		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.content.register(this.overrides.bind(this));
	}

	_createClass(Themes, [{
		key: "register",
		value: function register() {
			if (arguments.length === 0) {
				return;
			}
			if (arguments.length === 1 && _typeof(arguments[0]) === "object") {
				return this.registerThemes(arguments[0]);
			}
			if (arguments.length === 1 && typeof arguments[0] === "string") {
				return this.default(arguments[0]);
			}
			if (arguments.length === 2 && typeof arguments[1] === "string") {
				return this.registerUrl(arguments[0], arguments[1]);
			}
			if (arguments.length === 2 && _typeof(arguments[1]) === "object") {
				return this.registerRules(arguments[0], arguments[1]);
			}
		}
	}, {
		key: "default",
		value: function _default(theme) {
			if (!theme) {
				return;
			}
			if (typeof theme === "string") {
				return this.registerUrl("default", theme);
			}
			if ((typeof theme === "undefined" ? "undefined" : _typeof(theme)) === "object") {
				return this.registerRules("default", theme);
			}
		}
	}, {
		key: "registerThemes",
		value: function registerThemes(themes) {
			for (var theme in themes) {
				if (themes.hasOwnProperty(theme)) {
					if (typeof themes[theme] === "string") {
						this.registerUrl(theme, themes[theme]);
					} else {
						this.registerRules(theme, themes[theme]);
					}
				}
			}
		}
	}, {
		key: "registerUrl",
		value: function registerUrl(name, input) {
			var url = new _url2.default(input);
			this._themes[name] = { "url": url.toString() };
			if (this._injected[name]) {
				this.update(name);
			}
		}
	}, {
		key: "registerRules",
		value: function registerRules(name, rules) {
			this._themes[name] = { "rules": rules };
			// TODO: serialize css rules
			if (this._injected[name]) {
				this.update(name);
			}
		}
	}, {
		key: "select",
		value: function select(name) {
			var prev = this._current;
			var contents;

			this._current = name;
			this.update(name);

			contents = this.rendition.getContents();
			contents.forEach(function (content) {
				content.removeClass(prev);
				content.addClass(name);
			});
		}
	}, {
		key: "update",
		value: function update(name) {
			var _this = this;

			var contents = this.rendition.getContents();
			contents.forEach(function (content) {
				_this.add(name, content);
			});
		}
	}, {
		key: "inject",
		value: function inject(contents) {
			var links = [];
			var themes = this._themes;
			var theme;

			for (var name in themes) {
				if (themes.hasOwnProperty(name) && (name === this._current || name === "default")) {
					theme = themes[name];
					if (theme.rules && Object.keys(theme.rules).length > 0 || theme.url && links.indexOf(theme.url) === -1) {
						this.add(name, contents);
					}
					this._injected.push(name);
				}
			}

			if (this._current != "default") {
				contents.addClass(this._current);
			}
		}
	}, {
		key: "add",
		value: function add(name, contents) {
			var theme = this._themes[name];

			if (!theme || !contents) {
				return;
			}

			if (theme.url) {
				contents.addStylesheet(theme.url);
			} else if (theme.serialized) {
				// TODO: handle serialized
			} else if (theme.rules) {
				contents.addStylesheetRules(theme.rules);
				theme.injected = true;
			}
		}
	}, {
		key: "override",
		value: function override(name, value) {
			var _this2 = this;

			var contents = this.rendition.getContents();

			this._overrides[name] = value;

			contents.forEach(function (content) {
				content.css(name, _this2._overrides[name]);
			});
		}
	}, {
		key: "overrides",
		value: function overrides(contents) {
			var overrides = this._overrides;

			for (var rule in overrides) {
				if (overrides.hasOwnProperty(rule)) {
					contents.css(rule, overrides[rule]);
				}
			}
		}
	}, {
		key: "fontSize",
		value: function fontSize(size) {
			this.override("font-size", size);
		}
	}, {
		key: "font",
		value: function font(f) {
			this.override("font-family", f);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.rendition = undefined;
			this._themes = undefined;
			this._overrides = undefined;
			this._current = undefined;
			this._injected = undefined;
		}
	}]);

	return Themes;
}();

exports.default = Themes;
module.exports = exports["default"];