module.exports = async (db) => {
  const { conceptos_movimientos, parametros, roles, usuarios } = db;

  const rol0 = await roles.create({
    descripcion: "Administrador",
    alias: "SYSTEM_ADMINS",
  });

  const usuarioSystemAdmin = await usuarios.create({
    nombre_usuario: "system.admin.0",
    clave: "fghjkhjh#454676877",
    rol_id: rol0.get("id"),
  });

  const roles_por_defecto = [
    {
      descripcion: "Ejecutivo del Banco",
      alias: "BANCO_EJECUTIVO",
    },
    {
      descripcion: "Persona Física",
      alias: "CLIENTE_PERSONA_FISICA",
    },
    {
      descripcion: "Empresa",
      alias: "CLIENTE_EMPRESA",
    },
    {
      descripcion: "Proveedor",
      alias: "CLIENTE_PROVEEDOR",
    },
    {
      descripcion: "Banco Externo",
      alias: "EXTERNO_BANCO",
    },
  ];

  const rolesPromises = roles_por_defecto.map((data) => roles.create(data));

  const conceptos = [
    {
      alias: "DEPOSITO",
      descripcion: "Deposito",
    },
    {
      alias: "EXTRACCION",
      descripcion: "Extracción",
    },
    {
      alias: "PAGO_A_PROVEEDOR",
      descripcion: "Pago a Proveedor",
    },
    {
      alias: "PAGO_DE_CLIENTE",
      descripcion: "Pago de Cliente",
    },
    {
      alias: "COMISION_POR_TRANSACCION",
      descripcion: "Comisión por Transacción",
    },
    {
      alias: "MANTENIMIENTO_DE_CUENTA",
      descripcion: "Mantenimiento de Cuenta",
    },
    {
      alias: "FONDO_DESCUBIERTO",
      descripcion: "Fondo Descubierto",
    },
    {
      alias: "DINERO_EN_CUENTA",
      descripcion: "Dinero En Cuenta",
    },
    {
      alias: "COMPRA_EN_ESTABLECIMIENTO",
      descripcion: "Compra en Establecimiento",
    },
    {
      alias: "VENTA_DEL_ESTABLECIMIENTO",
      descripcion: "Venta del Establecimiento",
    },
    {
      alias: "PAGO_DE_SUELDO",
      descripcion: "Pago de Sueldo",
    },
    {
      alias: "PAGO_POR_VENTA_CON_TDC",
      descripcion: "Pago por Venta con Tarjeta de Crédito",
    },
  ];

  const conceptosPromises = conceptos.map((data) =>
    conceptos_movimientos.create(data)
  );

  const parametros_por_defecto = [
    {
      parametro: "COMISION_TRANSACCION_PROVEEDOR",
      valor: 0.05,
    },
    {
      parametro: "COMISION_MANTENIMIENTO_DE_CUENTA",
      valor: 0.035,
    },
    {
      parametro: "TASA_POR_FONDO_DESCUBIERTO",
      valor: 0.022,
    },
    {
      parametro: "TASA_POR_DINERO_EN_CUENTA",
      valor: 0.07,
    },
  ];

  const parametrosPromises = parametros_por_defecto.map((data) =>
    parametros.create(data)
  );

  return Promise.all(rolesPromises + conceptosPromises + parametrosPromises);
};
