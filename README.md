# EPUB.js + Hypothesis Reader

Uses v0.3 of [EPUB.js](https://github.com/futurepress/epub.js) to display ePubs along with the Hypothesis sidebar.

Getting Started
-------------------------

The demo runs from `index.html` and pulls the dependencies from `node_modules` which can be installed with

```bash
npm install
```

Any static web server can server the files, but `http-server` is included for testing and can be run with

```bash
npm start
```

Books
-------------------------

By default a version of Moby Dick is loaded from the the Hypothesis CDN, but other books can be tested by changing the `url` param, such as `&url=http://example.com/path/to/my/book.epub`.

Other
-------------------------

EPUB is a registered trademark of the [IDPF](http://idpf.org/).