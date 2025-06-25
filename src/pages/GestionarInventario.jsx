import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/GestionarLayout.css";
import "../styles/Loader.css"; // ¡Importamos el loader.css!

function GestionarInventario() {
  const [modo, setModo] = useState("lista");
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    idProducto: "",
    nombre: "",
    fechaVencimiento: "",
    descripcion: "",
    stock: "",
    unidadMedida: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para el loader

  
  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      setLoading(true); // Iniciar carga
      const response = await axios.get("https://fumifortebe-gxhg.onrender.com/gerente/productos", {
        withCredentials: true,
      });
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      setError("Hubo un error al cargar el inventario.");
    } finally {
      setLoading(false); // Finalizar carga
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarCampos = (form) => ({
    nombre: form.nombre.trim(),
    fechaVencimiento: form.fechaVencimiento.trim(),
    descripcion: form.descripcion.trim(),
    stock: form.stock.toString().trim(),
    unidadMedida: form.unidadMedida.trim(),
  });

  const validarCampos = ({ nombre, fechaVencimiento, descripcion, stock, unidadMedida }) => {
    return nombre !== "" && fechaVencimiento !== "" && descripcion !== "" && stock !== "" && unidadMedida !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedForm = limpiarCampos(form);

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.post("https://fumifortebe-gxhg.onrender.com/nuevo_producto", cleanedForm, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      setMensaje("¡Producto registrado exitosamente!");
      setError("");
      setForm({
        idProducto: "",
        nombre: "",
        fechaVencimiento: "",
        descripcion: "",
        stock: "",
        unidadMedida: "",
      });
      setModo("lista");
      obtenerProductos();
    } catch (error) {
      console.error("Error al registrar producto:", error);
      setError("No se pudo registrar el producto.");
    }
  };

  const handleEditar = (producto) => {
    setProductoEditado(producto);
    setModalVisible(true);
    setForm({ ...producto });
  };

  const handleEliminar = (producto) => {
    setProductoAEliminar(producto);
    setModalEliminarVisible(true);
  };

  const confirmarEliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      await axios.delete(`https://fumifortebe-gxhg.onrender.com/productos/${productoAEliminar.idProducto}`, {
        withCredentials: true,
      });
      setMensaje("Producto eliminado exitosamente.");
      setModalEliminarVisible(false);
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError("No se pudo eliminar el producto.");
    }
  };

  const handleConfirmarEdicion = async () => {
    const cleanedForm = {
      idProducto: form.idProducto,
      ...limpiarCampos(form),
    };

    if (!validarCampos(cleanedForm)) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.put(
        `https://fumifortebe-gxhg.onrender.com/productos/${cleanedForm.idProducto}`,
        cleanedForm,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMensaje("Producto actualizado exitosamente.");
        setModalVisible(false);
        obtenerProductos();
      } else {
        setError("Hubo un error al actualizar el producto.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setError("No se pudo actualizar el producto.");
    }
  };

  return (
    <div className="gestionar-layout-container">
      <h1 style={{ marginBottom: "10px" }}>Gestionar Inventario</h1>
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <>
          {modo === "lista" ? (
            <>
              <button style={{ marginBottom: "20px" }} onClick={() => setModo("registrar")}>
                + Registrar Producto
              </button>
              <div className="tabla-productos" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Nombre</th>
                      <th>Fecha Vencimiento</th>
                      <th>Descripción</th>
                      <th>Stock</th>
                      <th>Unidad Medida</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((prod) => (
                      <tr key={prod.idProducto}>
                        <td>{prod.idProducto}</td>
                        <td>{prod.nombre}</td>
                        <td>{prod.fechaVencimiento}</td>
                        <td>{prod.descripcion}</td>
                        <td>{prod.stock}</td>
                        <td>{prod.unidadMedida}</td>
                        <td>
                          <button onClick={() => handleEditar(prod)}>Editar</button>
                          <button onClick={() => handleEliminar(prod)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="formulario-registro">
              <h2>Registrar nuevo producto</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                <input type="date" name="fechaVencimiento" placeholder="Fecha Vencimiento" value={form.fechaVencimiento} onChange={handleChange} required />
                <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
                <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />
                <input type="text" name="unidadMedida" placeholder="Unidad Medida" value={form.unidadMedida} onChange={handleChange} required />
                <button type="submit">Registrar</button>
                <button type="button" onClick={() => setModo("lista")}>Cancelar</button>
              </form>
              {error && <p className="error">{error}</p>}
              {mensaje && <p className="success">{mensaje}</p>}
            </div>
          )}
        </>
      )}

      {/* Modal de edición */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Editar Producto</h2>
            <form className="formulario-registro">
              <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
              <input type="date" name="fechaVencimiento" placeholder="Fecha Vencimiento" value={form.fechaVencimiento} onChange={handleChange} required />
              <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
              <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />
              <input type="text" name="unidadMedida" placeholder="Unidad Medida" value={form.unidadMedida} onChange={handleChange} required />
              <button type="button" onClick={handleConfirmarEdicion}>Guardar</button>
              <button type="button" onClick={() => setModalVisible(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {modalEliminarVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <p>¿Estás seguro de eliminar este producto?</p>
            <button onClick={confirmarEliminarProducto}>Sí</button>
            <button onClick={() => setModalEliminarVisible(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarInventario;
