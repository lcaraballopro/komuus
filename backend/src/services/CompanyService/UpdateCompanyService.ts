import Company from "../../models/Company";
import AppError from "../../errors/AppError";

interface CompanyData {
    name?: string;
    slug?: string;
    plan?: string;
    isActive?: boolean;
    maxUsers?: number;
    maxWhatsapps?: number;
}

interface Request {
    companyData: CompanyData;
    companyId: string | number;
}

const UpdateCompanyService = async ({
    companyData,
    companyId
}: Request): Promise<Company> => {
    const company = await Company.findByPk(companyId);

    if (!company) {
        throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    const { name, slug, plan, isActive, maxUsers, maxWhatsapps } = companyData;

    // Check if new slug already exists (if changing slug)
    if (slug && slug !== company.slug) {
        const existingCompany = await Company.findOne({ where: { slug } });
        if (existingCompany) {
            throw new AppError("ERR_COMPANY_SLUG_EXISTS", 400);
        }
    }

    await company.update({
        name,
        slug,
        plan,
        isActive,
        maxUsers,
        maxWhatsapps
    });

    await company.reload();

    return company;
};

export default UpdateCompanyService;
