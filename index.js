const express = require('express');
const cors = require('cors');
const router = require("./routes/index");
require("dotenv").config();

const app = express();

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