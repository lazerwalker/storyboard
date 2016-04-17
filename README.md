# Storyboard

[![CI Status](http://img.shields.io/travis/lazerwalker/storyboard.svg?style=flat)](https://travis-ci.org/lazerwalker/storyboard)

Storyboard is a general-purpose engine for multilinear/nonlinear storytelling. It's written in JavaScript (ES6), and intended to be embedded within another game or application (such as the included-as-a-git-submodule [Storyboard-iOS](https://github.com/lazerwalker/storyboard-iOS.git) reference native iOS Swift project)

Right now, it's pre-alpha. Stay tuned for more.


## Setup and Usage

Real documentation is coming later; right now, this really isn't intended for use by anyone other than me.

That being said:

* `npm install` to install dependencies
* `gulp` to compile to a production file suitable for client-side JS consumption (`dist.js` in the root folder)
* `npm test` runs the test suite. It's got decent coverage at a functional, not unit, level.
* If using the reference iOS client, `git submodule update --init`
* Put your data files in the `examples` folder, with any media needed in a subfolder with the same name (e.g. `sample.json` would have a folder called `sample`)

Knock yourself out.


## Gulp scripts

For development, a few gulp scripts exist.

* `gulp browser` compiles a single `dist.js` file. This file exposes a `Game` class object in the global scope, and is intended to be used in client-side environments (e.g. JS within a web browser but without a Browserify pipeline, a JavaScriptCore thread on iOS)
* `gulp node` compiles each individual ES6 source file (in `src/`) into an equivalent non-ES6 file in `lib/`. This is intended for requiring storyboard as a `npm` library in node.js
* `gulp watch` is the equivalent of `gulp browser`, but listens for live file changes and automatically recompiles.


## License

This project is licensed under the MIT License. See the LICENSE file in this repository for more information.