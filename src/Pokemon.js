import uuid from 'uuid/v4';

export default class Pokemon {
	/**
	 * 
	 * @param {string} name 
	 * @param {number} x 
	 * @param {number} y 
	 */
	constructor(name, x, y) {
		this.name = name;
		this.id = uuid();
		this.position = { x, y };
	}
}