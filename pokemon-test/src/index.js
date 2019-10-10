import { paxos, template, target } from "foglet-template";

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
		console.log('data:', data);
		navigator.geolocation.getCurrentPosition(async position => {
			const x = position.coords.longitude;
			const y = position.coords.latitude;
		
		
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
				this.setState(prev => {
					const myLeaders = prev.nodeLeaders[nodeId];
					let myNewLeaders = {};
					if (!myLeaders) {
						myNewLeaders[cible] = pid.peer;
					} else {
						myNewLeaders = { ...myLeaders, [cible]: pid.peer };
					}
					return {
						leaders: {
							...this.state.leaders,
							[cible]: pid
						},
						nodeLeaders: {
							...prev.nodeLeaders,
							[nodeId]: myNewLeaders
						},
						loading: false
					};
				});
			});
			
			this.setState(prev => {
				const data = {
					nodeIndex: id,
					nodeData: [...prev.nodeData, { id: nodeId, x, y }],
					nodes: [...prev.nodes, node],
					paxoses: {
						...prev.paxoses,
						[nodeId]: nodePaxos
					}
				};
				if (targets.length > 0) {
					data[nodeTargets] = { ...prev.nodeTargets, nodeTargets };
				}
				return data;
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
		
		const targetData = {
			id: spawned.id,
			x,
			y,
			perimeter,
			pokemon
		};
		
		let nodeTargets = this.state.nodeTargets;
		this.state.nodes.forEach(node => {
			const response = node.targetSpawned(spawned);
			if (!response) return;
			// Update node targets
			const nodeId = node.foglet.inViewID;
			if (nodeTargets[nodeId])
			nodeTargets[nodeId] = [...nodeTargets[nodeId], targetData];
			else nodeTargets[nodeId] = [targetData];
		});
		
		spawned.pokemon = pokemon;
		this.setState(prev => ({
			targetIndex: id,
			nodeTargets: { ...prev.nodeTargets, nodeTargets },
			targets: [...prev.targets, spawned]
		}));
	};
	
	getTarget = (node, target) => async () => {
		this.setState({
			loading: true,
			loadingMessage: "Consensus en cours ..."
		});
		const { pid, cible } = await this.state.paxoses[node.id].getTarget(
			target.id
		);
		if (pid && cible) {
			this.setState(prev => ({
				caught: { ...prev.caught, [cible]: pid },
				loading: false
			}));
		}
	};
}

const addMap = () => {
    var map = null;
    map = new google.maps.Map(document.getElementById("map"), {
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
    });

};

let main = () => {
	console.log('main');
	addMap();
	const f = new withFoglet();
	f.addNode()();
};

window.onload = function () {
    // Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
    addMap();
};
main();