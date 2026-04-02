"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui/styles";
import { trackEvent } from "@/lib/analytics";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { normalizeContactMethod } from "@/lib/contact-links";
import { toE164AmPhone } from "@/lib/phone";
import { routes } from "@/lib/routes";
import type { Locale, TranslationTree } from "@/types/i18n";
import type { ContactMethod, JobCategory, Region, ResumeRecord } from "@/types/jobs";

type Props = {
  resume: Omit<ResumeRecord, "createdAt">;
  locale: Locale;
  resumeT: TranslationTree["resume"];
  dashT: TranslationTree["dashboard"];
};

type FormValues = {
  title: string;
  description: string;
  category: JobCategory;
  price: string;
  region: Region;
  phone: string;
  contactMethod: ContactMethod;
  publicContactName: string;
};

const CATEGORIES = Object.keys(categoryLabels) as JobCategory[];
const REGIONS = Object.keys(regionLabels) as Region[];

export function EditResumeForm({ resume, locale, resumeT, dashT }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: resume.title,
      description: resume.description ?? "",
      category: resume.category as JobCategory,
      price: resume.price ?? "",
      region: resume.region as Region,
      phone: resume.contactPhone,
      contactMethod: normalizeContactMethod(resume.contactMethod),
      publicContactName: resume.publicContactName ?? resume.author.name ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const contactPhone = toE164AmPhone(data.phone);
    if (!contactPhone) {
      setServerError(resumeT.errors.phoneInvalid);
      return;
    }

    const res = await fetch(`/api/resumes/${resume.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        category: data.category,
        price: data.price || null,
        region: data.region,
        contactPhone,
        contactMethod: data.contactMethod,
        publicContactName: data.publicContactName || null,
      }),
    });

    if (!res.ok) {
      setServerError(dashT.updateResumeError);
      return;
    }

    trackEvent("resume_update_success", {
      locale,
      resume_id: resume.id,
      contact_method: data.contactMethod,
      region: data.region,
      category: data.category,
    });
    setSuccess(true);
    setTimeout(() => {
      router.push(routes.dashboard(locale));
      router.refresh();
    }, 1200);
  }

  function fieldClass(hasError: boolean) {
    return hasError ? ui.fieldInvalid : ui.field;
  }

  if (success) {
    return <div className="py-10 text-center font-semibold">{dashT.updateResumeSuccess}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{resumeT.fields.title}</span>
        <input type="text" className={fieldClass(!!errors.title)} {...register("title", { required: resumeT.errors.required })} />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{resumeT.fields.publicContactName}</span>
        <input type="text" className={ui.field} {...register("publicContactName")} />
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{resumeT.publicContactNameHint}</p>
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{resumeT.fields.phone}</span>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: resumeT.errors.required,
            validate: (v) => (toE164AmPhone(v || "") !== null ? true : resumeT.errors.phoneInvalid),
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
        <legend className="text-sm font-semibold">{resumeT.contactMethodLabel}</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(["phone", "telegram", "whatsapp"] as const).map((method) => (
            <label
              key={method}
              className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
            >
              <input type="radio" value={method} className="h-4 w-4 shrink-0" {...register("contactMethod")} />
              <span>{method === "phone" ? resumeT.contactByCall : method === "telegram" ? resumeT.contactByTelegram : resumeT.contactByWhatsApp}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{resumeT.fields.description}</span>
        <textarea rows={4} className={ui.field} {...register("description")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{resumeT.fields.category}</span>
        <select className={ui.field} {...register("category", { required: resumeT.errors.required })}>
          {CATEGORIES.map((key) => (
            <option key={key} value={key}>{categoryLabels[key][locale]}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{resumeT.fields.region}</span>
        <select className={ui.field} {...register("region", { required: resumeT.errors.required })}>
          {REGIONS.map((key) => (
            <option key={key} value={key}>{regionLabels[key][locale]}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{resumeT.fields.price}</span>
        <input type="text" className={ui.field} {...register("price")} />
      </label>

      {serverError ? (
        <div className="sm:col-span-2 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className={`w-full ${ui.buttonPrimary} disabled:opacity-60`}>
          {isSubmitting ? "..." : dashT.saveChanges}
        </button>
      </div>
    </form>
  );
}
