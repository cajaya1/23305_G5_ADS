import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { AutoComplete } from 'primereact/autocomplete';
import '../styles/ventas.css';

const VentasPage = () => {
  // Estados principales
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados para nueva venta
  const [carritoItems, setCarritoItems] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [procesandoVenta, setProcesandoVenta] = useState(false);

  // Estados para cliente rápido
  const [dialogClienteRapido, setDialogClienteRapido] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  // Estados para factura
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [notas, setNotas] = useState('');

  // Estados para historial
  const [filtroFecha, setFiltroFecha] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');

  // Estados para diálogo de detalle
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const toast = useRef(null);

  // Opciones para dropdowns
  const metodosPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' }
  ];

  const estadosVenta = [
    { label: 'Todas', value: '' },
    { label: 'Completada', value: 'completada' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Pendiente', value: 'pendiente' }
  ];

  // FUNCIONES DE VALIDACIÓN

  // Validación de cédula ecuatoriana
  const validarCedulaEcuatoriana = (cedula) => {
    if (cedula.length !== 10) return false;
    
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    const digitoVerificador = parseInt(cedula.charAt(9));
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    
    const residuo = suma % 10;
    const digitoEsperado = residuo === 0 ? 0 : 10 - residuo;
    
    return digitoVerificador === digitoEsperado;
  };

  // Validación de campos del cliente
  const validarCampoCliente = (valor, campo) => {
    const soloLetrasRegex = /^[A-ZÁÉÍÓÚÑÜ\s]*$/;
    const soloNumerosRegex = /^[0-9]*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/;
    
    switch (campo) {
      case 'nombres':
      case 'apellidos':
        if (valor && !soloLetrasRegex.test(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Formato inválido',
            detail: `${campo === 'nombres' ? 'Los nombres' : 'Los apellidos'} solo pueden contener letras mayúsculas`,
            life: 3000
          });
          return false;
        }
        break;
      case 'cedula':
        if (valor && !soloNumerosRegex.test(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Formato inválido',
            detail: 'La cédula solo puede contener números',
            life: 3000
          });
          return false;
        }
        if (valor.length === 10 && !validarCedulaEcuatoriana(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Cédula inválida',
            detail: 'La cédula no es válida según el algoritmo ecuatoriano',
            life: 3000
          });
          return false;
        }
        break;
      case 'telefono':
        if (valor && !soloNumerosRegex.test(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Formato inválido',
            detail: 'El teléfono solo puede contener números',
            life: 3000
          });
          return false;
        }
        break;
      case 'email':
        if (valor && !emailRegex.test(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Formato inválido',
            detail: 'Formato de email inválido',
            life: 3000
          });
          return false;
        }
        break;
      case 'direccion':
        // La dirección puede contener letras, números y caracteres especiales comunes
        const direccionRegex = /^[A-ZÁÉÍÓÚÑÜ0-9\s\-\.\,\#]*$/;
        if (valor && !direccionRegex.test(valor)) {
          toast.current.show({
            severity: 'warn',
            summary: 'Formato inválido',
            detail: 'La dirección contiene caracteres no válidos',
            life: 3000
          });
          return false;
        }
        break;
    }
    return true;
  };

  // Validación de notas
  const validarNotas = (valor) => {
    // Permitir letras, números, espacios y algunos signos de puntuación básicos
    const notasRegex = /^[A-ZÁÉÍÓÚÑÜ0-9\s\.\,\;\:\-\(\)]*$/;
    if (valor && !notasRegex.test(valor)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'Las notas contienen caracteres no válidos',
        life: 3000
      });
      return false;
    }
    return true;
  };

  // Configurar axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (activeIndex === 0) {
      cargarProductos();
      cargarClientes();
    } else if (activeIndex === 1) {
      cargarVentas();
    } else if (activeIndex === 2) {
      cargarEstadisticas();
    }
  }, [activeIndex]);

  // Funciones de carga de datos
  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/productos');
      setProductos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos',
        life: 3000
      });
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/clientes');
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los clientes',
        life: 3000
      });
    }
  };

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroFecha.length === 2) {
        params.append('fecha_inicio', filtroFecha[0].toISOString().split('T')[0]);
        params.append('fecha_fin', filtroFecha[1].toISOString().split('T')[0]);
      }
      if (filtroCliente) params.append('cliente_nombre', filtroCliente);
      if (filtroEstado) params.append('estado', filtroEstado);

      const response = await axios.get(`http://localhost:3001/api/ventas?${params}`);
      setVentas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las ventas',
        life: 3000
      });
    }
    setLoading(false);
  };

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/ventas/estadisticas');
      setEstadisticas(response.data.data || null);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las estadísticas',
        life: 3000
      });
    }
    setLoading(false);
  };

  // Funciones de búsqueda
  const buscarProducto = (event) => {
    const query = event.query.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(query) ||
      producto.codigo.toLowerCase().includes(query)
    );
    setProductosEncontrados(productosFiltrados);
  };

  const buscarCliente = (event) => {
    const query = event.query.toLowerCase();
    const clientesFiltrados = clientes.filter(cliente =>
      cliente.nombres.toLowerCase().includes(query) ||
      cliente.apellidos.toLowerCase().includes(query) ||
      cliente.cedula.includes(query)
    );
    setClientesSugeridos(clientesFiltrados);
  };

  // Funciones del carrito
  const agregarAlCarrito = (producto) => {
    if (!producto || producto.stock <= 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Stock insuficiente',
        detail: 'El producto seleccionado no tiene stock disponible',
        life: 3000
      });
      return;
    }

    const itemExistente = carritoItems.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock) {
        toast.current.show({
          severity: 'warn',
          summary: 'Stock insuficiente',
          detail: `Solo hay ${producto.stock} unidades disponibles`,
          life: 3000
        });
        return;
      }
      
      setCarritoItems(items => 
        items.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
            : item
        )
      );
    } else {
      setCarritoItems(items => [...items, {
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        precio_unitario: producto.precio,
        cantidad: 1,
        subtotal: producto.precio,
        stock_disponible: producto.stock
      }]);
    }

    setBusquedaProducto('');
    setProductosEncontrados([]);
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removerDelCarrito(productoId);
      return;
    }

    const item = carritoItems.find(item => item.producto_id === productoId);
    if (item && nuevaCantidad > item.stock_disponible) {
      toast.current.show({
        severity: 'warn',
        summary: 'Stock insuficiente',
        detail: `Solo hay ${item.stock_disponible} unidades disponibles`,
        life: 3000
      });
      return;
    }

    setCarritoItems(items =>
      items.map(item =>
        item.producto_id === productoId
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio_unitario }
          : item
      )
    );
  };

  const removerDelCarrito = (productoId) => {
    setCarritoItems(items => items.filter(item => item.producto_id !== productoId));
  };

  const limpiarCarrito = () => {
    setCarritoItems([]);
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setDescuento(0);
    setNotas('');
  };

  // Cálculos de totales
  const calcularSubtotal = () => {
    return carritoItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calcularImpuesto = () => {
    return calcularSubtotal() * 0.19; // IVA 19%
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuesto() - descuento;
  };

  // Funciones de cliente rápido
  const abrirClienteRapido = () => {
    setNuevoCliente({
      nombres: '',
      apellidos: '',
      cedula: '',
      direccion: '',
      telefono: '',
      email: ''
    });
    setDialogClienteRapido(true);
  };

  const registrarClienteRapido = async () => {
    // Validar campos obligatorios
    if (!nuevoCliente.nombres || !nuevoCliente.cedula) {
      toast.current.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'El nombre y la cédula son obligatorios',
        life: 3000
      });
      return;
    }

    // Validar formato de cada campo
    const campos = ['nombres', 'apellidos', 'cedula', 'telefono', 'email', 'direccion'];
    for (const campo of campos) {
      if (nuevoCliente[campo] && !validarCampoCliente(nuevoCliente[campo], campo)) {
        return;
      }
    }

    // Convertir nombres y apellidos a mayúsculas
    const clienteData = {
      ...nuevoCliente,
      nombres: nuevoCliente.nombres.toUpperCase(),
      apellidos: nuevoCliente.apellidos.toUpperCase(),
      direccion: nuevoCliente.direccion.toUpperCase()
    };

    try {
      const response = await axios.post('http://localhost:3001/api/ventas/cliente-rapido', clienteData);
      
      if (response.data.success) {
        const clienteRegistrado = response.data.data;
        setClienteSeleccionado(clienteRegistrado);
        setBusquedaCliente(`${clienteRegistrado.nombres} ${clienteRegistrado.apellidos}`);
        setDialogClienteRapido(false);
        
        // Actualizar lista de clientes
        await cargarClientes();
        
        toast.current.show({
          severity: 'success',
          summary: 'Cliente registrado',
          detail: 'Cliente agregado exitosamente',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al registrar el cliente',
        life: 3000
      });
    }
  };

  // Función para procesar venta
  const procesarVenta = async () => {
    // Validaciones
    if (carritoItems.length === 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'Agregue productos al carrito antes de procesar la venta',
        life: 3000
      });
      return;
    }

    if (!clienteSeleccionado && !busquedaCliente) {
      toast.current.show({
        severity: 'warn',
        summary: 'Cliente requerido',
        detail: 'Seleccione un cliente o ingrese "Consumidor Final"',
        life: 3000
      });
      return;
    }

    // Validar notas
    if (notas && !validarNotas(notas)) {
      return;
    }

    setProcesandoVenta(true);

    try {
      const ventaData = {
        cliente_id: clienteSeleccionado?.id || null,
        cliente_nombre: clienteSeleccionado ? 
          `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}` : 
          busquedaCliente.toUpperCase(),
        cliente_cedula: clienteSeleccionado?.cedula || null,
        cliente_direccion: clienteSeleccionado?.direccion || null,
        cliente_telefono: clienteSeleccionado?.telefono || null,
        cliente_email: clienteSeleccionado?.email || null,
        metodo_pago: metodo_pago,
        descuento: descuento,
        notas: notas.toUpperCase(),
        vendedor_id: JSON.parse(localStorage.getItem('usuario'))?.id || null,
        detalles: carritoItems
      };

      const response = await axios.post('http://localhost:3001/api/ventas', ventaData);

      if (response.data.success) {
        const ventaCreada = response.data.data;
        
        toast.current.show({
          severity: 'success',
          summary: 'Venta procesada',
          detail: `Factura ${ventaCreada.numero_factura} generada exitosamente`,
          life: 4000
        });

        // Limpiar formulario
        limpiarCarrito();
        
        // Recargar productos para actualizar stock
        await cargarProductos();
        
        // Mostrar opción de descargar PDF
        confirmDialog({
          message: '¿Desea descargar la factura en PDF?',
          header: 'Factura generada',
          icon: 'pi pi-question-circle',
          accept: () => descargarFacturaPDF(ventaCreada.id),
          reject: () => {},
          acceptLabel: 'Sí, descargar',
          rejectLabel: 'No, gracias'
        });
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error al procesar venta',
        detail: error.response?.data?.message || 'Error interno del servidor',
        life: 4000
      });
    }

    setProcesandoVenta(false);
  };

  // Función para descargar PDF
  const descargarFacturaPDF = async (ventaId) => {
    setGenerandoPDF(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/ventas/${ventaId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${ventaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.current.show({
        severity: 'success',
        summary: 'Descarga exitosa',
        detail: 'La factura se ha descargado correctamente',
        life: 3000
      });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error de descarga',
        detail: 'No se pudo descargar la factura',
        life: 3000
      });
    }
    setGenerandoPDF(false);
  };

  // Funciones del historial
  const verDetalleVenta = async (venta) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/ventas/${venta.id}`);
      if (response.data.success) {
        setVentaSeleccionada(response.data.data);
        setDialogDetalle(true);
      }
    } catch (error) {
      console.error('Error al cargar detalle de venta:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el detalle de la venta',
        life: 3000
      });
    }
  };

  const cancelarVenta = async (ventaId) => {
    try {
      const response = await axios.patch(`http://localhost:3001/api/ventas/${ventaId}/cancelar`);
      
      if (response.data.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Venta cancelada',
          detail: 'La venta ha sido cancelada y el stock restaurado',
          life: 3000
        });
        
        await cargarVentas();
      }
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'No se pudo cancelar la venta',
        life: 3000
      });
    }
  };

  // Templates para las columnas
  const totalBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(rowData.total);
  };

  const estadoBodyTemplate = (rowData) => {
    const severity = rowData.estado === 'completada' ? 'success' : 
                    rowData.estado === 'cancelada' ? 'danger' : 'warning';
    return <Tag value={rowData.estado.toUpperCase()} severity={severity} />;
  };

  const fechaBodyTemplate = (rowData) => {
    return new Date(rowData.creado_en).toLocaleDateString('es-CO');
  };

  const accionesBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-info"
          onClick={() => verDetalleVenta(rowData)}
          tooltip="Ver detalle"
        />
        <Button
          icon="pi pi-download"
          className="p-button-text p-button-success"
          onClick={() => descargarFacturaPDF(rowData.id)}
          tooltip="Descargar PDF"
          loading={generandoPDF}
        />
        {rowData.estado === 'completada' && (
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-danger"
            onClick={() => {
              confirmDialog({
                message: '¿Está seguro de cancelar esta venta? Esta acción restaurará el stock.',
                header: 'Confirmar cancelación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => cancelarVenta(rowData.id),
                acceptLabel: 'Sí, cancelar',
                rejectLabel: 'No'
              });
            }}
            tooltip="Cancelar venta"
          />
        )}
      </div>
    );
  };

  // Renderizado de pestañas
  const renderNuevaVenta = () => (
    <div className="grid">
      <div className="col-12 lg:col-8">
        <Card title="Productos" className="mb-4">
          <div className="field">
            <label htmlFor="busqueda-producto">Buscar producto por nombre o código</label>
            <AutoComplete
              id="busqueda-producto"
              value={busquedaProducto}
              suggestions={productosEncontrados}
              completeMethod={buscarProducto}
              field="nombre"
              placeholder="Buscar producto..."
              itemTemplate={(item) => (
                <div className="flex align-items-center gap-2">
                  <div className="flex flex-column">
                    <span className="font-semibold">{item.nombre}</span>
                    <small className="text-500">{item.codigo} - Stock: {item.stock}</small>
                  </div>
                  <div className="ml-auto">
                    <span className="font-semibold text-primary">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(item.precio)}
                    </span>
                  </div>
                </div>
              )}
              onChange={(e) => setBusquedaProducto(e.value)}
              onSelect={(e) => agregarAlCarrito(e.value)}
              className="w-full"
            />
          </div>
        </Card>

        <Card title="Carrito de Compras" className="mb-4">
          {carritoItems.length === 0 ? (
            <div className="text-center text-500 py-4">
              <i className="pi pi-shopping-cart text-4xl mb-3"></i>
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <DataTable value={carritoItems} responsiveLayout="scroll">
              <Column field="producto_nombre" header="Producto" />
              <Column field="producto_codigo" header="Código" />
              <Column 
                field="precio_unitario" 
                header="Precio Unit." 
                body={(rowData) => new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(rowData.precio_unitario)}
              />
              <Column 
                field="cantidad" 
                header="Cantidad"
                body={(rowData) => (
                  <InputNumber
                    value={rowData.cantidad}
                    onValueChange={(e) => actualizarCantidad(rowData.producto_id, e.value)}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    min={1}
                    max={rowData.stock_disponible}
                  />
                )}
              />
              <Column 
                field="subtotal" 
                header="Subtotal"
                body={(rowData) => new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(rowData.subtotal)}
              />
              <Column 
                body={(rowData) => (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger"
                    onClick={() => removerDelCarrito(rowData.producto_id)}
                    tooltip="Remover del carrito"
                  />
                )}
              />
            </DataTable>
          )}
        </Card>
      </div>

      <div className="col-12 lg:col-4">
        <Card title="Información del Cliente" className="mb-4">
          <div className="field">
            <label htmlFor="busqueda-cliente">Cliente</label>
            <AutoComplete
              id="busqueda-cliente"
              value={busquedaCliente}
              suggestions={clientesSugeridos}
              completeMethod={buscarCliente}
              field="nombres"
              placeholder="Buscar cliente o escribir 'CONSUMIDOR FINAL'"
              itemTemplate={(item) => (
                <div>
                  <div className="font-semibold">{item.nombres} {item.apellidos}</div>
                  <small className="text-500">{item.cedula}</small>
                </div>
              )}
              onChange={(e) => {
                // Verificar si e.value es una cadena de texto o un objeto
                if (typeof e.value === 'string') {
                  setBusquedaCliente(e.value.toUpperCase());
                } else {
                  // Si es un objeto (cliente seleccionado), usar el nombre completo
                  setBusquedaCliente(e.value ? `${e.value.nombres} ${e.value.apellidos}` : '');
                }
              }}
              onSelect={(e) => setClienteSeleccionado(e.value)}
              className="w-full"
            />

          </div>
          
          <div className="field">
            <Button
              label="Registrar Cliente Nuevo"
              icon="pi pi-user-plus"
              className="p-button-outlined w-full"
              onClick={abrirClienteRapido}
            />
          </div>

          {clienteSeleccionado && (
            <div className="mt-3">
              <Divider />
              <div className="text-sm">
                <div><strong>Nombre:</strong> {clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</div>
                <div><strong>Cédula:</strong> {clienteSeleccionado.cedula}</div>
                {clienteSeleccionado.telefono && <div><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</div>}
                {clienteSeleccionado.email && <div><strong>Email:</strong> {clienteSeleccionado.email}</div>}
              </div>
            </div>
          )}
        </Card>

        <Card title="Resumen de Venta" className="mb-4">
          <div className="field">
            <label htmlFor="metodo-pago">Método de Pago</label>
            <Dropdown
              id="metodo-pago"
              value={metodo_pago}
              options={metodosPago}
              onChange={(e) => setMetodoPago(e.value)}
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="descuento">Descuento</label>
            <InputNumber
              id="descuento"
              value={descuento}
              onValueChange={(e) => setDescuento(e.value || 0)}
              mode="currency"
              currency="COP"
              locale="es-CO"
              className="w-full"
              min={0}
              max={calcularSubtotal()}
            />
          </div>

          <div className="field">
            <label htmlFor="notas">Notas</label>
            <InputTextarea
              id="notas"
              value={notas}
              onChange={(e) => {
                const valor = e.target.value.toUpperCase();
                if (validarNotas(valor)) {
                  setNotas(valor);
                }
              }}
              rows={3}
              className="w-full"
              placeholder="NOTAS ADICIONALES EN MAYÚSCULAS..."
              maxLength={500}
            />
          </div>

          <Divider />

          <div className="flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
              }).format(calcularSubtotal())}
            </span>
          </div>

          <div className="flex justify-content-between mb-2">
            <span>IVA (15%):</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
              }).format(calcularImpuesto())}
            </span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-content-between mb-2">
              <span>Descuento:</span>
              <span className="font-semibold text-red-500">
                -{new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(descuento)}
              </span>
            </div>
          )}

          <Divider />

          <div className="flex justify-content-between mb-3">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-xl font-bold text-primary">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
              }).format(calcularTotal())}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              label="Limpiar"
              icon="pi pi-times"
              className="p-button-secondary flex-1"
              onClick={limpiarCarrito}
              disabled={procesandoVenta}
            />
            <Button
              label="Procesar Venta"
              icon="pi pi-check"
              className="p-button-success flex-1"
              onClick={procesarVenta}
              disabled={carritoItems.length === 0 || procesandoVenta}
              loading={procesandoVenta}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderHistorial = () => (
    <div>
      <Card title="Filtros" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-fecha">Rango de fechas</label>
            <Calendar
              id="filtro-fecha"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.value)}
              selectionMode="range"
              readOnlyInput
              className="w-full"
              placeholder="Seleccionar fechas"
            />
          </div>
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-cliente">Cliente</label>
            <InputText
              id="filtro-cliente"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value.toUpperCase())}
              placeholder="NOMBRE DEL CLIENTE"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-estado">Estado</label>
            <Dropdown
              id="filtro-estado"
              value={filtroEstado}
              options={estadosVenta}
              onChange={(e) => setFiltroEstado(e.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3">
          <Button
            label="Aplicar Filtros"
            icon="pi pi-filter"
            onClick={cargarVentas}
            loading={loading}
          />
        </div>
      </Card>

      <Card title="Historial de Ventas">
        <div className="mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value.toUpperCase())}
              placeholder="BUSCAR EN HISTORIAL..."
              className="w-full"
            />
          </span>
        </div>

        <DataTable
          value={ventas}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          responsiveLayout="scroll"
          globalFilter={globalFilter}
          emptyMessage="No se encontraron ventas"
        >
          <Column field="numero_factura" header="Número Factura" sortable />
          <Column field="cliente_nombre" header="Cliente" sortable />
          <Column field="total" header="Total" body={totalBodyTemplate} sortable />
          <Column field="metodo_pago" header="Método Pago" sortable />
          <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable />
          <Column field="creado_en" header="Fecha" body={fechaBodyTemplate} sortable />
          <Column body={accionesBodyTemplate} exportable={false} />
        </DataTable>
      </Card>
    </div>
  );

  const renderEstadisticas = () => (
    <div>
      {loading ? (
        <div className="flex justify-content-center p-4">
          <i className="pi pi-spin pi-spinner text-2xl"></i>
        </div>
      ) : estadisticas ? (
        <div className="grid">
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-primary">{estadisticas.ventas.total_ventas}</div>
              <div className="text-500">Total Ventas</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(estadisticas.ventas.total_ingresos)}
              </div>
              <div className="text-500">Total Ingresos</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(estadisticas.ventas.promedio_venta)}
              </div>
              <div className="text-500">Promedio por Venta</div>
            </Card>
          </div>
          <div className="col-12 md:col-3">
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(estadisticas.ventas.venta_maxima)}
              </div>
              <div className="text-500">Venta Máxima</div>
            </Card>
          </div>

          <div className="col-12">
            <Card title="Métodos de Pago" className="mb-4">
              <div className="grid">
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(estadisticas.ventas.efectivo)}
                    </div>
                    <div className="text-500">Efectivo</div>
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(estadisticas.ventas.tarjeta)}
                    </div>
                    <div className="text-500">Tarjeta</div>
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(estadisticas.ventas.transferencia)}
                    </div>
                    <div className="text-500">Transferencia</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-12">
            <Card title="Productos Más Vendidos">
              <DataTable
                value={estadisticas.productos_mas_vendidos}
                responsiveLayout="scroll"
                emptyMessage="No hay datos de productos"
              >
                <Column field="producto_nombre" header="Producto" />
                <Column field="producto_codigo" header="Código" />
                <Column field="total_vendido" header="Cantidad Vendida" />
                <Column field="numero_ventas" header="Número de Ventas" />
                <Column 
                  field="ingresos_totales" 
                  header="Ingresos Totales"
                  body={(rowData) => new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                  }).format(rowData.ingresos_totales)}
                />
              </DataTable>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center text-500 p-4">
          No hay estadísticas disponibles
        </div>
      )}
    </div>
  );

  return (
    <div className="ventas-container">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="card">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Nueva Venta" leftIcon="pi pi-plus">
            {renderNuevaVenta()}
          </TabPanel>
          
          <TabPanel header="Historial" leftIcon="pi pi-history">
            {renderHistorial()}
          </TabPanel>
          
          <TabPanel header="Estadísticas" leftIcon="pi pi-chart-line">
            {renderEstadisticas()}
          </TabPanel>
        </TabView>
      </div>

      {/* Dialog para cliente rápido */}
      <Dialog
        visible={dialogClienteRapido}
        style={{ width: '450px' }}
        header="Registrar Cliente Rápido"
        modal
        onHide={() => setDialogClienteRapido(false)}
      >
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="nombres">Nombres *</label>
              <InputText
                id="nombres"
                value={nuevoCliente.nombres}
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase();
                  if (validarCampoCliente(valor, 'nombres')) {
                    setNuevoCliente({...nuevoCliente, nombres: valor});
                  }
                }}
                className="w-full"
                placeholder="NOMBRES EN MAYÚSCULAS"
                required
                maxLength={100}
              />
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="apellidos">Apellidos</label>
              <InputText
                id="apellidos"
                value={nuevoCliente.apellidos}
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase();
                  if (validarCampoCliente(valor, 'apellidos')) {
                    setNuevoCliente({...nuevoCliente, apellidos: valor});
                  }
                }}
                className="w-full"
                placeholder="APELLIDOS EN MAYÚSCULAS"
                maxLength={100}
              />
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="cedula">Cédula *</label>
              <InputText
                id="cedula"
                value={nuevoCliente.cedula}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (validarCampoCliente(valor, 'cedula')) {
                    setNuevoCliente({...nuevoCliente, cedula: valor});
                  }
                }}
                className="w-full"
                placeholder="Solo números"
                maxLength={10}
                required
              />
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="telefono">Teléfono</label>
              <InputText
                id="telefono"
                value={nuevoCliente.telefono}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (validarCampoCliente(valor, 'telefono')) {
                    setNuevoCliente({...nuevoCliente, telefono: valor});
                  }
                }}
                className="w-full"
                placeholder="Solo números"
                maxLength={10}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="field">
              <label htmlFor="direccion">Dirección</label>
              <InputText
                id="direccion"
                value={nuevoCliente.direccion}
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase();
                  if (validarCampoCliente(valor, 'direccion')) {
                    setNuevoCliente({...nuevoCliente, direccion: valor});
                  }
                }}
                className="w-full"
                placeholder="DIRECCIÓN EN MAYÚSCULAS"
                maxLength={200}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="field">
              <label htmlFor="email">Email</label>
              <InputText
                id="email"
                value={nuevoCliente.email}
                onChange={(e) => {
                  const valor = e.target.value.toLowerCase();
                  if (validarCampoCliente(valor, 'email')) {
                    setNuevoCliente({...nuevoCliente, email: valor});
                  }
                }}
                className="w-full"
                placeholder="email@ejemplo.com"
                maxLength={100}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogClienteRapido(false)}
          />
          <Button
            label="Registrar"
            icon="pi pi-check"
            onClick={registrarClienteRapido}
            disabled={!nuevoCliente.nombres || !nuevoCliente.cedula}
          />
        </div>
      </Dialog>

      {/* Dialog para detalle de venta */}
      <Dialog
        visible={dialogDetalle}
        style={{ width: '800px' }}
        header="Detalle de Venta"
        modal
        onHide={() => setDialogDetalle(false)}
      >
        {ventaSeleccionada && (
          <div>
            <div className="grid mb-4">
              <div className="col-12 md:col-6">
                <h5>Información de la Venta</h5>
                <div><strong>Número de Factura:</strong> {ventaSeleccionada.numero_factura}</div>
                <div><strong>Fecha:</strong> {new Date(ventaSeleccionada.creado_en).toLocaleDateString('es-CO')}</div>
                <div><strong>Estado:</strong> <Tag value={ventaSeleccionada.estado.toUpperCase()} /></div>
                <div><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</div>
              </div>
              <div className="col-12 md:col-6">
                <h5>Información del Cliente</h5>
                <div><strong>Nombre:</strong> {ventaSeleccionada.cliente_nombre}</div>
                <div><strong>Cédula:</strong> {ventaSeleccionada.cliente_cedula || 'N/A'}</div>
                <div><strong>Teléfono:</strong> {ventaSeleccionada.cliente_telefono || 'N/A'}</div>
                <div><strong>Email:</strong> {ventaSeleccionada.cliente_email || 'N/A'}</div>
              </div>
            </div>

            <h5>Productos Vendidos</h5>
            <DataTable value={ventaSeleccionada.detalles} responsiveLayout="scroll">
              <Column field="producto_nombre" header="Producto" />
              <Column field="producto_codigo" header="Código" />
              <Column field="cantidad" header="Cantidad" />
              <Column 
                field="precio_unitario" 
                header="Precio Unit."
                body={(rowData) => new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(rowData.precio_unitario)}
              />
              <Column 
                field="subtotal" 
                header="Subtotal"
                body={(rowData) => new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                }).format(rowData.subtotal)}
              />
            </DataTable>

            <div className="grid mt-4">
              <div className="col-12 md:col-6">
                {ventaSeleccionada.notas && (
                  <div>
                    <h5>Notas</h5>
                    <p>{ventaSeleccionada.notas}</p>
                  </div>
                )}
              </div>
              <div className="col-12 md:col-6">
                <div className="text-right">
                  <div className="flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(ventaSeleccionada.subtotal)}</span>
                  </div>
                  <div className="flex justify-content-between mb-2">
                    <span>IVA:</span>
                    <span>{new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(ventaSeleccionada.impuesto)}</span>
                  </div>
                  {ventaSeleccionada.descuento > 0 && (
                    <div className="flex justify-content-between mb-2">
                      <span>Descuento:</span>
                      <span className="text-red-500">-{new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(ventaSeleccionada.descuento)}</span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-content-between">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg text-primary">{new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(ventaSeleccionada.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() => descargarFacturaPDF(ventaSeleccionada.id)}
            loading={generandoPDF}
          />
          <Button
            label="Cerrar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogDetalle(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default VentasPage;