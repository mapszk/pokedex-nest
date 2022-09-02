import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { mongoErrorCodes } from '../../utils/mongo/errorCodes';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === mongoErrorCodes.duplicateKey) {
        const keyName = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(
          `Pokemon with ${keyName} ${createPokemonDto[keyName]} already exists`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(`Id ${id} is not a valid id`);
    const pokemon = await this.pokemonModel.findById(id);
    if (!pokemon)
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      await this.pokemonModel.findByIdAndUpdate(id, updatePokemonDto);
      return this.findOne(id);
    } catch (error) {
      if (error.code === mongoErrorCodes.duplicateKey) {
        const keyName = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(
          `Pokemon with ${keyName} ${updatePokemonDto[keyName]} already exists`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.pokemonModel.findByIdAndDelete(id);
  }

  async hydrateWithSeed(pokemons: CreatePokemonDto[]) {
    await this.pokemonModel.deleteMany({});
    await this.pokemonModel.insertMany(pokemons);
  }
}
