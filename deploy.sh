#!/bin/bash
set -e

echo "🚀 Iniciando proceso de subida a GitHub..."

# Comprobar si es un repositorio git
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    git branch -m main
fi

# Comprobar si hay un origen remoto (URL de GitHub) configurado
if ! git remote | grep -q "origin"; then
    echo "🔗 No se ha detectado ninguna URL de GitHub conectada."
    read -p "Por favor, introduce la URL de tu repositorio (ej: https://github.com/tu-usuario/AprendeX86.git): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ URL remota añadida."
    else
        echo "❌ Error: Necesitas un repositorio en GitHub para subir el código."
        exit 1
    fi
fi

echo "📂 Añadiendo archivos..."
git add .

echo "📝 Creando commit..."
# Pedir mensaje de commit (opcional, con valor por defecto)
read -p "Mensaje del commit [Actualización PWA Terminal]: " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Actualización PWA Terminal"}

git commit -m "$COMMIT_MSG" || echo "No hay cambios nuevos para confirmar."

echo "☁️  Subiendo código a GitHub..."
# Empujar a la rama main (o master si el usuario prefiere)
git push -u origin main

echo ""
echo "🎉 ¡Subida completada!"
echo ""
echo "En unos 1-2 minutos, GitHub Actions procesará tu subida y publicará la PWA automáticamente."
echo "Puedes revisar el progreso en la pestaña 'Actions' de tu repositorio en GitHub."
