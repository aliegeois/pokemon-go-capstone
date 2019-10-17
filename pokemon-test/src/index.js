// const { paxos, template, target } = require('foglet-template');
const { Foglet } = require('foglet-core');
const TMAN = require('../paxos-overlays/lib/overlay/overlay.js')

/*navigator.geolocation.getCurrentPosition(async position => {
	const x = position.coords.latitude;
	const y = position.coords.longitude;
	console.log('data:', {x, y});

	new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: x,
			lng: y
		},
		zoom: 18
	});
});*/

const fog = new Foglet({
	rps: {
		type: 'cyclon',
		options: {
			delta: 10 * 1000,
			timeout: 10 * 1000,
			pendingTimeout: 10 * 1000,
			protocol: 'my-awesome-broadcast-application', // the name of the protocol run by our app
			webrtc: { // some WebRTC options
				trickle: true, // enable trickle
				iceServers : [] // define iceServers here if you want to run this code outside localhost
			},
			signaling: { // configure the signaling server
				address: 'http://signaling.herokuapp.com', // put the URL of the signaling server here
				room: 'my-awesome-broadcast-application' // the name of the room for the peers of our application
			}
		}
	},
	overlays: [{
		name: 'tman',
		class: TMAN,
		options: {
			delta: 10 * 1000,
			timeout: 10 * 1000,
			pendingTimeout: 10 * 1000,
			maxPeers: 10,
			protocol: 'my-awesome-broadcast-application',
			signaling: {
				address: 'http://signaling.herokuapp.com',
				room: 'my-awesome-broadcast-application'
			}
		}
	}]
});

// connect the foglet to the signaling server
fog.share();

// Connect the foglet to our network
fog.connection().then(() => {
	fog.overlay('tman').network.rps._start();
	document.getElementById('id').innerHTML = fog.id;
	// listen for broadcast messages
	fog.onBroadcast((id, message) => {
		console.log('The peer', id, 'just sent me by broadcast:', message);
	});
	
	// send a message in broadcast
	fog.sendBroadcast('Hello World !');

	// console.log('voisins', fog.overlay().network.getNeighbours());
});

document.getElementById('refresh').addEventListener('click', () => {
	// document.getElementById('neighbours').innerHTML = fog.overlay().network.getNeighbours();
	const n = document.getElementById('neighbours');
	n.innerHTML = '';
	const tr1 = document.createElement('tr');
	for(let neighbour of fog.overlay().network.getNeighbours()) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		tr1.appendChild(td);
	}
	n.appendChild(tr1);
	const tr2 = document.createElement('tr');
	const overlayTman = fog.overlay('tman');
	console.log(overlayTman.network.getNeighbours());
	if(!overlayTman)
		return;
	for(let neighbour of overlayTman.network.getNeighbours()) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		tr2.appendChild(td);
	}
	n.appendChild(tr2);
});


window.fog = fog;