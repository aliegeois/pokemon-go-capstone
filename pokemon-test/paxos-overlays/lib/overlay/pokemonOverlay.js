'use strict'

const AbstractNetwork = require('foglet-core').abstract.rps

module.exports = class PokemonOverlay extends AbstractNetwork {

    constructor(options) {
        super(options);
        console.log("cc mdr");
    }

    _buildRPS(options) {
        console.log("buildRPS xd ptdr");
        return 2;
    }

}