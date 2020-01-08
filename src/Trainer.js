import { Foglet } from 'foglet-core';

export default class Trainer extends Foglet {
	constructor(options = {}) {
		super(options);
	}

	/**
	 * 
	 * @param {string} overlay 
	 * @param {string} id 
	 * @param {string} message 
	 */
	sendUnicastMessageOverOverlay(overlay, id, message) {
		this.overlay(overlay).communication.sendUnicast(id, message);
	}
}