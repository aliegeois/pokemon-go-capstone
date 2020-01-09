/* global google */

import { Foglet } from 'foglet-core';
import fetch from 'node-fetch';
import express from 'express';

import TMan from './overlay/TMan';
import Pokemon from './Pokemon';
import Consensus from './consensus/Consensus';
import distance from './euclidianDistance';

/**
 * Mêt à jour le contenu de tous les éléments html ayant une certaine classe
 * @param {string} type Classe de l'élément
 * @param {string} value Valeur de l'élément
 */
function update(type, value) {
	for (let element of document.querySelectorAll(`.${type}`))
		element.innerHTML = value;
}

/**
 * Fait apparaître un pokémon chez soi puis notifie les voisins
 * @param {string} name Nom du pokémon
 * @param {number} x Position x
 * @param {number} y Position y
 */
function spawnPokemon(name, x, y) {
	node.overlay('tman').network.spawnPokemon(new Pokemon(name, x, y));
}

/**
 * @param {{x: Number, y: Number}?} pos 
 * @returns {Promise<{x: Number, y: Number}>}
 */
let getCurrentPosition = (pos = { x: null, y: null }) => {
	return new Promise((resolve, reject) => {
		if (pos.x !== null && pos.y !== null) {
			resolve({
				x: pos.x,
				y: pos.y
			});
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

/**
 * @param {{x: Number, y: Number}} position 
 */
let updateCurrentPosition = position => {
	node.overlay('tman').network.rps.options.descriptor.x = position.x;
	node.overlay('tman').network.rps.options.descriptor.y = position.y;

	map.setOptions({
		center: {
			lat: position.x,
			lng: position.y
		}
	});

	markers.get(node.inViewID).setPosition({
		lat: position.x,
		lng: position.y
	});

	update('pos-x', position.x);
	update('pos-y', position.y);

	refresh();
};

/**
 * Affiche la liste des voisins dans un élément <table>
 */
function refresh() {
	const neighboursTable = document.getElementById('neighbours');

	/** @type {string[]} */
	const neighboursCyclon = node.overlay().network.getNeighbours();
	/** @type {string[]} */
	const neighboursTman = node.overlay('tman').network.getNeighbours();

	const trCyclon = document.createElement('tr');
	for (let neighbour of neighboursCyclon) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		trCyclon.appendChild(td);
	}

	const trTman = document.createElement('tr');
	for (let neighbour of neighboursTman) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		trTman.appendChild(td);
	}

	while (neighboursTable.lastElementChild)
		neighboursTable.removeChild(neighboursTable.lastElementChild);

	neighboursTable.appendChild(trCyclon);
	neighboursTable.appendChild(trTman);

	for (let [id, neighboor] of node.overlay('tman').network.rps.partialView) {
		console.log('position', neighboor.descriptor);
		if (markers.has(id)) {
			markers.get(id).setPosition({
				lat: neighboor.descriptor.x,
				lng: neighboor.descriptor.y
			});
		} else { // Les markers sont créés mais jamais supprimés
			markers.set(id, new google.maps.Marker({
				position: {
					lat: neighboor.descriptor.x,
					lng: neighboor.descriptor.y
				},
				icon: {
					url: icons.trainer.icon,
					anchor: new google.maps.Point(16, 16)
				},
				map
			}));

			/*var contentString = '<div id="content">' +
				'<div id="siteNotice">' +
				'</div>' +
				'<h1 id="firstHeading" class="firstHeading">Billy</h1>' +
				'<div id="bodyContent">' +
				'<p><b>Le joueur Billy</b> est un dresseur pokemon' +
				'<p><b>Coordonnées</b> : ' + neighboor.descriptor.x + ', ' + neighboor.descriptor.y +
				'</div>' +
				'</div>';

			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});
			markers[id].addListener('click', function () {
				infowindow.open(map, markers[id]);
			});*/
		}
	}

	/*for (let [id, marker] of markers.entries()) {
		for (let [id, consensus] of node.overlay('tman').network.visiblePokemons.entries()) {

		}
	}*/

	for (let [id, consensus] of node.overlay('tman').network.visiblePokemons.entries()) {
		console.log('consensus.pokemon', consensus.pokemon);
		const pokemon = consensus.pokemon;
		if (markers.has(id)) {
			// console.log('not add pokemon');
		} else {
			// console.log('add pokemon', pokemon);
			markers.set(id, new google.maps.Marker({
				position: {
					lat: pokemon.position.x,
					lng: pokemon.position.y
				},
				icon: {
					url: icons.pokemon.evoli.icon,
					anchor: new google.maps.Point(20, 18)
				},
				map
			}));
            var contentString = '<div id="content">' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h1 id="firstHeading" class="firstHeading">Billy le evoli</h1>' +
                '<div id="bodyContent">' +
                '<p><b>Evoli</b> est un pokemon très joli</p>' +
                '<button>Attraper</button>'
                '</div>' +
                '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            markers.get(id).addListener('click', function () {
                infowindow.open(map, markers.get(id));
            });
		}
	}
}

