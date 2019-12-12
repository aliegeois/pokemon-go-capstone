// import { Foglet } from 'foglet-core';
import Paxos from './Paxos';
import Pokemon from '../Pokemon';

export default class Consensus {
	/**
	 * @param {Network} overlay 
	 * @param {Pokemon} pokemon 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader 
	 */
	constructor(overlay, pokemon, onLeader) {
		console.log('consensus', overlay);
		this._pokemon = pokemon;
		this.paxos = new Paxos(overlay, pokemon, onLeader);
	}

	get pokemon() {
		return this._pokemon;
	}

	/**
	 * @return {Promise}
	 */
	catch() {
		return new Promise(resolve => this.paxos.start(resolve));
	}
}