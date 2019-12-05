import { Foglet } from 'foglet-core';
import Paxos from './Paxos';
import Pokemon from '../Pokemon';

export default class Consensus {
	/**
	 * @param {Foglet} node 
	 * @param {string} overlayName 
	 * @param {Pokemon} pokemon 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader 
	 */
	constructor(node, overlayName, pokemon, onLeader) {
		this._pokemon = pokemon;
		this.paxos = new Paxos(node, overlayName, pokemon, onLeader);
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