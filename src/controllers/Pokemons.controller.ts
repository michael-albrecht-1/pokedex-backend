import { Handler } from 'express';
import { PokemonsModel } from '../models/pokemonModel';
const mongoose = require('mongoose');

export const searchPokemons: Handler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 12;
    const result = {};
    const nbresults = await PokemonsModel.countDocuments().exec();

    let startIndex = page * limit;
    const endIndex = (page + 1) * limit;
    result.nbresults = nbresults;

    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    if (endIndex < nbresults) {
      result.next = {
        pageNumber: page + 1,
        limit: limit,
      };
    }
    console.warn(result);

    result.data = await PokemonsModel.find()
      .skip(startIndex)
      .limit(limit)
      .exec();

    result.rowsPerPage = limit;
    return res.json({ msg: 'Posts Fetched successfully', data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'Sorry, something went wrong' });
  }
};

export const getPokemon: Handler = async (req, res) => {
  try {
    const data = await PokemonsModel.findOne({
      id: req.params.id,
    });

    res.json(data);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

export const updatePokemonsFromPokeApi: Handler = async (req, res) => {
  try {
    const pokemons: PokemonPokeApiDTO[] = await getPokemonsFromPokeApi();

    mongoose.connection.db.dropCollection(
      'pokemons',
      function (err: any, res: any) {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );

    pokemons.map((p: PokemonPokeApiDTO) => {
      const newRecord = new PokemonsModel({
        id: p.id,
        name: p.name,
        height: p.height,
        weight: p.weight,
        types: p.types,
      });

      newRecord.save();
    });

    res.status(200).send('Pokemons import sucess !');
  } catch (err) {
    res.status(500).send({ message: 'import pokemons from pokeapi failed' });
  }
};

const getPokemonsFromPokeApi = async (): Promise<PokemonPokeApiDTO[]> => {
  // actual pokemons number referenced in pokeApi : 649
  const pokemonCount = 649;
  let pokemons: PokemonPokeApiDTO[] = [];
  for (let i = 1; i <= pokemonCount; i++) {
    const pokemon: PokemonPokeApiDTO = await getPokemonFromPokeApi(i);
    pokemons = [...pokemons, pokemon];
  }

  return pokemons;
};

const getPokemonFromPokeApi = async (
  num: number
): Promise<PokemonPokeApiDTO> => {
  const url = 'https://pokeapi.co/api/v2/pokemon/' + num.toString();

  const res = await fetch(url);

  return res.json() as Promise<PokemonPokeApiDTO>;
};

interface PokemonPokeApiDTO {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: any[];
  held_items: any[];
  location_area_encounters: string;
  moves: any[];
  species: any;
  sprites: PokemonPokeApiSpritesDTO;
  stats: any[];
  types: any[];
  past_types: any[];
}

export interface PokemonPokeApiSpritesDTO {
  front_default: string;
  front_shiny: string;
  front_female: string;
  front_shiny_female: string;
  back_default: string;
  back_shiny: string;
  back_female: string;
  back_shiny_female: string;
}
