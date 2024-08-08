<script lang="ts">
    import { page } from "$app/stores";
	import { getPokemon, getPokemonList } from "$lib/pokemonAPI";
    export let data;
    let { supabase, session } = data;
    $: ({ supabase, session } = data);

    $: email = $page.params.email

    let pokemonList: any = [];
    let pokemonData: any = []; //[{pikachu}, {charizard}, etc]
    let profile: any = {
        description: "This is your description, feel free to write about yourself or your favorite Pokemon.",
        pokemon_ids: [1,4,10]
    }
    let isModalOpen = false;
    let searchInput = "";

    //profiles in Supabase with columns for description, pokemon_ids, email

    async function refreshPokemonData() {
        pokemonData = [];

        profile.pokemon_ids.map(async (id: number) => {
            const data = await getPokemon(id.toString());

            if(pokemonData === undefined){
                pokemonData = [data]; //[ {} ]
            } else {
                pokemonData = [...pokemonData, data];
            }
        })
    }

    async function saveProfile() {
        const { data:profileData, error:profileError } =  await supabase.from("profiles").select("description, pokemon_ids").eq('email', email)

        if(profileData?.length === 0){ //create new row
            const { data, error } = await supabase
                .from("profiles")
                .insert({...profile, user_id: session?.user?.id, email: session?.user?.email });
        } else { //update row
            const { data, error } = await supabase
                .from("profiles")
                .update(profile)
                .eq("user_id", session?.user?.id);
        }
    }

    page.subscribe(async () => {
        pokemonList = await getPokemonList();

        //try to grab current profile
        const { data:profileData, error:profileError } =  await supabase.from("profiles").select("description, pokemon_ids").eq('email', email)
        //if profileData undefined and current user is current
        //MAKE NEW PROFILE
        if (profileData?.length == 0 && email == session?.user?.email){
            //saveProfile
            saveProfile();
        } else if (profileData != null && profileData.length > 0) {
            profile = profileData[0]
        } else {
            console.log("NO PROFILE")
            profile = {
                description: "This user does not have a profile yet!",
                pokemon_ids: []
            }
        }

        //if profileData exists
        //show data to user

        //if no data, say NO PROFILE
        await refreshPokemonData();
    });

    async function savePageEdits(){
        await saveProfile();
        await refreshPokemonData();
        isModalOpen=false;
    }

    async function togglePokemon(id: number){
        let pokemonIDs = profile.pokemon_ids;
        // [1, 2, 3] "toggle 2" -> [1, 3] -. "toggle 2" -> [1, 2, 3]

        // make sure we never have more than 3 pokemon
        if(pokemonIDs.length >= 3  && !pokemonIDs.includes(id)) {
            alert("You can only have 3 pokemon maximum!")
            return
        }
        // if pokemonIDs has ID, remove it
        if(pokemonIDs.includes(id)) {
            let index = pokemonIDs.indexOf(id);
            pokemonIDs.splice(index, 1);
        } else {
            pokemonIDs.push(id);
        }
        
        profile.pokemon_ids = [...pokemonIDs]
    }
</script>

<div class="hero min-h-screen bg-base-300">
    <div class="hero-content">
        <div class="max-w-2xl text-center">
            <h1 class="text-gray-700 font-bold text-4xl">{email}'s Page</h1>
            <p class="py-3 max-w-md mx-auto">{profile.description}</p>
            <div class="grid grid-cols-3">
                {#if pokemonData === undefined}
                    <p>Loading...</p>
                {:else}
                    {#each pokemonData as pokemon}
                        <div class="card bg-slate-300 m-3 shadow.lg shadow-gray-400">
                            <div class="card-body">
                                <img src={pokemon.sprites.front_default} alt="Pokemon Image" class="w-32 h-32 mx-auto " />
                                <h2 class="text-gray-900 text-2x1 font-bold">{pokemon.name}</h2>
                                <p class="text-info">{pokemon.types[0].type.name}</p>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            {#if email == session?.user?.email}
                <button class="btn btn-info" on:click={() => isModalOpen = true} >Edit Page</button>
                <dialog class="modal min-w-lg" class:modal-open={isModalOpen}>
                    <div class="modal-box">
                        <h3>Edit Your PokePage</h3>
                        <p>Here you can make edits to your page, such as description or pokemon selected.</p>
                        <p class="text-white p-2">Edit your description</p>
                        <textarea 
                            bind:value={profile.description}
                            class="textarea textarea-bordered textarea-lg, max-w-md h-[300px]"
                        />
                        <p class="text-gray-700 p-2">Select your pokemon</p>
                         <div class="grid grid-cols-3 overflow-y-scroll max-h-[600px] m-3">
                            <div class="col-span-3">
                                <input 
                                    type="text" 
                                    class="input input-bordered w-full"
                                    placeholder="Search for a pokemon!"
                                    bind:value={searchInput}
                                />
                            </div>
                            {#each pokemonList as pokemon, index} <!-- pokemon are 1 indexed -->
                                <!-- "char" -> "charmander", "charizard" -->
                                {#if pokemon.name.includes(searchInput)}
                                    <button 
                                        class={
                                            "card bg-slate-200 h-12 p-1 m-1 justify-center items-center "
                                            + (profile.pokemon_ids.includes(index + 1) 
                                            ? "border-2 border-gray-600"
                                            : "")
                                        }
                                        on:click={() => togglePokemon(index + 1)}
                                    >
                                        <div class="text=center">
                                            <h2 class="text-gray-700 text-xl">{pokemon.name}</h2>
                                        </div>
                                    </button>
                                {/if}
                            {/each}
                        </div>
                        <button class="btn btn-success" on:click={() => savePageEdits()}>Save Edits</button>
                    </div>
                </dialog>
            {/if}
        </div>
    </div>
</div>