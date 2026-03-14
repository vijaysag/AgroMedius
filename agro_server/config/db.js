const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/database.sqlite'),
    logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
    try {
        const dataPath = path.join(__dirname, '../data');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }

        await sequelize.authenticate();
        console.log('✅ SQLite Database Connected (Sequelize)');

        // Note: In production, you'd use migrations instead of sync()
        await sequelize.sync({ alter: false }); 
        
        // Manual migration check for farmerPhone column in SQLite
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Crops');
        if (!tableInfo.farmerPhone) {
            console.log('🏗️ Adding farmerPhone column to Crops table...');
            await queryInterface.addColumn('Crops', 'farmerPhone', {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            });
        }

        console.log('📊 Database tables synced (Schema Altered)');

        // Initial seeding can be triggered here if needed
        const seedDatabase = require('../seedDatabase');
        await seedDatabase();

        return sequelize;
    } catch (error) {
        console.error('❌ Critical: SQLite initialization failed:');
        console.error(error); // Logs full error object including validation details
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
