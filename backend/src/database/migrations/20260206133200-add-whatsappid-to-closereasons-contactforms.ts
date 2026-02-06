import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // Add whatsappId to CloseReasons
        await queryInterface.addColumn("CloseReasons", "whatsappId", {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "Whatsapps", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });

        // Add index for whatsappId on CloseReasons
        await queryInterface.addIndex("CloseReasons", ["whatsappId"], {
            name: "closereasons_whatsappid_idx"
        });

        // Add whatsappId to ContactForms
        await queryInterface.addColumn("ContactForms", "whatsappId", {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "Whatsapps", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });

        // Add index for whatsappId on ContactForms
        await queryInterface.addIndex("ContactForms", ["whatsappId"], {
            name: "contactforms_whatsappid_idx"
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("CloseReasons", "closereasons_whatsappid_idx");
        await queryInterface.removeColumn("CloseReasons", "whatsappId");
        await queryInterface.removeIndex("ContactForms", "contactforms_whatsappid_idx");
        await queryInterface.removeColumn("ContactForms", "whatsappId");
    }
};
