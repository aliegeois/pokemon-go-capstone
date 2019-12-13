import { abstract } from 'foglet-core';

import Leader from './Leader';
import Message from './Message';
import Ballot from './Ballot';

const AbstractNetwork = abstract.rps;

const DELTA = 2000;

export default class Paxos {
	/**
	 * @param {AbstractNetwork} overlay
	 * @param {{id: string, position: {x: number, y: number}}} target 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader Méthode appelée quand le consensus est terminé
	 */
	constructor(overlay, target, onLeader) {
		/** @private */
		this._progression = {
			initialValue: null,
			maxPeers: 0,
			ballot: new Ballot(),
			value: null,
			acceptedBallot: new Ballot(),
			acceptedValue: null,
			proposed: [],
			accepted: {},
			decided: null
		};
		/** @private */
		this._overlay = overlay;
		/** @private */
		this._target = target;
		/** @private */
		this._candidate = new Leader(overlay, target, onLeader);



		this._overlay.network.rps.unicast.on(Message.START, message => { this._prepare(message.pid, message) })
			.on(Message.PREPARE, message => { this._acknowledge(message.pid, message) })
			.on(Message.ACKNOWLEDGE, message => { this._propose(message.pid, message) })
			.on(Message.PROPOSE, message => { this._accept(message.pid, message) })
			.on(Message.ACCEPT, message => { this._decide(message.pid, message) })
			.on(Message.DECIDE, message => { this._decided(message.pid, message) });
	}

