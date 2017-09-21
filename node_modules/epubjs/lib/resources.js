"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _replacements = require("./utils/replacements");

var _core = require("./utils/core");

var _url = require("./utils/url");

var _url2 = _interopRequireDefault(_url);

var _mime = require("../libs/mime/mime");

var _mime2 = _interopRequireDefault(_mime);

var _path = require("./utils/path");

var _path2 = _interopRequireDefault(_path);

var _pathWebpack = require("path-webpack");

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handle Package Resources
 * @class
 * @param {Manifest} manifest
 * @param {[object]} options
 * @param {[string="base64"]} options.replacements
 * @param {[Archive]} options.archive
 * @param {[method]} options.resolver
 */
var Resources = function () {
	function Resources(manifest, options) {
		_classCallCheck(this, Resources);

		this.settings = {
			replacements: options && options.replacements || "base64",
			archive: options && options.archive,
			resolver: options && options.resolver,
			request: options && options.request
		};
		this.manifest = manifest;
		this.resources = Object.keys(manifest).map(function (key) {
			return manifest[key];
		});

		this.replacementUrls = [];

		this.html = [];
		this.assets = [];
		this.css = [];

		this.urls = [];
		this.cssUrls = [];

		this.split();
		this.splitUrls();
	}

	/**
  * Split resources by type
  * @private
  */


	_createClass(Resources, [{
		key: "split",
		value: function split() {

			// HTML
			this.html = this.resources.filter(function (item) {
				if (item.type === "application/xhtml+xml" || item.type === "text/html") {
					return true;
				}
			});

			// Exclude HTML
			this.assets = this.resources.filter(function (item) {
				if (item.type !== "application/xhtml+xml" && item.type !== "text/html") {
					return true;
				}
			});

			// Only CSS
			this.css = this.resources.filter(function (item) {
				if (item.type === "text/css") {
					return true;
				}
			});
		}

		/**
   * Convert split resources into Urls
   * @private
   */

	}, {
		key: "splitUrls",
		value: function splitUrls() {

			// All Assets Urls
			this.urls = this.assets.map(function (item) {
				return item.href;
			}.bind(this));

			// Css Urls
			this.cssUrls = this.css.map(function (item) {
				return item.href;
			});
		}
	}, {
		key: "createUrl",
		value: function createUrl(url) {
			var parsedUrl = new _url2.default(url);
			var mimeType = _mime2.default.lookup(parsedUrl.filename);

			if (this.settings.archive) {
				return this.settings.archive.createUrl(url, { "base64": this.settings.replacements === "base64" });
			} else {
				if (this.settings.replacements === "base64") {
					return this.settings.request(url, 'blob').then(function (blob) {
						return (0, _core.blob2base64)(blob);
					}).then(function (blob) {
						return (0, _core.createBase64Url)(blob, mimeType);
					});
				} else {
					return this.settings.request(url, 'blob').then(function (blob) {
						return (0, _core.createBlobUrl)(blob, mimeType);
					});
				}
			}
		}

		/**
   * Create blob urls for all the assets
   * @return {Promise}         returns replacement urls
   */

	}, {
		key: "replacements",
		value: function replacements() {
			var _this = this;

			if (this.settings.replacements === "none") {
				return new Promise(function (resolve) {
					resolve(this.urls);
				}.bind(this));
			}

			var replacements = this.urls.map(function (url) {
				var absolute = _this.settings.resolver(url);

				return _this.createUrl(absolute).catch(function (err) {
					console.error(err);
					return null;
				});
			});

			return Promise.all(replacements).then(function (replacementUrls) {
				_this.replacementUrls = replacementUrls.filter(function (url) {
					return typeof url === "string";
				});
				return replacementUrls;
			});
		}

		/**
   * Replace URLs in CSS resources
   * @private
   * @param  {[Archive]} archive
   * @param  {[method]} resolver
   * @return {Promise}
   */

	}, {
		key: "replaceCss",
		value: function replaceCss(archive, resolver) {
			var replaced = [];
			archive = archive || this.settings.archive;
			resolver = resolver || this.settings.resolver;
			this.cssUrls.forEach(function (href) {
				var replacement = this.createCssFile(href, archive, resolver).then(function (replacementUrl) {
					// switch the url in the replacementUrls
					var indexInUrls = this.urls.indexOf(href);
					if (indexInUrls > -1) {
						this.replacementUrls[indexInUrls] = replacementUrl;
					}
				}.bind(this));

				replaced.push(replacement);
			}.bind(this));
			return Promise.all(replaced);
		}

		/**
   * Create a new CSS file with the replaced URLs
   * @private
   * @param  {string} href the original css file
   * @return {Promise}  returns a BlobUrl to the new CSS file or a data url
   */

	}, {
		key: "createCssFile",
		value: function createCssFile(href) {
			var _this2 = this;

			var newUrl;

			if (_pathWebpack2.default.isAbsolute(href)) {
				return new Promise(function (resolve) {
					resolve();
				});
			}

			var absolute = this.settings.resolver(href);

			// Get the text of the css file from the archive
			var textResponse;

			if (this.settings.archive) {
				textResponse = this.settings.archive.getText(absolute);
			} else {
				textResponse = this.settings.request(absolute, "text");
			}

			// Get asset links relative to css file
			var relUrls = this.urls.map(function (assetHref) {
				var resolved = _this2.settings.resolver(assetHref);
				var relative = new _path2.default(absolute).relative(resolved);

				return relative;
			});

			if (!textResponse) {
				// file not found, don't replace
				return new Promise(function (resolve) {
					resolve();
				});
			}

			return textResponse.then(function (text) {
				// Replacements in the css text
				text = (0, _replacements.substitute)(text, relUrls, _this2.replacementUrls);

				// Get the new url
				if (_this2.settings.replacements === "base64") {
					newUrl = (0, _core.createBase64Url)(text, "text/css");
				} else {
					newUrl = (0, _core.createBlobUrl)(text, "text/css");
				}

				return newUrl;
			}, function (err) {
				// handle response errors
				return new Promise(function (resolve) {
					resolve();
				});
			});
		}

		/**
   * Resolve all resources URLs relative to an absolute URL
   * @param  {string} absolute to be resolved to
   * @param  {[resolver]} resolver
   * @return {string[]} array with relative Urls
   */

	}, {
		key: "relativeTo",
		value: function relativeTo(absolute, resolver) {
			resolver = resolver || this.settings.resolver;

			// Get Urls relative to current sections
			return this.urls.map(function (href) {
				var resolved = resolver(href);
				var relative = new _path2.default(absolute).relative(resolved);
				return relative;
			}.bind(this));
		}

		/**
   * Get a URL for a resource
   * @param  {string} path
   * @return {string} url
   */

	}, {
		key: "get",
		value: function get(path) {
			var indexInUrls = this.urls.indexOf(path);
			if (indexInUrls === -1) {
				return;
			}
			if (this.replacementUrls.length) {
				return new Promise(function (resolve, reject) {
					resolve(this.replacementUrls[indexInUrls]);
				}.bind(this));
			} else {
				return this.createUrl(path);
			}
		}

		/**
   * Substitute urls in content, with replacements,
   * relative to a url if provided
   * @param  {string} content
   * @param  {[string]} url   url to resolve to
   * @return {string}         content with urls substituted
   */

	}, {
		key: "substitute",
		value: function substitute(content, url) {
			var relUrls;
			if (url) {
				relUrls = this.relativeTo(url);
			} else {
				relUrls = this.urls;
			}
			return (0, _replacements.substitute)(content, relUrls, this.replacementUrls);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.settings = undefined;
			this.manifest = undefined;
			this.resources = undefined;
			this.replacementUrls = undefined;
			this.html = undefined;
			this.assets = undefined;
			this.css = undefined;

			this.urls = undefined;
			this.cssUrls = undefined;
		}
	}]);

	return Resources;
}();

exports.default = Resources;
module.exports = exports["default"];