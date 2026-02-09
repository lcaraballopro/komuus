import Database from "./database";
import Permission from "./models/Permission";

const verifyPermissions = async () => {
    try {
        // Database connection is established in ./database/index.ts but we might need to wait or authenticate
        // Actually ./database/index.ts exports an instance, but it doesn't await connection.
        // However, Sequelize usually connects lazily or we can force it.

        await Database.authenticate();
        console.log("Database connected.");

        const permissions = await Permission.findAll({
            where: {
                module: ["webchat", "reservations", "Webchat", "Reservations"]
            }
        });

        console.log("Found permissions:", JSON.stringify(permissions, null, 2));

        if (permissions.length === 0) {
            console.log("No permissions found for webchat or reservations.");
        } else {
            console.log(`Found ${permissions.length} permissions.`);
        }

    } catch (error) {
        console.error("Error verifying permissions:", error);
    } finally {
        await Database.close();
    }
};

verifyPermissions();
