import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/stock.css';

const VerificarStockPage = () => {
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [resumenInventario, setResumenInventario] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoStock, setNuevoStock] = useState(0);
  const [loadingActualizar, setLoadingActualizar] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [productosPorNivel, setProductosPorNivel] = useState([]);
  const [loadingNivel, setLoadingNivel] = useState(false);

  const toast = useRef(null);

  // Configurar axios con token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Cargar resumen del inventario al montar el componente
  useEffect(() => {
    cargarResumenInventario();
  }, []);

  const cargarResumenInventario = async () => {
    setLoadingResumen(true);
    try {
      const response = await axios.get('http://localhost:3001/api/stock/resumen');
      if (response.data.success) {
        setResumenInventario(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen del inventario:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el resumen del inventario',
        life: 3000
      });
    }
    setLoadingResumen(false);
  };

  const cargarProductosPorNivel = async (nivel) => {
    setLoadingNivel(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/stock/nivel/${nivel}`);
      if (response.data.success) {
        setProductosPorNivel(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos por nivel:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos',
        life: 3000
      });
    }
    setLoadingNivel(false);
  };

  const verificarStock = async () => {
    if (!identificador.trim()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un identificador del producto',
        life: 3000
      });
      return;
    }

    setLoading(true);
    setMensaje(null);
    setResultado(null);

    try {
      const response = await axios.get(`http://localhost:3001/api/stock/verificar/${identificador}`);
      
      if (response.data.success) {
        setResultado(response.data.data);
        setMensaje({
          severity: response.data.data.severity,
          text: response.data.data.mensaje
        });
      } else {
        setMensaje({
          severity: 'error',
          text: response.data.message
        });
      }
    } catch (error) {
      console.error('Error al verificar stock:', error);
      
      if (error.response?.status === 404) {
        setMensaje({
          severity: 'error',
          text: 'Producto no encontrado en el inventario'
        });
      } else {
        setMensaje({
          severity: 'error',
          text: 'Error al verificar el stock. No se pudo acceder a la base de datos.'
        });
      }
    }
    setLoading(false);
  };

  const abrirDialogoActualizar = (producto) => {
    setProductoSeleccionado(producto);
    setNuevoStock(producto.stock);
    setDialogVisible(true);
  };

  const actualizarStock = async () => {
    if (!productoSeleccionado || nuevoStock < 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un stock válido',
        life: 3000
      });
      return;
    }

    setLoadingActualizar(true);
    try {
      const response = await axios.put(`http://localhost:3001/api/stock/${productoSeleccionado.id}`, {
        nuevoStock: nuevoStock
      });

      if (response.data.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: response.data.message,
          life: 3000
        });

        // Actualizar el resultado si es el mismo producto
        if (resultado && resultado.producto.id === productoSeleccionado.id) {
          setResultado(prev => ({
            ...prev,
            producto: {
              ...prev.producto,
              stock: nuevoStock
            },
            stockActual: nuevoStock,
            ...response.data.data
          }));
        }

        // Recargar resumen del inventario
        await cargarResumenInventario();
        setDialogVisible(false);
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al actualizar el stock',
        life: 3000
      });
    }
    setLoadingActualizar(false);
  };

  const limpiarBusqueda = () => {
    setIdentificador('');
    setResultado(null);
    setMensaje(null);
  };

  const getSeverityColor = (nivelStock) => {
    switch (nivelStock) {
      case 'critico': return 'danger';
      case 'bajo': return 'warning';
      case 'medio': return 'info';
      case 'alto': return 'success';
      case 'adecuado': return 'success';
      default: return 'info';
    }
  };

  const getStockIcon = (nivelStock) => {
    switch (nivelStock) {
      case 'critico': return 'pi pi-exclamation-triangle';
      case 'bajo': return 'pi pi-exclamation-circle';
      case 'medio': return 'pi pi-info-circle';
      case 'alto': return 'pi pi-check-circle';
      case 'adecuado': return 'pi pi-check-circle';
      default: return 'pi pi-info-circle';
    }
  };

  const stockBodyTemplate = (rowData) => {
    let severity = 'success';
    if (rowData.stock === 0) severity = 'danger';
    else if (rowData.stock <= 10) severity = 'warning';
    else if (rowData.stock <= 50) severity = 'info';

    return (
      <Tag severity={severity} value={rowData.stock} className="p-tag-rounded" />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text"
        onClick={() => abrirDialogoActualizar(rowData)}
        tooltip="Actualizar stock"
      />
    );
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  };

  const getProgressValue = (stock) => {
    if (stock === 0) return 0;
    if (stock <= 10) return 25;
    if (stock <= 50) return 60;
    return 100;
  };

  const getProgressColor = (stock) => {
    if (stock === 0) return '#f87171';
    if (stock <= 10) return '#fb923c';
    if (stock <= 50) return '#60a5fa';
    return '#34d399';
  };

  const renderNivelButtons = () => {
    const niveles = [
      { label: 'Crítico', value: 'critico', severity: 'danger', icon: 'pi pi-exclamation-triangle' },
      { label: 'Bajo', value: 'bajo', severity: 'warning', icon: 'pi pi-exclamation-circle' },
      { label: 'Medio', value: 'medio', severity: 'info', icon: 'pi pi-info-circle' },
      { label: 'Alto', value: 'alto', severity: 'success', icon: 'pi pi-check-circle' }
    ];

    return (
      <div className="flex gap-2 flex-wrap">
        {niveles.map(nivel => (
          <Button
            key={nivel.value}
            label={nivel.label}
            icon={nivel.icon}
            className={`p-button-${nivel.severity} p-button-outlined`}
            onClick={() => cargarProductosPorNivel(nivel.value)}
            loading={loadingNivel}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="verificar-stock-container">
      <Toast ref={toast} />
      
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Verificar Stock" leftIcon="pi pi-search">
          <div className="grid">
            {/* Panel de búsqueda */}
            <div className="col-12 lg:col-6">
              <Card title="Verificar Stock de Producto" className="mb-4">
                <div className="formgrid grid">
                  <div className="field col-12">
                    <label htmlFor="identificador">ID o Código del Producto</label>
                    <InputText
                      id="identificador"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ingrese ID o código del producto"
                      className="w-full"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && verificarStock()}
                    />
                  </div>
                  <div className="field col-12">
                    <div className="flex gap-2">
                      <Button
                        label="Verificar Stock"
                        icon="pi pi-search"
                        onClick={verificarStock}
                        disabled={loading || !identificador.trim()}
                        loading={loading}
                      />
                      <Button
                        label="Limpiar"
                        icon="pi pi-times"
                        className="p-button-secondary"
                        onClick={limpiarBusqueda}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {mensaje && (
                  <Message
                    severity={mensaje.severity}
                    text={mensaje.text}
                    className="w-full mt-3"
                  />
                )}

                {resultado && (
                  <div className="mt-4">
                    <Divider />
                    <div className="grid">
                      <div className="col-12">
                        <div className="surface-0 p-4 border-round">
                          <div className="flex align-items-center justify-content-between mb-3">
                            <h3 className="text-xl font-bold m-0">{resultado.producto.nombre}</h3>
                            <Tag
                              severity={getSeverityColor(resultado.nivelStock)}
                              value={resultado.nivelStock.toUpperCase()}
                              icon={getStockIcon(resultado.nivelStock)}
                            />
                          </div>
                          
                          <div className="grid">
                            <div className="col-12 md:col-6">
                              <div className="text-500 mb-1">Stock Actual</div>
                              <div className="text-3xl font-bold text-primary">
                                {resultado.stockActual} unidades
                              </div>
                            </div>
                            <div className="col-12 md:col-6">
                              <div className="text-500 mb-1">Nivel de Stock</div>
                              <ProgressBar 
                                value={getProgressValue(resultado.stockActual)} 
                                color={getProgressColor(resultado.stockActual)}
                                className="mb-2"
                              />
                            </div>
                          </div>

                          <div className="grid mt-3">
                            <div className="col-12 md:col-6">
                              <div className="text-500">Código:</div>
                              <div className="font-semibold">{resultado.producto.codigo}</div>
                            </div>
                            <div className="col-12 md:col-6">
                              <div className="text-500">Precio:</div>
                              <div className="font-semibold">{formatearMoneda(resultado.producto.precio)}</div>
                            </div>
                            <div className="col-12 md:col-6">
                              <div className="text-500">Categoría:</div>
                              <div className="font-semibold">{resultado.producto.categoria || 'Sin categoría'}</div>
                            </div>
                            <div className="col-12 md:col-6">
                              <div className="text-500">Proveedor:</div>
                              <div className="font-semibold">{resultado.producto.proveedor || 'Sin proveedor'}</div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <Button
                              label="Actualizar Stock"
                              icon="pi pi-pencil"
                              className="p-button-outlined"
                              onClick={() => abrirDialogoActualizar(resultado.producto)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Panel de resumen */}
            <div className="col-12 lg:col-6">
              <Card title="Resumen del Inventario" className="mb-4">
                {loadingResumen ? (
                  <div className="flex align-items-center justify-content-center p-4">
                    <i className="pi pi-spin pi-spinner text-2xl"></i>
                  </div>
                ) : resumenInventario ? (
                  <div className="grid">
                    <div className="col-6 md:col-3">
                      <div className="surface-0 p-3 border-round text-center">
                        <div className="text-500 mb-1">Total Productos</div>
                        <div className="text-2xl font-bold text-primary">{resumenInventario.resumen.total_productos}</div>
                      </div>
                    </div>
                    <div className="col-6 md:col-3">
                      <div className="surface-0 p-3 border-round text-center">
                        <div className="text-500 mb-1">Total Stock</div>
                        <div className="text-2xl font-bold text-green-500">{resumenInventario.resumen.total_stock}</div>
                      </div>
                    </div>
                    <div className="col-6 md:col-3">
                      <div className="surface-0 p-3 border-round text-center">
                        <div className="text-500 mb-1">Sin Stock</div>
                        <div className="text-2xl font-bold text-red-500">{resumenInventario.resumen.productos_sin_stock}</div>
                      </div>
                    </div>
                    <div className="col-6 md:col-3">
                      <div className="surface-0 p-3 border-round text-center">
                        <div className="text-500 mb-1">Stock Bajo</div>
                        <div className="text-2xl font-bold text-orange-500">{resumenInventario.resumen.productos_stock_bajo}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>

              {resumenInventario && resumenInventario.alertas && resumenInventario.alertas.length > 0 && (
                <Card title="Alertas de Stock" className="mb-4">
                  <DataTable 
                    value={resumenInventario.alertas} 
                    responsiveLayout="scroll"
                    emptyMessage="No hay alertas de stock"
                    size="small"
                  >
                    <Column field="nombre" header="Nombre" style={{ minWidth: '12rem' }} />
                    <Column field="codigo" header="Código" style={{ minWidth: '8rem' }} />
                    <Column field="stock" header="Stock" body={stockBodyTemplate} style={{ minWidth: '6rem' }} />
                    <Column field="nivel_alerta" header="Nivel" style={{ minWidth: '6rem' }} />
                    <Column body={actionBodyTemplate} style={{ minWidth: '4rem' }} />
                  </DataTable>
                </Card>
              )}
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Productos por Nivel" leftIcon="pi pi-chart-bar">
          <Card title="Filtrar Productos por Nivel de Stock" className="mb-4">
            <div className="mb-3">
              <label className="block text-500 mb-2">Seleccione el nivel de stock:</label>
              {renderNivelButtons()}
            </div>
            
            {productosPorNivel.length > 0 && (
              <div className="mt-4">
                <DataTable 
                  value={productosPorNivel} 
                  loading={loadingNivel}
                  responsiveLayout="scroll"
                  emptyMessage="No hay productos en este nivel"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                >
                  <Column field="nombre" header="Nombre" sortable style={{ minWidth: '14rem' }} />
                  <Column field="codigo" header="Código" sortable style={{ minWidth: '8rem' }} />
                  <Column field="categoria" header="Categoría" sortable style={{ minWidth: '10rem' }} />
                  <Column field="stock" header="Stock" body={stockBodyTemplate} sortable style={{ minWidth: '6rem' }} />
                  <Column field="precio" header="Precio" body={(rowData) => formatearMoneda(rowData.precio)} sortable style={{ minWidth: '8rem' }} />
                  <Column body={actionBodyTemplate} style={{ minWidth: '4rem' }} />
                </DataTable>
              </div>
            )}
          </Card>
        </TabPanel>
      </TabView>

      {/* Dialog para actualizar stock */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '450px' }}
        header="Actualizar Stock"
        modal
        onHide={() => setDialogVisible(false)}
      >
        {productoSeleccionado && (
          <div className="grid">
            <div className="col-12">
              <div className="text-500 mb-1">Producto:</div>
              <div className="font-semibold text-lg mb-3">{productoSeleccionado.nombre}</div>
              
              <div className="text-500 mb-1">Stock Actual:</div>
              <div className="font-semibold text-xl mb-3">{productoSeleccionado.stock} unidades</div>
              
              <label htmlFor="nuevoStock" className="text-500 mb-1 block">Nuevo Stock:</label>
              <InputNumber
                id="nuevoStock"
                value={nuevoStock}
                onValueChange={(e) => setNuevoStock(e.value)}
                min={0}
                className="w-full"
                showButtons
                disabled={loadingActualizar}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-content-end mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogVisible(false)}
            disabled={loadingActualizar}
          />
          <Button
            label="Actualizar"
            icon="pi pi-check"
            onClick={actualizarStock}
            loading={loadingActualizar}
            disabled={loadingActualizar}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default VerificarStockPage;