package ec.edu.espe.controller;

import ec.edu.espe.dao.EstudianteDAO;
import ec.edu.espe.model.Estudiante;
import java.util.List;

/**
 * Controlador que maneja la lógica de negocio y validación de estudiantes.
 * Principio SOLID aplicado: Single Responsibility se encarga solo de coordinar lógica entre vista y DAO.
 */
public class EstudianteController {
    private final EstudianteDAO dao;

    // Constructor: instancia el DAO
    public EstudianteController() {
        this.dao = new EstudianteDAO();
    }


    /**
     * Carga datos iniciales
     */


    public void cargarDatosIniciales() {
        crearEstudiante(1234, "Pérez", "Ana", 20);
        crearEstudiante(5678, "García", "Luis", 22);
    }


    /**
     * Valida los datos del estudiante.
     * retorna true si los datos son válidos, false en caso contrario.
     * Principio open closed de los principios SOLID: la validación puede extenderse sin afectar otras partes del sistema.
     */


    public boolean validarDatos(int id, String apellidos, String nombres, int edad) {
        return id >= 0 &&
                apellidos != null && !apellidos.trim().isEmpty() &&
                nombres != null && !nombres.trim().isEmpty() &&
                edad >= 0 && edad <= 120;
    }

    /**
     * Crea un estudiante y lo guarda si los datos son válidos.
     */
    public void crearEstudiante(int id, String apellidos, String nombres, int edad) {
        if (validarDatos(id, apellidos, nombres, edad)) {
            Estudiante estudiante = new Estudiante(id, apellidos, nombres, edad);
            dao.agregar(estudiante);
        } else {
            System.err.println("Datos no válidos. No se pudo crear el estudiante.");
        }
    }

    /**
     * Actualiza los datos de un estudiante existente.
     * retorna true si se actualizó correctamente, false si los datos son inválidos o no se encontró.
     */
    public boolean actualizarEstudiante(int id, String apellidos, String nombres, int edad) {
        if (validarDatos(id, apellidos, nombres, edad)) {
            Estudiante estudiante = new Estudiante(id, apellidos ,nombres, edad);
            return dao.actualizar(estudiante);
        } else {
            System.err.println(" Datos inválidos. No se pudo actualizar el estudiante.");
            return false;
        }
    }

    /**
     * Elimina un estudiante por su ID.
     */
    public boolean eliminarEstudiante(int id) {
        return dao.eliminar(id);
    }

    /**
     * Devuelve la lista de todos los estudiantes.
     */
    public List<Estudiante> obtenerTodos() {
        return dao.listar();
    }

    /**
     * Busca un estudiante por su ID.
     */
    public Estudiante buscarEstudiante(int id) {
        return dao.buscarPorId(id);
    }
}
