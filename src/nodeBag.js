const _ = require('underscore')

import checkPredicate from "./predicate"

export default class Bag {
  constructor(nodes) {
    this.nodes = nodes;
  }

  checkNodes(state) {
    return this.nodes.filter( (node) => checkPredicate(node.predicate, state) );
  }
}