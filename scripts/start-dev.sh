#!/usr/bin/env bash
# Startet den Backend-Server
# Verwendung:
#   ./start-dev.sh         → lokales Profil (Dev, lokale PostgreSQL)
#   ./start-dev.sh --prod  → Prod-Profil (Neon-Datenbank)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$ROOT_DIR/server"

PROFILE="dev"
if [[ "$1" == "--prod" ]]; then
  PROFILE="prod"
fi

# Lade .env-Datei
set -o allexport
source "$ROOT_DIR/.env"
set +o allexport

echo "Starte Folia Backend mit Profil: $PROFILE"
if [[ "$PROFILE" == "prod" ]]; then
  echo "DB-URL: jdbc:postgresql://$NEON_DATABASE"
else
  echo "DB-URL: jdbc:postgresql://${HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-folia}"
fi

cd "$SERVER_DIR" && ./mvnw spring-boot:run -Dspring-boot.run.profiles="$PROFILE"
