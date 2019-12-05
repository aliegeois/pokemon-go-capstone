import { Foglet } from 'foglet-core';
import fetch from 'node-fetch';

import TMan from './overlay/TMan';
import Pokemon from './Pokemon';
import Consensus from './consensus/Consensus';

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
	node.overlay('tman').network.spawnPokemon(node, new Pokemon(name, x, y));
	// node.overlay('tman').network.rps.unicast.emit('pokemon-spawned');
	/*new Consensus(node, 'tman', new Pokemon(name, x, y), leader => {
		console.log('leader is ', leader);
	});*/
}

/**
 * Affiche la liste des voisins dans un élément <table>
 */
function showNeighbours() {
	const neighboursTable = document.getElementById('neighbours');

	/** @type {string[]} */
	const neighboursCyclon = node.overlay().network.getNeighbours();
	/** @type {string[]} */
	const neighboursTman = node.overlay('tman').network.getNeighbours();

	const trCyclon = document.createElement('tr');
	for(let neighbour of neighboursCyclon) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		trCyclon.appendChild(td);
	}
	
	const trTman = document.createElement('tr');
	for(let neighbour of neighboursTman) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		trTman.appendChild(td);
	}

	while(neighboursTable.lastElementChild)
		neighboursTable.removeChild(neighboursTable.lastElementChild);

	neighboursTable.appendChild(trCyclon);
	neighboursTable.appendChild(trTman);
}

function showPokemons() {
	const table = document.getElementById('visible-pokemons');

	while(table.lastElementChild)
		table.removeChild(table.lastElementChild);
	
	for(let consensus of pokemons.values()) {
		const tr = document.createElement('tr');
		const tdPokemon = document.createElement('td');
		const tdCatch = document.createElement('td');
		const buttonCatch = document.createElement('button');

		tdPokemon.innerHTML = consensus.pokemon.name;
		buttonCatch.innerHTML = 'Catch';
		buttonCatch.addEventListener('click', () => {
			consensus.catch().then(peer => {
				console.log(`The peer ${peer} has catched ${consensus.pokemon.name}`)
			})
		});
		tdCatch.appendChild(buttonCatch);
		tr.appendChild(tdPokemon);
		tr.appendChild(tdCatch);
		table.appendChild(tr);
	}
}

/** @type {Foglet} */
let node;
/** @type {Map.<string, Consensus>} */
const pokemons = new Map();

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
						},
						range: Infinity,
						node
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

					showNeighbours();
					console.log('rps open', peerId);
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

				/*node.overlay('tman').network.on('pokemon-spawned', pokemon => {
					console.log('Pokémon spawned', pokemon);
					pokemons.set(pokemon.id, new Consensus(node, 'tman', pokemon, console.log));
					showPokemons();
				});

				node.overlay('tman').network.on('pokemon-catched', pokemon => {
					console.log('Pokémon catched', pokemon);
					pokemons.delete(pokemon.id);
					showPokemons();
				});*/
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

	document.getElementById('spawn-pokemon').addEventListener('click', () => {
		const name = document.getElementById('input-pokemon-name').value,
			x = parseInt(document.getElementById('input-pokemon-x').value),
			y = parseInt(document.getElementById('input-pokemon-y').value);

		if (!name || isNaN(x) || isNaN(y))
			return;

		spawnPokemon(name, x, y);
	});
});