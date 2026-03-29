import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";

export default function RootPage() {
  redirect(routes.home(defaultLocale));
}
