const multer = require("multer");
const facturasController = require("../controllers/facturas.controller");

const upload = multer({ dest: "uploads/" });

module.exports = (app) => {
  app.post("/facturas/cargar", upload.single("archivo"), (req, res) =>
    // #swagger.tags = ['Facturas']
    // #swagger.description = 'Endpoint para cargar facturas a una cuenta del cliente.'
    // #swagger.parameters['numero_cuenta'] = { description: 'Numero de cuenta.' }
    facturasController.cargar(req, res)
  );

  app.get("/facturas/:codigo_pago_electronico", (req, res) =>
    // #swagger.tags = ['Facturas']
    // #swagger.description = 'Endpoint para buscar las facturas de un cliente por codigo de pago electronico o numero de factura.'
    // #swagger.parameters['codigo_pago_electronico'] = { description: 'Codigo de pago electronico de un servicio.', type: 'string' }
    // #swagger.parameters['ngiumero_factura'] = { description: 'Numero de factura de un servicio.', type: 'string' }
    facturasController.obtenerFacturas(req, res)
  );

  app.get("/cuentas/:numero_cuenta/facturas/:anio/:mes", (req, res) =>
    // #swagger.tags = ['Facturas']
    // #swagger.description = 'Endpoint para buscar todas las facturas de un cliente por .'
    // #swagger.parameters['anio'] = { description: 'Anio de factura a buscar.', type: 'string' }
    // #swagger.parameters['mes'] = { description: 'Mes de las facturas.', type: 'string' }
    // #swagger.parameters['numero_cuenta'] = { description: 'Numero de cuenta de cliente.', type: 'string' }
    facturasController.obtenerFacturasFecha(req, res)
  );
};
