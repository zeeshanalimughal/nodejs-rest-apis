const swaggerAutogen = require('swagger-autogen')()
const outputFile = './swagger_output.json'
const endpoint = ['./app.js']
swaggerAutogen(outputFile,endpoint).then(() => {
    require('./app.js')
})
