import uuid from 'uuid/v4';

import TManOverlay from './TManOverlay';
import Pokemon from './Pokemon';

import NetworkManager from 'foglet-core/src/network/network-manager';

export default class TMan extends TManOverlay {
	/**
	 * 
	 * @param {NetworkManager} networkManager
	 */
	constructor(networkManager, options) {
		super(networkManager, options);

		console.log('this', this);
		// networkManager.overlay('tman').network.rps.join().then(console.info);
		// console.log('rps', this._rps);
		this.rps.unicast.on('pokemon-spawned', ({ overlayName, pokemon }) => {
			console.log('pokemon spawned', { name: pokemon.name, x: pokemon.x, y: pokemon.y }, overlayName);

			const overlayConfig = {
				name: overlayName,
				class: Pokemon,
				options: {
					pid: overlayName,
					delta: 10 * 1000,
					timeout: 10 * 1000,
					pendingTimeout: 10 * 1000,
					maxPeers: Infinity,
					protocol: 'pokestone',
					signaling: {
						address: 'https://signaling.herokuapp.com',
						room: overlayName
					}
				}
			};

			this._manager._buildOverlay(overlayConfig);
			// console.log('benis', this._manager.overlay(overlayName).network.rps);
			this._manager.overlay(overlayName).network.rps._start();
		});

		this.rps.unicast.on('update-descriptor', ({ peerId, descriptor }) => {
			this._rps.cache.set(peerId, descriptor);
			// console.log('received updated descriptor from', peerId, descriptor);
		});




		// console.log('?', this._manager);

		// console.log('rps', this._rps);
		// console.log('unicast', this._rps.unicast);

		// this._rps.unicast.on('bite', console.info);
		// console.log('partialView', this._rps.partialView);
		// console.log('network', this._rps._network);

		setInterval(() => {
			for (let [peerId] of this.rps.partialView) {
				this.rps.unicast.emit('update-descriptor', peerId, {
					peerId: this.rps.parent.options.peer,
					descriptor: this._rps.options.descriptor
				});
				// console.log(`send updated descriptor to ${peerId}`);
			}
		}, 50 * 1000);
	}

	spawnPokemon(pokemon) {
		const overlayName = `pokemon-${uuid()}`,
			overlayConfig = {
				name: overlayName,
				class: Pokemon,
				options: {
					pid: overlayName,
					delta: 10 * 1000,
					timeout: 10 * 1000,
					pendingTimeout: 10 * 1000,
					maxPeers: Infinity,
					protocol: 'pokestone',
					signaling: {
						address: 'https://signaling.herokuapp.com',
						room: overlayName
					}
				}
			};

		this._manager._buildOverlay(overlayConfig);
		// console.log('benis', this._manager.overlay(overlayName).network.rps);
		this._manager.overlay(overlayName).network.rps._start();


		for (let [peerId] of this.rps.partialView) {
			this.rps.unicast.emit('pokemon-spawned', peerId, {
				peerId: this.rps.parent.options.peer,
				overlayName,
				pokemon
			});
		}
	}


	_startDescriptor() {
		return {
			x: 0,
			y: 0
		}
	}

	_descriptorTimeout() {
		return 10 * 1000;
	}

	/**
	 * 
	 * @param {*} neighbour 
	 * @param {{x: number, y: number}} descriptorA 
	 * @param {{x: number, y: number}} descriptorB 
	 */
	_rankPeers(neighbour, descriptorA, descriptorB) {
		const getDistance = (descriptor1, descriptor2) => {
			const { x: xa, y: ya } = descriptor1;
			const { x: xb, y: yb } = descriptor2;
			const dx = xa - xb;
			const dy = ya - yb;
			// const dz = za - zb;
			return Math.sqrt(dx * dx + dy * dy);
			//return Math.sqrt(dx * dx + dy * dy + dz * dz);
		};
		const distanceA = getDistance(neighbour.descriptor, descriptorA);
		const distanceB = getDistance(neighbour.descriptor, descriptorB);

		if (distanceA === distanceB) {
			if (descriptorA.x >= descriptorB.x) {
				return -1;
			} else if (descriptorA.x < descriptorB.x) {
				return 1;
			}
		}
		return distanceA - distanceB;
	}
}