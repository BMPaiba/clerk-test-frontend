// Almacenar los datos
ultimosDatos = datosBalanza;

// Enviar confirmación al cliente
connection.send(
    JSON.stringify({
        status: 'success',
        message: 'Datos recibidos correctamente',
        data: datosBalanza,
    })
); 