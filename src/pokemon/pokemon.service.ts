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
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 }) // Ordena en forma ascendente
      .select('-__v'); // Elimina del select la columna __v
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

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });
      // Se devuelve lo que está en pokemon sobreescribiendo lo que se actualizó, que está en updatePokemonDto:
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    // Al eliminar de esta forma se evita hacer dos consultas a la BD:
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) throw new BadRequestException('Pokemon not found');
    return;
  }

  private handleExceptions(error: any) {
    // El error.code 11000 es el que se genera cuando se intenta guardar dos veces un valor que debe ser único
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in DB ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException('Cannot create/update pokemon');
  }
}
