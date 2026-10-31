"use client";

import {
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
  type FormEvent,
} from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/newsletter-utils/button";
import { Input } from "@/components/ui/input";

/** Every string the form shows, including the hidden label and status messages. */
interface NewsletterLabels {
  /** Visually hidden label of the email field. */
  email: ReactNode;
  submit: ReactNode;
  /** Button text while `onSubscribe` is running. */
  pending: ReactNode;
  /** Announced in the status region once `onSubscribe` resolves. */
  success: ReactNode;
  /** Announced in the alert region when `onSubscribe` throws. */
  error: ReactNode;
}

type NewsletterStatus = "idle" | "pending" | "success" | "error";

const defaultLabels: NewsletterLabels = {
  email: "Email address",
  submit: "Subscribe",
  pending: "Subscribing…",
  success: "You're subscribed. Check your inbox to confirm.",
  error: "Could not subscribe. Please try again.",
};

interface NewsletterProps extends Omit<ComponentProps<"section">, "title"> {
  /** Section title, rendered as an `<h2>`. */
  title?: ReactNode;
  description?: ReactNode;
  /** Small print under the form. Pass `null` to hide it. */
  note?: ReactNode;
  placeholder?: string;
  /** Overrides for any of the form's strings; the rest keep their English defaults. */
  labels?: Partial<NewsletterLabels>;
  /**
   * Called with the email instead of a native submit. While it runs the button
   * is disabled; resolving clears the field and shows `labels.success`,
   * throwing keeps the email and shows `labels.error`.
   */
  onSubscribe?: (email: string) => void | Promise<void>;
  /** Props for the `<form>`, such as `action` and `method` for a native submit. */
  formProps?: ComponentProps<"form">;
  /** "card" puts the band in a bordered box; "plain" leaves it on the page background. */
  variant?: "plain" | "card";
  containerClassName?: string;
}

/**
 * A compact sign-up band: title and description on the left and an inline
 * email form on the right from `md` up (stacked on small screens).
 */
function Newsletter({
  title = "Stay in the loop",
  description = "Get product updates, tips and release notes in your inbox once a month.",
  note = "No spam. Unsubscribe at any time.",
  placeholder = "you@example.com",
  labels: labelsProp,
  onSubscribe,
  formProps,
  variant = "card",
  className,
  containerClassName,
  ...props
}: NewsletterProps) {
  const id = useId();
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const labels = { ...defaultLabels, ...labelsProp };
  const pending = status === "pending";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    formProps?.onSubmit?.(event);
    // No handler, or the consumer cancelled it: leave the native submit alone.
    if (!onSubscribe || event.defaultPrevented) return;
    event.preventDefault();
    if (pending) return;

    // React clears currentTarget once the event is handled, so keep the form.
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");

    setStatus("pending");
    try {
      await onSubscribe(email);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      data-slot="newsletter"
      data-status={status}
      data-variant={variant}
      className={cn("w-full py-16 sm:py-24", className)}
      {...props}
    >
      <div
        data-slot="newsletter-container"
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          containerClassName || (variant === "plain" ? "max-w-7xl" : "max-w-6xl")
        )}
      >
        <div
          data-slot="newsletter-content"
          className={cn(
            "w-full flex flex-col gap-8 md:flex-row md:items-center md:justify-between",
            variant === "card" &&
              "bg-card text-card-foreground rounded-xl border p-6 sm:p-10",
          )}
        >
          <div data-slot="newsletter-header" className="max-w-2xl min-w-0">
            <h2
              data-slot="newsletter-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {title}
            </h2>
            {description ? (
              <p
                data-slot="newsletter-description"
                className="text-muted-foreground mt-4 text-lg text-pretty"
              >
                {description}
              </p>
            ) : null}
          </div>
          <div
            data-slot="newsletter-body"
            className="w-full min-w-0 md:max-w-md"
          >
            <form
              data-slot="newsletter-form"
              data-status={status}
              {...formProps}
              className={cn(
                "flex flex-col gap-3 sm:flex-row",
                formProps?.className,
              )}
              onSubmit={handleSubmit}
            >
              <label htmlFor={`${id}-email`} className="sr-only">
                {labels.email}
              </label>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder={placeholder}
                required
                className="sm:flex-1"
              />
              <Button
                type="submit"
                data-slot="newsletter-submit"
                loading={pending}
              >
                {pending ? labels.pending : labels.submit}
              </Button>
            </form>
            <p
              role="status"
              data-slot="newsletter-success"
              className="mt-3 text-sm empty:mt-0"
            >
              {status === "success" ? labels.success : null}
            </p>
            <p
              role="alert"
              data-slot="newsletter-error"
              className="text-destructive mt-3 text-sm empty:mt-0"
            >
              {status === "error" ? labels.error : null}
            </p>
            {note ? (
              <p
                data-slot="newsletter-note"
                className="text-muted-foreground mt-3 text-sm"
              >
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export {
  Newsletter,
  type NewsletterLabels,
  type NewsletterProps,
  type NewsletterStatus,
};
export default Newsletter;

