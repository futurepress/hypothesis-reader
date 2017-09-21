"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = require("../../utils/core");

var _epubcfi = require("../../epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _contents = require("../../contents");

var _contents2 = _interopRequireDefault(_contents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InlineView = function () {
	function InlineView(section, options) {
		_classCallCheck(this, InlineView);

		this.settings = (0, _core.extend)({
			ignoreClass: "",
			axis: "vertical",
			width: 0,
			height: 0,
			layout: undefined,
			globalLayoutProperties: {}
		}, options || {});

		this.id = "epubjs-view:" + (0, _core.uuid)();
		this.section = section;
		this.index = section.index;

		this.element = this.container(this.settings.axis);

		this.added = false;
		this.displayed = false;
		this.rendered = false;

		this.width = this.settings.width;
		this.height = this.settings.height;

		this.fixedWidth = 0;
		this.fixedHeight = 0;

		// Blank Cfi for Parsing
		this.epubcfi = new _epubcfi2.default();

		this.layout = this.settings.layout;
		// Dom events to listen for
		// this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];
	}

	_createClass(InlineView, [{
		key: "container",
		value: function container(axis) {
			var element = document.createElement("div");

			element.classList.add("epub-view");

			// if(this.settings.axis === "horizontal") {
			//   element.style.width = "auto";
			//   element.style.height = "0";
			// } else {
			//   element.style.width = "0";
			//   element.style.height = "auto";
			// }

			element.style.overflow = "hidden";

			if (axis && axis == "horizontal") {
				element.style.display = "inline-block";
			} else {
				element.style.display = "block";
			}

			return element;
		}
	}, {
		key: "create",
		value: function create() {

			if (this.frame) {
				return this.frame;
			}

			if (!this.element) {
				this.element = this.createContainer();
			}

			this.frame = document.createElement("div");
			this.frame.id = this.id;
			this.frame.style.overflow = "hidden";
			this.frame.style.wordSpacing = "initial";
			this.frame.style.lineHeight = "initial";

			this.resizing = true;

			// this.frame.style.display = "none";
			this.element.style.visibility = "hidden";
			this.frame.style.visibility = "hidden";

			if (this.settings.axis === "horizontal") {
				this.frame.style.width = "auto";
				this.frame.style.height = "0";
			} else {
				this.frame.style.width = "0";
				this.frame.style.height = "auto";
			}

			this._width = 0;
			this._height = 0;

			this.element.appendChild(this.frame);
			this.added = true;

			this.elementBounds = (0, _core.bounds)(this.element);

			return this.frame;
		}
	}, {
		key: "render",
		value: function render(request, show) {

			// view.onLayout = this.layout.format.bind(this.layout);
			this.create();

			// Fit to size of the container, apply padding
			this.size();

			// Render Chain
			return this.section.render(request).then(function (contents) {
				return this.load(contents);
			}.bind(this))
			// .then(function(doc){
			// 	return this.hooks.content.trigger(view, this);
			// }.bind(this))
			.then(function () {
				// this.settings.layout.format(view.contents);
				// return this.hooks.layout.trigger(view, this);
			}.bind(this))
			// .then(function(){
			// 	return this.display();
			// }.bind(this))
			// .then(function(){
			// 	return this.hooks.render.trigger(view, this);
			// }.bind(this))
			.then(function () {

				// apply the layout function to the contents
				this.settings.layout.format(this.contents);

				// Expand the iframe to the full size of the content
				// this.expand();

				// Listen for events that require an expansion of the iframe
				this.addListeners();

				if (show !== false) {
					//this.q.enqueue(function(view){
					this.show();
					//}, view);
				}
				// this.map = new Map(view, this.layout);
				//this.hooks.show.trigger(view, this);
				this.emit("rendered", this.section);
			}.bind(this)).catch(function (e) {
				this.emit("loaderror", e);
			}.bind(this));
		}

		// Determine locks base on settings

	}, {
		key: "size",
		value: function size(_width, _height) {
			var width = _width || this.settings.width;
			var height = _height || this.settings.height;

			if (this.layout.name === "pre-paginated") {
				// TODO: check if these are different than the size set in chapter
				this.lock("both", width, height);
			} else if (this.settings.axis === "horizontal") {
				this.lock("height", width, height);
			} else {
				this.lock("width", width, height);
			}
		}

		// Lock an axis to element dimensions, taking borders into account

	}, {
		key: "lock",
		value: function lock(what, width, height) {
			var elBorders = (0, _core.borders)(this.element);
			var iframeBorders;

			if (this.frame) {
				iframeBorders = (0, _core.borders)(this.frame);
			} else {
				iframeBorders = { width: 0, height: 0 };
			}

			if (what == "width" && (0, _core.isNumber)(width)) {
				this.lockedWidth = width - elBorders.width - iframeBorders.width;
				this.resize(this.lockedWidth, false); //  width keeps ratio correct
			}

			if (what == "height" && (0, _core.isNumber)(height)) {
				this.lockedHeight = height - elBorders.height - iframeBorders.height;
				this.resize(false, this.lockedHeight);
			}

			if (what === "both" && (0, _core.isNumber)(width) && (0, _core.isNumber)(height)) {

				this.lockedWidth = width - elBorders.width - iframeBorders.width;
				this.lockedHeight = height - elBorders.height - iframeBorders.height;

				this.resize(this.lockedWidth, this.lockedHeight);
			}
		}

		// Resize a single axis based on content dimensions

	}, {
		key: "expand",
		value: function expand(force) {
			var width = this.lockedWidth;
			var height = this.lockedHeight;

			var textWidth, textHeight;

			if (!this.frame || this._expanding) return;

			this._expanding = true;

			// Expand Horizontally
			if (this.settings.axis === "horizontal") {
				width = this.contentWidth(textWidth);
			} // Expand Vertically
			else if (this.settings.axis === "vertical") {
					height = this.contentHeight(textHeight);
				}

			// Only Resize if dimensions have changed or
			// if Frame is still hidden, so needs reframing
			if (this._needsReframe || width != this._width || height != this._height) {
				this.resize(width, height);
			}

			this._expanding = false;
		}
	}, {
		key: "contentWidth",
		value: function contentWidth(min) {
			return this.frame.scrollWidth;
		}
	}, {
		key: "contentHeight",
		value: function contentHeight(min) {
			return this.frame.scrollHeight;
		}
	}, {
		key: "resize",
		value: function resize(width, height) {

			if (!this.frame) return;

			if ((0, _core.isNumber)(width)) {
				this.frame.style.width = width + "px";
				this._width = width;
			}

			if ((0, _core.isNumber)(height)) {
				this.frame.style.height = height + "px";
				this._height = height;
			}

			this.prevBounds = this.elementBounds;

			this.elementBounds = (0, _core.bounds)(this.element);

			var size = {
				width: this.elementBounds.width,
				height: this.elementBounds.height,
				widthDelta: this.elementBounds.width - this.prevBounds.width,
				heightDelta: this.elementBounds.height - this.prevBounds.height
			};

			this.onResize(this, size);

			this.emit("resized", size);
		}
	}, {
		key: "load",
		value: function load(contents) {
			var loading = new _core.defer();
			var loaded = loading.promise;
			var doc = (0, _core.parse)(contents, "text/html");
			var body = (0, _core.qs)(doc, "body");

			/*
   var srcs = doc.querySelectorAll("[src]");
   	Array.prototype.slice.call(srcs)
   	.forEach(function(item) {
   		var src = item.getAttribute("src");
   		var assetUri = URI(src);
   		var origin = assetUri.origin();
   		var absoluteUri;
   			if (!origin) {
   			absoluteUri = assetUri.absoluteTo(this.section.url);
   			item.src = absoluteUri;
   		}
   	}.bind(this));
   */
			this.frame.innerHTML = body.innerHTML;

			this.document = this.frame.ownerDocument;
			this.window = this.document.defaultView;

			this.contents = new _contents2.default(this.document, this.frame);

			this.rendering = false;

			loading.resolve(this.contents);

			return loaded;
		}
	}, {
		key: "setLayout",
		value: function setLayout(layout) {
			this.layout = layout;
		}
	}, {
		key: "resizeListenters",
		value: function resizeListenters() {
			// Test size again
			// clearTimeout(this.expanding);
			// this.expanding = setTimeout(this.expand.bind(this), 350);
		}
	}, {
		key: "addListeners",
		value: function addListeners() {
			//TODO: Add content listeners for expanding
		}
	}, {
		key: "removeListeners",
		value: function removeListeners(layoutFunc) {
			//TODO: remove content listeners for expanding
		}
	}, {
		key: "display",
		value: function display(request) {
			var displayed = new _core.defer();

			if (!this.displayed) {

				this.render(request).then(function () {

					this.emit("displayed", this);
					this.onDisplayed(this);

					this.displayed = true;

					displayed.resolve(this);
				}.bind(this));
			} else {
				displayed.resolve(this);
			}

			return displayed.promise;
		}
	}, {
		key: "show",
		value: function show() {

			this.element.style.visibility = "visible";

			if (this.frame) {
				this.frame.style.visibility = "visible";
			}

			this.emit("shown", this);
		}
	}, {
		key: "hide",
		value: function hide() {
			// this.frame.style.display = "none";
			this.element.style.visibility = "hidden";
			this.frame.style.visibility = "hidden";

			this.stopExpanding = true;
			this.emit("hidden", this);
		}
	}, {
		key: "position",
		value: function position() {
			return this.element.getBoundingClientRect();
		}
	}, {
		key: "locationOf",
		value: function locationOf(target) {
			var parentPos = this.frame.getBoundingClientRect();
			var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

			return {
				"left": window.scrollX + parentPos.left + targetPos.left,
				"top": window.scrollY + parentPos.top + targetPos.top
			};
		}
	}, {
		key: "onDisplayed",
		value: function onDisplayed(view) {
			// Stub, override with a custom functions
		}
	}, {
		key: "onResize",
		value: function onResize(view, e) {
			// Stub, override with a custom functions
		}
	}, {
		key: "bounds",
		value: function bounds() {
			if (!this.elementBounds) {
				this.elementBounds = (0, _core.bounds)(this.element);
			}
			return this.elementBounds;
		}
	}, {
		key: "destroy",
		value: function destroy() {

			if (this.displayed) {
				this.displayed = false;

				this.removeListeners();

				this.stopExpanding = true;
				this.element.removeChild(this.frame);
				this.displayed = false;
				this.frame = null;

				this._textWidth = null;
				this._textHeight = null;
				this._width = null;
				this._height = null;
			}
			// this.element.style.height = "0px";
			// this.element.style.width = "0px";
		}
	}]);

	return InlineView;
}();

(0, _eventEmitter2.default)(InlineView.prototype);

exports.default = InlineView;
module.exports = exports["default"];