import Company from "../../models/Company";
import AppError from "../../errors/AppError";

interface Request {
    name: string;
    slug: string;
    plan?: string;
    isActive?: boolean;
    maxUsers?: number;
    maxWhatsapps?: number;
}

const CreateCompanyService = async ({
    name,
    slug,
    plan = "basic",
    isActive = true,
    maxUsers = 10,
    maxWhatsapps = 2
}: Request): Promise<Company> => {
    // Check if slug already exists
    const existingCompany = await Company.findOne({ where: { slug } });
    if (existingCompany) {
        throw new AppError("ERR_COMPANY_SLUG_EXISTS", 400);
    }

    const company = await Company.create({
        name,
        slug,
        plan,
        isActive,
        maxUsers,
        maxWhatsapps
    });

    return company;
};

export default CreateCompanyService;
