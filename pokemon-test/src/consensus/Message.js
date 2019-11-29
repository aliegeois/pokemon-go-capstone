class Message {
	constructor(type, content) {
		this.type = type;
		this.content = content;
	}
}

Message.START = 'start';
Message.PREPARE = 'prepare';
Message.ACKNOWLEDGE = 'acknowledge';
Message.PROPOSE = 'propose';
Message.ACCEPT = 'accept';
Message.DECIDE = 'decide';

module.exports = Message;