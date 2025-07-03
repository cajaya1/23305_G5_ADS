package ec.edu.espe.dao;

import java.util.ArrayList;
import java.util.List;
import ec.edu.espe.model.Estudiante;

/**
 *Clase encargada de almacenar y recuperar estudiantes en una lista (solo manejo de datos).
 *Principio Solid: Single Responsability ya que solo se encarga del manejo de datos.
 */


public class EstudianteDAO {
    private final List<Estudiante> estudiantes = new ArrayList<>();

    //Agrega un nuevo estudiante
    public void agregar(Estudiante estudiante) {
        estudiantes.add(estudiante);
    }

    //Lista todos los estudiantes almacenados
    public List<Estudiante> listar() {
        return estudiantes;
    }

    //Busca un estudiante por su ID
    public Estudiante buscarPorId(int id) {
        for (Estudiante e : estudiantes) {
            if (e.getId() == id) {
                return e;
            }
        }
        return null;
    }

    //Elimina un estudiante usando el método de buscar
    public boolean eliminar(int id) {
        Estudiante e = buscarPorId(id);
        return estudiantes.remove(e);
    }

    //Actualiza un estudiante por ID
    public boolean actualizar(Estudiante estudiante) {
        for (int i = 0; i < estudiantes.size(); i++) {
            if (estudiantes.get(i).getId() == estudiante.getId()) {
                estudiantes.set(i, estudiante);
                return true;
            }
        }
        return false;
    }
}
