export default class Message {
	constructor(type, content) {
		this.type = type;
		this.content = content;
	}

	static get START() {
		return 'start';
	}

	static get PREPARE() {
		return 'prepare';
	}

	static get ACKNOWLEDGE() {
		return 'acknowledge';
	}

	static get PROPOSE() {
		return 'propose';
	}

	static get ACCEPT() {
		return 'accept';
	}

	static get DECIDE() {
		return 'decide';
	}
}