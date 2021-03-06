import NetworkManager from 'foglet-core/src/network/network-manager';

import TManOverlay from './TManOverlay';
import Pokemon from '../Pokemon';
import distance from '../euclidianDistance';
import Consensus from '../consensus/VraiConsensusJeJure';

class LoggableMap extends Map {
	set(key, value) {
		//console.log(`set(${key}, ${value})`);
		super.set(key, value);
	}
}

export default class TMan extends TManOverlay {
	/**
	 * @param {NetworkManager} networkManager
	 */
	constructor(networkManager, options) {
		super(networkManager, options);

		//console.log('tman', this);

		/** @type {Map.<string, Pokemon>} */
		this.visiblePokemons = new LoggableMap();

		// networkManager.overlay('tman').network.rps.join().then(console.info);
		// console.log('rps', this._rps);
		/*this.communication.onUnicast((id, message) => {
			if(message.type === 'pokemon-spawned') {
				console.log(id + ' said that a pokemon has spawned');
				this.visiblePokemons.set(pokemon.id, new Consensus(this.node.overlay('tman'), pokemon, leader => {
					console.log('elected leader:', leader);
				}));
			}
		});*/
		this.rps.unicast.on('pokemon-spawned', message => {
			//console.log(message.peerId + ' said that a pokemon has spawned (' + message + ')');
			this.visiblePokemons.set(message.pokemon.id, new Consensus(this._manager.overlay(options.pid), message.pokemon, leader => {
				//console.log('elected leader:', leader);
			}));
		});
		/*this.rps.unicast.on('pokemon-spawned', ({ peerId, pokemon }) => {
			// this.emit('pokemon-spawned', pokemon);
			console.log('pokemon', pokemon, ' spawned (', peerId, ')');
			this.visiblePokemons.set(pokemon.id, new Consensus(this.node.overlay('tman'), pokemon, leader => {
				console.log('elected leader:', leader);
			}));
		});*/
		this.rps.unicast.on('pokemon-caught', message => {
			// this.emit('pokemon-catched', pokemon);
			console.log('Pokemon', message.pokemon.id, 'caught by', message.peerId);
			for (let pok of this.visiblePokemons) {
				console.log(pok.id);
			}
			this.visiblePokemons.delete(message.pokemon.id);
			options.markers.get(message.pokemon.id).setMap(null);
			console.log('markers : ',options.markers);
			options.markers.delete(message.pokemon.id);
		});



		/*this.rps.unicast
			.on(Message.START, message => { this.emit(Message.START, message) })
			.on(Message.PREPARE, message => { this.emit(Message.PREPARE, message) })
			.on(Message.ACKNOWLEDGE, message => { this.emit(Message.ACKNOWLEDGE, message) })
			.on(Message.PROPOSE, message => { this.emit(Message.PROPOSE, message) })
			.on(Message.ACCEPT, message => { this.emit(Message.ACCEPT, message) })
			.on(Message.DECIDE, message => { this.emit(Message.DECIDE, message) });*/


		// console.log('?', this._manager);

		// console.log('rps', this._rps);
		// console.log('unicast', this._rps.unicast);

		// this._rps.unicast.on('bite', console.info);
		// console.log('partialView', this._rps.partialView);
		// console.log('network', this._rps._network);

		this.rps.unicast.on('update-descriptor', message => {
			this.rps.cache.set(message.peerId, message.descriptor);
			// console.log('received updated descriptor from', peerId, descriptor);
		});
		setTimeout(() => {
			setInterval(() => {
				let nbPeers = 0;
				for (let [peerId, { descriptor }] of this.rps.partialView) {
					const x1 = descriptor.x;
					const y1 = descriptor.y;
					const x2 = this.rps.options.descriptor.x;
					const y2 = this.rps.options.descriptor.y;
					if (Math.hypot(Math.abs(x1 - x2), Math.abs(y1 - y2)) < 10)
						nbPeers++;
				}
				let p = 1 / (nbPeers + 1);
				let r = Math.random();
				if (r < p) {
					let x = this.rps.options.descriptor.x + (Math.random() - .5) / 4790 * this.rps.options.descriptor.x;
					let y = this.rps.options.descriptor.y + (Math.random() - .5) / 220 * this.rps.options.descriptor.y;
					this.spawnPokemon(new Pokemon('Evoli', x, y)); // x: descriptor.x + (Math.random() - .5) / 50 * descriptor.x (ça spawn dans un carré autour de nous)
				}
			}, 10 * 1000);
		}, 10*1000);


		setInterval(() => {
			for (let [peerId] of this.rps.partialView) {
				this.rps.unicast.emit('update-descriptor', peerId, {
					peerId: this.inviewId,
					descriptor: this.rps.options.descriptor
				});
			}
		}, 10 * 1000);
	}

	/**
	 * @param {Pokemon} pokemon 
	 */
	spawnPokemon(pokemon) {
		this.visiblePokemons.set(pokemon.id, new Consensus(this._manager.overlay(this.options.pid), pokemon, leader => {
			//console.log('elected leader is', leader);
		}));
		for (let [peerId, { descriptor }] of this.rps.partialView) {
			if (distance(this.rps.options.descriptor, descriptor) <= this.options.range) {
				//console.log('emit', 'pokemon-spawned', peerId, this.inviewId, pokemon);
				this.rps.unicast.emit('pokemon-spawned', peerId, {
					peerId: this.inviewId,
					pokemon
				});
			}
		}


		/*this.visiblePokemons.set(pokemon.id, new Consensus(node, 'tman', pokemon, leader => {
			console.log('elected leader is', leader);
		}));
		for (let [peerId, {descriptor}] of this.rps.partialView) {
			if(euclidianDistance(this.rps.options.descriptor, descriptor) <= this.options.range) {
				this.rps.unicast.emit('pokemon-spawned', peerId, {
					peerId: this.rps.inViewID,
					pokemon
				});
			}
		}*/
	}

	/** @private */
	_startDescriptor() {
		return {
			x: 0,
			y: 0
		}
	}

	/** @private */
	_descriptorTimeout() {
		return 10 * 1000;
	}

	/**
	 * @private
	 * @param {{x: number, y: number}} neighbour 
	 * @param {{x: number, y: number}} descriptorA 
	 * @param {{x: number, y: number}} descriptorB 
	 * @returns {number}
	 */
	_rankPeers(neighbour, descriptorA, descriptorB) {
		const distanceA = distance(neighbour.descriptor, descriptorA);
		const distanceB = distance(neighbour.descriptor, descriptorB);

		if (distanceA === distanceB) {
			return descriptorA.x >= descriptorB.x ? -1 : 1;
			/*if (descriptorA.x >= descriptorB.x) {
				return -1;
			} else if (descriptorA.x < descriptorB.x) {
				return 1;
			}*/
		}
		return distanceA - distanceB;
	}
}