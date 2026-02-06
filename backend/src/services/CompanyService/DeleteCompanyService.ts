import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const DeleteCompanyService = async (id: string | number): Promise<void> => {
    const company = await Company.findByPk(id);

    if (!company) {
        throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    // Prevent deleting the default company
    if (company.slug === "default") {
        throw new AppError("ERR_CANNOT_DELETE_DEFAULT_COMPANY", 400);
    }

    await company.destroy();
};

export default DeleteCompanyService;
