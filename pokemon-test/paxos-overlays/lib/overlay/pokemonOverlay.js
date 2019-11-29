const AbstractNetwork = require('foglet-core').abstract.rps
// const lmerge = require('lodash.merge');
const TMan = require('tman-wrtc');

module.exports = class PokemonOverlay extends AbstractNetwork {
	constructor(options) {
		super(options);
		console.log("cc mdr");
	}

	_buildRPS() {
		console.log("pokemonOverlay buildRPS");
		return new TMan();
	}

}