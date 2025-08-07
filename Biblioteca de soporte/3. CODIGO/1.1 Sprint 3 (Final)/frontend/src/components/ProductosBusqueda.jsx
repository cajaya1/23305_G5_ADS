import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

const ProductosBusqueda = ({ onBuscar, resultados, loading, mensaje }) => {
  const [criterios, setCriterios] = useState({
    nombre: '',
    id: '',
    precioMin: null,
    precioMax: null
  });

  const handleBuscar = () => {
    // Validar que al menos un campo esté lleno
    const { nombre, id, precioMin, precioMax } = criterios;
    if (!nombre && !id && precioMin === null && precioMax === null) {
      return;
    }

    // Llamar función de búsqueda del componente padre
    onBuscar(criterios);
  };

  const handleLimpiar = () => {
    setCriterios({
      nombre: '',
      id: '',
      precioMin: null,
      precioMax: null
    });
  };

  const onInputChange = (e, field) => {
    const value = e.target ? e.target.value : e.value;
    setCriterios(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card title="Búsqueda de Productos" className="mb-4">
      <div className="formgrid grid">
        <div className="field col-12 md:col-6">
          <label htmlFor="nombre">Nombre del Producto</label>
          <InputText
            id="nombre"
            value={criterios.nombre}
            onChange={(e) => onInputChange(e, 'nombre')}
            placeholder="Buscar por nombre del producto"
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="id">ID del Producto</label>
          <InputText
            id="id"
            value={criterios.id}
            onChange={(e) => onInputChange(e, 'id')}
            placeholder="Buscar por ID del producto"
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="precioMin">Precio Mínimo</label>
          <InputNumber
            id="precioMin"
            value={criterios.precioMin}
            onValueChange={(e) => onInputChange(e, 'precioMin')}
            mode="currency"
            currency="COP"
            locale="es-CO"
            placeholder="Precio mínimo"
            className="w-full"
            disabled={loading}
            min={0}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="precioMax">Precio Máximo</label>
          <InputNumber
            id="precioMax"
            value={criterios.precioMax}
            onValueChange={(e) => onInputChange(e, 'precioMax')}
            mode="currency"
            currency="COP"
            locale="es-CO"
            placeholder="Precio máximo"
            className="w-full"
            disabled={loading}
            min={0}
          />
        </div>

        <div className="field col-12">
          <div className="flex gap-2">
            <Button
              label="Buscar"
              icon="pi pi-search"
              onClick={handleBuscar}
              disabled={loading || (!criterios.nombre && !criterios.id && criterios.precioMin === null && criterios.precioMax === null)}
              loading={loading}
            />
            <Button
              label="Limpiar"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={handleLimpiar}
              disabled={loading}
            />
          </div>
        </div>

        {mensaje && (
          <div className="field col-12">
            <Message
              severity={mensaje.severity}
              text={mensaje.text}
              className="w-full"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductosBusqueda;