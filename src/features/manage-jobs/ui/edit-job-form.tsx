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
import type { ContactMethod, JobCategory, Region } from "@/types/jobs";

type Job = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: string | null;
  region: string;
  address: string;
  date: string | null;
  time: string | null;
  isUrgent: boolean;
  contactPhone: string;
  contactMethod: string;
  publicContactName: string | null;
  author: { name: string | null };
};

type Props = {
  job: Job;
  locale: Locale;
  postT: TranslationTree["post"];
  dashT: TranslationTree["dashboard"];
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  price: string;
  region: string;
  address: string;
  date: string;
  time: string;
  phone: string;
  contactMethod: ContactMethod;
  publicContactName: string;
};

const CATEGORIES = Object.keys(categoryLabels) as JobCategory[];
const REGIONS = Object.keys(regionLabels) as Region[];

export function EditJobForm({ job, locale, postT, dashT }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: job.title,
      description: job.description ?? "",
      category: job.category,
      price: job.price ?? "",
      region: job.region,
      address: job.address,
      date: job.date ?? "",
      time: job.time ?? "",
      phone: job.contactPhone,
      contactMethod: normalizeContactMethod(job.contactMethod),
      publicContactName: job.publicContactName ?? job.author.name ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const contactPhone = toE164AmPhone(data.phone);
    if (!contactPhone) {
      setServerError(postT.errors.phoneInvalid);
      return;
    }
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        category: data.category,
        price: data.price || null,
        region: data.region,
        address: data.address,
        date: data.date || null,
        time: data.time || null,
        contactPhone,
        contactMethod: data.contactMethod,
        publicContactName: data.publicContactName || null,
      }),
    });

    if (!res.ok) { setServerError(dashT.updateError); return; }
    trackEvent("job_update_success", {
      locale,
      job_id: job.id,
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
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="font-semibold">{dashT.updateSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.title}</span>
        <input type="text" className={fieldClass(!!errors.title)}
          {...register("title", { required: postT.errors.required })} />
        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.publicContactName}</span>
        <input type="text" className={ui.field} {...register("publicContactName")} />
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{postT.publicContactNameHint}</p>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.phone}</span>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: postT.errors.required,
            validate: (v) => (toE164AmPhone(v || "") !== null ? true : postT.errors.phoneInvalid),
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
        {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
      </label>

      <fieldset className="flex flex-col gap-3 sm:col-span-2">
        <legend className="text-sm font-semibold">{postT.contactMethodLabel}</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="phone" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{postT.contactByCall}</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="telegram" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{postT.contactByTelegram}</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-[1.25rem] border border-[color:var(--border)] px-4 py-3 text-sm font-medium ${ui.textMuted} has-[:checked]:border-[color:var(--accent)] has-[:checked]:bg-[color:var(--accent-soft)] has-[:checked]:text-[color:var(--accent-strong)]`}
          >
            <input type="radio" value="whatsapp" className="h-4 w-4 shrink-0" {...register("contactMethod")} />
            <span>{postT.contactByWhatsApp}</span>
          </label>
        </div>
        <p className={`text-xs leading-relaxed ${ui.textMuted}`}>{postT.contactPhoneHint}</p>
      </fieldset>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">{postT.fields.description}</span>
        <textarea rows={4} className={ui.field} {...register("description")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.category}</span>
        <select className={fieldClass(!!errors.category)}
          {...register("category", { required: postT.errors.required })}>
          {CATEGORIES.map((key) => (
            <option key={key} value={key}>{categoryLabels[key][locale]}</option>
          ))}
        </select>
        {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.region}</span>
        <select className={ui.field} {...register("region")}>
          {REGIONS.map((key) => (
            <option key={key} value={key}>{regionLabels[key][locale]}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.price}</span>
        <input type="text" className={ui.field} {...register("price")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.address}</span>
        <input type="text" className={fieldClass(!!errors.address)}
          {...register("address", { required: postT.errors.required })} />
        {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.date}</span>
        <input type="date" className={ui.field} {...register("date")} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{postT.fields.time}</span>
        <input type="time" className={ui.field} {...register("time")} />
      </label>

      {serverError && (
        <div className="sm:col-span-2 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting}
          className={`w-full ${ui.buttonPrimary} disabled:opacity-60`}>
          {isSubmitting ? "..." : dashT.saveChanges}
        </button>
      </div>
    </form>
  );
}
