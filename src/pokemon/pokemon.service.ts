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
import { PaginationDto } from 'src/common/interfaces/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

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

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    const totalCount = await this.pokemonModel.countDocuments({});
    const pokemons = await this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset * limit)
      .sort({ no: 1 })
      .select('-__v');

    return {
      data: pokemons,
      pages: Math.ceil(totalCount / limit),
      totalCount,
    };
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
}
