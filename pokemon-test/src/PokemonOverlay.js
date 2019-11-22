// const AbstractOverlay = require('../paxos-overlays/lib/overlay/abstract.js');
const Overlay = require('foglet-core').abstract.tman;

module.exports = class PokemonOverlay extends Overlay {
	/**
	* Constructor
	* @param {Object} options - Additional options used to build the network
	* @return {NetworkManager} networkManager - Network manager used as root for the overlay
	*/
	constructor(networkManager, options) {
		super(networkManager, options);
	}

	_startDescriptor() {
		return {};
	}

	_descriptorTimeout() {
		return 30 * 1000;
	}

	_rankPeers() {
		return 0;
	}
}