/*function showPokemons() {
	const table = document.getElementById('visible-pokemons');

	while (table.lastElementChild)
		table.removeChild(table.lastElementChild);

	for (let consensus of pokemons.values()) {
		const tr = document.createElement('tr');
		const tdPokemon = document.createElement('td');
		const tdCatch = document.createElement('td');
		const buttonCatch = document.createElement('button');

		tdPokemon.innerHTML = consensus.pokemon.name;
		buttonCatch.innerHTML = 'Catch';
		buttonCatch.addEventListener('click', () => {
			consensus.catch().then(peer => {
				console.log(`The peer ${peer} has catched ${consensus.pokemon.name}`);
			})
		});
		tdCatch.appendChild(buttonCatch);
		tr.appendChild(tdPokemon);
		tr.appendChild(tdCatch);
		table.appendChild(tr);
	}
}*/

/** @type {Foglet} */
let node;
let map;
// let marker;
let markers = new Map();

const icons = {
	trainer: {
		icon: 'https://i.imgur.com/TTc57s2.png'
	},
	self: {
		icon: 'https://cdn.discordapp.com/attachments/627178681428606989/638326088573124618/trainer_v4.png'
	},
	pokemon: {
		evoli: {
			icon: 'https://i.imgur.com/yehInnF.png'
		}
	}
};


