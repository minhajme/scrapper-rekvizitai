require('dotenv').config();
require('./helpers');
const express = require('express');
const cors = require('cors');
const redislib = require('redis');
const redis = redislib.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
const amqplib = require('amqplib');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    if (req.query.search.value) { // TODO trim
        const search_ids = req.query.search.value.replace(',', '* | *').wrap('*');
        results = await redis.ft.search('idx:companies', `@reg:${search_ids}`, {LIMIT: {from, size}});
        recordsFiltered = (await redis.sendCommand(['FT.SEARCH', 'idx:companies', `@reg:${search_ids}`, 'NOCONTENT']))[0];
    } else { // no search, return all
        results = await redis.ft.search('idx:companies', '*', {LIMIT: {from, size}});
        recordsFiltered = recordsTotal;
    }
    await redis.disconnect();

    const rows = results.documents.map(doc => doc.value);

    return res.json({data: rows, recordsTotal, recordsFiltered});
});
app.post('/scrape', async (req, res) => {
    const amqp_conn = await amqplib.connect(`amqp://${process.env.AMQP_HOST}`);
    const amqp_channel = await amqp_conn.createChannel();
    await amqp_channel.assertQueue('crawler-needle', {durable:true});
     
    const search = req.body.search; // relying on frontend to send validated needles
    await amqp_channel.sendToQueue('crawler-needle', Buffer.from(search), {persistent: true}); 
    setTimeout(async () => {
        await amqp_conn.close();
    }, 500);
    
    return res.json({queue: true, msgid: search}); 
});
app.get('/check_scrape', (req, res) => {
    const msgid = req.body.msgid;
    return res.json({acked: false});
});

app.listen(3000, () => {
    console.log('listeing to port 3000');
});
