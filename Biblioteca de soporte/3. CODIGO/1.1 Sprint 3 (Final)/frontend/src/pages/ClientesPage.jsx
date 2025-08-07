import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toolbar } from 'primereact/toolbar';
import { InputMask } from 'primereact/inputmask';
import { InputTextarea } from 'primereact/inputtextarea';
import '../styles/cliente.css';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [clienteDialogo, setClienteDialogo] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [editando, setEditando] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);

  // Configurar axios con token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Validación de cédula ecuatoriana
  const validarCedulaEcuatoriana = (cedula) => {
    if (!cedula || cedula.length !== 10) return false;
    
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

  // Validaciones de campos - CORREGIDO EL EMAIL
  const validarCampo = (valor, campo) => {
    switch (campo) {
      case 'nombres':
      case 'apellidos':
        // Permitir letras (mayúsculas y minúsculas) y espacios
        const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
        return letrasRegex.test(valor);
        
      case 'cedula':
        // Solo números
        const numerosRegex = /^[0-9]*$/;
        return numerosRegex.test(valor);
        
      case 'telefono':
        // Solo números
        const telefonoRegex = /^[0-9]*$/;
        return telefonoRegex.test(valor);
        
      case 'email':
        // CORREGIDO: Permitir caracteres de email mientras se escribe
        const emailRegex = /^[a-zA-Z0-9@._-]*$/;
        return emailRegex.test(valor);
        
      case 'direccion':
        // Permitir letras, números y símbolos básicos
        const direccionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-\.\,\#\°]*$/;
        return direccionRegex.test(valor);
        
      default:
        return true;
    }
  };

  // NUEVA FUNCIÓN: Validación completa de email
  const validarEmailCompleto = (email) => {
    if (!email) return false;
    const emailCompletoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailCompletoRegex.test(email);
  };

  // Validación completa del formulario
  const isFormValid = () => {
    // Campos obligatorios
    if (!clienteDialogo.nombres?.trim()) return false;
    if (!clienteDialogo.apellidos?.trim()) return false;
    if (!clienteDialogo.cedula?.trim()) return false;
    if (!clienteDialogo.telefono?.trim()) return false;
    if (!clienteDialogo.email?.trim()) return false;
    
    // Validar formato de campos
    if (!validarCampo(clienteDialogo.nombres, 'nombres')) return false;
    if (!validarCampo(clienteDialogo.apellidos, 'apellidos')) return false;
    if (!validarCampo(clienteDialogo.cedula, 'cedula')) return false;
    if (!validarCampo(clienteDialogo.telefono, 'telefono')) return false;
    if (!validarEmailCompleto(clienteDialogo.email)) return false; // CORREGIDO
    if (clienteDialogo.direccion && !validarCampo(clienteDialogo.direccion, 'direccion')) return false;
    
    // Validar cédula si tiene 10 dígitos
    if (clienteDialogo.cedula?.length === 10) {
      return validarCedulaEcuatoriana(clienteDialogo.cedula);
    }
    
    return clienteDialogo.cedula?.length === 10; // Debe tener exactamente 10 dígitos
  };

  const cargarClientes = async (mostrarLoading = true) => {
    if (mostrarLoading) setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/clientes');
      const clientesData = response.data.data || [];
      setClientes(clientesData);
      
      if (!mostrarLoading && clientesData.length > 0) {
        console.log(`Tabla actualizada: ${clientesData.length} clientes cargados`);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los clientes',
        life: 3000
      });
    }
    if (mostrarLoading) setLoading(false);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const openNew = () => {
    setClienteDialogo({
      nombres: '',
      apellidos: '',
      cedula: '',
      direccion: '',
      telefono: '',
      email: ''
    });
    setEditando(false);
    setDialogVisible(true);
  };

  const editarCliente = (cliente) => {
    setClienteDialogo({ ...cliente });
    setEditando(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSaveLoading(false);
  };

  const saveCliente = async () => {
    if (!isFormValid()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Por favor complete todos los campos obligatorios correctamente',
        life: 3000
      });
      return;
    }

    setSaveLoading(true);
    try {
      let response;
      if (editando) {
        response = await axios.put(`http://localhost:3001/api/clientes/${clienteDialogo.id}`, clienteDialogo);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente actualizado correctamente',
          life: 3000
        });
      } else {
        response = await axios.post('http://localhost:3001/api/clientes', clienteDialogo);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente creado correctamente',
          life: 3000
        });
      }

      setDialogVisible(false);
      setSaveLoading(false);
      await cargarClientes(false);

      if (response.data && response.data.data) {
        const clienteActualizado = response.data.data;
        setTimeout(() => {
          toast.current.show({
            severity: 'info',
            summary: 'Tabla actualizada',
            detail: `${clienteActualizado.nombres} ${clienteActualizado.apellidos} ${editando ? 'actualizado' : 'agregado'} a la lista`,
            life: 2000
          });
        }, 500);
      }

    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setSaveLoading(false);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al guardar cliente',
        life: 3000
      });
    }
  };

  const confirmarEliminar = (cliente) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar a ${cliente.nombres} ${cliente.apellidos}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => eliminarCliente(cliente),
      reject: () => {},
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger'
    });
  };

  const eliminarCliente = async (cliente) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/clientes/${cliente.id}`);
      
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `${cliente.nombres} ${cliente.apellidos} eliminado correctamente`,
        life: 3000
      });

      await cargarClientes(false);
      
      setTimeout(() => {
        toast.current.show({
          severity: 'info',
          summary: 'Tabla actualizada',
          detail: 'Cliente eliminado de la lista',
          life: 2000
        });
      }, 500);

    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar cliente',
        life: 3000
      });
    }
    setDeleteLoading(false);
  };

  // Manejo de cambios en inputs con validación intuitiva
  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    
    // Validación silenciosa (no mostrar errores mientras se escribe)
    if (val && !validarCampo(val, name)) {
      return; // No actualizar si el formato es inválido
    }
    
    setClienteDialogo(prev => ({
      ...prev,
      [name]: val
    }));
  };

  // Validación al perder el foco - CORREGIDO PARA EMAIL
  const onInputBlur = (e, name) => {
    const val = e.target.value;
    
    if (val && name !== 'email' && !validarCampo(val, name)) {
      let mensaje = '';
      switch (name) {
        case 'nombres':
        case 'apellidos':
          mensaje = `${name === 'nombres' ? 'Los nombres' : 'Los apellidos'} solo pueden contener letras`;
          break;
        case 'cedula':
          mensaje = 'La cédula solo puede contener números';
          break;
        case 'telefono':
          mensaje = 'El teléfono solo puede contener números';
          break;
        case 'direccion':
          mensaje = 'La dirección contiene caracteres no válidos';
          break;
      }
      
      if (mensaje) {
        toast.current.show({
          severity: 'warn',
          summary: 'Formato incorrecto',
          detail: mensaje,
          life: 3000
        });
      }
    }
    
    // Validación específica de email al perder el foco
    if (name === 'email' && val && !validarEmailCompleto(val)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Ingrese un email válido (ejemplo@correo.com)',
        life: 3000
      });
    }
    
    // Validación específica de cédula
    if (name === 'cedula' && val.length === 10 && !validarCedulaEcuatoriana(val)) {
      toast.current.show({
        severity: 'warn',
        summary: 'Cédula inválida',
        detail: 'La cédula ingresada no es válida',
        life: 3000
      });
    }
  };

  const clearFilter = () => {
    setGlobalFilter('');
  };

  const actualizarTabla = async () => {
    await cargarClientes(true);
    toast.current.show({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Tabla actualizada manualmente',
      life: 2000
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-text"
          onClick={() => editarCliente(rowData)}
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
      <h2 className="text-xl font-bold text-900 mb-0">Gestión de Clientes</h2>
      <div className="search-container">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por nombre, cédula, email..."
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
          tooltip="Actualizar tabla"
          loading={loading}
        />
      </div>
    </div>
  );

  const leftToolbarTemplate = () => {
    return (
      <div className="toolbar-left">
        <Button
          label="Nuevo Cliente"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
          disabled={saveLoading || deleteLoading}
        />
        {clientes.length > 0 && (
          <span className="clients-count">
            Total: {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </span>
        )}
        {(loading || saveLoading || deleteLoading) && (
          <span className="loading-indicator">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
              {loading ? 'Cargando...' : saveLoading ? 'Guardando...' : 'Eliminando...'}
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
        label={saveLoading ? (editando ? 'Actualizando...' : 'Creando...') : 'Guardar'}
        icon={saveLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        className="p-button-text"
        onClick={saveCliente}
        disabled={!isFormValid() || saveLoading}
        loading={saveLoading}
      />
    </React.Fragment>
  );

  return (
    <div className="clientes-container">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="card">
        <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

        <DataTable
          value={clientes}
          loading={loading}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
          globalFilter={globalFilter}
          globalFilterFields={['nombres', 'apellidos', 'cedula', 'direccion', 'telefono', 'email']}
          header={header}
          responsiveLayout="scroll"
          emptyMessage="No se encontraron clientes."
          className="datatable-responsive"
          filterDisplay="menu"
          stripedRows
        >
          <Column 
            field="nombres" 
            header="Nombres" 
            sortable 
            filter 
            filterPlaceholder="Buscar por nombres"
            style={{ minWidth: '12rem' }}
          />
          <Column 
            field="apellidos" 
            header="Apellidos" 
            sortable 
            filter 
            filterPlaceholder="Buscar por apellidos"
            style={{ minWidth: '12rem' }}
          />
          <Column 
            field="cedula" 
            header="Cédula" 
            sortable 
            filter 
            filterPlaceholder="Buscar por cédula"
            style={{ minWidth: '10rem' }}
          />
          <Column 
            field="direccion" 
            header="Dirección" 
            sortable 
            filter 
            filterPlaceholder="Buscar por dirección"
            style={{ minWidth: '14rem' }}
          />
          <Column 
            field="telefono" 
            header="Teléfono" 
            sortable 
            filter 
            filterPlaceholder="Buscar por teléfono"
            style={{ minWidth: '10rem' }}
          />
          <Column 
            field="email" 
            header="Email" 
            sortable 
            filter 
            filterPlaceholder="Buscar por email"
            style={{ minWidth: '14rem' }}
          />
          <Column 
            body={actionBodyTemplate} 
            exportable={false} 
            style={{ minWidth: '8rem' }}
            header="Acciones"
          />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible}
        style={{ width: '500px' }}
        header={editando ? 'Editar Cliente' : 'Nuevo Cliente'}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
        closable={!saveLoading}
      >
        <div className="field">
          <label htmlFor="nombres">Nombres *</label>
          <InputText
            id="nombres"
            value={clienteDialogo.nombres}
            onChange={(e) => onInputChange(e, 'nombres')}
            onBlur={(e) => onInputBlur(e, 'nombres')}
            required
            autoFocus
            className={!clienteDialogo.nombres?.trim() ? 'p-invalid' : ''}
            placeholder="Ingrese los nombres"
            disabled={saveLoading}
            maxLength={100}
          />
          {!clienteDialogo.nombres?.trim() && (
            <small className="p-error">Los nombres son obligatorios</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="apellidos">Apellidos *</label>
          <InputText
            id="apellidos"
            value={clienteDialogo.apellidos}
            onChange={(e) => onInputChange(e, 'apellidos')}
            onBlur={(e) => onInputBlur(e, 'apellidos')}
            required
            className={!clienteDialogo.apellidos?.trim() ? 'p-invalid' : ''}
            placeholder="Ingrese los apellidos"
            disabled={saveLoading}
            maxLength={100}
          />
          {!clienteDialogo.apellidos?.trim() && (
            <small className="p-error">Los apellidos son obligatorios</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="cedula">Cédula *</label>
          <InputText
            id="cedula"
            value={clienteDialogo.cedula}
            onChange={(e) => onInputChange(e, 'cedula')}
            onBlur={(e) => onInputBlur(e, 'cedula')}
            placeholder="Ingrese 10 dígitos"
            className={!clienteDialogo.cedula?.trim() || clienteDialogo.cedula?.length !== 10 ? 'p-invalid' : ''}
            disabled={saveLoading}
            maxLength={10}
          />
          {!clienteDialogo.cedula?.trim() ? (
            <small className="p-error">La cédula es obligatoria</small>
          ) : clienteDialogo.cedula?.length !== 10 ? (
            <small className="p-error">La cédula debe tener 10 dígitos</small>
          ) : clienteDialogo.cedula?.length === 10 && !validarCedulaEcuatoriana(clienteDialogo.cedula) ? (
            <small className="p-error">La cédula no es válida</small>
          ) : clienteDialogo.cedula?.length === 10 && validarCedulaEcuatoriana(clienteDialogo.cedula) ? (
            <small className="text-green-600">✓ Cédula válida</small>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="telefono">Teléfono *</label>
          <InputText
            id="telefono"
            value={clienteDialogo.telefono}
            onChange={(e) => onInputChange(e, 'telefono')}
            onBlur={(e) => onInputBlur(e, 'telefono')}
            placeholder="Ingrese el teléfono"
            className={!clienteDialogo.telefono?.trim() ? 'p-invalid' : ''}
            disabled={saveLoading}
            maxLength={10}
          />
          {!clienteDialogo.telefono?.trim() && (
            <small className="p-error">El teléfono es obligatorio</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">Email *</label>
          <InputText
            id="email"
            type="email"
            value={clienteDialogo.email}
            onChange={(e) => onInputChange(e, 'email')}
            onBlur={(e) => onInputBlur(e, 'email')}
            required
            className={!clienteDialogo.email?.trim() || !validarEmailCompleto(clienteDialogo.email) ? 'p-invalid' : ''}
            placeholder="ejemplo@correo.com"
            disabled={saveLoading}
            maxLength={100}
          />
          {!clienteDialogo.email?.trim() ? (
            <small className="p-error">El email es obligatorio</small>
          ) : clienteDialogo.email?.trim() && !validarEmailCompleto(clienteDialogo.email) ? (
            <small className="p-error">Formato de email inválido</small>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <InputTextarea
            id="direccion"
            value={clienteDialogo.direccion}
            onChange={(e) => onInputChange(e, 'direccion')}
            onBlur={(e) => onInputBlur(e, 'direccion')}
            placeholder="Ingrese la dirección (opcional)"
            disabled={saveLoading}
            rows={3}
            maxLength={200}
          />
          <small className="text-500">
            {clienteDialogo.direccion ? clienteDialogo.direccion.length : 0}/200 caracteres
          </small>
        </div>
      </Dialog>
    </div>
  );
};

export default ClientesPage;