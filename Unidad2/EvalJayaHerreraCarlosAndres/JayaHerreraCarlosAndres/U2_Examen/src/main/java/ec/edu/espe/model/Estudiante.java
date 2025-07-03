package ec.edu.espe.model;

/**
 * Single Responsability: Solo modela al estudiante (comportamiento)
 */
public class Estudiante {
    private int id;         // Identificador único
    private String apellidos; // Apellidos del estudiante
    private String nombres;  // Nombres del estudiante
    private int edad;       // Edad del estudiante

    // Constructor
    public Estudiante(int id, String apellidos, String nombres, int edad) {
        this.id = id;
        this.apellidos = apellidos;
        this.nombres = nombres;
        this.edad = edad;
    }
    // Getters y setters
    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
    // to string por si se necesita una cadena string con los datos del estudiante
    @Override
    public String toString() {
        return "Estudiante{" +
                "id=" + id +
                ", apellidos='" + apellidos + '\'' +
                ", nombres='" + nombres + '\'' +
                ", edad=" + edad +
                '}';
    }
}
