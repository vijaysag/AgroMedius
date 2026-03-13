const { Crop, MarketPrice, User } = require('./models');

const seedDatabase = async () => {
    try {
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('👤 Seeding default users...');
            await User.create({
                id: 'f0000000-0000-0000-0000-000000000001',
                name: 'Demo Farmer',
                email: 'farmer@test.com',
                password: 'password123',
                role: 'farmer'
            });
            await User.create({
                id: 'w0000000-0000-0000-0000-000000000001',
                name: 'Demo Wholesaler',
                email: 'wholesaler@test.com',
                password: 'password123',
                role: 'wholesaler'
            });
        }

        const cropCount = await Crop.count();
        if (cropCount === 0) {
            console.log('🌱 Seeding default crops...');
            const defaultCrops = [
                {
                    name: 'Organic Wheat',
                    category: 'grain',
                    quantity: 500,
                    unit: 'kg',
                    pricePerUnit: 25,
                    growthStatus: 'ready',
                    description: 'High quality organic wheat from the fields of Madhya Pradesh.',
                    location: { city: 'Bhopal', state: 'MP' },
                    farmerId: 'f0000000-0000-0000-0000-000000000001', 
                    isActive: true,
                    views: 124
                },
                {
                    name: 'Basmati Rice',
                    category: 'grain',
                    quantity: 1200,
                    unit: 'kg',
                    pricePerUnit: 65,
                    growthStatus: 'harvesting',
                    description: 'Long grain aromatic Basmati rice from Punjab.',
                    location: { city: 'Amritsar', state: 'Punjab' },
                    farmerId: 'f0000000-0000-0000-0000-000000000001',
                    isActive: true,
                    views: 89
                }
            ];
            await Crop.bulkCreate(defaultCrops);
        }

        const marketCount = await MarketPrice.count();
        if (marketCount < 10) {
            console.log('📈 Seeding full market history for graphs...');
            const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Chilli'];
            const MARKETS = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'];
            const STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu'];
            const BASE_PRICES = { Wheat: 2200, Rice: 3100, Tomato: 1100, Onion: 1500, Potato: 1200, Soybean: 4500, Cotton: 6200, Sugarcane: 900, Maize: 1900, Chilli: 8000 };
            
            const data = [];
            // Seed 30 days of data for each crop to make the graph look good
            for (let d = 0; d < 30; d++) {
                const date = new Date();
                date.setDate(date.getDate() - d);
                for (let i = 0; i < CROPS.length; i++) {
                    const base = BASE_PRICES[CROPS[i]];
                    const price = Math.round(base + Math.sin(d / 5) * 200 + (Math.random() - 0.5) * 100);
                    data.push({
                        cropName: CROPS[i],
                        category: i < 2 ? 'grain' : (i < 5 ? 'vegetable' : 'other'),
                        market: MARKETS[i % MARKETS.length],
                        state: STATES[i % STATES.length],
                        price,
                        minPrice: price - 100,
                        maxPrice: price + 100,
                        unit: 'quintal',
                        date
                    });
                }
            }
            await MarketPrice.destroy({ where: {} });
            await MarketPrice.bulkCreate(data);
            console.log('✅ Market history seeded successfully.');
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }
};

module.exports = seedDatabase;
