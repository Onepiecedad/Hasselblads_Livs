import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import NotFound from "./NotFound";

type Scenario = {
  title: string;
  setup: string;
  steps: string[];
  expected: string[];
};

const scenarios: Scenario[] = [
  {
    title: "Guest checkout handoff",
    setup: "Use a signed-out browser session with only valid WooCommerce-mapped products in the cart.",
    steps: [
      "Add at least two standard products in `/webbutik`.",
      "Go through `/kassa` and complete delivery or pickup selection.",
      "Start final checkout.",
    ],
    expected: [
      "React summary values remain stable before handoff.",
      "The browser reaches `/betalning` without losing the cart during handoff.",
      "Delivery note prefill appears in WooCommerce order comments.",
    ],
  },
  {
    title: "Authenticated checkout handoff",
    setup: "Sign in as a customer account with a matching WooCommerce customer record.",
    steps: [
      "Add valid products to the cart.",
      "Go to `/kassa` and start checkout while signed in.",
      "Confirm the handoff reaches final checkout.",
    ],
    expected: [
      "The authenticated bridge succeeds without falling back silently.",
      "WooCommerce final checkout loads on `/betalning`.",
      "If the bridge fails, React shows the retry-safe error state and the cart remains saved.",
    ],
  },
  {
    title: "Blocked invalid mapping",
    setup: "Use a cart containing at least one line without a valid `woocommerce_id`.",
    steps: [
      "Open `/kassa` with the invalid line still present.",
      "Attempt to continue to final checkout.",
    ],
    expected: [
      "Checkout is blocked before handoff.",
      "The summary shows a clear explanation that the affected items must be fixed or removed.",
      "No partial WooCommerce handoff occurs.",
    ],
  },
  {
    title: "Portioned item context",
    setup: "Add the same underlying product in at least two different portion sizes.",
    steps: [
      "Verify the cart summary shows separate lines in `/kassa`.",
      "Start checkout and inspect the final order-comments prefill.",
    ],
    expected: [
      "Portioned lines stay separate in React pre-checkout.",
      "The handoff note preserves portion labels in the pre-checkout summary block.",
      "Final checkout keeps more readable context even though WooCommerce still receives product ids and quantities.",
    ],
  },
  {
    title: "Sale and multi-buy context",
    setup: "Use one sale-priced product and one product/group that triggers a multi-buy offer.",
    steps: [
      "Verify the React summary line totals in `/kassa`.",
      "Start checkout and inspect the order-comments prefill.",
    ],
    expected: [
      "React summary still shows the intended line totals.",
      "Applied offer labels and final React line totals appear in the handoff note block.",
      "This improves context preservation without claiming WooCommerce pricing is fully synchronized.",
    ],
  },
  {
    title: "Comment and delivery-note prefill",
    setup: "Use either delivery or pickup and enter a customer comment in the summary step.",
    steps: [
      "Add a comment with line breaks or special characters such as `%` or `&`.",
      "Start final checkout.",
    ],
    expected: [
      "WooCommerce order comments receive delivery details plus the customer comment.",
      "Special characters survive the handoff reliably.",
      "Pickup still includes the expected delivery-note context.",
    ],
  },
  {
    title: "Handoff failure recovery",
    setup: "Use a scenario where the bridge fails or simulate a failed handoff response.",
    steps: [
      "Attempt checkout from `/kassa`.",
      "Observe the React-side failure handling.",
    ],
    expected: [
      "The loading state stops instead of leaving the user stuck.",
      "The error message says checkout could not be started and that the cart is still saved.",
      "The same checkout attempt can be tried again.",
    ],
  },
  {
    title: "Bridge observability trace",
    setup: "Use browser console and Netlify function logs during any guest or authenticated failure.",
    steps: [
      "Trigger one handoff attempt.",
      "Search logs for the shared `bridgeAttemptId`.",
    ],
    expected: [
      "Frontend and Netlify logs share the same bridge attempt id.",
      "Structured error codes make the failure stage easier to identify.",
      "Support can trace whether the failure happened in auth, cart sync, session setup, or redirect preparation.",
    ],
  },
];

const InternalCheckoutVerificationPage = () => {
  usePageMetadata({
    title: "Intern checkout-verifiering | Hasselblads Livs",
    description: "Intern checklista for end-to-end verifiering av checkoutflödet.",
    canonicalPath: "/intern/checkout-verifiering",
  });

  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar intern verifiering...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/60 bg-gradient-to-br from-stone-100 via-background to-amber-50">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Intern verifiering
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Checkout end-to-end checklista
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Den här sidan är till för manuell intern verifiering av React pre-checkout,
            Netlify bridge och WooCommerce final checkout. Den ändrar inget i kundflödet.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/webbutik">Öppna webbutiken</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/kassa">Öppna pre-checkout</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6">
          <h2 className="text-lg font-semibold">Användning</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Välj ett scenario nedan och följ setup samt steg i ordning.</li>
            <li>2. Jämför faktiskt beteende mot den förväntade listan direkt efter testet.</li>
            <li>3. Vid bridge-fel, spara `bridgeAttemptId` från konsol eller Netlify-loggar för snabbare felsökning.</li>
          </ul>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <article
              key={scenario.title}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{scenario.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Setup:</span> {scenario.setup}
              </p>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Steg
                </p>
                <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {scenario.steps.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Förväntat resultat
                </p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {scenario.expected.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InternalCheckoutVerificationPage;
