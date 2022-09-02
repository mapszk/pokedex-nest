import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/interfaces/adapters/axios.adapter';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=10',
    );
    const pokemons = data.results.map(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      return { name, no };
    });
    this.pokemonModel.deleteMany({});
    this.pokemonModel.insertMany(pokemons);
    return 'DB hydrated';
  }
}
