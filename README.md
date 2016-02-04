# Storyboard

[![CI Status](http://img.shields.io/travis/lazerwalker/storyboard.svg?style=flat)](https://travis-ci.org/lazerwalker/storyboard)

Storyboard is a general-purpose engine for multilinear/nonlinear storytelling. It's written in JavaScript (ES6), and intended to be embedded within another game or application (such as the included-as-a-git-submodule [Storyboard-iOS](https://github.com/lazerwalker/storyboard-iOS.git) reference native iOS Swift project)

Right now, it's pre-alpha. Stay tuned for more.


## Setup and Usage

Real documentation is coming later; right now, this really isn't intended for use by anyone other than me.

That being said:

* `npm install` to install dependencies
* `gulp` to compile to a production file (`dist.js` in the root folder)
* `npm test` runs the test suite. It's got decent coverage at a functional, not unit, level.
* If using the reference iOS client, `git submodule update --init`
* Put your data files in the `examples` folder, with any media needed in a subfolder with the same name (e.g. `sample.json` would have a folder called `sample`)

Knock yourself out.


## License

This project is licensed under the MIT License. See the LICENSE file in this repository for more information.