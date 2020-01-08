/* eslint-disable no-unused-vars */

const fc = require('foglet-core');
const Network = require('foglet-core/src/network/network.js');
const tmanwrtc = require('tman-wrtc');
const TManOverlay = require('../overlay/TMan.js');

const Foglet = fc.Foglet;
const AbstractNetwork = fc.abstract.rps;

class Leader {
	/**
	* @param {Foglet} [foglet]
	* @param {function(string): string} callback
	*/
	constructor(foglet, callback) {
		this.callback = callback;
		this.foglet = foglet; //

		this.leaderOfCible = new Map();

		this.ranking = neighbor => (a, b) => {
			/**
			 * 
			 * @param {{x: number, y: number}} d1 Descriptor 1
			 * @param {{x: number, y: number}} d2 Descriptor 2
			 */
			const getDistance = (d1, d2) => {
				const { x: xa, y: ya } = d1;
				const { x: xb, y: yb } = d2;
				const dx = xa - xb;
				const dy = ya - yb;
				return Math.sqrt(dx * dx + dy * dy);
			};

			const distanceA = getDistance(neighbor, a);
			const distanceB = getDistance(neighbor, b);

			if (distanceA === distanceB)
				return a.id >= b.id ? 1 : -1;
			else
				return distanceA - distanceB;
		};
		this.doLeaderElection();
	}

	doLeaderElection() {
		let visibleOverlay = Array.from(
			this.foglet._networkManager._overlays.keys() //
		);

		/** @type {Iterator<Network>} */
		const overlays = this.foglet._networkManager._overlays.values();

		/** @type {TManOverlay} */
		const overlay = this.foglet.overlay('tman');
		
		/** @type {AbstractNetwork} */
		const network = overlay.network;
		/** @type {tmanwrtc} */
		const rps = network.rps;
		const descriptors = Array.from(rps.partialView).map(([, neighboor]) => {
			return {
				...neighboor.descriptor,
				peer: neighboor.peer
			};
		});
		descriptors.push({
			...rps.options.descriptor,
			peer: network.inviewId
		});
		
		
		


		// let overlays = Array.from(
		// 	this.foglet._networkManager._overlays.values() //
		// );
		overlays.forEach((network_, index) => {
			let network = network_._network;
			let rps = network._rps;
			let myPeers = Array.from(rps.partialView.values()).map(evp => {
				let descriptor = evp.descriptor;
				descriptor.peer = evp.peer;
				return descriptor;
			});
			let descriptor = JSON.parse(JSON.stringify(rps.options.descriptor));
			descriptor.peer = network.inviewId;
			myPeers.push(descriptor);

			let cible = this.foglet.targets.filter(
				target => target.id === visibleOverlay[index]
			);
			if(cible.length > 0)
				cible = cible[0];

			Array.from(this.leaderOfCible.keys(), key => {
				if(visibleOverlay.indexOf(key) === -1) {
					this.leaderOfCible.delete(key);
				}
			});

			if(myPeers.length > 0) {
				myPeers.sort(this.ranking(cible.getCoordinates()));
				this.leaderOfCible.set(cible.id, myPeers[0]);
				this.callback({ cible: cible.id, pid: myPeers[0] });
			}
		});
	}

	getLeaders() {
		return Array.from(this.leaderOfCible.values()).map(
			desc => desc.peer || desc.id
		);
	}

	isLeader(overlay) {
		const leader = this.leaderOfCible.get(overlay);
		if(!leader)
			return false;
		return leader.peer == this.foglet.inViewID; //
	}

	getLeader(overlay) {
		return this.leaderOfCible.get(overlay);
	}
}

module.exports = Leader;
