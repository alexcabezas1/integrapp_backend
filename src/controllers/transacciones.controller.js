const {
  CantidadInvalidaError,
  ClienteNoExisteError,
  CuentaNoExisteError,
  DesconocidoError,
  DesconocidoBDError,
  CuentaNoAsociadaAlClienteError,
  CuentaConSaldoInsuficienteError,
  CantidadMenorQueTotalFacturasError,
  CantidadMayorQueTotalFacturasError,
  FacturasNoExistenError,
  CuentaDestinoNoExisteError,
} = require("../daos/errors");

const {
  depositarEnCuentaPropia,
  depositarEnCuentaDeTercero,
  extraerDineroDeCuenta,
  pagarServicioComoCliente,
  pagarServicioComoBanco,
  disminuirSaldoDeCuenta,
  aumentarSaldoDeCuenta,
  pedirDineroAOtroBanco,
  tieneSaldoEnCuentaParaPagar,
  buscarConcepto,
  pagarServicioConEfectivo,
  transferirDinero,
  crearMovimiento,
  recibirOperacionDesdeOtroBanco,
  enviarDinero,
} = require("../daos/transacciones.dao");

const {
  MOVIMIENTOS_CUENTAS_TIPO,
  MOVIMIENTOS_CUENTAS_CONCEPTO,
  BANCOS_INFO,
  SERVICE_DETAILS,
} = require("./../daos/common");

const { buscarClientePorCbu } = require("../daos/clientes.dao");

const { db } = require("../sequelize/models");

const { extraerDeCuentaEntreBancos } = require("../daos/transacciones.dao");
const { buscarFacturasPorIds } = require("../daos/facturas.dao");
const { Error } = require("../daos/errors");

