import { Foglet } from 'foglet-core';

import Leader from './Leader';

import Message from './Message';
import Ballot from './Ballot';

const DELTA = 2000;

export default class Paxos {
	/**
	 * @param {Foglet} node 
	 * @param {Network} overlayName
	 * @param {{id: string, position: {x: number, y: number}}} target 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader Méthode appelée quand le consensus est terminé
	 */
	constructor(node, overlayName, target, onLeader) {
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
		this._node = node;
		/** @private */
		this._target = target;
		/** @private */
		this._candidate = new Leader(overlayName, target, onLeader);
		/** @type {AbstractNetwork} @private */
		this._overlayName = overlayName;

		node.overlay(overlayName).network
			.on(Message.START, this._prepare.bind(this))
			.on(Message.PREPARE, this._acknowledge.bind(this))
			.on(Message.ACKNOWLEDGE, this._propose.bind(this))
			.on(Message.PROPOSE, this._accept.bind(this))
			.on(Message.ACCEPT, this._decide.bind(this))
			.on(Message.DECIDE, this._decided.bind(this));

		/*this.foglet.addHandler(
			Message.START,
			this.prepare.bind(this),
			this.overlay
		);

		this.foglet.addHandler(
			Message.PREPARE,
			this.acknowledge.bind(this),
			this.overlay
		);
		this.foglet.addHandler(
			Message.ACKNOWLEDGE,
			this.propose.bind(this),
			this.overlay
		);

		this.foglet.addHandler(
			Message.PROPOSE,
			this.accept.bind(this),
			this.overlay
		);

		this.foglet.addHandler(
			Message.ACCEPT,
			this.decide.bind(this),
			this.overlay
		);
		this.foglet.addHandler(
			Message.DECIDE,
			this.decided.bind(this),
			this.overlay
		);*/
	}

	start(resolver = null) {
		/** @private */
		this._resolver = resolver;
		const leader = this._candidate.leader;
		if (!leader)
			return;
		const myId = this._node.inViewID;
		const message = new Message(Message.START, {
			pid: myId,
			cible: 'tman'
		});

		if (leader.peer === myId) {
			this._prepare(myId, message);
		} else {
			this._node.overlay(this._overlayName).communication.sendUnicast(leader.peer, message);
			/*this.foglet.sendOverlayUnicast(
				this.overlay,
				leader.peer,
				message
			);*/
		}
	}

	/**
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_prepare(id, message) {
		if (this.periodic)
			return;
		this._progression.initialValue = message.content;
		Ballot.setPid(
			this._progression.ballot,
			this._node.inViewID
		);
		this._sendPrepare();
		this.periodic = setInterval(() => {
			this._sendPrepare();
		}, DELTA);
	}

	/** @private */
	_sendPrepare() {
		if (!this._candidate.isLeader())
			return;
		this._progression.proposed = [];
		this._progression.maxPeers = this._overlayName.network.getNeighbours();
		// this.foglet.neighboursOverlay(this.overlay).length + 1;

		const ballot = Ballot.increment(this._progression.ballot);
		const message = new Message(Message.PREPARE, {
			ballot,
			maxPeers: this._progression.maxPeers
		});
		for (let peer of this._node.overlay(this._overlayName).network.getNeighbours())
			this._node.overlay(this._overlayName).communication.sendUnicast(peer, message);
		// this.foglet.sendOverlayUnicastAll(this.overlay, message);
		this._acknowledge(this._node.inViewID, message);
	}

	/**
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_acknowledge(id, message) {
		// console.log(id, message)
		if (this._progression.decided) return;
		let { ballot, maxPeers } = message.content;
		this._progression.maxPeers = maxPeers;
		if (Ballot.greaterThan(ballot, this._progression.ballot)) {
			this._progression.ballot = ballot;

			const answer = new Message(Message.ACKNOWLEDGE, {
				ballot,
				acceptedBallot: this._progression.acceptedBallot,
				acceptedValue: this._progression.acceptedValue
			});

			if (id === this._node.inViewID) {
				this._propose(this._node.inViewID, answer);
			} else {
				this._node.overlay(this._overlayName).communication.sendUnicast(ballot.pid, answer);
				/*this.foglet.sendOverlayUnicast(
					this.overlay,
					ballot.pid,
					answer
				);*/
			}
		}
	}

	/**
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_propose(id, message) {
		// console.log(id, message)
		if (this._progression.decided) return;
		const { ballot, acceptedBallot, acceptedValue } = message.content;
		if (!acceptedBallot) return;

		this._progression.proposed.push({
			ballot: acceptedBallot,
			value: acceptedValue
		});

		if (this._majority(this._progression.proposed)) {
			let value = null;
			if (this._isNoValue()) {
				value = this._progression.initialValue;
			} else {
				value = this._greatestBallot().value;
			}
			const message = new Message(Message.PROPOSE, {
				ballot: ballot,
				value
			});
			// this.foglet.sendOverlayUnicastAll(this.overlay, message);
			for (let peer of this._node.overlay(this._overlayName).network.getNeighbours())
				this._node.overlay(this._overlayName).communication.sendUnicast(peer, message);
			this._accept(this._node.inViewID, message);
		}
	}

	/**
	 * 
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_accept(id, message) {
		if (this._progression.decided) return;

		const { ballot, value } = message.content;
		if (Ballot.greaterThan(ballot, this._progression.ballot)) {
			this._progression.acceptedBallot = ballot;
			this._progression.acceptedValue = value;
			const message = new Message(Message.ACCEPT, {
				ballot: this._progression.acceptedBallot,
				value: this._progression.acceptedValue
			});
			// this.foglet.sendOverlayUnicastAll(this.overlay, message);
			for (let peer of this._node.overlay(this._overlayName).network.getNeighbours())
				this._node.overlay(this._overlayName).communication.sendUnicast(peer, message);
			this._decide(this._node.inViewID, message);
		}
	}

	/**
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_decide(id, message) {
		if (this._progression.decided)
			return;
		const { ballot, value } = message.content;
		const bstring = Ballot.toString(ballot);

		if (!this._progression.accepted[bstring])
			this._progression.accepted[bstring] = { [id]: value };
		else
			this._progression.accepted[bstring][id] = value;

		if (!this._isMajorityValue(bstring, value))
			return;

		// this.progression.decided = value;
		// Normalement setInterval, mais pour tester je fais qu'une seule fois
		const answer = new Message(Message.DECIDE, { value });
		// this.foglet.sendOverlayUnicastAll(this.overlay, answer);
		for (let peer of this._node.overlay(this._overlayName).network.getNeighbours())
			this._node.overlay(this._overlayName).communication.sendUnicast(peer, answer);
		this._decided(this._node.inViewID, answer);
	}

	/**
	 * @param {*} id 
	 * @param {*} message 
	 * @private
	 */
	_decided(id, message) {
		if (this._progression.decided)
			return;
		const { value } = message.content;
		this._progression.decided = value;
		if (this._resolver)
			this._resolver(value);

		if (!this._candidate.isLeader())
			return;
		clearInterval(this.periodic);
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
		return array.length >= Math.floor(this._progression.maxPeers / 2 + 1);
	}

	/**
	 * @private
	 * @param {string} bstring 
	 * @param {*} value 
	 * @returns {boolean}
	 */
	_isMajorityValue(bstring, value) {
		let count = 0;
		const accepted = this._progression.accepted[bstring];
		Object.keys(accepted).forEach(key => {
			if (value && accepted[key].pid == value.pid)
				count++;
		});

		return count >= Math.floor(this._progression.maxPeers / 2 + 1);
	}
}