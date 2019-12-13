export default class Ballot {
	constructor(pid = '', n = 0) {
		this.pid = pid;
		this.n = n;
	}

	/**
	 * @param {Ballot} ballot1
	 * @param {Ballot} ballot2
	 * @returns {boolean}
	 */
	static greaterThan(ballot1, ballot2) {
		return ballot1.n > ballot2.n
			|| ballot1.n === ballot2.n && ballot1.pid > ballot2.pid
			|| ballot1.n === ballot2.n && ballot1.pid === ballot2.pid;
	}
}