module.exports = {
  async depositar(req, res) {
    const { body } = req;
    const { dni, cantidad } = body;

    let depositarFunction;
    if (body.hasOwnProperty("numero_cuenta")) {
      console.log("cuenta propia");
      depositarFunction = depositarEnCuentaPropia(body.numero_cuenta);
    } else if (body.hasOwnProperty("cbu")) {
      console.log("cuenta de tercero");
      depositarFunction = depositarEnCuentaDeTercero(body.cbu);
    }

    try {
      const { usuario } = res.locals;
      const cantidadFloat = parseFloat(cantidad);
      console.log(cantidadFloat);
      await depositarFunction({ dni, usuario, cantidad: cantidadFloat });

      return res.status(200).json({ mensaje: "deposito realizado" });
    } catch (error) {
      const mensajes_error = [
        CantidadInvalidaError.mensaje,
        ClienteNoExisteError.mensaje,
        CuentaNoExisteError.mensaje,
        DesconocidoBDError.mensaje,
      ];
      if (mensajes_error.includes(error.mensaje)) {
        return res.status(400).json({ error });
      } else {
        return res.status(500).json({ mensaje: new DesconocidoError() });
      }
    }
  },

  async extraer(req, res) {
    const { body } = req;
    const { numero_cuenta, dni, cantidad } = body;

    try {
      const { usuario } = res.locals;
      const cantidadFloat = parseFloat(cantidad);
      await extraerDineroDeCuenta({
        numero_cuenta,
        dni,
        cantidad: cantidadFloat,
        usuario,
      });

      return res.status(200).json({ mensaje: "extracción realizada" });
    } catch (error) {
      const mensajes_error = [
        CantidadInvalidaError.mensaje,
        ClienteNoExisteError.mensaje,
        CuentaNoExisteError.mensaje,
        CuentaNoAsociadaAlClienteError.mensaje,
        CuentaConSaldoInsuficienteError.mensaje,
        DesconocidoBDError.mensaje,
      ];
      if (mensajes_error.includes(error.mensaje)) {
        return res.status(400).json({ error });
      } else {
        return res.status(500).json({ mensaje: new DesconocidoError() });
      }
    }
  },

  async pagarServicio(req, res) {
    const { body } = req;
    const { facturas_ids, cantidad } = body;

    let pagarServicioFunction;
    if (body.hasOwnProperty("numero_cuenta")) {
      const { numero_cuenta } = body;
      if (body.hasOwnProperty("dni")) {
        const { dni } = body;
        pagarServicioFunction = pagarServicioComoBanco({ dni, numero_cuenta });
      } else {
        pagarServicioFunction = pagarServicioComoCliente({ numero_cuenta });
      }
    } else {
      pagarServicioFunction = pagarServicioConEfectivo;
    }

    try {
      const { usuario } = res.locals;
      const cantidadFloat = parseFloat(cantidad);
      const facturas = await buscarFacturasPorIds(facturas_ids);
      if (facturas.length == 0) {
        throw new FacturasNoExistenError();
      }

      await pagarServicioFunction({
        facturas,
        cantidad: cantidadFloat,
        usuario,
      });

      return res.status(200).json({ mensaje: "pago de servicios realizado" });
    } catch (error) {
      const mensajes_error = [
        ClienteNoExisteError.mensaje,
        CantidadInvalidaError.mensaje,
        CuentaNoExisteError.mensaje,
        CuentaConSaldoInsuficienteError.mensaje,
        CantidadMenorQueTotalFacturasError.mensaje,
        CantidadMayorQueTotalFacturasError.mensaje,
        DesconocidoBDError.mensaje,
        FacturasNoExistenError.mensaje,
        CuentaDestinoNoExisteError.mensaje,
      ];

      if (mensajes_error.includes(error.mensaje)) {
        return res.status(400).json({ error });
      } else {
        return res.status(500).json({ mensaje: new DesconocidoError() });
      }
    }
  },

  async autorizarCompra(req, res) {
    const { body } = req;
    const { cbu, importe, cbu_establecimiento } = body;

    try {
      if (!cbu || !importe || !cbu_establecimiento)
        throw new Error("faltan datos");

      if (importe <= 0) throw new CantidadInvalidaError();

      const transaction = await db.sequelize.transaction();
      const cantidad = parseFloat(importe);

      try {
        let { cuenta, cliente } = await buscarClientePorCbu(
          cbu_establecimiento
        );

        if (!cuenta)
          throw new Error(
            "No se encontro una cuenta para el cbu_establecimiento"
          );
        if (!cliente)
          throw new Error(
            "No se encontro cliente asociado al cbu_establecimiento"
          );

        const cuenta_destino = cuenta;
        const cliente_destino = cliente;

        const digitosIdenitficadores = cbu.substring(0, 3);

        if (digitosIdenitficadores === BANCOS_INFO.BANCO_A.numero_entidad) {
          const descripcion =
            "Compra en " +
            cliente_destino.get("nombre") +
            " " +
            cliente_destino.get("apellido");

          //El metodo de redirigir transaccion deberia pegarle al de ellos y hacer la transaccion
          const token = BANCOS_INFO.BANCO_A.token.valor;

          const resultadoTransaccion = await pedirDineroAOtroBanco(
            cbu,
            cantidad,
            descripcion,
            token
          );

          if (resultadoTransaccion.status === 400)
            throw new Error("no se encontro la cuenta en el banco destino");

          if (resultadoTransaccion.status !== 201)
            throw new Error("algo salio mal en la llada al Banco A");
        } else {
          let { cuenta, cliente } = await buscarClientePorCbu(cbu);
          const cuenta_origen = cuenta;
          const cliente_origen = cliente;

          if (!cuenta_origen) throw new CuentaNoExisteError();
          if (!cliente_origen) throw new ClienteNoExisteError();
          if (tieneSaldoEnCuentaParaPagar({ cuenta: cuenta_origen, cantidad }))
            throw new CuentaConSaldoInsuficienteError();

          const concepto_origen = await buscarConcepto(
            MOVIMIENTOS_CUENTAS_CONCEPTO.COMPRA_EN_ESTABLECIMIENTO
          );
          const usuario_origen = await cliente_origen.get("usuario");

          await crearMovimiento({
            cuenta: cuenta_origen,
            concepto: concepto_origen,
            tipo: MOVIMIENTOS_CUENTAS_TIPO.DEBITA,
            cantidad,
            usuario: usuario_origen,
            transaction,
          });

          await disminuirSaldoDeCuenta({
            cuenta: cuenta_origen,
            cantidad,
            transaction,
          });
        }

        const concepto_destino = await buscarConcepto(
          MOVIMIENTOS_CUENTAS_CONCEPTO.VENTA_DEL_ESTABLECIMIENTO
        );
        const usuario_destino = await cliente_destino.get("usuario");

        await crearMovimiento({
          cuenta: cuenta_destino,
          concepto: concepto_destino,
          tipo: MOVIMIENTOS_CUENTAS_TIPO.ACREDITA,
          cantidad,
          usuario: usuario_destino,
          transaction,
        });

        await aumentarSaldoDeCuenta({
          cuenta: cuenta_destino,
          cantidad,
          transaction,
        });

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      return res.status(200).json({ mensaje: "compra autorizada" });
    } catch (error) {
      console.log("error", error);
      return res.status(404).json({ error });
    }
  },

  async recibirDesdeOtroBanco(req, res) {
    const { body } = req;
    const { cbu, cantidad, concepto, descripcion } = body;

    try {
      if (!cbu || !cantidad || !concepto || !descripcion) {
        throw new Error("faltan datos");
      }
      const { usuario } = res.locals;

      await recibirOperacionDesdeOtroBanco({
        cbu,
        cantidad,
        concepto,
        descripcion,
        usuario_operador: usuario,
      });

      return res.status(200).json({ mensaje: "operación realizada" });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ error });
    }
  },

  async transferir(req, res) {
    const { body } = req;
    const { cbu_origen, cbu_destino, cantidad } = body;

    try {
      if (!cbu_origen || !cbu_destino || !cantidad) {
        throw new Error("faltan datos");
      }

      const { usuario } = res.locals;
      let transferirDineroFunction;

      const tresDigitos = cbu_destino.substring(0, 3);

      if (tresDigitos === BANCOS_INFO.BANCO_A.numero_entidad) {
        console.log("cuenta de otro banco");
        transferirDineroFunction = enviarDinero;
      } else if (tresDigitos === SERVICE_DETAILS.numero_entidad) {
        console.log("cuenta del mismo banco");
        transferirDineroFunction = transferirDinero;
      } else {
        throw new Error("cbu inválido");
      }

      await transferirDineroFunction({
        cbu_origen,
        cbu_destino,
        cantidad,
        usuario,
      });

      return res.status(200).json({ mensaje: "transferencia realizada" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  },

  async transferirTransaccionesArray(req, res) {
    const { body } = req;
    const { cbu_origen, movimientos } = body;
    let transaction = await db.sequelize.transaction();

    try {
      if (!cbu_origen || !movimientos) throw new Error("faltan datos");

      let { cuenta, cliente } = await buscarClientePorCbu(cbu_origen);

      if (!cuenta)
        throw new Error("No se encontro una cuenta para el cbu_origen");
      if (!cliente)
        throw new Error("No se encontro cliente asociado al cbu_origen");

      const cuenta_origen = cuenta;
      const cliente_origen = cliente;
      let total = 0;

      const movimientosLen = movimientos.length;
      for (let i = 0; i < movimientosLen; i++) {
        let digitosIdenitficadores = movimientos[i].cbu.substring(0, 3);

        if (digitosIdenitficadores === BANCOS_INFO.BANCO_A.numero_entidad) {
          const descripcion =
            "Compra en " +
            cliente_destino.get("nombre") +
            " " +
            cliente_destino.get("apellido");

          //El metodo de redirigir transaccion deberia pegarle al de ellos y hacer la transaccion
          const token = BANCOS_INFO.BANCO_A.token.valor;

          const resultadoTransaccion = await pedirDineroAOtroBanco(
            movimientos[i].cbu,
            movimientos[i].cantidad,
            descripcion,
            token
          );

          if (resultadoTransaccion.status === 200)
            throw new Error("No se encontro la cuenta en el banco destino");

          if (resultadoTransaccion.status !== 201)
            throw new Error("Algo salio mal ne la llamada al banco B");
        } else {
          let { cuenta, cliente } = await buscarClientePorCbu(
            movimientos[i].cbu
          );
          let cuenta_destino = cuenta;
          let cliente_destino = cliente;

          if (!cuenta_destino) throw new CuentaNoExisteError();
          if (!cliente_destino) throw new ClienteNoExisteError();

          const concepto_destino = await buscarConcepto(
            MOVIMIENTOS_CUENTAS_CONCEPTO.DEPOSITO
          ); //Importar
          const usuario_destino = await cliente_destino.get("usuario");

          await crearMovimiento({
            cuenta: cuenta_destino,
            concepto: concepto_destino,
            tipo: MOVIMIENTOS_CUENTAS_TIPO.ACREDITA,
            cantidad: parseFloat(movimientos[i].importe),
            usuario: usuario_destino,
            transaction,
          });

          await aumentarSaldoDeCuenta({
            cuenta: cuenta_destino,
            cantidad: movimientos[i].importe,
            transaction,
          });
          total += parseFloat(movimientos[i].importe);

          console.log(total);
        }
      }

      if (total <= 0 || !total) throw new CantidadInvalidaError();

      if (
        tieneSaldoEnCuentaParaPagar({ cuenta: cuenta_origen, cantidad: total })
      )
        throw new CuentaConSaldoInsuficienteError();

      const concepto_origen = await buscarConcepto(
        MOVIMIENTOS_CUENTAS_CONCEPTO.EXTRACCION
      );
      const usuario_origen = await cliente_origen.get("usuario");

      await crearMovimiento({
        cuenta: cuenta_origen,
        concepto: concepto_origen,
        tipo: MOVIMIENTOS_CUENTAS_TIPO.DEBITA,
        cantidad: total,
        usuario: usuario_origen,
        transaction,
      });

      console.log("total", total);
      await disminuirSaldoDeCuenta({
        cuenta: cuenta_origen,
        cantidad: total,
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({ mensaje: "compra autorizada" });
    } catch (error) {
      await transaction.rollback();
      console.log("error", error);
      return res
        .status(404)
        .json({ error })
        .end();
    }
  },
};
