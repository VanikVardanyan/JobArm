"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { PatternFormat } from "react-number-format";
import { SignInButton } from "@/features/auth/ui/sign-in-button";
import { ui } from "@/components/ui/styles";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { toE164AmPhone } from "@/lib/phone";
import { routes } from "@/lib/routes";
import type { Locale, TranslationTree } from "@/types/i18n";
import type { ContactMethod, JobCategory, Region } from "@/types/jobs";

type Props = {
  locale: Locale;
  t: TranslationTree["post"];
  commonT: Pick<TranslationTree["common"], "loading" | "backToJobs">;
  authT: TranslationTree["auth"];
};

type FormValues = {
  title: string;
  description: string;
  category: JobCategory | "";
  price: string;
  region: Region;
  address: string;
  date: string;
  time: string;
  phone: string;
  contactMethod: ContactMethod;
};

const CATEGORIES = Object.keys(categoryLabels) as JobCategory[];
const REGIONS = Object.keys(regionLabels) as Region[];

export function PostForm({ locale, t, commonT, authT }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { region: "yerevan", phone: "", contactMethod: "phone" },
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const contactPhone = toE164AmPhone(data.phone);
    if (!contactPhone) {
      setServerError(t.errors.phoneInvalid);
      return;
    }
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          price: data.price || undefined,
          region: data.region,
          address: data.address,
          date: data.date || undefined,
          time: data.time || undefined,
          contactPhone,
          contactMethod: data.contactMethod,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(json.error ?? t.errorText);
        return;
      }
      setSuccess(true);
    } catch {
      setServerError(t.errorText);
    }
  }

  function goToJobs() {
    router.push(routes.jobs(locale));
    router.refresh();
  }

  if (status === "loading") {
    return (
      <div className="mt-8 flex items-center justify-center py-12">
        <p className={ui.textMuted}>{commonT.loading}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mt-8 flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent-soft)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--accent-strong)]">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t.authRequired}</h2>
          <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{t.authRequiredHint}</p>
        </div>
        <SignInButton
          label={authT.button}
          callbackUrl={routes.dashboard(locale)}
          className={`inline-flex items-center gap-3 rounded-full border-2 border-[color:var(--border)] bg-[color:var(--panel-muted)] px-5 py-2.5 text-sm font-semibold transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]`}
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t.successTitle}</h2>
          <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{t.successText}</p>
        </div>
        <button type="button" onClick={goToJobs} className={ui.buttonPrimary}>
          {commonT.backToJobs}
        </button>
      </div>
    );
  }

  function fieldClass(hasError: boolean) {
    return hasError ? ui.fieldInvalid : ui.field;
  }

  function selectClass(hasError: boolean) {
    return `${fieldClass(hasError)} min-h-12 appearance-none pe-12`;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{t.fields.title}</span>
        <input type="text" className={fieldClass(!!errors.title)} {...register("title", { required: t.errors.required })} />
        {errors.title ? <span className="text-xs text-red-500">{errors.title.message}</span> : null}
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{t.fields.phone}</span>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: t.errors.required,
            validate: (v) => (toE164AmPhone(v || "") !== null ? true : t.errors.phoneInvalid),
          }}
          render={({ field }) => (
            <PatternFormat
              format="+374 ## ### ###"
              allowEmptyFormatting
              mask="_"
              type="tel"
              className={fieldClass(!!errors.phone)}
              value={field.value}
              onBlur={field.onBlur}
              getInputRef={field.ref}
              onValueChange={(vals) => {
                field.onChange(vals.formattedValue);
              }}
            />
          )}
        />
        {errors.phone ? <span className="text-xs text-red-500">{errors.phone.message}</span> : null}
      </label>

      <fieldset className="flex flex-col gap-3 sm:col-span-2">
        <legend className="text-sm font-semibold">{t.contactMethodLabel}</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="phone" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{t.contactByCall}</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="telegram" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{t.contactByTelegram}</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="whatsapp" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{t.contactByWhatsApp}</span>
          </label>
        </div>
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{t.contactPhoneHint}</p>
      </fieldset>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{t.fields.description}</span>
        <textarea rows={3} className={ui.field} {...register("description")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.category}</span>
        <div className="relative">
          <select className={selectClass(!!errors.category)} {...register("category", { required: t.errors.required })}>
            <option value="">{t.placeholders.category}</option>
            {CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {categoryLabels[key][locale]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[color:var(--muted)]">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {errors.category ? <span className="text-xs text-red-500">{errors.category.message}</span> : null}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.region}</span>
        <div className="relative">
          <select className={selectClass(!!errors.region)} {...register("region", { required: t.errors.required })}>
            {REGIONS.map((key) => (
              <option key={key} value={key}>
                {regionLabels[key][locale]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[color:var(--muted)]">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {errors.region ? <span className="text-xs text-red-500">{errors.region.message}</span> : null}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.price}</span>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`${ui.field} min-h-12 pe-18`}
            {...register("price", {
              onChange: (event) => {
                event.target.value = event.target.value.replace(/\D+/g, "");
              },
            })}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-[color:var(--muted)]">
            dram
          </span>
        </div>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.address}</span>
        <input type="text" className={fieldClass(!!errors.address)} {...register("address", { required: t.errors.required })} />
        {errors.address ? <span className="text-xs text-red-500">{errors.address.message}</span> : null}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.date}</span>
        <input type="date" className={`${ui.field} min-h-12`} {...register("date")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.time}</span>
        <input type="time" className={`${ui.field} min-h-12`} {...register("time")} />
      </label>

      {serverError ? (
        <div className="sm:col-span-2 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {serverError}
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className={`w-full ${ui.buttonPrimary} disabled:opacity-60`}>
          {isSubmitting ? "..." : t.submit}
        </button>
      </div>
    </form>
  );
}
