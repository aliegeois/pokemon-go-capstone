import { Foglet } from 'foglet-core';
import fetch from 'node-fetch';
import uuid from 'uuid/v4';

import AbstractNetwork from 'foglet-core/src/network/abstract/abstract-network';
import Network from 'foglet-core/src/network/network';

// import Pokemon from './overlay/Pokemon';
import TMan from './overlay/TMan';

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
	node.overlay('tman').network.spawnPokemon({ name, x, y });
}

function showNeighbours() {
	/** @type {Map} */
	const neighbours = node.overlay('tman').network.getNeighbours();

	const tr = document.createElement('tr');
	for(let neighbour of neighbours) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		tr.appendChild(td);
	}
	while(neighboursTable.lastElementChild)
		neighboursTable.removeChild(neighboursTable.lastElementChild);
	neighboursTable.appendChild(tr);
}

/** @type {Foglet} */
let node;
/** @type {HTMLTableElement} */
const neighboursTable = document.getElementById('neighbours');
console.log('$', neighboursTable);

addEventListener('DOMContentLoaded', () => {
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
						}
					}
				}]
			});

			console.log('initializing foglet');
			node.share();

			node.connection().then(() => {
				console.log('foglet initialized', node);
				update('id', node.id);

				console.log('starting tman');
				// node.share('tman');
				// console.log('rps', node.overlay('tman').network.rps);
				/*node.overlay('tman').network.rps.join().then(peerId => {
					console.log('peerId', peerId);
				}).catch(err => {
					console.error(err);
				});*/

				node.overlay().network.rps.once('open', peerId => {
					// node.connection(node, 'tman');
					node.overlay('tman').network.rps._start();
					// node.overlay('tman').network.rps.join(peerId)
					// 	.then(console.warn)
					// 	.catch(console.error);
				});

				// node.overlay('tman').network.rps.unicast.on('pokemon-spawned', data => {
				// 	console.log('pokemon spawned', data);
				// });

				node.overlay().network.rps.on('open', peerId => {
					showNeighbours();
					console.log('rps open', peerId);
				});
				node.overlay().network.rps.on('close', peerId => {
					showNeighbours();
					console.log('rps close', peerId);
				});
				node.overlay('tman').network.rps.on('open', peerId => {
					showNeighbours();
					console.log('tman open', peerId);
				});
				node.overlay('tman').network.rps.on('close', peerId => {
					showNeighbours();
					console.log('tman close', peerId);
				});
				// console.log(node.overlay('tman').network);
				// node.overlay('tman').network.rps._start();
				// node.overlay('tman').network.rps.join().then(peerId => {
				// 	console.log(`tman id: ${peerId}`);
				// });

			}).catch(console.error);
		});



	document.getElementById('update-position').addEventListener('click', () => {
		const x = parseInt(document.getElementById('input-pos-x').value),
			y = parseInt(document.getElementById('input-pos-y').value);

		if (isNaN(x) || isNaN(y))
			return;

		node.overlay('tman').network.descriptor = { x, y };

		update('pos-x', x);
		update('pos-y', y);
	});

	document.getElementById('join-overlay').addEventListener('click', () => {
		/*const overlayName = document.getElementById('input-overlay-name').value;

		if (!overlayName)
			return;

		node._networkManager._buildOverlay({
			name: overlayName,
			class: Pokemon,
			options: {
				pid: overlayName,
				delta: 10 * 1000,
				timeout: 10 * 1000,
				pendingTimeout: 10 * 1000,
				maxPeers: Infinity,
				protocol: 'pokestone',
				signaling: {
					address: 'https://signaling.herokuapp.com',
					room: overlayName
				}
			}
		});

		node.share(overlayName);*/
	});

	document.getElementById('spawn-pokemon').addEventListener('click', () => {
		const name = document.getElementById('input-pokemon-name').value,
			x = parseInt(document.getElementById('input-pokemon-x').value),
			y = parseInt(document.getElementById('input-pokemon-y').value);

		if (!name || isNaN(x) || isNaN(y))
			return;

		spawnPokemon(name, x, y);
	});
});