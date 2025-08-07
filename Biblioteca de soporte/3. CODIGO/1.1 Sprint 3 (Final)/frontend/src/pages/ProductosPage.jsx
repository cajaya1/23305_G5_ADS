import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toolbar } from 'primereact/toolbar';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import '../styles/producto.css';

const ProductosBusqueda = ({ 
  criteriosBusqueda, 
  onInputBusquedaChange, 
  handleBuscar, 
  handleLimpiarBusqueda, 
  loadingBusqueda, 
  mensajeBusqueda 
}) => (
  <Card title="Búsqueda de Productos" className="mb-4">
    <div className="formgrid grid">
      <div className="field col-12 md:col-6">
        <label htmlFor="nombre">Nombre del Producto</label>
        <InputText
          id="nombre"
          value={criteriosBusqueda.nombre}
          onChange={(e) => onInputBusquedaChange(e, 'nombre')}
          placeholder="Buscar por nombre del producto"
          className="w-full"
          disabled={loadingBusqueda}
        />
      </div>

      <div className="field col-12 md:col-6">
        <label htmlFor="id">ID del Producto</label>
        <InputText
          id="id"
          value={criteriosBusqueda.id}
          onChange={(e) => onInputBusquedaChange(e, 'id')}
          placeholder="Buscar por ID del producto"
          className="w-full"
          disabled={loadingBusqueda}
        />
      </div>

      <div className="field col-12 md:col-6">
        <label htmlFor="precioMin">Precio Mínimo</label>
        <InputNumber
          id="precioMin"
          value={criteriosBusqueda.precioMin}
          onValueChange={(e) => onInputBusquedaChange(e, 'precioMin')}
          mode="currency"
          currency="COP"
          locale="es-CO"
          placeholder="Precio mínimo"
          className="w-full"
          disabled={loadingBusqueda}
          min={0}
        />
      </div>

      <div className="field col-12 md:col-6">
        <label htmlFor="precioMax">Precio Máximo</label>
        <InputNumber
          id="precioMax"
          value={criteriosBusqueda.precioMax}
          onValueChange={(e) => onInputBusquedaChange(e, 'precioMax')}
          mode="currency"
          currency="COP"
          locale="es-CO"
          placeholder="Precio máximo"
          className="w-full"
          disabled={loadingBusqueda}
          min={0}
        />
      </div>

      <div className="field col-12">
        <div className="flex gap-2">
          <Button
            label="Buscar"
            icon="pi pi-search"
            onClick={() => handleBuscar(criteriosBusqueda)}
            disabled={loadingBusqueda || (!criteriosBusqueda.nombre && !criteriosBusqueda.id && criteriosBusqueda.precioMin === null && criteriosBusqueda.precioMax === null)}
            loading={loadingBusqueda}
          />
          <Button
            label="Limpiar"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={handleLimpiarBusqueda}
            disabled={loadingBusqueda}
          />
        </div>
      </div>

      {mensajeBusqueda && (
        <div className="field col-12">
          <Message
            severity={mensajeBusqueda.severity}
            text={mensajeBusqueda.text}
            className="w-full"
          />
        </div>
      )}
    </div>
  </Card>
);

const ProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [productoDialogo, setProductoDialogo] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    proveedor: '',
    fecha_caducidad: null
  });
  const [editando, setEditando] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para búsqueda
  const [activeIndex, setActiveIndex] = useState(0);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [mensajeBusqueda, setMensajeBusqueda] = useState(null);
  const [criteriosBusqueda, setCriteriosBusqueda] = useState({
    nombre: '',
    id: '',
    precioMin: null,
    precioMax: null
  });
  
  const toast = useRef(null);

  // Configurar axios con token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Función de validación del formulario
  const isFormValid = () => {
    return productoDialogo.nombre && 
           productoDialogo.codigo && 
           productoDialogo.precio >= 0 && 
           productoDialogo.stock >= 0;
  };

  const cargarProductos = async (mostrarLoading = true) => {
    if (mostrarLoading) setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/productos');
      // Mapear _id a id si es necesario
      let productosData = response.data.data || [];
      productosData = productosData.map(producto => ({
        ...producto,
        id: producto.id || producto._id // usar id si existe, si no usar _id
      }));
      
      setProductos(productosData);
      
      if (!mostrarLoading && productosData.length > 0) {
        console.log(`Tabla actualizada: ${productosData.length} productos cargados`);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos',
        life: 3000
      });
    }
    if (mostrarLoading) setLoading(false);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para buscar productos
  const buscarProductos = async (criterios) => {
    setLoadingBusqueda(true);
    setMensajeBusqueda(null);
    
    try {
      const params = new URLSearchParams();
      
      if (criterios.nombre) params.append('nombre', criterios.nombre);
      if (criterios.id) params.append('id', criterios.id);
      if (criterios.precioMin !== null) params.append('precioMin', criterios.precioMin);
      if (criterios.precioMax !== null) params.append('precioMax', criterios.precioMax);

      const response = await axios.get(`http://localhost:3001/api/productos/buscar?${params}`);
      
      if (response.data.success) {
        setResultadosBusqueda(response.data.data || []);
        setMensajeBusqueda({
          severity: 'success',
          text: response.data.message || `Se encontraron ${response.data.data.length} productos.`
        });
      } else {
        setResultadosBusqueda([]);
        setMensajeBusqueda({
          severity: 'warn',
          text: response.data.message || 'No se encontraron productos.'
        });
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setResultadosBusqueda([]);
      
      if (error.response?.status === 404) {
        setMensajeBusqueda({
          severity: 'info',
          text: 'No se encontraron productos que coincidan con los criterios de búsqueda.'
        });
      } else if (error.response?.status === 400) {
        setMensajeBusqueda({
          severity: 'warn',
          text: error.response.data.message || 'Criterios de búsqueda inválidos.'
        });
      } else {
        setMensajeBusqueda({
          severity: 'error',
          text: 'Error al buscar productos. No se pudo acceder a la base de datos.'
        });
      }
    }
    setLoadingBusqueda(false);
  };

  const openNew = () => {
    setProductoDialogo({
      nombre: '',
      codigo: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      proveedor: '',
      fecha_caducidad: null
    });
    setEditando(false);
    setDialogVisible(true);
  };

  const editarProducto = (producto) => {
    console.log('Producto a editar:', producto);
    console.log('ID del producto:', producto.id);
    
    const productoEdit = { ...producto };
    // Convertir fecha si existe
    if (productoEdit.fecha_caducidad) {
      productoEdit.fecha_caducidad = new Date(productoEdit.fecha_caducidad);
    }
    setProductoDialogo(productoEdit);
    setEditando(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSaveLoading(false);
  };

  const saveProducto = async () => {
    if (!isFormValid()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos obligatorios',
        life: 3000
      });
      return;
    }

    // Validación del ID al editar
    if (editando && !productoDialogo.id) {
      console.error('Error: No se encontró ID del producto para editar');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede editar: ID del producto no encontrado',
        life: 3000
      });
      return;
    }

    setSaveLoading(true);
    try {
      const productoData = { ...productoDialogo };
      
      // Formatear fecha si existe
      if (productoData.fecha_caducidad) {
        productoData.fecha_caducidad = productoData.fecha_caducidad.toISOString().split('T')[0];
      }

      // Eliminar el ID de los datos a enviar
      delete productoData.id;

      let response;
      if (editando) {
        console.log('Actualizando producto con ID:', productoDialogo.id);
        response = await axios.put(`http://localhost:3001/api/productos/${productoDialogo.id}`, productoData);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto actualizado correctamente',
          life: 3000
        });
      } else {
        response = await axios.post('http://localhost:3001/api/productos', productoData);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto agregado correctamente',
          life: 3000
        });
      }

      setDialogVisible(false);
      setSaveLoading(false);
      await cargarProductos(false);

      setTimeout(() => {
        toast.current.show({
          severity: 'info',
          summary: 'Inventario actualizado',
          detail: `${productoData.nombre} ${editando ? 'actualizado' : 'agregado'} al inventario`,
          life: 2000
        });
      }, 500);

    } catch (error) {
      console.error('Error al guardar producto:', error);
      setSaveLoading(false);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al guardar producto',
        life: 3000
      });
    }
  };

  const confirmarEliminar = (producto) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => eliminarProducto(producto),
      reject: () => {},
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger'
    });
  };

  const eliminarProducto = async (producto) => {
    // Validación
    if (!producto.id) {
      console.error('Error: No se encontró ID del producto para eliminar');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede eliminar: ID del producto no encontrado',
        life: 3000
      });
      return;
    }

    setDeleteLoading(true);
    try {
      console.log('Eliminando producto con ID:', producto.id);
      const response = await axios.delete(`http://localhost:3001/api/productos/${producto.id}`);
      
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: response.data.message || `${producto.nombre} eliminado correctamente`,
        life: 3000
      });

      await cargarProductos(false);
      
      setTimeout(() => {
        toast.current.show({
          severity: 'info',
          summary: 'Inventario actualizado',
          detail: 'Producto eliminado del inventario',
          life: 2000
        });
      }, 500);

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar producto',
        life: 3000
      });
    }
    setDeleteLoading(false);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setProductoDialogo(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    setProductoDialogo(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const onDateChange = (e) => {
    setProductoDialogo(prev => ({
      ...prev,
      fecha_caducidad: e.value
    }));
  };

  // Función para limpiar la búsqueda
  const clearFilter = () => {
    setGlobalFilter('');
  };

  // Función para actualizar manualmente
  const actualizarTabla = async () => {
    await cargarProductos(true);
    toast.current.show({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Inventario actualizado manualmente',
      life: 2000
    });
  };

  // Funciones para el componente de búsqueda
  const handleBuscar = (criterios) => {
    setCriteriosBusqueda(criterios);
    buscarProductos(criterios);
  };

  const handleLimpiarBusqueda = () => {
    setCriteriosBusqueda({
      nombre: '',
      id: '',
      precioMin: null,
      precioMax: null
    });
    setResultadosBusqueda([]);
    setMensajeBusqueda(null);
  };

  const onInputBusquedaChange = (e, field) => {
    const value = e.target ? e.target.value : e.value;
    setCriteriosBusqueda(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Template para el precio
  const precioBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(rowData.precio);
  };

  // Template para el stock
  const stockBodyTemplate = (rowData) => {
    return (
      <span className={`stock-badge ${rowData.stock <= 10 ? 'stock-low' : 'stock-normal'}`}>
        {rowData.stock}
      </span>
    );
  };

  // Template para fecha de caducidad
  const fechaCaducidadBodyTemplate = (rowData) => {
    if (!rowData.fecha_caducidad) return '-';
    const fecha = new Date(rowData.fecha_caducidad);
    return fecha.toLocaleDateString('es-CO');
  };

  // Columnas del DataTable
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-text"
          onClick={() => editarProducto(rowData)}
          tooltip="Editar"
          tooltipOptions={{ position: 'bottom' }}
          disabled={saveLoading || deleteLoading}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() => confirmarEliminar(rowData)}
          tooltip="Eliminar"
          tooltipOptions={{ position: 'bottom' }}
          disabled={saveLoading || deleteLoading}
          loading={deleteLoading}
        />
      </div>
    );
  };

  const header = (
    <div className="table-header">
      <h2 className="text-xl font-bold text-900 mb-0">
        {activeIndex === 0 ? 'Gestión de Productos' : 'Resultados de Búsqueda'}
      </h2>
      <div className="search-container">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por nombre, código, categoría..."
            className="w-full"
          />
        </span>
        {globalFilter && (
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-plain"
            onClick={clearFilter}
            tooltip="Limpiar búsqueda"
          />
        )}
        <Button
          icon="pi pi-refresh"
          className="p-button-text p-button-plain"
          onClick={actualizarTabla}
          tooltip="Actualizar inventario"
          loading={loading}
        />
      </div>
    </div>
  );

  const leftToolbarTemplate = () => {
    return (
      <div className="toolbar-left">
        <Button
          label="Agregar Producto"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
          disabled={saveLoading || deleteLoading}
        />
        {(activeIndex === 0 ? productos : resultadosBusqueda).length > 0 && (
          <span className="products-count">
            Total: {(activeIndex === 0 ? productos : resultadosBusqueda).length} producto{(activeIndex === 0 ? productos : resultadosBusqueda).length !== 1 ? 's' : ''}
          </span>
        )}
        {(loading || saveLoading || deleteLoading || loadingBusqueda) && (
          <span className="loading-indicator">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
              {loading ? 'Cargando...' : saveLoading ? 'Guardando...' : loadingBusqueda ? 'Buscando...' : 'Eliminando...'}
            </span>
          </span>
        )}
      </div>
    );
  };

  const dialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
        disabled={saveLoading}
      />
      <Button
        label={saveLoading ? (editando ? 'Actualizando...' : 'Agregando...') : 'Guardar'}
        icon={saveLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        className="p-button-text"
        onClick={saveProducto}
        disabled={!isFormValid() || saveLoading}
        loading={saveLoading}
      />
    </React.Fragment>
  );

  // Función para renderizar la tabla
  const renderTable = (data) => (
    <DataTable
      value={data}
      loading={activeIndex === 0 ? loading : loadingBusqueda}
      dataKey="id"
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
      globalFilter={globalFilter}
      globalFilterFields={['nombre', 'codigo', 'descripcion', 'categoria', 'proveedor']}
      header={header}
      responsiveLayout="scroll"
      emptyMessage={activeIndex === 0 ? "No se encontraron productos en el inventario." : "No hay resultados de búsqueda."}
      className="datatable-responsive"
      filterDisplay="menu"
      stripedRows
    >
      <Column 
        field="nombre" 
        header="Nombre" 
        sortable 
        filter 
        filterPlaceholder="Buscar por nombre"
        style={{ minWidth: '12rem' }}
      />
      <Column 
        field="codigo" 
        header="Código" 
        sortable 
        filter 
        filterPlaceholder="Buscar por código"
        style={{ minWidth: '10rem' }}
      />
      <Column 
        field="descripcion" 
        header="Descripción" 
        sortable 
        filter 
        filterPlaceholder="Buscar por descripción"
        style={{ minWidth: '14rem' }}
      />
      <Column 
        field="precio" 
        header="Precio" 
        sortable 
        body={precioBodyTemplate}
        style={{ minWidth: '10rem' }}
      />
      <Column 
        field="stock" 
        header="Stock" 
        sortable 
        body={stockBodyTemplate}
        style={{ minWidth: '8rem' }}
      />
      <Column 
        field="categoria" 
        header="Categoría" 
        sortable 
        filter 
        filterPlaceholder="Buscar por categoría"
        style={{ minWidth: '10rem' }}
      />
      <Column 
        field="proveedor" 
        header="Proveedor" 
        sortable 
        filter 
        filterPlaceholder="Buscar por proveedor"
        style={{ minWidth: '12rem' }}
      />
      <Column 
        field="fecha_caducidad" 
        header="Fecha Caducidad" 
        sortable 
        body={fechaCaducidadBodyTemplate}
        style={{ minWidth: '10rem' }}
      />
      <Column 
        body={actionBodyTemplate} 
        exportable={false} 
        style={{ minWidth: '8rem' }}
        header="Acciones"
      />
    </DataTable>
  );

  return (
    <div className="productos-container">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="card">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Inventario" leftIcon="pi pi-box">
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
            {renderTable(productos)}
          </TabPanel>
          
          <TabPanel header="Búsqueda" leftIcon="pi pi-search">
            <ProductosBusqueda
              criteriosBusqueda={criteriosBusqueda}
              onInputBusquedaChange={onInputBusquedaChange}
              handleBuscar={handleBuscar}
              handleLimpiarBusqueda={handleLimpiarBusqueda}
              loadingBusqueda={loadingBusqueda}
              mensajeBusqueda={mensajeBusqueda}
            />
            {renderTable(resultadosBusqueda)}
          </TabPanel>
        </TabView>
      </div>

      <Dialog
        visible={dialogVisible}
        style={{ width: '600px' }}
        header={editando ? 'Editar Producto' : 'Agregar Producto'}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
        closable={!saveLoading}
      >
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombre del Producto *</label>
            <InputText
              id="nombre"
              value={productoDialogo.nombre}
              onChange={(e) => onInputChange(e, 'nombre')}
              required
              autoFocus
              className={!productoDialogo.nombre ? 'p-invalid' : ''}
              placeholder="Ingrese el nombre del producto"
              disabled={saveLoading}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="codigo">Código del Producto *</label>
            <InputText
              id="codigo"
              value={productoDialogo.codigo}
              onChange={(e) => onInputChange(e, 'codigo')}
              required
              className={!productoDialogo.codigo ? 'p-invalid' : ''}
              placeholder="Ingrese el código único"
              disabled={saveLoading}
            />
          </div>

          <div className="field col-12">
            <label htmlFor="descripcion">Descripción</label>
            <InputTextarea
              id="descripcion"
              value={productoDialogo.descripcion}
              onChange={(e) => onInputChange(e, 'descripcion')}
              placeholder="Descripción del producto"
              rows={3}
              disabled={saveLoading}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="precio">Precio *</label>
            <InputNumber
              id="precio"
              value={productoDialogo.precio}
              onValueChange={(e) => onInputNumberChange(e, 'precio')}
              mode="currency"
              currency="COP"
              locale="es-CO"
              className={productoDialogo.precio < 0 ? 'p-invalid' : ''}
              disabled={saveLoading}
              min={0}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="stock">Cantidad en Stock *</label>
            <InputNumber
              id="stock"
              value={productoDialogo.stock}
              onValueChange={(e) => onInputNumberChange(e, 'stock')}
              showButtons
              className={productoDialogo.stock < 0 ? 'p-invalid' : ''}
              disabled={saveLoading}
              min={0}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="categoria">Categoría</label>
            <InputText
              id="categoria"
              value={productoDialogo.categoria}
              onChange={(e) => onInputChange(e, 'categoria')}
              placeholder="Categoría del producto"
              disabled={saveLoading}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="proveedor">Proveedor</label>
            <InputText
              id="proveedor"
              value={productoDialogo.proveedor}
              onChange={(e) => onInputChange(e, 'proveedor')}
              placeholder="Nombre del proveedor"
              disabled={saveLoading}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="fecha_caducidad">Fecha de Caducidad</label>
            <Calendar
              id="fecha_caducidad"
              value={productoDialogo.fecha_caducidad}
              onChange={onDateChange}
              dateFormat="dd/mm/yy"
              placeholder="Seleccione fecha (opcional)"
              showIcon
              disabled={saveLoading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ProductosPage;