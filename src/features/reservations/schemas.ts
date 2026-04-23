import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const nameRegex = /^[\p{L}][\p{L} '.\-]{1,49}$/u;

const docRefinement = (type: "DNI" | "CE" | "PASSPORT", n: string) => {
  const value = n.trim();
  if (type === "DNI") return /^\d{8}$/.test(value);
  if (type === "CE") return /^\d{9}$/.test(value);
  return /^[A-Z0-9]{6,12}$/i.test(value);
};

export const phoneE164Schema = z
  .string()
  .trim()
  .regex(
    /^\+\d{7,15}$/,
    "Ingresa un celular válido con código de país (ej. +51987654321)",
  );

export const reservationInputSchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1, "Mínimo 1 huésped").max(15, "Máximo 15 huéspedes"),
    docType: z.enum(["DNI", "CE", "PASSPORT"]),
    docNumber: z
      .string()
      .trim()
      .min(6, "Documento demasiado corto")
      .max(20, "Documento demasiado largo"),
    firstName: z
      .string()
      .trim()
      .min(2, "Ingresa tus nombres")
      .max(50, "Máximo 50 caracteres")
      .regex(nameRegex, "Nombre inválido"),
    lastName: z
      .string()
      .trim()
      .min(2, "Ingresa tus apellidos")
      .max(50, "Máximo 50 caracteres")
      .regex(nameRegex, "Apellido inválido"),
    email: z
      .string()
      .trim()
      .max(254, "Correo demasiado largo")
      .email("Correo inválido"),
    phone: phoneE164Schema,
    message: z.string().trim().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
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
