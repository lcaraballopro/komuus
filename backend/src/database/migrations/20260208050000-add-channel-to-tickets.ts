import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.addColumn("Tickets", "channel", {
            type: DataTypes.STRING(20),
            defaultValue: "whatsapp",
            allowNull: false
        });

        await queryInterface.addIndex("Tickets", ["channel"]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn("Tickets", "channel");
    }
};
