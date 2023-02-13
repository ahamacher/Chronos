import express from 'express';
import * as bodyParser from 'body-parser'
import routes from './routes';
import cors from 'cors';

const app = express()
// Only allow the one discord page
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
}))
// body content from requests with 'application/json' Content-Type headers
app.use(bodyParser.json());
// routes available
app.use('/', routes);

export function startServer() {
  app.listen(process.env.PORT, () => {
    console.log(`Listening on PORT: ${ process.env.PORT }.`)
  })
}
