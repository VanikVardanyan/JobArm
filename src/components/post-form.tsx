"use client";

import { useForm } from "react-hook-form";
import { ui } from "@/components/ui/styles";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import type { Locale, TranslationTree } from "@/types/i18n";
import type { JobCategory, Region } from "@/types/jobs";

type Props = {
  locale: Locale;
  t: TranslationTree["post"];
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
};

const PHONE_RE = /^\+?[0-9\s\-()+]{7,15}$/;
const CATEGORIES = Object.keys(categoryLabels) as JobCategory[];
const REGIONS = Object.keys(regionLabels) as Region[];

export function PostForm({ locale, t }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { region: "yerevan" },
  });

  function onSubmit(data: FormValues) {
    // TODO: connect to backend
    console.log("submit", data);
  }

  function fieldClass(hasError: boolean) {
    return hasError ? ui.fieldInvalid : ui.field;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
      {/* Title */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.title}
        </span>
        <input
          type="text"
          className={fieldClass(!!errors.title)}
          {...register("title", { required: t.errors.required })}
        />
        {errors.title && (
          <span className="text-xs text-red-500">{errors.title.message}</span>
        )}
      </label>

      {/* Phone */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.phone}
        </span>
        <input
          type="tel"
          className={fieldClass(!!errors.phone)}
          {...register("phone", {
            required: t.errors.required,
            pattern: { value: PHONE_RE, message: t.errors.phoneInvalid },
          })}
        />
        {errors.phone && (
          <span className="text-xs text-red-500">{errors.phone.message}</span>
        )}
      </label>

      {/* Description */}
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.description}
        </span>
        <textarea
          rows={5}
          className={ui.field}
          {...register("description")}
        />
      </label>

      {/* Category */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.category}
        </span>
        <select
          className={fieldClass(!!errors.category)}
          {...register("category", { required: t.errors.required })}
        >
          <option value="">{t.placeholders.category}</option>
          {CATEGORIES.map((key) => (
            <option key={key} value={key}>
              {categoryLabels[key][locale]}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="text-xs text-red-500">{errors.category.message}</span>
        )}
      </label>

      {/* Region */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.region}
        </span>
        <select
          className={fieldClass(!!errors.region)}
          {...register("region", { required: t.errors.required })}
        >
          {REGIONS.map((key) => (
            <option key={key} value={key}>
              {regionLabels[key][locale]}
            </option>
          ))}
        </select>
        {errors.region && (
          <span className="text-xs text-red-500">{errors.region.message}</span>
        )}
      </label>

      {/* Price */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.price}
        </span>
        <input
          type="text"
          className={ui.field}
          {...register("price")}
        />
      </label>

      {/* Address */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.address}
        </span>
        <input
          type="text"
          className={fieldClass(!!errors.address)}
          {...register("address", { required: t.errors.required })}
        />
        {errors.address && (
          <span className="text-xs text-red-500">{errors.address.message}</span>
        )}
      </label>

      {/* Date */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.date}
        </span>
        <input
          type="date"
          className={ui.field}
          {...register("date")}
        />
      </label>

      {/* Time */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[color:var(--foreground)]">
          {t.fields.time}
        </span>
        <input
          type="time"
          className={ui.field}
          {...register("time")}
        />
      </label>

      <div className="sm:col-span-2">
        <button type="submit" className={`w-full ${ui.buttonPrimary}`}>
          {t.submit}
        </button>
        <p className={`mt-4 text-sm leading-7 ${ui.textMuted}`}>
          {t.loginHint}
        </p>
      </div>
    </form>
  );
}
