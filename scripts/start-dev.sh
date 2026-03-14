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

# Lade .env-Datei falls vorhanden
if [ -f "$ROOT_DIR/.env" ]; then
  set -o allexport
  source "$ROOT_DIR/.env"
  set +o allexport
fi

# Standardwerte falls nicht in .env definiert
export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:postgresql://localhost:5432/folia}"
export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-folia}"
export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-folia}"
export PROFILE="${PROFILE:-dev}"

echo "Starte Folia Backend mit Profil: $PROFILE"
echo "DB-URL: $SPRING_DATASOURCE_URL"

cd "$SERVER_DIR" && ./mvnw spring-boot:run -Dspring-boot.run.profiles="$PROFILE"
