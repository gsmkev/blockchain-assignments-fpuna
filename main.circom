pragma circom 2.1.6;

// Componente que calcula el cuadrado de un número
template Square() {
    signal input in;
    signal output out;
    out <== in * in;
}

// Componente que calcula el módulo de un número
template mod() {
    // TODO: Implementar la reducción de módulo
    signal input in;
    signal output out;
    out <== in;
}

template TP1() {
    // Señales privadas de entrada
    signal input a;
    signal input b;

    // Señal pública de entrada
    signal input p;

    // Señal pública de salida
    signal output c;
    
    // Señales internas
    signal sum;

    // Componentes internos 
    component sqrt_a = Square();
    component sqrt_b = Square();
    component mod = mod();

    // Conexiones
    sqrt_a.in <== a;
    sqrt_b.in <== b;

    sum <== sqrt_a.out + sqrt_b.out;
    mod.in <== sum;

    // Salida
    c <== mod.out;
}

// Componente principal
component main {public [p]} = TP1();

/* 
  Con la siguiente entrada
  {
    "a": "2",
    "b": "3",
    "p": "5"
  }
  Obtenemos la salida tiene la siguiente estructura
  {
    "1": "1",
    "c": "13"
    "p": "5",
    "a": "2",
    "b": "3",
    "a^2": "4",
    "b^2": "9",            
  }
*/