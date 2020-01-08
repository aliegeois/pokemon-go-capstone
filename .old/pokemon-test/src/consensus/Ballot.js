class Ballot {
	constructor() {
		this.pid = 0;
		this.n = 0;
	}
}

Ballot.setBallot = (ballot, { pid, n }) => {
	ballot.pid = pid;
	ballot.n = n;

	return ballot;
};

Ballot.setPid = (ballot, pid) => {
	ballot.pid = pid;

	return ballot;
};

Ballot.increment = ballot => {
	ballot.n = ballot.n + 1;

	return ballot;
};

Ballot.greaterThan = (ballot1, ballot2) => {
	return ballot1.n > ballot2.n
		|| ballot1.n === ballot2.n && ballot1.pid > ballot2.pid
		|| ballot1.n === ballot2.n && ballot1.pid === ballot2.pid;
}

Ballot.toString = ballot => ballot.pid + "-" + ballot.n;

module.exports = Ballot;