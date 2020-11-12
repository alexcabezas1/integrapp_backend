const CLIENTES_TIPO = {
  PERSONA_FISICA: "PERSONA_FISICA",
  PERSONA_JURIDICA: "PERSONA_JURIDICA",
};

const CUENTAS_TIPO = {
  CAJA_DE_AHORRO: "CAJA_DE_AHORRO",
  CUENTA_CORRIENTE: "CUENTA_CORRIENTE",
};

const MOVIMIENTOS_CUENTAS_CONCEPTO = {
  DEPOSITO: "DEPOSITO",
  EXTRACCION: "EXTRACCION",
  PAGO_A_PROVEEDOR: "PAGO_A_PROVEEDOR",
  PAGO_DE_CLIENTE: "PAGO_DE_CLIENTE",
  COMISION_POR_TRANSACCION: "COMISION_POR_TRANSACCION",
  MANTENIMIENTO_DE_CUENTA: "MANTENIMIENTO_DE_CUENTA",
  FONDO_DESCUBIERTO: "FONDO_DESCUBIERTO",
  DINERO_EN_CUENTA: "DINERO_EN_CUENTA",
};

const MOVIMIENTOS_CUENTAS_TIPO = {
  ACREDITA: "ACREDITA",
  DEBITA: "DEBITA",
};

const DEFAULTS = {
  TIEMPO_MANTENIMIENTO_CUENTAS: {
    valor: "10",
    unidad: "minutes",
  },
};

module.exports = {
  DEFAULTS,
  CLIENTES_TIPO,
  CUENTAS_TIPO,
  MOVIMIENTOS_CUENTAS_CONCEPTO,
  MOVIMIENTOS_CUENTAS_TIPO,
};
