# path.js
Node Path from v7.0.0 https://github.com/nodejs/node/blob/v7.0.0/lib/path.js

Win32 methods have been removed to make this only useful for the browser.

### Using with Webpack
Install as a dev dependency
```
npm install path-webpack --save-dev
```

Add an alias to this library in the config
```
// webpack.config.js
resolve: {
    alias: {
        path: "path-webpack"
    }
}
```
