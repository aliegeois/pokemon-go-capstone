/* eslint-disable no-unused-vars */

import fogletCore from 'foglet-core';
import Network from 'foglet-core/src/network/network';
// import tmanwrtc from 'tman-wrtc';
// import TManOverlay from '../overlay/TMan';
import euclidianDistance from '../euclidianDistance';

// const fc = require('foglet-core');
// const Network = require('foglet-core/src/network/network.js');
// const tmanwrtc = require('tman-wrtc');
// const TManOverlay = require('../overlay/TMan.js');

const Foglet = fogletCore.Foglet;
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
		const ranking = neighbour => (a, b) => {
			const distanceA = euclidianDistance(neighbour, a);
			const distanceB = euclidianDistance(neighbour, b);

			if (distanceA === distanceB)
				return a.id >= b.id ? 1 : -1;
			else
				return distanceA - distanceB;
		};
		
		const rps = overlay.network.rps;
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
			peer: overlay.inViewID
		});
		console.log(descriptors);
		descriptors.sort(ranking(pokemon));
		this.leader = descriptors[0];
		callback(this.leader);
	}

	/** @returns {boolean} */
	get isLeader() {
		return this.leader ? this.leader.peer == this.foglet.inViewID : false;
	}
}