class Ballot {
	constructor(pid = 0, n = 0) {
		this.pid = pid;
		this.n = n;
	}
}

/**
 * @param {Ballot} ballot
 * @returns {Ballot}
 */
Ballot.setBallot = (ballot, { pid, n }) => {
	ballot = { pid, n };

	return ballot;
};

/**
 * @param {Ballot} ballot
 * @param {number} pid
 * @returns {Ballot}
 */
Ballot.setPid = (ballot, pid) => {
	ballot.pid = pid;

	return ballot;
};

/**
 * @param {Ballot} ballot
 * @return {Ballot}
 */
Ballot.increment = ballot => {
	ballot.n++;

	return ballot;
};

/**
 * @param {Ballot} ballot1
 * @param {Ballot} ballot2
 * @returns {boolean}
 */
Ballot.greaterThan = (ballot1, ballot2) => {
	return ballot1.n > ballot2.n
		|| ballot1.n === ballot2.n && ballot1.pid > ballot2.pid
		|| ballot1.n === ballot2.n && ballot1.pid === ballot2.pid;
}

/**
 * @param {Ballot} ballot
 * @returns {string}
 */
Ballot.toString = ballot => `${ballot.pid}-${ballot.n}`;

// module.exports = Ballot;
export default Ballot;