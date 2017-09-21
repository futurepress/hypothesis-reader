"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathWebpack = require("path-webpack");

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

var _core = require("./utils/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {[document]} containerDocument xml document
 */
var Container = function () {
	function Container(containerDocument) {
		_classCallCheck(this, Container);

		this.packagePath = '';
		this.directory = '';
		this.encoding = '';

		if (containerDocument) {
			this.parse(containerDocument);
		}
	}

	/**
  * Parse the Container XML
  * @param  {document} containerDocument
  */


	_createClass(Container, [{
		key: "parse",
		value: function parse(containerDocument) {
			//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
			var rootfile;

			if (!containerDocument) {
				throw new Error("Container File Not Found");
			}

			rootfile = (0, _core.qs)(containerDocument, "rootfile");

			if (!rootfile) {
				throw new Error("No RootFile Found");
			}

			this.packagePath = rootfile.getAttribute("full-path");
			this.directory = _pathWebpack2.default.dirname(this.packagePath);
			this.encoding = containerDocument.xmlEncoding;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.packagePath = undefined;
			this.directory = undefined;
			this.encoding = undefined;
		}
	}]);

	return Container;
}();

exports.default = Container;
module.exports = exports["default"];