import Link from "next/link";
import { ui } from "@/components/ui/styles";
import type { SectionLinkProps } from "@/types/props";

export function SectionLink({ href, label }: SectionLinkProps) {
  return <Link href={href} className={ui.backLink}>{label}</Link>;
}
