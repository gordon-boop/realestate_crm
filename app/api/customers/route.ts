import { handleApiError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { customerCreateSchema } from "@/lib/validation";

export async function GET(): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customers = await prisma.customer.findMany({
      where: user.role === "admin" ? undefined : { partnerId: user.partnerId },
      orderBy: { updatedAt: "desc" }
    });
    return json({ customers });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = customerCreateSchema.parse(await request.json());
    const partnerId = user.role === "admin" ? String(body.partnerId ?? "") : user.partnerId;
    if (!partnerId) throw new Error("Partner id required");

    const customer = await prisma.customer.create({
      data: {
        partnerId,
        displayName: body.displayName ?? `${body.firstName} ${body.lastName}`,
        firstName: body.firstName,
        lastName: body.lastName,
        ageAtSubmission: body.ageAtSubmission,
        gender: body.gender as never,
        email: body.email,
        phone: body.phone,
        mobile: body.mobile,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        maritalStatus: body.maritalStatus as never,
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
    return json({ customer }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
