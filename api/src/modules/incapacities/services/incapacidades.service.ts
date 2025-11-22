import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IncapacidadRepository } from '../repositories';
import { CreateIncapacidadDto, UpdateIncapacidadDto } from '../dtos';
import { Incapacidad, EstadoIncapacidad } from '../../../database/entities';

@Injectable()
export class IncapacidadesService {
  constructor(private readonly incapacidadRepository: IncapacidadRepository) {}

  /**
   * Crear una nueva incapacidad
   */
  async create(createDto: CreateIncapacidadDto): Promise<Incapacidad> {
    // Validar que fecha_fin sea posterior a fecha_inicio
    const fechaInicio = new Date(createDto.fecha_inicio);
    const fechaFin = new Date(createDto.fecha_fin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const incapacidadData: Partial<Incapacidad> = {
      ...createDto,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      fecha_registro: new Date(),
      estado: EstadoIncapacidad.REGISTRADA,
    };

    return this.incapacidadRepository.create(incapacidadData);
  }

  /**
   * Obtener todas las incapacidades
   */
  async findAll(): Promise<Incapacidad[]> {
    return this.incapacidadRepository.findAll();
  }

  /**
   * Obtener una incapacidad por ID
   */
  async findOne(id: string): Promise<Incapacidad> {
    const incapacidad = await this.incapacidadRepository.findById(id);
    if (!incapacidad) {
      throw new NotFoundException(`Incapacidad con ID ${id} no encontrada`);
    }
    return incapacidad;
  }

  /**
   * Obtener incapacidades de un usuario
   */
  async findByUsuario(usuarioId: string): Promise<Incapacidad[]> {
    return this.incapacidadRepository.findByUsuario(usuarioId);
  }

  /**
   * Obtener incapacidades por estado
   */
  async findByEstado(estado: EstadoIncapacidad): Promise<Incapacidad[]> {
    return this.incapacidadRepository.findByEstado(estado);
  }

  /**
   * Obtener incapacidades pendientes de revisión
   */
  async findPendientesRevision(): Promise<Incapacidad[]> {
    return this.incapacidadRepository.findPendientesRevision();
  }

  /**
   * Actualizar una incapacidad
   */
  async update(id: string, updateDto: UpdateIncapacidadDto): Promise<Incapacidad> {
    const incapacidad = await this.findOne(id);

    // Validar fechas si se están actualizando
    if (updateDto.fecha_inicio || updateDto.fecha_fin) {
      const fechaInicio = updateDto.fecha_inicio 
        ? new Date(updateDto.fecha_inicio) 
        : incapacidad.fecha_inicio;
      const fechaFin = updateDto.fecha_fin 
        ? new Date(updateDto.fecha_fin) 
        : incapacidad.fecha_fin;

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    const updateData: Partial<Incapacidad> = {};
    
    if (updateDto.fecha_inicio !== undefined) {
      updateData.fecha_inicio = new Date(updateDto.fecha_inicio);
    }
    if (updateDto.fecha_fin !== undefined) {
      updateData.fecha_fin = new Date(updateDto.fecha_fin);
    }
    if (updateDto.motivo !== undefined) {
      updateData.motivo = updateDto.motivo;
    }
    if (updateDto.monto_solicitado !== undefined) {
      updateData.monto_solicitado = updateDto.monto_solicitado;
    }
    if (updateDto.estado !== undefined) {
      updateData.estado = updateDto.estado;
    }
    if (updateDto.observaciones !== undefined) {
      updateData.observaciones = updateDto.observaciones;
    }

    return this.incapacidadRepository.update(id, updateData);
  }

  /**
   * Cambiar el estado de una incapacidad
   */
  async cambiarEstado(
    id: string,
    nuevoEstado: EstadoIncapacidad,
    observaciones?: string,
  ): Promise<Incapacidad> {
    await this.findOne(id); // Verificar que existe
    return this.incapacidadRepository.cambiarEstado(id, nuevoEstado, observaciones);
  }

  /**
   * Eliminar una incapacidad
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verificar que existe
    await this.incapacidadRepository.delete(id);
  }

  /**
   * Calcular duración de una incapacidad en días
   */
  calcularDuracion(incapacidad: Incapacidad): number {
    const inicio = new Date(incapacidad.fecha_inicio);
    const fin = new Date(incapacidad.fecha_fin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
