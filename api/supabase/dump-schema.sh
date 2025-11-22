#!/bin/bash
# Script para recuperar el esquema actual de Supabase
# Uso: ./dump-schema.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Script de recuperación de esquema desde Supabase${NC}"
echo ""

# Verificar que existe el archivo .env
if [ ! -f "../.env" ]; then
  echo -e "${RED}❌ No se encontró el archivo .env${NC}"
  echo "Por favor crea el archivo api/.env con las credenciales de Supabase"
  exit 1
fi

# Cargar variables de entorno
source ../.env

# Verificar que DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL no está definida en .env${NC}"
  echo "Agrega la connection string de Supabase:"
  echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
  exit 1
fi

# Crear directorio de backups si no existe
BACKUP_DIR="../src/database/backups"
mkdir -p "$BACKUP_DIR"

# Nombre del archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SCHEMA_FILE="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
FULL_FILE="$BACKUP_DIR/full_${TIMESTAMP}.sql"

echo -e "${YELLOW}📥 Exportando esquema (solo estructura)...${NC}"
pg_dump "$DATABASE_URL" \
  --schema-only \
  --no-owner \
  --no-acl \
  --schema=public \
  -f "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Esquema exportado: $SCHEMA_FILE${NC}"
else
  echo -e "${RED}❌ Error al exportar esquema${NC}"
  exit 1
fi

echo ""
read -p "¿Deseas exportar también los datos? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}📥 Exportando base de datos completa (esquema + datos)...${NC}"
  pg_dump "$DATABASE_URL" \
    --no-owner \
    --no-acl \
    --schema=public \
    -f "$FULL_FILE"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completo exportado: $FULL_FILE${NC}"
  else
    echo -e "${RED}❌ Error al exportar backup completo${NC}"
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}🎉 Proceso completado${NC}"
echo ""
echo "Archivos generados:"
echo "  - Esquema: $SCHEMA_FILE"
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo "  - Backup completo: $FULL_FILE"
fi
echo ""
echo "Para restaurar el esquema en otra base de datos:"
echo "  psql \$DATABASE_URL -f $SCHEMA_FILE"
