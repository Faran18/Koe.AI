import PageShell from "@/components/PageShell";
export const metadata = { title: "Privacy — VELORA" };
export default function Privacy() {
  return (
    <PageShell eyebrow="Legal" title="Privacy">
      <p><strong>Template text. Have it reviewed by a lawyer before launch.</strong></p>
      <p>We collect the details you give us (name, email, address, order history) to fulfil orders and support you. Your bag, wishlist and profile are stored in your browser. Payments are handled by Stripe, and we do not store card details. Contact us to access or delete your data. [ADD CONTROLLER, RETENTION, COOKIES AND REGION-SPECIFIC RIGHTS]</p>
    </PageShell>
  );
}