let start = position => {
	console.log('fetching ice servers');
	fetch('https://signaling.herokuapp.com/ice')
		.then(data => data.json())
		.then(data => {
			console.log('ice servers fetched');

			const iceServers = data.ice.map(ice => {
				const nIce = {
					...ice,
					urls: ice.url
				};
				delete nIce.url;
				return nIce;
			});

			node = new Foglet({
				rps: {
					type: 'cyclon',
					options: {
						delta: 10 * 1000,
						timeout: 10 * 1000,
						pendingTimeout: 30 * 1000,
						protocol: 'pokestone', // the name of the protocol run by our app
						webrtc: { // some WebRTC options
							trickle: true, // enable trickle
							config: {
								iceServers
							}
						},
						signaling: { // configure the signaling server
							address: 'https://signaling.herokuapp.com', // put the URL of the signaling server here
							room: 'pokeroom' // the name of the room for the peers of our application
						}
					}
				},
				overlays: [{
					name: 'tman',
					class: TMan,
					options: {
						delta: 10 * 1000,
						timeout: 100 * 1000, // for join
						pendingTimeout: 10 * 1000,
						maxPeers: 50,
						protocol: 'pokestone',
						signaling: {
							address: 'https://signaling.herokuapp.com',
							room: 'pokeroom'
						},
						range: Infinity,
						pid: 'tman'
					}
				}]
			});

			console.log('initializing foglet');
			node.share();

			node.connection().then(() => {
				node.overlay('tman').network.node = node;
				console.log('foglet initialized', node);
				update('id', node.inViewID);

				console.log('starting tman');

				node.overlay().network.rps.once('open', peerId => {
					// node.connection(node, 'tman');
					node.overlay('tman').network.rps._start();
					node.overlay('tman').network._options.node = node;

					refresh();
					console.log('rps open', peerId);
				});

				node.overlay().network.rps.on('open', peerId => {
					refresh();
					console.log('rps open', peerId);
				});
				node.overlay().network.rps.on('close', peerId => {
					refresh();
					console.log('rps close', peerId);
				});
				node.overlay('tman').network.rps.on('open', peerId => {
					refresh();
					console.log('tman open', peerId);
				});
				node.overlay('tman').network.rps.on('close', peerId => {
					refresh();
					markers.get(peerId).setMap(null);
					console.log('tman close', peerId);
				});

				markers.set(node.inViewID, new google.maps.Marker({
					position: {
						lat: position.x,
						lng: position.y
					},
					icon: {
						url: icons.trainer.icon,
						anchor: new google.maps.Point(11, 13)
					},
					map
				}));

				updateCurrentPosition(position);

				setInterval(() => {
					getCurrentPosition().then(position => {
						updateCurrentPosition(position);
					});
				}, 5 * 1000);
			}).catch(console.error);
		});

	document.getElementById('update-position').addEventListener('click', () => {
		const x = parseFloat(document.getElementById('input-pos-x').value),
			y = parseFloat(document.getElementById('input-pos-y').value);

		if (isNaN(x) || isNaN(y))
			return;

		node.overlay('tman').network.descriptor = { x, y };

		update('pos-x', x);
		update('pos-y', y);
	});

	document.getElementById('spawn-pokemon').addEventListener('click', () => {
		const name = document.getElementById('input-pokemon-name').value,
			x = parseFloat(document.getElementById('input-pokemon-x').value),
			y = parseFloat(document.getElementById('input-pokemon-y').value);

		if (!name || isNaN(x) || isNaN(y))
			return;

		spawnPokemon(name, x, y);
	});
}

addEventListener('DOMContentLoaded', () => {
	getCurrentPosition().then(position => {
		start(position);

		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: position.x,
				lng: position.y
			},
			zoom: 17,
			disableDefaultUI: true,
			gestureHandling: 'greedy'
		});

		map.setOptions({
			styles: [
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off'
						}
					]
				},
				{
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off'
						}
					]
				},
				{
					'featureType': 'landscape.man_made',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#a2c081'
						}
					]
				},
				{
					'featureType': 'landscape.natural',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#8cb75d'
						}
					]
				},
				{
					'featureType': 'poi.medical',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ff0000'
						}
					]
				},
				{
					'featureType': 'poi.park',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#97c367'
						}
					]
				},
				{
					'featureType': 'poi.sports_complex',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#bc2f2f'
						},
						{
							'weight': 1.5
						}
					]
				},
				{
					'featureType': 'poi.sports_complex',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#898779'
						}
					]
				},
				{
					'featureType': 'road.arterial',
					'elementType': 'geometry',
					'stylers': [
						{
							'color': '#d9d5ba'
						}
					]
				},
				{
					'featureType': 'road.arterial',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#bcbaa7'
						}
					]
				},
				{
					'featureType': 'road.highway',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#ffdf00'
						}
					]
				},
				{
					'featureType': 'road.highway',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#898779'
						}
					]
				},
				{
					'featureType': 'road.local',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#eae182'
						}
					]
				},
				{
					'featureType': 'transit.line',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#898779'
						}
					]
				},
				{
					'featureType': 'transit.station',
					'elementType': 'geometry.stroke',
					'stylers': [
						{
							'color': '#898779'
						}
					]
				},
				{
					'featureType': 'water',
					'elementType': 'geometry.fill',
					'stylers': [
						{
							'color': '#679bc3'
						}
					]
				}
			]
		});
	});
});


const app = express()
 
app.get('/', function (req, res) {
  res.sendFile('./index.html');
})
 
app.listen(80);