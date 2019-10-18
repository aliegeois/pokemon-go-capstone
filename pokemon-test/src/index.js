// const { paxos, template, target } = require('foglet-template');
const { Foglet } = require('foglet-core');
const TMAN = require('../paxos-overlays/lib/overlay/overlay.js');
const fetch = require('node-fetch');

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

let fog;

let refresh = () => {
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
	// console.log(overlayTman.network.getNeighbours());
	if(!overlayTman)
		return;
	for(let neighbour of overlayTman.network.getNeighbours()) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		tr2.appendChild(td);
	}
	n.appendChild(tr2);
};

fetch('https://signaling.herokuapp.com/ice').then(data => data.json()).then(data => {
	// console.log(data.ice.map(e => {return {...e, urls: e.url}}));
	let data2 = data.ice.map(e => {
		let e2 = {
			...e,
			urls: e.url
		};
		delete e2.url;
		return e2;
	});
	// console.log(data2);
	fog = new Foglet({
		rps: {
			type: 'cyclon',
			options: {
				delta: 10 * 1000,
				timeout: 10 * 1000,
				pendingTimeout: 30 * 1000,
				protocol: 'pokestone', // the name of the protocol run by our app
				webrtc: { // some WebRTC options
					trickle: true, // enable trickle
					// iceServers : data.ice, // define iceServers here if you want to run this code outside localhost
					config: {
						iceServers: data2
					}
				},
				signaling: { // configure the signaling server
					address: 'https://signaling.herokuapp.com', // put the URL of the signaling server here
					room: 'pokestone' // the name of the room for the peers of our application
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
				protocol: 'pokestone',
				signaling: {
					address: 'https://signaling.herokuapp.com',
					room: 'pokestone'
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
		// fog.sendBroadcast('Hello World !');
	
		fog.overlay().network.rps.on('open', refresh);
		fog.overlay().network.rps.on('close', refresh);
		fog.overlay('tman').network.rps.on('open', refresh);
		fog.overlay('tman').network.rps.on('close', refresh);
		// console.log('voisins', fog.overlay().network.getNeighbours());
	});
	
	document.getElementById('refresh').addEventListener('click', refresh);
	
	
	window.fog = fog;
});