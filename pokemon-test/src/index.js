import { paxos, template, target } from "foglet-template";
import Foglet from 'foglet-core';

class withFoglet {
	state = {
		nodes: [],
		nodeData: [],
		targets: [],
		paxoses: {},
		nodeTargets: {},
		caught: {},
		loading: false,
		loadingMessage: "",
		leaders: {},
		nodeLeaders: {},
		nodeIndex: 0,
		targetIndex: 0
	};
	

	constructor() {
		console.log('constructor');
		
		// super();
		/*navigator.geolocation.getCurrentPosition(position => {
			console.log(position.coords);
			console.log('this', this);
			withFoglet.addNode({
				x: position.coords.longitude,
				y: position.coords.latitude
			});
		});*/
	}

	test = () => {
		console.log('dans test');
	};
	
	addNode = data => async () => {
		
		navigator.geolocation.getCurrentPosition(async position => {
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
		
			if (!x || !y) return;
			const id = this.state.nodeIndex + 1;

			
			// const node = new template({ foglet: { id } }, true);
			const node = new template({ foglet: { id } }, false);
			console.log('overlays', node.getOverlays());
			node.setDescriptor(data);
			const rn = Math.floor(Math.random() * this.state.nodes.length);
			const randomNode = this.state.nodes[rn];
			await node.connection(randomNode);
			
			const nodeTargets = this.state.nodeTargets;
			const targets = [];
			
			this.state.targets.forEach(target => {
				const response = node.targetSpawned(target);
				if (!response) return;
				
				targets.push({
					...target.getCoordinates(),
					id: target.id,
					pokemon: target.pokemon
				});
			});
			
			const nodeId = node.foglet.inViewID;
			nodeTargets[nodeId] = targets;
			
			const nodePaxos = new paxos(node, ({ cible, pid }) => {
			});

			
			node.foglet.onUnicast(console.log);
			node.sendUnicastAll('dbar');
		});
	};
	
	addTarget = data => () => {
		const { x, y, pokemon, perimeter } = data;
		if (!x || !y || !pokemon || !perimeter) return;
		const id = this.state.targetIndex + 1;
		const spawned = new target(id, {
			coordinates: { x, y },
			perimeter
		});
		
		spawned.pokemon = pokemon;
	};
}

const addMap = () => {
    /*const map = new google.maps.Map(document.getElementById("map"), {
        // Nous définissons le zoom par défaut
        zoom: 11,
        // Nous définissons le type de carte (ici carte routière)
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // Nous activons les options de contrôle de la carte (plan, satellite...)
        mapTypeControl: true,
        // Nous désactivons la roulette de souris
        scrollwheel: false,
        mapTypeControlOptions: {
            // Cette option sert à définir comment les options se placent
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        // Activation des options de navigation dans la carte (zoom...)
        navigationControl: true,
        navigationControlOptions: {
            // Comment ces options doivent-elles s'afficher
            style: google.maps.NavigationControlStyle.ZOOM_PAN
        }
    });*/
};

let main = () => {
	console.log('main');
	const f = new withFoglet();
	f.addNode()();
};

window.onload = function () {
    // Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
    addMap();
};
main();