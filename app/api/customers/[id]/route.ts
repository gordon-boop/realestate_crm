import { handleApiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { customerCreateSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    return json({ customer });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    const body = customerCreateSchema.partial().parse(await request.json());
    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        displayName: body.displayName,
        title: body.title,
        firstName: body.firstName,
        lastName: body.lastName,
        ageAtSubmission: body.ageAtSubmission,
        gender: body.gender as never,
        email: body.email,
        phone: body.phone,
        mobile: body.mobile,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        maritalStatus: body.maritalStatus as never,
        spouseTitle: body.spouseTitle,
        spouseFirstName: body.spouseFirstName,
        spouseLastName: body.spouseLastName,
        spouseGender: body.spouseGender as never,
        spouseDateOfBirth: body.spouseDateOfBirth ? new Date(body.spouseDateOfBirth) : undefined,
        propertyOwnership: body.propertyOwnership as never,
        monthlyIncomeRange: body.monthlyIncomeRange as never,
        street: body.street,
        postalCode: body.postalCode,
        city: body.city,
        addressText: body.addressText,
        consentDataProcessing: body.consentDataProcessing
      }
    });
    return json({ customer: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
