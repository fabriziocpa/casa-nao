import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const docRefinement = (type: "DNI" | "CE" | "PASSPORT", n: string) => {
  const value = n.trim();
  if (type === "DNI") return /^\d{8}$/.test(value);
  if (type === "CE") return /^\d{9}$/.test(value);
  return /^[A-Z0-9]{6,12}$/i.test(value);
};

export const phonePeruSchema = z
  .string()
  .trim()
  .regex(/^9\d{8}$/, "Ingresa un celular peruano válido (9 dígitos, inicia en 9)");

export const reservationInputSchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1, "Mínimo 1 huésped").max(15, "Máximo 15 huéspedes"),
    docType: z.enum(["DNI", "CE", "PASSPORT"]),
    docNumber: z.string().trim().min(6, "Documento demasiado corto").max(20),
    firstName: z.string().trim().min(2, "Ingresa tus nombres"),
    lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
    email: z.string().trim().email("Correo inválido"),
    phone: phonePeruSchema,
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    consent: z
      .union([z.literal("on"), z.literal(true), z.literal("true")])
      .transform(() => true)
      .or(z.boolean().refine((v) => v, { message: "Debes aceptar los términos" })),
  })
  .superRefine((data, ctx) => {
    if (data.checkIn >= data.checkOut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "La fecha de salida debe ser posterior a la llegada",
      });
    }
    if (!docRefinement(data.docType, data.docNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["docNumber"],
        message:
          data.docType === "DNI"
            ? "DNI debe tener 8 dígitos"
            : data.docType === "CE"
              ? "CE debe tener 9 dígitos"
              : "Pasaporte de 6 a 12 caracteres",
      });
    }
  });
