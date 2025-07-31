const express = require('express');
const cors = require('cors');
const router = require("./routes/index");
require("dotenv").config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Auth',
    version: '1.0.0',
    description: 'API Micro Service Auth'
  }
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const init = async () => {
    try {
        app.use(express.json());
        app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        app.use("/api", router);

        app.listen(process.env.port, () => {
            console.log(`Listening on port: ${process.env.port}`);
        });

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

init();