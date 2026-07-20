import { handleApiError, json, requireRole } from "@/lib/api";
import { isInternalAdmin } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { customerCreateSchema } from "@/lib/validation";
import { formatAddress } from "@/lib/address";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && customer.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");
    return json({ customer });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { properties: { select: { status: true } } }
    });
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && customer.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");
    if (user.role === "partner" && customer.properties.some((property) => property.status !== "DRAFT")) {
      throw new Error("Submitted cases cannot be edited by partners");
    }
    const rawBody = await request.json();
    const body = customerCreateSchema.partial().parse(rawBody);
    const addressChanged = ["street", "houseNumber", "postalCode", "city"].some((field) => Object.prototype.hasOwnProperty.call(rawBody, field));
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
        houseNumber: body.houseNumber,
        postalCode: body.postalCode,
        city: body.city,
        addressText: addressChanged
          ? formatAddress({
              street: body.street ?? customer.street,
              houseNumber: body.houseNumber ?? customer.houseNumber,
              postalCode: body.postalCode ?? customer.postalCode,
              city: body.city ?? customer.city
            })
          : body.addressText,
        consentDataProcessing: body.consentDataProcessing
      }
    });
    return json({ customer: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
