package ec.edu.espe.ui;

import javax.swing.SwingUtilities;
import ec.edu.espe.controller.EstudianteController;
/**
 * Clase main
 * Se encarga exclusivamente de iniciar la UI
 */
public class Main {
    public static void main(String[] args) {
        // Crear el controlador y cargar datos iniciales
        EstudianteController controller = new EstudianteController();
        controller.cargarDatosIniciales();

        // Lanzar la UI
        SwingUtilities.invokeLater(() -> {
            EstudianteUI ui = new EstudianteUI(controller);
            ui.setVisible(true);
        });
    }
}
