/* eslint-disable no-unused-vars */

import fogletCore from 'foglet-core';
// import Network from 'foglet-core/src/network/network';
// import tmanwrtc from 'tman-wrtc';
// import TManOverlay from '../overlay/TMan';
import distance from '../euclidianDistance';

// const fc = require('foglet-core');
// const Network = require('foglet-core/src/network/network.js');
// const tmanwrtc = require('tman-wrtc');
// const TManOverlay = require('../overlay/TMan.js');

// const Foglet = fogletCore.Foglet;
const AbstractNetwork = fogletCore.abstract.rps;

export default class Leader {
	/**
	* @param {AbstractNetwork} overlay
	* @param {Pokemon} pokemon
	* @param {function(string): void} callback
	*/
	constructor(overlay, pokemon, callback) {
		/** @type {{peer: string}} */
		this.leader = null;

		/** @private */
		this._overlay = overlay;
		/** @private */
		this._pokemon = pokemon;
		/** @private */
		this._callback = callback;

		/** @private */
		this._ranking = neighbour => (a, b) => {
			const distanceA = distance(neighbour, a);
			const distanceB = distance(neighbour, b);
			if (distanceA === distanceB)
				return a.peer >= b.peer ? 1 : -1;
			else
				return distanceA - distanceB;
		};

		this.doLeaderElection();
	}

	doLeaderElection() {
		const rps = this._overlay.network.rps;
		/** @type {Map.<string, {peer: string, descriptor: {x: number, y: number}}>} */
		const partialView = rps.partialView;
		/** @type {{peer: string, x: number, y: number}[]} */
		const descriptors = Array.from(partialView).map(([, neighboor]) => {
			return {
				...neighboor.descriptor,
				peer: neighboor.peer
			};
		});
		descriptors.push({
			...rps.options.descriptor,
			peer: this._overlay.network.inviewId
		});
		console.log('leaders', descriptors);
		descriptors.sort(this._ranking(this._pokemon.position));
		this.leader = descriptors[0];
		console.log('leader', this.leader);
		this._callback(this.leader);
	}

	/** @returns {boolean} */
	isLeader() {
		return this.leader && this.leader.peer === this._overlay.network.inviewId;
	}
}