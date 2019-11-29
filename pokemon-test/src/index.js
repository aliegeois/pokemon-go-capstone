/* eslint-env browser */
/* global google */

// const { paxos, template, target } = require('foglet-template');
const { Foglet } = require('foglet-core');
const fetch = require('node-fetch');
const TMAN = require('../paxos-overlays/lib/overlay/overlay.js');
const POKOVERLAY = require('../paxos-overlays/lib/overlay/pokemonOverlay.js')

// Ne pas modifier ou déplacer
document.getElementById('update').addEventListener('click', () => {
	updateCurrentPosition({
		x: parseFloat(document.getElementById('x').value, 10),
		y: parseFloat(document.getElementById('y').value, 10)
	});
});

/**
 * @returns {Promise<Number>}
 */
function getId() {
	if (!getId.resolvers) {
		getId.resolvers = [];
	}

	if (getId.id) {
		return new Promise(resolve => {
			resolve(getId.id);
		});
	} else {
		return new Promise(resolve => {
			getId.resolvers.push(resolve);
		});
	}
}
/**
 * @param {Number} id
 */
getId.setId = id => {
	getId.id = id;
	for (let resolver of getId.resolvers)
		resolver(id);
};

/** @type {google.maps.Marker} */
let marker;
let markers = {};
let map;
let iceServers;

window.markers = markers;

const icons = {
	trainer: {
		icon: 'https://cdn.discordapp.com/attachments/627178681428606989/638045396282769431/trainer_v3.png'
	},

	self: {
		// TODO: faire nos propres icones
		icon: 'https://cdn.discordapp.com/attachments/627178681428606989/638326088573124618/trainer_v4.png'
	},

	pokemon: {
		icon: 'https://cdn.discordapp.com/attachments/627178681428606989/637666290563284995/pokeball_v1.png'
	}
};

/**
 * 
 * @param {{x: Number, y: Number}?} pos 
 * @returns {Promise<{x: Number, y: Number}>}
 */
let getCurrentPosition = (pos = { x: null, y: null }) => {
	return new Promise((resolve, reject) => {
		if (pos.x !== null && pos.y !== null) {
			resolve(pos);
		} else {
			navigator.geolocation.getCurrentPosition(position => {
				resolve({
					x: position.coords.latitude,
					y: position.coords.longitude
				});
			}, reject);
		}
	});
}

getCurrentPosition().then(position => {
	const { x, y } = position;
	// console.log('data:', { x, y });

	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: x,
			lng: y
		},
		zoom: 17,
		disableDefaultUI: true,
		gestureHandling: 'greedy'
	});

	map.setOptions({
		styles: [{
			featureType: 'water',
			stylers: [{ color: '#00C6D8' }]
		},
		{
			featureType: 'road.local',
			stylers: [{ color: '#E4C52A' }]
		},
		{
			featureType: 'landscape.natural',
			stylers: [{ color: '#7CE748' }]
		},
		{
			featureType: 'landscape.natural.terrain',
			stylers: [{ color: '#5BD529' }]
		},
		{
			featureType: 'administrative.land_parcel',
			stylers: [{ color: '#FC5061' }]
		},
		{
			featureType: 'all',
			elementType: 'labels.icon',
			stylers: [{ visibility: 'off' }]
		},
		{
			featureType: 'all',
			elementType: 'labels.text',
			stylers: [{ visibility: 'off' }]
		}
			/*[
				{
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "administrative",
					"elementType": "geometry",
					"stylers": [
						{
							"visibility": "on"
						}
					]
				},
				{
					"featureType": "administrative.country",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#fc5061"
						},
						{
							"visibility": "on"
						},
						{
							"weight": 2.5
						}
					]
				},
				{
					"featureType": "administrative.land_parcel",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "administrative.neighborhood",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "landscape.natural",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#5bd529"
						},
						{
							"visibility": "on"
						}
					]
				},
				{
					"featureType": "landscape.natural.landcover",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#369100"
						},
						{
							"weight": 8
						}
					]
				},
				{
					"featureType": "landscape.natural.landcover",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"visibility": "on"
						},
						{
							"weight": 6.5
						}
					]
				},
				{
					"featureType": "poi",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "poi",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"visibility": "on"
						},
						{
							"weight": 8
						}
					]
				},
				{
					"featureType": "poi.attraction",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#fc5061"
						}
					]
				},
				{
					"featureType": "poi.government",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#fc5061"
						}
					]
				},
				{
					"featureType": "poi.park",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#7ce748"
						}
					]
				},
				{
					"featureType": "poi.place_of_worship",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#fc5061"
						}
					]
				},
				{
					"featureType": "poi.school",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"visibility": "on"
						},
						{
							"weight": 8
						}
					]
				},
				{
					"featureType": "road",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#f7c510"
						}
					]
				},
				{
					"featureType": "road",
					"elementType": "labels.icon",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "road.arterial",
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "road.highway",
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "road.local",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "transit",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "water",
					"elementType": "geometry.fill",
					"stylers": [
						{
							"color": "#0098b5"
						}
					]
				}
			]*/
		]
	});

	// const features = [{
	// 	position: {
	// 		lat: x,
	// 		lng: y
	// 	}, 
	// 	type: 'pokeball'
	// }];

	marker = new google.maps.Marker({
		position: {
			lat: x,
			lng: y
		},
		icon: {
			url: icons.self.icon,
			anchor: new google.maps.Point(16, 16)
		},
		map
	});

	// for(let i = 0; i < features.length; i++) {
	// 	new google.maps.Marker({
	// 		position: features[i].position,
	// 		icon: icons[features[i].type].icon,
	// 		map
	// 	});
	// };

	start(position);
});

