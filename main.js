const morgan = require('morgan')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise')
const secureEnv = require('secure-env')
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

global.env = secureEnv({secret:'mySecretPassword'})

const app = express();

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// create connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT) || 3306,
	database: 'paf2020',
	user: global.env.DB_USER || process.env.DB_USER,
	password: global.env.DB_PASSWORD || process.env.DB_PASSWORD,
	connectionLimit: 4
})

const startApp = async (app, pool) => {
	const conn = await pool.getConnection()
	try {
		console.info('Pinging database...')
		await conn.ping()

        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)        
        })

    } catch(e) {
		console.error('Cannot ping database', e)
	} finally {
		conn.release()
	}
}

// start the app
startApp(app, pool)