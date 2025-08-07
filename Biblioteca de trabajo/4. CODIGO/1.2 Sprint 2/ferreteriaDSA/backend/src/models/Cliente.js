class Cliente {
  constructor({ id, nombres, apellidos, cedula, direccion, telefono, email, creado_en, es_frecuente }) {
    this.id = id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.cedula = cedula;
    this.direccion = direccion;
    this.telefono = telefono;
    this.email = email;
    this.creado_en = creado_en;
    this.es_frecuente = es_frecuente === 1; // Convertir a booleano
  }
}

module.exports = Cliente;
