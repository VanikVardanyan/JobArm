"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { PatternFormat } from "react-number-format";
import { SignInButton } from "@/features/auth/ui/sign-in-button";
import { trackEvent } from "@/lib/analytics";
import { ui } from "@/components/ui/styles";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { toE164AmPhone } from "@/lib/phone";
import { routes } from "@/lib/routes";
import type { Locale, TranslationTree } from "@/types/i18n";
import type { ContactMethod, JobCategory, Region } from "@/types/jobs";

type Props = {
  locale: Locale;
  t: TranslationTree["resume"];
  commonT: Pick<TranslationTree["common"], "loading" | "browseWorkers">;
  authT: TranslationTree["auth"];
};

type FormValues = {
  title: string;
  description: string;
  category: JobCategory | "";
  price: string;
  region: Region;
  phone: string;
  contactMethod: ContactMethod;
  publicContactName: string;
};

const CATEGORIES = Object.keys(categoryLabels) as JobCategory[];
const REGIONS = Object.keys(regionLabels) as Region[];

export function ResumeForm({ locale, t, commonT, authT }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      region: "yerevan",
      phone: "",
      contactMethod: "phone",
      publicContactName: "",
    },
  });

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    if (getValues("publicContactName").trim().length > 0) {
      return;
    }
    const nextName = session.user?.name?.trim();
    if (nextName) {
      setValue("publicContactName", nextName, { shouldDirty: false });
    }
  }, [getValues, session, setValue, status]);

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const contactPhone = toE164AmPhone(data.phone);
    if (!contactPhone) {
      setServerError(t.errors.phoneInvalid);
      return;
    }

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          price: data.price || undefined,
          region: data.region,
          contactPhone,
          contactMethod: data.contactMethod,
          publicContactName: data.publicContactName || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(json.error ?? t.errorText);
        trackEvent("resume_create_error", {
          locale,
          contact_method: data.contactMethod,
          region: data.region,
          category: data.category || "unknown",
        });
        return;
      }

      trackEvent("resume_create_success", {
        locale,
        contact_method: data.contactMethod,
        region: data.region,
        category: data.category || "unknown",
        has_price: Boolean(data.price),
      });
      setSuccess(true);
    } catch {
      setServerError(t.errorText);
    }
  }

  function goToWorkers() {
    router.push(routes.workers(locale));
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
        <div>
          <h2 className="text-lg font-semibold">{t.authRequired}</h2>
          <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{t.authRequiredHint}</p>
        </div>
        <SignInButton
          label={authT.button}
          callbackUrl={routes.dashboard(locale)}
          className="w-full justify-center gap-2 sm:w-auto"
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center gap-5 py-10 text-center">
        <div>
          <h2 className="text-lg font-semibold">{t.successTitle}</h2>
          <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{t.successText}</p>
        </div>
        <button type="button" onClick={goToWorkers} className={ui.buttonPrimary}>
          {commonT.browseWorkers}
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
        <span className="text-sm font-semibold">{t.fields.publicContactName}</span>
        <input type="text" className={ui.field} {...register("publicContactName")} />
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{t.publicContactNameHint}</p>
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
              onValueChange={(vals) => field.onChange(vals.formattedValue)}
            />
          )}
        />
      </label>

      <fieldset className="flex flex-col gap-3 sm:col-span-2">
        <legend className="text-sm font-semibold">{t.contactMethodLabel}</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(["phone", "telegram", "whatsapp"] as const).map((method) => (
            <label
              key={method}
              className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
            >
              <input type="radio" value={method} className="h-4 w-4 shrink-0" {...register("contactMethod")} />
              <span>{method === "phone" ? t.contactByCall : method === "telegram" ? t.contactByTelegram : t.contactByWhatsApp}</span>
            </label>
          ))}
        </div>
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{t.contactPhoneHint}</p>
      </fieldset>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{t.fields.description}</span>
        <textarea rows={4} className={ui.field} {...register("description")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.category}</span>
        <div className="relative">
          <select className={selectClass(!!errors.category)} {...register("category", { required: t.errors.required })}>
            <option value="">{t.placeholders.category}</option>
            {CATEGORIES.map((key) => (
              <option key={key} value={key}>{categoryLabels[key][locale]}</option>
            ))}
          </select>
        </div>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{t.fields.region}</span>
        <div className="relative">
          <select className={selectClass(!!errors.region)} {...register("region", { required: t.errors.required })}>
            {REGIONS.map((key) => (
              <option key={key} value={key}>{regionLabels[key][locale]}</option>
            ))}
          </select>
        </div>
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{t.fields.price}</span>
        <input type="text" className={ui.field} {...register("price")} />
      </label>

      {serverError ? (
        <div className="sm:col-span-2 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
