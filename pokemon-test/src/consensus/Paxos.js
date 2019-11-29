/* eslint-disable no-unused-vars */
const Foglet = require('foglet-core').Foglet;

const Leader = require("./leader.js");

const Message = require('./Message.js');
const Ballot = require('./Ballot.js');

const DELTA = 2000;

class Paxos {
	/**
	 * @param {Foglet} foglet 
	 * @param {string} overlay 
	 * @param {function(string, {x: number, y: number, peer: string}): void} onLeader 
	 */
	constructor(foglet, overlay, onLeader) {
		this.progression = {
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

		this.candidate = new Leader(foglet, onLeader);
		this.overlay = overlay;

		this.candidate.foglet.addHandler(
			Message.START,
			this.prepare.bind(this),
			this.overlay
		);

		this.candidate.foglet.addHandler(
			Message.PREPARE,
			this.acknowledge.bind(this),
			this.overlay
		);
		this.candidate.foglet.addHandler(
			Message.ACKNOWLEDGE,
			this.propose.bind(this),
			this.overlay
		);

		this.candidate.foglet.addHandler(
			Message.PROPOSE,
			this.accept.bind(this),
			this.overlay
		);

		this.candidate.foglet.addHandler(
			Message.ACCEPT,
			this.decide.bind(this),
			this.overlay
		);
		this.candidate.foglet.addHandler(
			Message.DECIDE,
			this.decided.bind(this),
			this.overlay
		);
	}

	start(resolver = null) {
		this.resolver = resolver;
		const leader = this.candidate.getLeader(this.overlay);
		if (!leader) return;
		const myId = this.candidate.foglet.inViewID;
		const message = new Message(Message.START, {
			pid: myId,
			cible: this.overlay
		});

		if (leader.peer === myId) {
			this.prepare(myId, message);
		} else {
			this.candidate.foglet.sendOverlayUnicast(
				this.overlay,
				leader.peer,
				message
			);
		}
	}

	prepare(id, message) {
		// console.log(id, message)
		if (this.periodic) return;
		this.progression.initialValue = message.content;
		Ballot.setPid(
			this.progression.ballot,
			this.candidate.foglet.inViewID
		);
		this.sendPrepare();
		this.periodic = setInterval(() => {
			this.sendPrepare();
		}, DELTA);
	}

	sendPrepare() {
		if (!this.candidate.isLeader(this.overlay)) return;
		this.progression.proposed = [];
		this.progression.maxPeers =
			this.candidate.foglet.neighboursOverlay(this.overlay).length + 1;

		const ballot = Ballot.increment(this.progression.ballot);
		const message = new Message(Message.PREPARE, {
			ballot,
			maxPeers: this.progression.maxPeers
		});
		this.candidate.foglet.sendOverlayUnicastAll(this.overlay, message);
		this.acknowledge(this.candidate.foglet.inViewID, message);
	}

	acknowledge(id, message) {
		// console.log(id, message)
		if (this.progression.decided) return;
		let { ballot, maxPeers } = message.content;
		this.progression.maxPeers = maxPeers;
		if (Ballot.greaterThan(ballot, this.progression.ballot)) {
			this.progression.ballot = ballot;

			const answer = new Message(Message.ACKNOWLEDGE, {
				ballot,
				acceptedBallot: this.progression.acceptedBallot,
				acceptedValue: this.progression.acceptedValue
			});

			if (id === this.candidate.foglet.inViewID) {
				this.propose(this.candidate.foglet.inViewID, answer);
			} else {
				this.candidate.foglet.sendOverlayUnicast(
					this.overlay,
					ballot.pid,
					answer
				);
			}
		}
	}

	propose(id, message) {
		// console.log(id, message)
		if (this.progression.decided) return;
		const { ballot, acceptedBallot, acceptedValue } = message.content;
		if (!acceptedBallot) return;

		this.progression.proposed.push({
			ballot: acceptedBallot,
			value: acceptedValue
		});

		if (this.majority(this.progression.proposed)) {
			let value = null;
			if (this.isNoValue()) {
				value = this.progression.initialValue;
			} else {
				value = this.greatestBallot().value;
			}
			const message = new Message(Message.PROPOSE, {
				ballot: ballot,
				value
			});
			this.candidate.foglet.sendOverlayUnicastAll(this.overlay, message);
			this.accept(this.candidate.foglet.inViewID, message);
		}
	}

	accept(id, message) {
		if (this.progression.decided) return;

		const { ballot, value } = message.content;
		if (Ballot.greaterThan(ballot, this.progression.ballot)) {
			this.progression.acceptedBallot = ballot;
			this.progression.acceptedValue = value;
			const message = new Message(Message.ACCEPT, {
				ballot: this.progression.acceptedBallot,
				value: this.progression.acceptedValue
			});
			this.candidate.foglet.sendOverlayUnicastAll(this.overlay, message);
			this.decide(this.candidate.foglet.inViewID, message);
		}
	}

	decide(id, message) {
		if (this.progression.decided) return;
		const { ballot, value } = message.content;
		const bstring = Ballot.toString(ballot);

		if (!this.progression.accepted[bstring]) {
			this.progression.accepted[bstring] = { [id]: value };
		} else {
			this.progression.accepted[bstring][id] = value;
		}

		if (!this.isMajorityValue(bstring, value)) return;

		// this.progression.decided = value;
		// Normalement setInterval, mais pour tester je fais qu'une seule fois
		const answer = new Message(Message.DECIDE, { value });
		this.candidate.foglet.sendOverlayUnicastAll(this.overlay, answer);
		this.decided(this.candidate.foglet.inViewID, answer);
	}

	decided(id, message) {
		if (this.progression.decided) return;
		const { value } = message.content;
		this.progression.decided = value;
		if (this.resolver) this.resolver(value);

		if (!this.candidate.isLeader(this.overlay)) return;
		clearInterval(this.periodic);
	}

	isNoValue() {
		let noValue = true;
		this.progression.proposed.forEach(proposed => {
			noValue = noValue && proposed.value === null;
		});
		return noValue;
	}

	greatestBallot() {
		if (this.progression.length == 0)
			return;
		let greatest = this.progression.proposed[0];
		this.progression.proposed.forEach(proposed => {
			if (Ballot.greaterThan(proposed.ballot, greatest.ballot) && proposed.value !== null) {
				greatest = proposed;
			}
		});
		return greatest;
	}

	majority(array) {
		return array.length >= Math.floor(this.progression.maxPeers / 2 + 1);
	}

	isMajorityValue(bstring, value) {
		let count = 0;
		const accepted = this.progression.accepted[bstring];
		Object.keys(accepted).forEach(key => {
			if (value && accepted[key].pid == value.pid) count++;
		});

		return count >= Math.floor(this.progression.maxPeers / 2 + 1);
	}
}

module.exports = Paxos;
