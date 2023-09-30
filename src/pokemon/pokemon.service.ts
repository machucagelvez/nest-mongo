import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    // Se inyecta la entidad:
    @InjectModel(Pokemon.name) // Este decorador se utiliza para que se pueda inyectar modelos en el servicio
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    // Se usa trycatch para no hacer dos consultas validando con BD (Una por el name y otra por el no)
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      // El error.code 11000 es el que se genera cuando se intenta guardar dos veces un valor que debe ser único
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exists in DB ${JSON.stringify(error.keyValue)}`,
        );
      } else {
        console.log(error);
        throw new InternalServerErrorException('Cannot create pokemon');
      }
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(filter: string) {
    let pokemon: Pokemon;

    if (!isNaN(+filter)) {
      pokemon = await this.pokemonModel.findOne({ no: filter });
    }

    if (!pokemon && isValidObjectId(filter)) {
      pokemon = await this.pokemonModel.findById(filter);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: filter.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon) throw new NotFoundException('Pokemon not found');

    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return updatePokemonDto;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
