import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionLink } from "@/components/section-link";
import { ResumeCard } from "@/entities/resume/ui/resume-card";
import { WorkersFiltersLayout } from "@/features/filter-workers/ui/workers-filters-layout";
import { JobsPageActions } from "@/features/jobs-list/ui/jobs-page-actions";
import { prisma } from "@/lib/prisma";
import { parseCommaListParam } from "@/lib/query-filters";
import { routes, workersListWithQuery, type WorkersListQuery } from "@/lib/routes";
import { ui } from "@/components/ui/styles";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { WORKERS_PAGE_SIZE, parseWorkersPage, parseWorkersSortOrder } from "@/lib/workers-list";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { WorkersNavProvider } from "@/features/workers-list/ui/workers-nav-provider";
import { WorkersSortBar } from "@/features/workers-list/ui/workers-sort-bar";
import { WorkersPagination } from "@/features/workers-list/ui/workers-pagination";
import type { LocalePageProps } from "@/types/props";
import type { JobCategory, Region } from "@/types/jobs";

export const revalidate = 0;

type WorkersPageProps = LocalePageProps & {
  searchParams: Promise<{
    category?: string;
    region?: string;
    page?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: WorkersPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);
  const sp = await searchParams;

  return pageMetadata({
    locale,
    pathname: "/workers",
    title: d.workers.title,
    description: d.workers.subtitle,
    noIndex: Boolean(sp.category) || Boolean(sp.region) || sp.sort === "old" || (sp.page !== undefined && sp.page !== "1"),
  });
}

export default async function WorkersPage({ params, searchParams }: WorkersPageProps) {
  const { locale: rawLocale } = await params;
  const sp = await searchParams;
  const { category, region, page: pageParam, sort: sortParam } = sp;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);

  const categoryList = parseCommaListParam(category);
  const regionList = parseCommaListParam(region);
  const categoryQuery = categoryList.length > 0 ? categoryList.join(",") : undefined;
  const regionQuery = regionList.length > 0 ? regionList.join(",") : undefined;
  const sortOld = sortParam === "old";

  const baseQuery: WorkersListQuery = {
    category: categoryQuery,
    region: regionQuery,
    sort: sortOld ? "old" : undefined,
  };

  const page = parseWorkersPage(pageParam);
  const sortOrder = parseWorkersSortOrder(sortOld ? "old" : undefined);

  const where = {
    status: "active" as const,
    ...(categoryList.length > 0 && { category: { in: categoryList } }),
    ...(regionList.length > 0 && { region: { in: regionList } }),
  };

  const skip = (page - 1) * WORKERS_PAGE_SIZE;

  const [total, resumes] = await prisma.$transaction([
    prisma.resume.count({ where }),
    prisma.resume.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: sortOrder },
      skip,
      take: WORKERS_PAGE_SIZE,
    }),
  ]);

  if (total === 0 && page > 1) {
    redirect(workersListWithQuery(locale, baseQuery));
  }

  const totalPages = total === 0 ? 0 : Math.ceil(total / WORKERS_PAGE_SIZE);

  if (total > 0 && page > totalPages) {
    redirect(
      workersListWithQuery(locale, {
        ...baseQuery,
        page: totalPages > 1 ? totalPages : undefined,
      }),
    );
  }

  const categoryItems = (Object.keys(categoryLabels) as JobCategory[]).map((key) => ({
    key,
    label: categoryLabels[key][locale],
  }));

  const regionItems = (Object.keys(regionLabels) as Region[]).map((key) => ({
    key,
    label: regionLabels[key][locale],
  }));

  const filterQueryForSort: Pick<WorkersListQuery, "category" | "region"> = {
    category: categoryQuery,
    region: regionQuery,
  };
  const hasAppliedFilters = categoryList.length > 0 || regionList.length > 0;

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.home(locale)} label={d.common.backToHome} />

      <WorkersNavProvider>
        <WorkersFiltersLayout
          categories={categoryItems}
          regions={regionItems}
          openFilters={d.workers.openFilters}
          filtersTitle={d.workers.filtersTitle}
          categoriesTitle={d.jobs.filtersTitle}
          regionsTitle={d.workers.regionsTitle}
          clearFilters={d.workers.clearFilters}
          applyFilters={d.workers.applyFilters}
        >
          <section className={`${ui.panel} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
            <div>
              <h1 className="text-2xl font-semibold">{d.workers.title}</h1>
              <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{d.workers.subtitle}</p>
            </div>
            <JobsPageActions
              locale={locale}
              dashboardLabel={d.dashboard.cabinetLink}
              createTaskLabel={d.common.createResume}
              createHref={routes.workersPost(locale)}
            />
          </section>

          <WorkersSortBar
            locale={locale}
            active={sortOld ? "old" : "new"}
            filters={filterQueryForSort}
            sortByLabel={d.workers.sortBy}
            newestLabel={d.workers.sortNewest}
            oldestLabel={d.workers.sortOldest}
          />

          {resumes.length === 0 ? (
            <div className={`${ui.panel} py-16 text-center`}>
              <p className={`text-lg font-medium ${ui.textMuted}`}>{d.workers.empty}</p>
              <Link href={hasAppliedFilters ? routes.workers(locale) : routes.workersPost(locale)} className={`mt-6 inline-flex ${ui.buttonPrimary}`}>
                {hasAppliedFilters ? d.workers.clearFilters : d.common.createResume}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {resumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    locale={locale}
                    titleLabel={d.workers.titleLabel}
                    rateLabel={d.workers.rateLabel}
                    descriptionLabel={d.workers.descriptionLabel}
                    regionLabel={d.workers.regionLabel}
                    callLabel={d.workers.callButton}
                    telegramLabel={d.workers.contactTelegram}
                    whatsappLabel={d.workers.contactWhatsApp}
                  />
                ))}
              </div>
              <WorkersPagination
                locale={locale}
                currentPage={page}
                totalPages={totalPages}
                baseQuery={baseQuery}
                prevLabel={d.workers.paginationPrev}
                nextLabel={d.workers.paginationNext}
                pageIndicatorTemplate={d.workers.pageIndicator}
              />
            </>
          )}
        </WorkersFiltersLayout>
      </WorkersNavProvider>
    </main>
  );
}
