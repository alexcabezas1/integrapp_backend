const swaggerAutogen = require('swagger-autogen')()

const outputFile = './resource/swagger/swagger_output.json'
const endpointsFiles = ['./src/routes/client.routes.js', './src/routes/user.routes.js', "./src/routes/transacciones.routes.js"]

const doc = {
    info: {
        version: "1.0.0",
        title: "Integracion de Aplicaciones - BANCO",
        description: "Endpoints del proyecto del banco del grupo 5, para la amteria de Integracion de Aplicaciones - UADE"
    },
    host: "localhost:8080",
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "Usuario",
            "description": "Endpoints"
        },
        {
            "name": "Cliente",
            "description": "Endpoints"
        },
        {
            "name": "Transaccion",
            "description": "Endpoints"
        }
    ],
}


swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    // require('./index.js')
})