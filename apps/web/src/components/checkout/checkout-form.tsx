import { useState } from "react";

import { useForm, standardSchemaValidators } from "@tanstack/react-form";
import { useStore } from "@nanostores/react";

import { Button } from "@zeitless/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@zeitless/ui/components/field";
import { Input } from "@zeitless/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zeitless/ui/components/select";
import { Separator } from "@zeitless/ui/components/separator";

import { cartIdStore } from "../../lib/cart-store";
import { checkoutCountryOptions, checkoutPageContent } from "../../lib/checkout-content";
import { checkoutFormDefaults, checkoutFormSchema } from "../../lib/checkout-form-schema";
import type { CheckoutFormValues } from "../../lib/checkout-form-schema";
import { orpc } from "../../lib/orpc";

const validateCheckoutForm = ({
  value,
  validationSource,
}: {
  value: CheckoutFormValues;
  validationSource: "field" | "form";
}) => standardSchemaValidators.validate({ value, validationSource }, checkoutFormSchema);

function CheckoutForm(): JSX.Element {
  const cartId = useStore(cartIdStore);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm({
    defaultValues: checkoutFormDefaults,
    validators: {
      onBlur: validateCheckoutForm,
      onChange: validateCheckoutForm,
      onSubmit: checkoutFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      setIsRedirecting(true);

      try {
        const session = await orpc.checkout.start({
          cartId,
          email: value.email,
          shippingAddress: {
            fullName: value.fullName,
            line1: value.line1,
            line2: value.line2 || undefined,
            city: value.city,
            region: value.region || undefined,
            postalCode: value.postalCode,
            country: value.country,
            phone: value.phone || undefined,
          },
        });

        if (!session.stripeCheckoutUrl) {
          throw new Error("Stripe Checkout URL was not returned.");
        }

        window.location.assign(session.stripeCheckoutUrl);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "We could not start checkout. Please try again.";
        setSubmitError(message);
        setIsRedirecting(false);
      }
    },
  });

  const isSubmitting = isRedirecting || form.state.isSubmitting;

  return (
    <form
      className="flex flex-col gap-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldSet className="rounded-none border border-[color:var(--outline)]/18 bg-[color:var(--surface-low)]/56 p-5 sm:p-7">
        <FieldLegend className="label-font text-[11px] tracking-[0.24em] text-[color:var(--primary)]/72 uppercase">
          Shipping Destination
        </FieldLegend>
        <FieldDescription className="max-w-2xl text-sm leading-7 text-[color:var(--on-surface)]/66">
          These details are used to create the Stripe Checkout session and the buyer-facing order
          record.
        </FieldDescription>

        <FieldGroup className="mt-6 flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="fullName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      autoComplete="name"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Evelyn Thorne"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      autoComplete="email"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="evelyn@example.com"
                      type="email"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>

          <form.Field
            name="line1"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Street address</FieldLabel>
                  <Input
                    autoComplete="address-line1"
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="12 Savile Row"
                    value={field.state.value}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          />

          <form.Field
            name="line2"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Apartment, suite, etc.</FieldLabel>
                  <Input
                    autoComplete="address-line2"
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Optional"
                    value={field.state.value}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <form.Field
              name="city"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      autoComplete="address-level2"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="London"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="region"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Region</FieldLabel>
                    <Input
                      autoComplete="address-level1"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Optional"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="postalCode"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Postal code</FieldLabel>
                    <Input
                      autoComplete="postal-code"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="W1S 3PQ"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="country"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger aria-invalid={isInvalid} id={field.name} name={field.name}>
                        <SelectValue>{field.state.value || "Select country"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {checkoutCountryOptions.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet className="rounded-none border border-[color:var(--outline)]/18 bg-[color:var(--surface-low)]/56 p-5 sm:p-7">
        <FieldLegend className="label-font text-[11px] tracking-[0.24em] text-[color:var(--primary)]/72 uppercase">
          Contact details
        </FieldLegend>
        <FieldDescription className="max-w-2xl text-sm leading-7 text-[color:var(--on-surface)]/66">
          We’ll use this email to create your order access token.
        </FieldDescription>

        <FieldGroup className="mt-6 flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="phone"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                    <Input
                      autoComplete="tel"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Optional"
                      type="tel"
                      value={field.state.value}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      {submitError ? (
        <p className="text-xs leading-6 text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lg text-xs leading-6 text-[color:var(--on-surface)]/56">
          {checkoutPageContent.cancelNote}
        </p>
        <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Redirecting to Stripe..." : checkoutPageContent.ctaLabel}
        </Button>
      </div>
    </form>
  );
}

export { CheckoutForm };
