const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import Graph from '../src/nodeGraph'
import * as Actions from '../src/gameActions'

var graph;

// TODO: Unit-test this.