import lmerge from 'lodash.merge';
import TManOverlay from './TManOverlay';

export default class Pokemon extends TManOverlay {
	constructor(networkManager, options) {
		super(networkManager, {
			...options,
			maxPeers: Infinity
		});

		// this._setupListener();

		console.log('overlay pokemon started', this);

		this.rps.unicast.on('message', console.log);

		/*for (let [peerId] of this.rps.partialView) {
			this.rps.unicast.emit('message', peerId, {
				peerId: this.rps.parent.options.peer,
				message: 'coucou !'
			});
		}*/

		this.rps.on('open', console.warn);
	}

	_startDescriptor() {
		return {
			x: null,
			y: null,
			name: null
		}
	}

	_descriptorTimeout() {
		return Infinity;
	}

	/**
	 * 
	 * @param {*} neighbour 
	 * @param {{x: number, y: number}} descriptorA 
	 * @param {{x: number, y: number}} descriptorB 
	 */
	_rankPeers(neighbour, descriptorA, descriptorB) {
		const getDistance = (descriptor1, descriptor2) => {
			const { x: xa, y: ya } = descriptor1;
			const { x: xb, y: yb } = descriptor2;
			const dx = xa - xb;
			const dy = ya - yb;
			// const dz = za - zb;
			return Math.sqrt(dx * dx + dy * dy);
			//return Math.sqrt(dx * dx + dy * dy + dz * dz);
		};
		const distanceA = getDistance(neighbour.descriptor, descriptorA);
		const distanceB = getDistance(neighbour.descriptor, descriptorB);

		if (distanceA === distanceB) {
			if (descriptorA.x >= descriptorB.x) {
				return -1;
			} else if (descriptorA.x < descriptorB.x) {
				return 1;
			}
		}
		return distanceA - distanceB;
	}
}