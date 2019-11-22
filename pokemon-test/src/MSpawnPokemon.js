module.exports = class MSpawnPokemon {
	constructor(inviewId, spawnDate, lifeTime, pokemon) {
		this.inviewId = inviewId;
		this.spawnDate = spawnDate;
		this.lifeTime = lifeTime;
		this.pokemon = pokemon;
		this.type = 'MSpawnPokemon';
	}
}