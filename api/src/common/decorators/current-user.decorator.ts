import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario actual del request
 * Uso:
 * - @CurrentUser() user → Obtiene todo el payload del JWT
 * - @CurrentUser('id') userId → Obtiene solo el campo 'sub' (id)
 * - @CurrentUser('email') email → Obtiene solo el email
 * - @CurrentUser('rol') rol → Obtiene solo el rol
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Si se especifica un campo, devolver ese campo
    // El campo 'id' mapea a 'sub' del JWT
    if (data) {
      if (data === 'id') {
        return user.sub;
      }
      return user[data];
    }

    // Devolver todo el usuario con el campo 'id' mapeado
    return {
      id: user.sub,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };
  },
);
