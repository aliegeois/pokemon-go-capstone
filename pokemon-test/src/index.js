/* eslint-env browser */
/* global google */

// const { paxos, template, target } = require('foglet-template');
const { Foglet } = require('foglet-core');
const fetch = require('node-fetch');
const TMAN = require('../paxos-overlays/lib/overlay/overlay.js');
const POKOVERLAY = require('./pokemonOverlay.js')

// Ne pas modifier ou déplacer
/*document.getElementById('update').addEventListener('click', () => {
	updateCurrentPosition({
		x: parseFloat(document.getElementById('x').value, 10),
		y: parseFloat(document.getElementById('y').value, 10)
	});
});*/


let marker;
let markers = {};
let map;
let iceServers;

window.markers = markers;

const icons = {
	trainer: {
		icon:'https://cdn.discordapp.com/attachments/627178681428606989/638045396282769431/trainer_v3.png'
	},

	self: {
		//TODO: faire nos propres icones
		icon:'https://cdn.discordapp.com/attachments/627178681428606989/638326088573124618/trainer_v4.png'
	},

	pokemon: {
		icon:'https://cdn.discordapp.com/attachments/627178681428606989/637666290563284995/pokeball_v1.png'
	}
};

/**
 * 
 * @param {{x: Number, y: Number}?} pos 
 * @returns {Promise<{x: Number, y: Number}>}
 */
let getCurrentPosition = (pos = {x: null, y: null}) => {
	return new Promise((resolve, reject) => {
		if(pos.x !== null && pos.y !== null) {
			resolve({
				x: pos.x,
				y: pos.y,
				name: "Jean Billy"
			});
		} else {
			navigator.geolocation.getCurrentPosition(position => {
				resolve({
					x: position.coords.latitude,
					y: position.coords.longitude,
					name: "Jean Billy"
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
		styles: [
			{
			  "elementType": "labels",
			  "stylers": [
				{
				  "visibility": "off"
				}
			  ]
			},
			{
			  "elementType": "labels.icon",
			  "stylers": [
				{
				  "visibility": "off"
				}
			  ]
			},
			{
			  "featureType": "landscape.man_made",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#a2c081"
				}
			  ]
			},
			{
			  "featureType": "landscape.natural",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#8cb75d"
				}
			  ]
			},
			{
			  "featureType": "poi.medical",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#ff0000"
				}
			  ]
			},
			{
			  "featureType": "poi.park",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#97c367"
				}
			  ]
			},
			{
			  "featureType": "poi.sports_complex",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#bc2f2f"
				},
				{
				  "weight": 1.5
				}
			  ]
			},
			{
			  "featureType": "poi.sports_complex",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#898779"
				}
			  ]
			},
			{
			  "featureType": "road.arterial",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#d9d5ba"
				}
			  ]
			},
			{
			  "featureType": "road.arterial",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#bcbaa7"
				}
			  ]
			},
			{
			  "featureType": "road.highway",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#ffdf00"
				}
			  ]
			},
			{
			  "featureType": "road.highway",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#898779"
				}
			  ]
			},
			{
			  "featureType": "road.local",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#eae182"
				}
			  ]
			},
			{
			  "featureType": "transit.line",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#898779"
				}
			  ]
			},
			{
			  "featureType": "transit.station",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#898779"
				}
			  ]
			},
			{
			  "featureType": "water",
			  "elementType": "geometry.fill",
			  "stylers": [
				{
				  "color": "#679bc3"
				}
			  ]
			}
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

const contentPlayer = document.createElement('div');

let fog;

function getId() {
	if(!getId.resolvers)
		getId.resolvers = [];

	if(getId.id)
		return new Promise(resolve => {
			resolve(getId.id);
		});
	else
		return new Promise(resolve => {
			getId.resolvers.push(resolve);
		});
}
getId.setId = id => {
	getId.id = id;
	if(getId.resolvers)
		for(let resolver of getId.resolvers)
			resolver(id);
	//delete getId.resolvers;
};

/**
 * 
 * @param {{x: Number, y: Number}} pos 
			document.getElementsByClassName("id").forlement => {
				
			});
 */
