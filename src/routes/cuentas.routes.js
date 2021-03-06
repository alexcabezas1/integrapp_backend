const cuentaController = require("../controllers/cuentas.controller");

module.exports = (app) => {
  app.get("/cuentas/:numero_cuenta/resumen", (req, res) =>
    // #swagger.tags = ['Cuenta']
    // #swagger.description = 'Endpoint para obtener resumen de una cuenta por numero de cuenta.'
    // #swagger.parameters['numero_cuenta'] = { description: 'Numero de cuenta.' }
    cuentaController.obtenerResumenDeCuenta(req, res)
  );

  app.get("/cuentas", (req, res) => cuentaController.obtenerCuentas(req, res));

  app.post("/cuentas", (req, res) =>
    // #swagger.tags = ['Cuenta']
    // #swagger.description = 'Endpoint para crear una cuenta.'
    // #swagger.parameters['id'] = { description: 'ID de cliente.' }
    cuentaController.crear(req, res)
  );

  app.get("/cuentas/:numero_cuenta", (req, res) =>
    // #swagger.tags = ['Cuenta']
    // #swagger.description = 'Endpoint para obtener una cuenta por numero de cuenta.'
    // #swagger.parameters['numero_cuenta'] = { description: 'Numero de cuenta.' }
    cuentaController.obtenerCuenta(req, res)
  );
};
