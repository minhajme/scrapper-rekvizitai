require('dotenv').config();
require('./helpers');
const express = require('express');
const redislib = require('redis');
const redis = redislib.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
const amqplib = require('amqplib');

const app = express();

app.get('/get_rows', async (req, res) => {
    if (!redis.isOpen) await redis.connect();
    
    const from = req.query.start;
    const size = req.query.length;
    if (!from || !size) {
        return res.json({data: [], 'error': 'query params missing: from, size'});
    }
    
    let results = {};
    const recordsTotal = (await redis.sendCommand(['FT.SEARCH', 'idx:companies', '*', 'NOCONTENT']))[0];
    let recordsFiltered = 0;
    if (req.query.search.value) {
        const search_ids = req.query.search.value.replace(',', '* | *').wrap('*');
        results = await redis.ft.search('idx:companies', `@reg:${search_ids}`, {LIMIT: {from, size}});
        recordsFiltered = (await redis.sendCommand(['FT.SEARCH', 'idx:companies', `@reg:${search_ids}`, 'NOCONTENT']))[0];
    } else { // no search, return all
        results = await redis.ft.search('idx:companies', '*', {LIMIT: {from, size}});
        recordsFiltered = recordsTotal;
    }
    await redis.disconnect();

    const rows = results.documents.map(doc => doc.value);

    res.setHeader('Access-Control-Allow-Origin', req.headers['origin']?req.headers['origin']:'');
    res.setHeader('Access-Control-Allow-Headers', 'access-control-allow-origin');
    res.setHeader('Vary', 'origin');
    return res.json({data: rows, recordsTotal, recordsFiltered});
});
app.get('/crawl', async (req, res) => {
    const amqp_conn = await amqplib.connect(`amqp://${process.env.AMQP_HOST}`);
    const amqp_channel = await amqp_conn.createChannel();
    await amqp_channel.assertQueue('crawler', {durable:false});
    
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin']?req.headers['origin']:'');
    res.setHeader('Access-Control-Allow-Headers', 'access-control-allow-origin');
    res.setHeader('Vary', 'origin');
    const search = req.query.search; // relying on frontend to send validated needles
    await amqp_channel.sendToQueue('crawler', Buffer.from(search)); 
    await amqp_conn.close();
    return res.json([]); 
});

app.listen(3000, () => {
    console.log('listeing to port 3000');
});