let fog;

/**
 * 
 * @param {{x: Number, y: Number}} pos 
 */
let updateCurrentPosition = pos => {
	fog.overlay('tman').network.rps.options.descriptor = pos;
	marker.setPosition({
		lat: pos.x,
		lng: pos.y
	});
	map.setOptions({
		center: {
			lat: pos.x,
			lng: pos.y
		}
	});

	refresh();
};

let spawnPokemon = pokemon => {
	const pokefog = new Foglet({
		rps: {
			type: 'cyclon',
			options: {
				delta: 10 * 1000,
				timeout: 10 * 1000,
				pendingTimeout: 30 * 1000,
				protocol: `pokemon-${pokemon.id}`, // the name of the protocol run by our app
				webrtc: { // some WebRTC options
					trickle: true, // enable trickle
					// iceServers : data.ice, // define iceServers here if you want to run this code outside localhost
					config: {
						iceServers: iceServers
					}
				},
				signaling: { // configure the signaling server
					address: 'https://signaling.herokuapp.com', // put the URL of the signaling server here
					room: `pokemon-${pokemon.id}` // the name of the room for the peers of our application
				}
			}
		}
	});

	pokefog.share();

	pokefog.connection().then(() => {
		pokefog.overlay().network.rps.on('open', e => {
			console.log('wesh les mecs', e);
		});
	});
};

// let customSpawn = () => {
// 	for(let peerId of fog.overlay('tman').network.rps.getPeers()) {
// 		fog.overlay('tman').communication.sendUnicast(peerId, {
// 			type: 'MSpawnPokemon',
// 			id: Math.floor(Math.random() * Math.pow(2, 10))
// 		});
// 	}
// };

let refresh = () => {
	const n = document.getElementById('neighbours');
	n.innerHTML = '';

	const tr1 = document.createElement('tr');
	for (let neighbour of fog.overlay().network.getNeighbours()) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		tr1.appendChild(td);
	}
	n.appendChild(tr1);
	const tr2 = document.createElement('tr');
	const overlayTman = fog.overlay('tman');

	if (!overlayTman)
		return;

	for (let [id, neighboor] of overlayTman.network.rps.partialView) {
		const td = document.createElement('td');
		td.innerHTML = id + ` - (x: ${neighboor.descriptor.x}, y: ${neighboor.descriptor.y})`;
		tr2.appendChild(td);

		if (markers[id]) {
			markers[id].setPosition({
				lat: neighboor.descriptor.x,
				lng: neighboor.descriptor.y
			});
		} else { // Les markers sont créés mais jamais supprimés
			markers[id] = new google.maps.Marker({
				position: {
					lat: neighboor.descriptor.x,
					lng: neighboor.descriptor.y
				},
				icon: {
					url: icons.trainer.icon,
					anchor: new google.maps.Point(16, 16)
				},
				map
			});
		}
	}
	n.appendChild(tr2);

	let d = fog.overlay('tman').network.rps.options.descriptor;
	for (let px of document.getElementsByClassName('pos-x'))
		px.innerHTML = d.x;
	for (let py of document.getElementsByClassName('pos-y'))
		py.innerHTML = d.y;


};

let start = position => {
	fetch('https://signaling.herokuapp.com/ice')
		.then(data => data.json())
		.then(data => {
			// console.log(data.ice.map(e => {return {...e, urls: e.url}}));
			iceServers = data.ice.map(e => {
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
								iceServers: iceServers
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
						maxPeers: 3,
						protocol: 'pokestone',
						signaling: {
							address: 'https://signaling.herokuapp.com',
							room: 'pokestone'
						},
						position,
						refresh,
						spawnPokemon
					}
				},
				{
					name: 'pokoverlay',
					class: POKOVERLAY,
					options: {
						protocol: 'pokestone',
						signaling: {
							address: 'https://signaling.herokuapp.com',
							room: 'pokestone'
						}
					},
					position,
					refresh
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

				// console.log('rps', fog.overlay().network.rps);

				// send a message in broadcast
				// fog.sendBroadcast('Hello World !');

				fog.overlay().network.rps.on('open', refresh);
				fog.overlay().network.rps.on('close', refresh);
				fog.overlay('tman').network.rps.on('open', refresh);
				fog.overlay('tman').network.rps.on('close', (id) => {
					markers[id] && markers[id].setMap(null);
					console.log(id);
					refresh();
				});
				// console.log('voisins', fog.overlay().network.getNeighbours());
			});


			window.fog = fog;
			window.refresh = refresh;
		});
};