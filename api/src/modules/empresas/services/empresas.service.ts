import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmpresaRepository } from '../repositories/empresa.repository';
import { CreateEmpresaDto, UpdateEmpresaDto } from '../dtos';

@Injectable()
export class EmpresasService {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  /**
   * Crear una nueva empresa
   */
  async create(createEmpresaDto: CreateEmpresaDto) {
    // Verificar si ya existe una empresa con ese nombre
    const existingEmpresa =
      await this.empresaRepository.findByNombre(createEmpresaDto.nombre);

    if (existingEmpresa) {
      throw new ConflictException(
        `Ya existe una empresa con el nombre "${createEmpresaDto.nombre}"`,
      );
    }

    const empresa = await this.empresaRepository.create(createEmpresaDto);
    return empresa;
  }

  /**
   * Obtener todas las empresas
   */
  async findAll() {
    return await this.empresaRepository.findAll({
      column: 'created_at',
      ascending: false,
    });
  }

  /**
   * Obtener una empresa por ID
   */
  async findOne(id: string) {
    const empresa = await this.empresaRepository.findById(id);

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return empresa;
  }

  /**
   * Actualizar una empresa
   */
  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otra empresa con ese nombre
    if (updateEmpresaDto.nombre) {
      const existingEmpresa =
        await this.empresaRepository.findByNombre(updateEmpresaDto.nombre);

      if (existingEmpresa && existingEmpresa.id !== id) {
        throw new ConflictException(
          `Ya existe otra empresa con el nombre "${updateEmpresaDto.nombre}"`,
        );
      }
    }

    return await this.empresaRepository.update(id, updateEmpresaDto);
  }

  /**
   * Eliminar una empresa
   */
  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    await this.empresaRepository.delete(id);

    return { message: 'Empresa eliminada exitosamente' };
  }

  /**
   * Obtener usuarios de una empresa
   */
  async getUsuarios(empresaId: string) {
    // Verificar que la empresa existe
    await this.findOne(empresaId);

    return await this.empresaRepository.getUsuarios(empresaId);
  }
}
