// import uuid from 'uuid/v4';

// import { Foglet } from 'foglet-core';
import NetworkManager from 'foglet-core/src/network/network-manager';

import TManOverlay from './TManOverlay';
// import Message from '../consensus/Message';
import Pokemon from '../Pokemon';
import euclidianDistance from '../euclidianDistance';
// import Paxos from '../consensus/Paxos';
import Consensus from '../consensus/Consensus';

export default class TMan extends TManOverlay {
	/**
	 * 
	 * @param {NetworkManager} networkManager
	 */
	constructor(networkManager, options) {
		super(networkManager, options);

		console.log('this', this);

		this.visiblePokemons = new Map();

		console.log('node', options.node);
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
			console.log(message.peerId + ' said that a pokemon has spawned');
			this.visiblePokemons.set(message.pokemon.id, new Consensus(this.node.overlay('tman'), message.pokemon, leader => {
				console.log('elected leader:', leader);
			}));
		});
		/*this.rps.unicast.on('pokemon-spawned', ({ peerId, pokemon }) => {
			// this.emit('pokemon-spawned', pokemon);
			console.log('pokemon', pokemon, ' spawned (', peerId, ')');
			this.visiblePokemons.set(pokemon.id, new Consensus(this.node.overlay('tman'), pokemon, leader => {
				console.log('elected leader:', leader);
			}));
		});*/
		this.rps.unicast.on('pokemon-catched', ({ peerId, pokemon }) => {
			// this.emit('pokemon-catched', pokemon);
			console.log('Pokemon', pokemon.id, 'catched by', peerId);
		});

		this.rps.unicast.on('update-descriptor', ({ peerId, descriptor }) => {
			this.rps.cache.set(peerId, descriptor);
			// console.log('received updated descriptor from', peerId, descriptor);
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

		setInterval(() => {
			for (let [peerId] of this.rps.partialView) {
				this.rps.unicast.emit('update-descriptor', peerId, {
					peerId: this.rps.NI.PEER,
					descriptor: this.rps.options.descriptor
				});
				// console.log(`send updated descriptor to ${peerId}`);
			}
		}, 10 * 1000);
	}

	/**
	 * @param {Pokemon} pokemon 
	 */
	spawnPokemon(pokemon) {
		this.visiblePokemons.set(pokemon.id, new Consensus(this.node.overlay('tman'), pokemon, leader => {
			console.log('elected leader is', leader);
		}));
		for (let [peerId, {descriptor}] of this.rps.partialView) {
			if(euclidianDistance(this.rps.options.descriptor, descriptor) <= this.options.range) {
				console.log('emit', 'pokemon-spawned', peerId, this.rps.NI.PEER, pokemon);
				this.rps.unicast.emit('pokemon-spawned', peerId, {
					peerId: this.rps.NI.PEER,
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
	 * @param {*} neighbour 
	 * @param {{x: number, y: number}} descriptorA 
	 * @param {{x: number, y: number}} descriptorB 
	 */
	_rankPeers(neighbour, descriptorA, descriptorB) {
		const distanceA = euclidianDistance(neighbour.descriptor, descriptorA);
		const distanceB = euclidianDistance(neighbour.descriptor, descriptorB);

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