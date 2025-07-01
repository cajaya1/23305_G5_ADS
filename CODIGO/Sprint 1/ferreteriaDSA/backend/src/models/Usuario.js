class Usuario {
  constructor({ id, nombre, email, password, rol, creado_en }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;
    this.creado_en = creado_en;
  }
}

module.exports = Usuario;
