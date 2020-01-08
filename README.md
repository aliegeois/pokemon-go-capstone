# Projet Capstone : Pokémon Go en distribué

## Pokémon Go

Jeu mobile massivement multijoueur  
Plusieurs fonctionnalités intéressantes:
- Déplacement sur une carte du monde à l'aide du GPS
- Permet de capturer des pokémons

Fonctionnalités qui ne nous intéressent pas:
- Plusieurs personnes peuvent capturer le même pokémon
- Application centralisée

Ainsi nous voulons recréer le jeu dans un système distribué en rajoutant une contrainte qui permet à un pokémon de n'être capturé que par une seule personne au maximum

Pour ce faire nous avons plusieurs problèmes à résoudre:
- Créer un réseau distribué que les utilisateurs peuvent rejoindre et quitter à n'importe quel moment
- Établir une communication entre les utilisateurs qui souhaitent capture un même pokémon
- Imposer un consensus sur la capture de chaque pokémon pour s'assurer qu'il n'y ait pas de duplications

Pour chaque problème plusieurs solutions s'offrent à nous et nous allons détailler les choix effectués.

## Les contraintes technologiques

Pour rajouter du challenge à ce projet, la contrainte technologique suivante a été imposée: l'application doit pouvoir tourner dans un navigateur web. Ceci nous impose de coder en HTML/JavaScript.

# Solutions proposées

## Réseau distribué

Dans un réseau distribué, les client communiquent entre eux directement, mais il faut au préalable les connecter entre eux. Pour ce faire nous avons pensé à 2 possibilités:
- Des connexions opportunistes (en bluetooth par exemple)
- Des connexions par internet à l'aide d'un serveur qui initie la connexion entre les utilisateurs

La première approche est très limitée puisque la portée du bluetooth est d'une dizaine de mètres, et limité à 7 connexions en parallèle.  
En revanche La deuxième approche est plus simple à mettre en place, un serveur initie la connexion entre les utilisateurs puis nous nous débrouillons pour créer un réseau robuste entre les utilisateurs.

C'est pourquoi nous avons choisis d'utiliser l'algorithme Cyclon pour créer un réseau dynamique et robuste aux déconnexions.

Fonctionnement de Cyclon:
Cyclon génere un graphe améatoire en effectuant des "shuffles" entres les noeuds du graphes.
Dans Cyclon, et comme dans l'algorithme basique de shuffle, tous les noeuds vont périodiquement:
- Séléctionner un nombre aléatoire de voisin parmis leur liste de voisin,
- Séléctionner un voisin dans la sous-liste choisie précédemment avec lequel le noeud va effectuer un échange des autres voisin de la sous-liste, dans la sous-liste l'addresse du voisin choisit pour l'échange est renplacée par celle du voisin commençant l'échange,
- Le voisin séléctionné choisit aléatoirement une sous-liste de ses voisins qu'il va renvoyer pour l'échange (la taille de la sous-liste est inférieure où égale à celle de la première sous-liste).

Dans Cyclon, les voisins ont un âge qu'il leur est associé, les échanges sont lancés avec le voisin le plus vieux de la liste et après l'échange. Après l'échange, dans la liste de voisins du noeud précedement choisit, l'âge du noeud ayant commencé l'échange précedent est initialisé à 0.
Avant chaque échange, l'aĝe de tous les voisins est augmenté de 1.

Pour l'insertion dans le graphe, Cyclon utilise un point d'entrée externe qui va effectuer plusieurs déplacement aléatoire dans le graphe pour obtenir plusieurs noeuds aléatoires du graphe que le noeud qui va être inseré va ajouter dans sa liste de voisins.

## Capture des pokémons

Pour chaque capture de pokémon, il faut réaliser un consensus entre les utilisateurs qui veulent captuer le pokémon pour définir un seul possesseur. L'algorithme de consensus le plus connu est Paxos, imaginé par Lamport.

Celui-ci a besoin d'un ensemble de processus qui réalisent le consensus, c'est pourquoi nous avons besoin, lors de chaque capture, de récupérer tous les utilisateurs qui peuvent voir le pokémon et de les recruter pour le consensus.

# Conséquences de solutions décidées

Chaque solution que nous avons choisie apporte son lot d'avantages et d'inconvénient, nous en discutons ici.

## Cyclon
