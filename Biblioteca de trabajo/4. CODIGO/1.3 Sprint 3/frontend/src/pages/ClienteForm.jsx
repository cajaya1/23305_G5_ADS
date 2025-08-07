import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ClienteForm = ({ visible, onHide, onSubmit, clienteEdit }) => {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    if (clienteEdit) {
      setForm(clienteEdit);
    } else {
      setForm({ nombres: '', apellidos: '', cedula: '', direccion: '', telefono: '', email: '' });
    }
  }, [clienteEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog header={clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente'} visible={visible} onHide={onHide} modal className="cliente-form-modal">
      <div className="form-grid">
        {['nombres', 'apellidos', 'cedula', 'direccion', 'telefono', 'email'].map((campo) => (
          <div key={campo} className="form-field">
            <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
            <InputText name={campo} value={form[campo]} onChange={handleChange} />
          </div>
        ))}
      </div>
      <div className="form-actions">
        <Button label="Cancelar" className="p-button-text" onClick={onHide} />
        <Button label={clienteEdit ? 'Actualizar' : 'Guardar'} onClick={handleSubmit} />
      </div>
    </Dialog>
  );
};

export default ClienteForm;