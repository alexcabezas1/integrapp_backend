const cliente = require('../sequelize/models').db.clientes;

module.exports = {
    //Crea una transaccion / eposito de cuenta
    async crear(tipo, cuit, dni, nombre, apellido, email, domicilio_barrio, domicilio_calle, domicilio_ciudad, domicilio_numero, domicilio_piso, domicilio_apartamento, fecha_nacimiento, pregunta1,pregunta1_respuesta, pregunta2, pregunta2_respuesta, pregunta3, pregunta3_respuesta, usuario_id) {
        return await cliente
            .create ({
                tipo: tipo,
                cuit: cuit,
                dni: dni,
                nombre: nombre,
                apellido: apellido,
                email: email,
                domicilio_ciudad: domicilio_ciudad,
                domicilio_calle: domicilio_calle,
                domicilio_barrio: domicilio_barrio,
                domicilio_numero: domicilio_numero,
                domicilio_piso: domicilio_piso,
                domicilio_apartamento: domicilio_apartamento,
                fecha_nacimiento: fecha_nacimiento,
                pregunta1: pregunta1,
                pregunta1_respuesta: pregunta1_respuesta,
                pregunta2: pregunta2,
                pregunta2_respuesta: pregunta2_respuesta,
                pregunta3: pregunta3,
                pregunta3_respuesta: pregunta3_respuesta,
                usuario_id: usuario_id
            })
            .then(cliente => {
                console.log("bien!")
                return cliente
            })
            .catch(error => {
                console.log(error)
            })
    },

    async buscarPorId(id) {
        return await cliente.findOne({ where: { id: id } })
    }
};