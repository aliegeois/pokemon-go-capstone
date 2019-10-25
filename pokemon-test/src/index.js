// const { paxos, template, target } = require('foglet-template');
const { Foglet } = require('foglet-core');
const fetch = require('node-fetch');
const TMAN = require('../paxos-overlays/lib/overlay/overlay.js');

navigator.geolocation.getCurrentPosition(async position => {
	const x = position.coords.latitude;
	const y = position.coords.longitude;
	var map;
	console.log('data:', {x, y});

	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: x,
			lng: y
		},
		zoom: 19
	});
	
	map.setOptions({styles: [

		{
			featureType: 'water',
			stylers: [{color:'#00C6D8'}]
		},
		{
			featureType: 'road.local',
			stylers: [{color: '#E4C52A'}]
		},
		{
			featureType: 'landscape.natural',
			stylers: [{color:'#7CE748'}]
		},
		{
			featureType: 'landscape.natural.terrain',
			stylers: [{color:'#5BD529'}]
		},
		{
			featureType: 'administrative.land_parcel',
			stylers: [{color:'#FC5061'}]
		},
		{
			featureType: 'all',
			elementType: 'labels.icon',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'all',
			elementType: 'labels.text',
			stylers: [{visibility:'off'}]
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
	]});

	var icons = {
		pokeball:{
			//TODO: faire nos propres icones
			icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnJW8QWOGW4h8cREWdx7gU352re88-07fAQsyD5r6ekEH6SWnSbg&s'
		}
	};

	/*var features = [
		{
			position: {lat:x, lng:y}, 
			type: 'pokeball'
		}
	];*/

	for (var i = 0; i < features.length; i++){
		var marker = new google.maps.Marker({
			position:features[i].position,
			icon: icons[features[i].type].icon,
			map: map
		});
	};
});


let getCurrentPosition = (pos = {x: null, y: null}) => {
	return new Promise((resolve, reject) => {
		if(pos.x !== null && pos.y !== null) {
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

document.getElementById('update').addEventListener('click', () => {
	updateCurrentPosition({
		x: document.getElementById('x').value,
		y: document.getElementById('y').value
	});
});

getCurrentPosition().then(position => {
	start(position);

	// setInterval(async () => {
	// 	updateCurrentPosition(await getCurrentPosition());
	// }, 5 * 1000);
});

let fog;

let updateCurrentPosition = pos => {
	fog.overlay('tman')._network._rps.options.descriptor = pos;
	refresh();
};

let refresh = () => {
	const n = document.getElementById('neighbours');
	const p = document.getElementById('pos');
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
	for(let [id, neighboor] of overlayTman._network._rps.partialView) {
		const td = document.createElement('td');
		td.innerHTML = id + ` - (x: ${neighboor.descriptor.x}, y: ${neighboor.descriptor.y})`;
		tr2.appendChild(td);
	}
	/*for(let neighbour of overlayTman.network.getNeighbours()) {
		const td = document.createElement('td');
		console.log(neighbour);
		td.innerHTML = neighbour;
		tr2.appendChild(td);
	}*/
	n.appendChild(tr2);

	let d = fog.overlay('tman')._network._rps.options.descriptor;
	for(let px of document.getElementsByClassName('pos-x'))
		px.innerHTML = d.x;
	for(let py of document.getElementsByClassName('pos-y'))
		py.innerHTML = d.y;
};

let start = position => {
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
					maxPeers: 3,
					protocol: 'pokestone',
					signaling: {
						address: 'https://signaling.herokuapp.com',
						room: 'pokestone'
					},
					position,
					refresh
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

			// console.log('rps', fog.overlay().network.rps);
			
			// send a message in broadcast
			// fog.sendBroadcast('Hello World !');
		
			fog.overlay().network.rps.on('open', refresh);
			fog.overlay().network.rps.on('close', refresh);
			fog.overlay('tman').network.rps.on('open', refresh);
			fog.overlay('tman').network.rps.on('close', refresh);
			// console.log('voisins', fog.overlay().network.getNeighbours());
		});
		
		
		window.fog = fog;
		window.refresh = refresh;
	});
};