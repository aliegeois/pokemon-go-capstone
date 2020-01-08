import { Foglet } from 'foglet-core';
import fetch from 'node-fetch';

import TMan from './overlay/TMan';
import Pokemon from './Pokemon';
import Consensus from './consensus/Consensus';

// ******************************************** MAP ********************************************

/** @type {google.maps.Marker} */
let marker;
let markers = {};
let map;
let pokemons = {};

window.markers = markers;

const icons = {
    trainer: {
        icon: 'https://cdn.discordapp.com/attachments/627178681428606989/638045396282769431/trainer_v3.png'
    },

    self: {
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
            resolve({
                x: pos.x,
                y: pos.y
            });
        } else {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    x: position.coords.latitude,
                    y: position.coords.longitude,
                });
            }, reject);
        }
    });
}

getCurrentPosition().then(position => {
    const { x, y } = position;
    console.log('data:', { x, y });

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: x,
            lng: y
        },
        zoom: 17,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
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

// ******************************************** MAP ********************************************

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
	const overlayTman = node.overlay('tman');

	const trCyclon = document.createElement('tr');
	for(let neighbour of neighboursCyclon) {
		const td = document.createElement('td');
		td.innerHTML = neighbour;
		trCyclon.appendChild(td);
	}
	
	const trTman = document.createElement('tr');
	for(let [id, neighbour] of overlayTman.network.rps.partialView) {
		const td = document.createElement('td');
		console.log('neighbour : ' + neighbour);
        td.innerHTML = id + ` - (x: ${neighbour.descriptor.x}, y: ${neighbour.descriptor.y})`;
		trTman.appendChild(td);

        markers[id] = new google.maps.Marker({
            position: {
                lat: neighbour.descriptor.x,
                lng: neighbour.descriptor.y
            },
            icon: {
                url: icons.trainer.icon,
                anchor: new google.maps.Point(16, 16)
            },
            map
        });
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
				console.log(`The peer ${peer} has catched ${consensus.pokemon.name}`);
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
						pid: 'tman'
					}
				}]
			});

			console.log('initializing foglet');
			node.share();

			node.connection().then(() => {
				node.overlay('tman').network.node = node;
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
					node.overlay('tman').network._options.node = node;

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

				node.overlay('tman').network.rps.unicast.on('pokemon-spawned', pokemon => {
					console.log('Pokémon spawned', pokemon);
					pokemons[pokemon.id] = new Consensus(node, 'tman', pokemon, console.log);
					showPokemons();
				});

				node.overlay('tman').network.rps.unicast.on('pokemon-catched', pokemon => {
					console.log('Pokémon catched', pokemon);
					pokemons[pokemon.id] = null;
					showPokemons();
				});
				// console.log(node.overlay('tman').network);
				// node.overlay('tman').network.rps._start();
				// node.overlay('tman').network.rps.join().then(peerId => {
				// 	console.log(`tman id: ${peerId}`);
				// });

			}).catch(console.error);
			setInterval(refresh,5*1000);
		});



	document.getElementById('update-position').addEventListener('click', () => {
		const x = parseFloat(document.getElementById('input-pos-x').value),
			y = parseFloat(document.getElementById('input-pos-y').value);

		if (isNaN(x) || isNaN(y))
			return;

		node.overlay('tman').network.descriptor = { x, y };

        marker.setPosition({
            lat: x,
            lng: y
        });
        map.setOptions({
            center: {
                lat: x,
                lng: y
            }
        });

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

let refresh = () => {
    getCurrentPosition().then(position => {
        const { x, y } = position;
        console.log('data:', { x, y });

        node.overlay('tman').network.descriptor = { x, y };

        map.setOptions({
            center: {
                lat: x,
                lng: y
            }
        });

        marker.setPosition({
            lat: x,
            lng: y
        });

        update('pos-x', x);
        update('pos-y', y);
    });
}
