const express = require('express');
const morgan = require('morgan');
const webPool = require('web-pool');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const { notFound, handleError } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(webPool());

app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

app.use('*', notFound);
app.use(handleError);

module.exports = app;
