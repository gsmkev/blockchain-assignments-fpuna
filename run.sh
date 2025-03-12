#!/bin/bash

# Ejecute el siguiente comando para crear el código que genera el vector de testigos
circom main.circom --r1cs --sym --wasm

# Para leer el archivo R1CS, utilizamos snarkjs de la siguiente manera si se pasa el parámetro 'snark':
if [[ "$1" == "snark" || "$2" == "snark" ]]; then
  snarkjs r1cs print main.r1cs
fi

# Crear el archivo de entrada dentro de la carpeta main_js
cd main_js
echo '{
  "a": "2",
  "b": "3",
  "p": "5"
}' > input.json

# Ahora calculamos y exportamos el testigo con el siguiente comando:
node generate_witness.js main.wasm input.json witness.wtns
snarkjs wtns export json witness.wtns

# Mostrar el contenido de witness.json si se pasa el parámetro 'witness':
if [[ "$1" == "witness" || "$2" == "witness" ]]; then
  cat witness.json
fi