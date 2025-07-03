package ec.edu.espe.ui;

import ec.edu.espe.controller.EstudianteController;
import ec.edu.espe.model.Estudiante;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * Interfaz gráfica de usuario
 * Representa la vista del patron MVC.
 * Se usa la vista usada en la actividad anterior hecha en clase
 */

public class EstudianteUI extends JFrame {
    // Controlador recibido desde el exterior (inyección de dependencias)
    private final EstudianteController controller;

    // Campos de entrada
    private final JTextField txtId = new JTextField(5);
    private final JTextField txtApellidos = new JTextField(10);
    private final JTextField txtNombres = new JTextField(10);
    private final JTextField txtEdad = new JTextField(5);

    // Modelo de la tabla
    private final DefaultTableModel tableModel = new DefaultTableModel(
            new Object[]{"ID", "Apellidos", "Nombres", "Edad"}, 0
    );
    private final JTable tablaEstudiantes = new JTable(tableModel);

    /**
     * Constructor: recibe el controlador y configura la ventana.
     */
    public EstudianteUI(EstudianteController controller) {
        this.controller = controller;

        setTitle("Gestión de Estudiantes");
        setSize(700, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null); // Centrar

        // Panel de entrada de datos
        JPanel panelCampos = new JPanel();
        panelCampos.add(new JLabel("ID:"));
        panelCampos.add(txtId);
        panelCampos.add(new JLabel("Apellidos:"));
        panelCampos.add(txtApellidos);
        panelCampos.add(new JLabel("Nombres:"));
        panelCampos.add(txtNombres);
        panelCampos.add(new JLabel("Edad:"));
        panelCampos.add(txtEdad);

        // Botones
        JButton btnCrear = new JButton("Crear");
        JButton btnActualizar = new JButton("Actualizar");
        JButton btnEliminar = new JButton("Eliminar");
        JButton btnVerTodo = new JButton("Ver Todo");

        btnCrear.addActionListener(e -> crearEstudiante());
        btnActualizar.addActionListener(e -> actualizarEstudiante());
        btnEliminar.addActionListener(e -> eliminarEstudiante());
        btnVerTodo.addActionListener(e -> mostrarEstudiantes());

        JPanel panelBotones = new JPanel();
        panelBotones.add(btnCrear);
        panelBotones.add(btnActualizar);
        panelBotones.add(btnEliminar);
        panelBotones.add(btnVerTodo);

        // Tabla con scroll
        JScrollPane scrollPane = new JScrollPane(tablaEstudiantes);

        // Panel superior que une campos + botones
        JPanel panelSuperior = new JPanel(new BorderLayout());
        panelSuperior.add(panelCampos, BorderLayout.NORTH);
        panelSuperior.add(panelBotones, BorderLayout.SOUTH);

        // Estructura final de la ventana
        setLayout(new BorderLayout());
        add(panelSuperior, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);

        // Mostrar datos precargados al iniciar
        mostrarEstudiantes();
    }

    /**
     * Crea un nuevo estudiante desde los campos de texto.
     */
    private void crearEstudiante() {
        try {
            int id = Integer.parseInt(txtId.getText());
            String apellidos = txtApellidos.getText();
            String nombres = txtNombres.getText();
            int edad = Integer.parseInt(txtEdad.getText());

            controller.crearEstudiante(id, apellidos, nombres, edad);
            limpiarCampos();
            mostrarEstudiantes();
        } catch (NumberFormatException ex) {
            mostrarError("Ingrese datos válidos.");
        }
    }

    /**
     * Actualiza un estudiante con los datos ingresados.
     */
    private void actualizarEstudiante() {
        try {
            int id = Integer.parseInt(txtId.getText());
            String apellidos = txtApellidos.getText();
            String nombres = txtNombres.getText();
            int edad = Integer.parseInt(txtEdad.getText());

            if (controller.actualizarEstudiante(id, apellidos, nombres, edad)) {
                mostrarInfo("Estudiante actualizado.");
            } else {
                mostrarError("ID no encontrado o datos inválidos.");
            }
            limpiarCampos();
            mostrarEstudiantes();
        } catch (NumberFormatException ex) {
            mostrarError("Ingrese datos válidos.");
        }
    }

    /**
     * Elimina un estudiante según el ID ingresado.
     */
    private void eliminarEstudiante() {
        try {
            int id = Integer.parseInt(txtId.getText());
            if (controller.eliminarEstudiante(id)) {
                mostrarInfo("Estudiante eliminado.");
            } else {
                mostrarError("ID no encontrado.");
            }
            limpiarCampos();
            mostrarEstudiantes();
        } catch (NumberFormatException ex) {
            mostrarError("Ingrese un ID válido.");
        }
    }

    /**
     * Muestra todos los estudiantes en la tabla.
     */
    private void mostrarEstudiantes() {
        tableModel.setRowCount(0); // Limpiar tabla

        List<Estudiante> estudiantes = controller.obtenerTodos();
        for (Estudiante e : estudiantes) {
            tableModel.addRow(new Object[]{
                    e.getId(), e.getApellidos(), e.getNombres(), e.getEdad()
            });
        }
    }

    /**
     * Limpia los campos de texto.
     */
    private void limpiarCampos() {
        txtId.setText("");
        txtApellidos.setText("");
        txtNombres.setText("");
        txtEdad.setText("");
    }

    /**
     * Muestra un cuadro de diálogo con mensaje de error.
     */
    private void mostrarError(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje, "Error", JOptionPane.ERROR_MESSAGE);
    }

    /**
     * Muestra un cuadro de diálogo con información.
     */
    private void mostrarInfo(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje, "Info", JOptionPane.INFORMATION_MESSAGE);
    }
}
