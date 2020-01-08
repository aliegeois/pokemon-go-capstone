export default class Consensus {
	/**
	 * @param {Network} overlay 
	 * @param {Pokemon} pokemon 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader 
	 */
	constructor(overlay, pokemon, onLeader) {
		console.log('consensus', this);
		/** @private */
		this._overlay = overlay;
		/** @private */
		this._pokemon = pokemon;
	}

	get pokemon() {
		return this._pokemon;
	}

	/**
	 * @return {Promise<string>}
	 */
	catch() {
		return Promise.resolve(this._overlay.network.rps.getInviewId());
	}
}