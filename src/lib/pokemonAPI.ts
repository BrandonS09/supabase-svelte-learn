const POKEMON_API = "https://pokeapi.co/api/v2/"

// getPokemonList -> Get the og pokemon names
export async function getPokemonList(){
    const response = await fetch(POKEMON_API + "pokemon?limit=151&offset=0");
    const data = await response.json();
    return data.results;
}

// getPokemon -> given a string, get the info {.....}
export async function getPokemon(name: string) {
    const response = await fetch(POKEMON_API + "pokemon/" + name);
    const data = await response.json();
    return data;
}

//getPokemon -> { object }