	start(resolver = null) {
		console.group('start');
		console.log('starting paxos');
		/** @private */
		this._resolver = resolver;
		console.log(this._candidate);
		const leader = this._candidate.leader;
		console.log('leader', leader);
		if (!leader) {
			console.groupEnd('start');
			return;
		}

		const myId = this._overlay.network.inviewId;
		console.log('myId', myId);
		const message = new Message(Message.START, {
			pid: myId
		});
		console.log('message', message);

		console.log('leader.peer === myId ?', leader.peer === myId);
		if (leader.peer === myId) {
			console.groupEnd('start');
			this._prepare(myId, message);
		} else {
			this._overlay.network.rps.unicast.emit(message.type, leader.peer, message);
			// this._overlay.communication.sendUnicast(leader.peer, message);
			// this._node.overlay(this._overlayName).communication.sendUnicast(leader.peer, message);
			/*this.foglet.sendOverlayUnicast(
				this.overlay,
				leader.peer,
				message
			);*/
			console.groupEnd('start');
		}
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_prepare(id, message) {
		console.group('prepare');
		console.log('periodic ?', this._periodic);
		if (this._periodic) {
			console.groupEnd('prepare');
			return;
		}
		this._progression.initialValue = message.content;
		this._progression.ballot.pid = this._overlay.network.inViewId;
		console.groupEnd('prepare');
		this._sendPrepare();
		/** @private */
		this._periodic = setInterval(() => {
			this._sendPrepare();
		}, DELTA);
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_sendPrepare() {
		console.group('sendPrepare');
		console.log('candidate.isLeader ?', this._candidate.isLeader());
		if (!this._candidate.isLeader()) {
			console.groupEnd('sendPrepare');
			return;
		}
		this._progression.proposed = [];
		this._progression.maxPeers = this._overlay.network.getNeighbours().length + 1;
		// this.foglet.neighboursOverlay(this.overlay).length + 1;

		this._progression.ballot.n++;
		const message = new Message(Message.PREPARE, {
			pid: this._overlay.network.inviewId,
			ballot: this._progression.ballot,
			maxPeers: this._progression.maxPeers
		});
		for (let peer of this._overlay.network.getNeighbours())
			this._overlay.network.rps.unicast.emit(message.type, peer, message);
		// this._overlay.communication.sendUnicast(peer, message);
		// this.foglet.sendOverlayUnicastAll(this.overlay, message);
		console.groupEnd('sendPrepare');
		this._acknowledge(this._overlay.network.inViewId, message);
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_acknowledge(id, message) {
		console.group('acknowledge');
		console.log('decided ?', this._progression.decided);
		if (this._progression.decided) {
			console.groupEnd('acknowledge');
			return;
		}
		const ballot = new Ballot(message.content.ballot.pid, message.content.ballot.n)
		let { maxPeers } = message.content;
		this._progression.maxPeers = maxPeers;
		console.log('greaterThan ?', Ballot.greaterThan(ballot, this._progression.ballot));
		if (Ballot.greaterThan(ballot, this._progression.ballot)) {
			this._progression.ballot = ballot;

			const answer = new Message(Message.ACKNOWLEDGE, {
				pid: this._overlay.network.inviewId,
				ballot,
				acceptedBallot: this._progression.acceptedBallot,
				acceptedValue: this._progression.acceptedValue
			});

			console.log('id === inViewId ?', id === this._overlay.network.inViewId);
			if (id === this._overlay.network.inViewId) {
				console.groupEnd('acknowledge');
				this._propose(this._overlay.network.inViewId, answer);
			} else {
				// this._overlay.communication.sendUnicast(ballot.pid, answer);
				this._overlay.network.rps.unicast.emit(answer.type, ballot.pid, answer);
				/*this.foglet.sendOverlayUnicast(
					this.overlay,
					ballot.pid,
					answer
				);*/
				console.groupEnd('acknowledge');
			}
		} else {
			console.groupEnd('acknowledge');
		}
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_propose(id, message) {
		console.group('propose');
		// console.log(id, message)
		console.log('decided ?', this._progression.decided);
		if (this._progression.decided) {
			console.groupEnd('propose');
			return;
		}
		const ballot = new Ballot(message.content.ballot.pid, message.content.ballot.n);
		const acceptedBallot = new Ballot(message.content.acceptedBallot.pid, message.content.acceptedBallot.n);
		const { acceptedValue } = message.content;
		console.log('acceptedBallot ?', acceptedBallot);
		if (!acceptedBallot) {
			console.groupEnd('propose');
			return;
		}

		this._progression.proposed.push({
			ballot: acceptedBallot,
			value: acceptedValue
		});

		console.log('majority ?', this._majority(this._progression.proposed));
		if (this._majority(this._progression.proposed)) {
			const value = this._isNoValue() ? this._progression.initialValue : this._greatestBallot().value;
			console.log('value', value);
			const answer = new Message(Message.PROPOSE, {
				pid: this._overlay.network.inviewId,
				ballot,
				value
			});
			// this.foglet.sendOverlayUnicastAll(this.overlay, message);
			for (let peer of this._overlay.network.getNeighbours())
				// this._overlay.communication.sendUnicast(peer, message);
				this._overlay.network.rps.unicast.emit(answer.type, peer, answer);
			console.groupEnd('propose');
			this._accept(this._overlay.network.inViewId, answer);
		} else {
			console.groupEnd('propose');
		}
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_accept(id, message) {
		console.group('accept');
		console.log('decided', this._progression.decided);
		if (this._progression.decided) {
			console.groupEnd('accept');
			return;
		}

		const ballot = new Ballot(message.content.ballot.pid, message.content.ballot.n);
		const { value } = message.content;
		if (Ballot.greaterThan(ballot, this._progression.ballot)) {
			this._progression.acceptedBallot = ballot;
			this._progression.acceptedValue = value;
			const answer = new Message(Message.ACCEPT, {
				pid: this._overlay.network.inviewId,
				ballot: this._progression.acceptedBallot,
				value: this._progression.acceptedValue
			});
			// this.foglet.sendOverlayUnicastAll(this.overlay, message);
			for (let peer of this._overlay.network.getNeighbours())
				// this._overlay.communication.sendUnicast(peer, message);
				this._overlay.network.rps.unicast.emit(answer.type, peer, answer);
			console.groupEnd('accept');
			this._decide(this._overlay.network.inViewId, answer);
		} else {
			console.groupEnd('accept');
		}
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_decide(id, message) {
		console.group('decide');
		console.log('progression', this._progression);
		if (this._progression.decided) {
			console.groupEnd('decide');
			return;
		}
		const ballot = new Ballot(message.content.ballot.pid, message.content.ballot.n);
		const { value } = message.content;
		const bstring = `${ballot.pid}-${ballot.n}`;

		if (!this._progression.accepted[bstring])
			this._progression.accepted[bstring] = { [id]: value };
		else
			this._progression.accepted[bstring][id] = value;

		if (!this._isMajorityValue(bstring, value)) {
			console.groupEnd('decide');
			return;
		}

		// this.progression.decided = value;
		// Normalement setInterval, mais pour tester je fais qu'une seule fois
		const answer = new Message(Message.DECIDE, {
			pid: this._overlay.network.inviewId,
			value
		});
		// this.foglet.sendOverlayUnicastAll(this.overlay, answer);
		for (let peer of this._overlay.network.getNeighbours())
			// this._overlay.communication.sendUnicast(peer, answer);
			this._overlay.network.rps.unicast.emit(answer.type, peer, answer);
		console.groupEnd('decide');
		this._decided(this._overlay.network.inViewId, answer);
	}

	/**
	 * @param {string} id 
	 * @param {Message} message 
	 * @private
	 */
	_decided(id, message) {
		console.group('decided');
		console.log('decided');
		if (this._progression.decided) {
			console.groupEnd('decided');
			return;
		}
		const { value } = message.content;
		this._progression.decided = value;
		if (this._resolver)
			this._resolver(value);

		if (!this._candidate.isLeader()) {
			console.groupEnd('decided');
			return;
		}
		clearInterval(this._periodic);
		console.groupEnd('decided');
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	_isNoValue() {
		let noValue = true;
		for (let proposed of this._progression.proposed)
			noValue = noValue && proposed.value === null;
		/*this.progression.proposed.forEach(proposed => {
			noValue = noValue && proposed.value === null;
		});*/
		return noValue;
	}

	/**
	 * @private
	 * @returns {number?}
	 */
	_greatestBallot() {
		if (this._progression.length == 0)
			return;
		console.log('greatestBallot', this._progression.proposed);
		let greatest = this._progression.proposed[0];
		for (let proposed of this._progression.proposed)
			if (Ballot.greaterThan(proposed.ballot, greatest.ballot) && proposed.value !== null)
				greatest = proposed;
		/*this.progression.proposed.forEach(proposed => {
			if (Ballot.greaterThan(proposed.ballot, greatest.ballot) && proposed.value !== null)
				greatest = proposed;
		});*/
		return greatest;
	}

	/**
	 * @private
	 * @param {[]} array 
	 * @returns {boolean}
	 */
	_majority(array) {
		console.log('majority ?', array.length, '/', this._progression.maxPeers);
		return array.length >= Math.floor(this._progression.maxPeers / 2 + 1);
	}

	/**
	 * @private
	 * @param {string} bstring 
	 * @returns {boolean}
	 */
	_isMajorityValue(bstring, value) {
		let count = 0;
		const accepted = this._progression.accepted[bstring];
		for(let key of Object.keys(accepted)) {
			if (value && accepted[key].pid === value.pid)
				count++;
		}
		/*Object.keys(accepted).forEach(key => {
			if (value && accepted[key].pid === value.pid)
				count++;
		});*/

		return count >= Math.floor(this._progression.maxPeers / 2 + 1);
	}
}