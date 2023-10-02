import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    // Este adaptador se utiliza para cambiar por si se requiere hacer cambios en axios o utilizar otra librería para la conexión (solo se cambia/crea el adaptador):
    private readonly http: AxiosAdapter,
  ) {}
  async executedSeed() {
    await this.pokemonModel.deleteMany({}); //Limpiar la BD
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=500',
    );

    // await Promise.all(
    //   data.results.map(async ({ name, url }) => {
    //     const segments = url.split('/');
    //     const no = +segments[segments.length - 2];
    //     await this.pokemonModel.create({ name, no });
    //   }),
    // );

    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });
    await this.pokemonModel.insertMany(pokemonToInsert); // Esto hace una sola inserción en BD

    return 'Seed executed';
  }
}
