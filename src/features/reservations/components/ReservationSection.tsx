import { getPricingSnapshot } from "../queries";
import { ReservationForm } from "./ReservationForm";

export async function ReservationSection() {
  const { rules, base, blocked } = await getPricingSnapshot();
  return <ReservationForm blockedIso={blocked} rules={rules} base={base} />;
}
