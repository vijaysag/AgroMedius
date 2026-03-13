const mongoose = require('mongoose');
const Order = require('./agro_server/models/Order');

async function test() {
    try {
        const order = new Order({
            crop: new mongoose.Types.ObjectId(),
            farmer: new mongoose.Types.ObjectId(),
            buyer: new mongoose.Types.ObjectId(),
            quantity: 10,
            totalPrice: 100,
            status: 'accepted'
        });
        const err = order.validateSync();
        if (err) {
            console.log('Validation Error:', err.message);
        } else {
            console.log('Validation Success!');
        }
    } catch (e) {
        console.error('Test failed:', e.message);
    }
    process.exit();
}

test();