let updateCurrentPosition = pos => {
	fog.overlay('tman').network.rps.options.descriptor.x = pos.x;
	fog.overlay('tman').network.rps.options.descriptor.y = pos.y;
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

let customSpawn = () => {
	console.log('Bonjour la méthode customSpawn est exécutée lol')
	for(let peerId of fog.overlay('tman').network.rps.getPeers()) {
		fog.overlay('tman').communication.sendUnicast(peerId, {
			type: 'MSpawnPokemon',
			id: Math.floor(Math.random() * Math.pow(2, 16))
		});
	}
};

let euclideanDist = (x1, y1, x2, y2) => {
	return Math.hypot(Math.abs(x1-x2),Math.abs(y1-y2));
}

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
	
	if(!overlayTman)
		return;
	
	for(let [id, neighboor] of overlayTman.network.rps.partialView) {
		const td = document.createElement('td');
		td.innerHTML = id + ` - (x: ${neighboor.descriptor.x}, y: ${neighboor.descriptor.y})`;
		tr2.appendChild(td);

		if(markers[id]) {
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

			var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">Billy</h1>'+
            '<div id="bodyContent">'+
			'<p><b>Le joueur Billy</b> est un dresseur pokemon'+
			'<p><b>Coordonnées</b> : '+ neighboor.descriptor.x + ', '+ neighboor.descriptor.y +
            '</div>'+
			'</div>';
			
	 		var infowindow = new google.maps.InfoWindow({
          		content: contentString
    		});
			markers[id].addListener('click', function() {
				infowindow.open(map, markers[id]);
			  });
		}
	}
	n.appendChild(tr2);
	
	let d = fog.overlay('tman').network.rps.options.descriptor;
	for(let px of document.getElementsByClassName('pos-x'))
		px.innerHTML = d.x;
	for(let py of document.getElementsByClassName('pos-y'))
		py.innerHTML = d.y;
	for(let pname of document.getElementsByClassName('name'))
		pname.innerHTML = d.name;
	
	
};

let start = position => {
	fetch('https://signaling.herokuapp.com/ice')
	.then(data => data.json())
	.then(data => {

		contentPlayer.innerHTML = '<h1> <span class="name"></span></h1>';

		let span = document.createElement('span');
		span.className = 'id';
		
		contentPlayer.innerHTML += '<div>id: '
		contentPlayer.appendChild(span);
		contentPlayer.innerHTML += ' </div>'+
		'<div>My position: (x: <span class="pos-x"></span>, y: <span class="pos-y"></span>)</div>'

		var xInput = contentPlayer.appendChild(document.createElement('input'));
		xInput.type = 'text';
		xInput.id = 'xDynamic';

		var yInput = contentPlayer.appendChild(document.createElement('input'));
		yInput.type = 'text';
		yInput.id = 'yDynamic';

		var button = contentPlayer.appendChild(document.createElement('input'));
		button.type = 'button';
		button.id = 'updateDynamic';
		button.value = 'update';
		button.addEventListener('click', () => {
			updateCurrentPosition({
				x: parseFloat(document.getElementById('xDynamic').value, 10),
				y: parseFloat(document.getElementById('yDynamic').value, 10)
			});
		});

		var xPokeInput = contentPlayer.appendChild(document.createElement('input'));
		xPokeInput.type = 'text';
		xPokeInput.id = 'xPokeDynamic';

		var yPokeInput = contentPlayer.appendChild(document.createElement('input'));
		yPokeInput.type = 'text';
		yPokeInput.id = 'yPokeDynamic';

		var pokebutton = contentPlayer.appendChild(document.createElement('input'));
		pokebutton.type = 'button';
		pokebutton.id = 'updatePokeDynamic';
		pokebutton.value = 'spawn';
		pokebutton.addEventListener('click', () => {
			customSpawn();
		});

		let config = {
			content: contentPlayer
		};

		var infoPlayer = new google.maps.InfoWindow(config);

		marker.addListener('click', function(){
			
			infoPlayer.close();

			// infoPlayer = new google.maps.InfoWindow({
			// 	content : contentPlayer
			// });
			getId().then(id => {
				for(let el of config.content.getElementsByClassName('id')){
					//console.log(el)
					el.innerHTML = id;
				}
			});
			infoPlayer.open(map, marker);
		})

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
							iceServers: []
						}
					},
					signaling: { // configure the signaling server
						address: 'localhost:3000', // put the URL of the signaling server here
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
						address: 'localhost:3000',
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
			getId.setId(fog.id);
			console.log(getId.id);
			for(let truc of document.getElementsByClassName('id')){
				truc.innerHTML = fog.id
			}
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