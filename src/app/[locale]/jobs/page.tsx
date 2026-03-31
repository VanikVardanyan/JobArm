import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SectionLink } from "@/components/section-link";
import { JobCard, type DbJob } from "@/entities/job/ui/job-card";
import { JobsFiltersLayout } from "@/features/filter-jobs/ui/jobs-filters-layout";
import { JobsNavProvider } from "@/features/jobs-list/ui/jobs-nav-provider";
import { JobsPagination } from "@/features/jobs-list/ui/jobs-pagination";
import { JobsSortBar } from "@/features/jobs-list/ui/jobs-sort-bar";
import { categoryLabels, regionLabels } from "@/lib/jobs";
import { JOBS_PAGE_SIZE, parseJobsPage, parseJobsSortOrder } from "@/lib/jobs-list";
import { prisma } from "@/lib/prisma";
import { parseCommaListParam } from "@/lib/query-filters";
import { jobsListWithQuery, type JobsListQuery, routes } from "@/lib/routes";
import { ui } from "@/components/ui/styles";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { authOptions } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import type { LocalePageProps } from "@/types/props";
import type { JobCategory, Region } from "@/types/jobs";

export const revalidate = 0;

type JobsPageProps = LocalePageProps & {
  searchParams: Promise<{
    category?: string;
    region?: string;
    urgent?: string;
    page?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: JobsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);
  const sp = await searchParams;

  const hasFilters =
    Boolean(sp.category) ||
    Boolean(sp.region) ||
    sp.urgent === "true" ||
    sp.sort === "old" ||
    (sp.page !== undefined && sp.page !== "1");

  return pageMetadata({
    locale,
    pathname: "/jobs",
    title: d.jobs.title,
    description: d.jobs.subtitle,
    noIndex: hasFilters,
  });
}

export default async function JobsPage({ params, searchParams }: JobsPageProps) {
  const { locale: rawLocale } = await params;
  const sp = await searchParams;
  const { category, region, urgent, page: pageParam, sort: sortParam } = sp;

  const locale = getLocale(rawLocale);
  const d = getDictionary(locale);
  const session = await getServerSession(authOptions);

  const categoryList = parseCommaListParam(category);
  const regionList = parseCommaListParam(region);

  const categoryQuery = categoryList.length > 0 ? categoryList.join(",") : undefined;
  const regionQuery = regionList.length > 0 ? regionList.join(",") : undefined;
  const urgentQuery = urgent === "true" ? "true" : undefined;
  const sortOld = sortParam === "old";

  const baseQuery: JobsListQuery = {
    category: categoryQuery,
    region: regionQuery,
    urgent: urgentQuery,
    sort: sortOld ? "old" : undefined,
  };

  const page = parseJobsPage(pageParam);
  const sortOrder = parseJobsSortOrder(sortOld ? "old" : undefined);

  const where = {
    status: "active" as const,
    ...(categoryList.length > 0 && { category: { in: categoryList } }),
    ...(regionList.length > 0 && { region: { in: regionList } }),
    ...(urgent === "true" && { isUrgent: true }),
  };

  const total = await prisma.job.count({ where });

  if (total === 0 && page > 1) {
    redirect(jobsListWithQuery(locale, baseQuery));
  }

  const totalPages = total === 0 ? 0 : Math.ceil(total / JOBS_PAGE_SIZE);

  if (total > 0 && page > totalPages) {
    redirect(
      jobsListWithQuery(locale, {
        ...baseQuery,
        page: totalPages > 1 ? totalPages : undefined,
      }),
    );
  }

  const skip = (page - 1) * JOBS_PAGE_SIZE;

  const jobs: DbJob[] = await prisma.job.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: sortOrder },
    skip,
    take: JOBS_PAGE_SIZE,
  });

  const categoryItems = (Object.keys(categoryLabels) as JobCategory[]).map((key) => ({
    key,
    label: categoryLabels[key][locale],
  }));

  const regionItems = (Object.keys(regionLabels) as Region[]).map((key) => ({
    key,
    label: regionLabels[key][locale],
  }));

  const filterQueryForSort: Pick<JobsListQuery, "category" | "region" | "urgent"> = {
    category: categoryQuery,
    region: regionQuery,
    urgent: urgentQuery,
  };

  const hasAppliedFilters =
    categoryList.length > 0 || regionList.length > 0 || urgent === "true";

  const listSection =
    jobs.length === 0 ? (
      <div className={`${ui.panel} py-16 text-center`}>
        <p className={`text-lg font-medium ${ui.textMuted}`}>
          {hasAppliedFilters ? d.jobs.emptyFiltered : d.jobs.empty}
        </p>
        {hasAppliedFilters ? (
          <Link href={routes.jobs(locale)} className={`mt-6 inline-flex ${ui.buttonPrimary}`}>
            {d.jobs.clearFilters}
          </Link>
        ) : (
          <Link href={routes.post(locale)} className={`mt-6 inline-flex ${ui.buttonPrimary}`}>
            {d.common.createTask}
          </Link>
        )}
      </div>
    ) : (
      <>
        <div className="grid gap-4 sm:grid-cols-2" data-tour="jobs-list">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              locale={locale}
              urgentLabel={d.common.urgent}
              titleLabel={d.jobs.titleLabel}
              budgetLabel={d.jobs.budgetLabel}
              descriptionLabel={d.jobs.descriptionLabel}
              addressLabel={d.jobs.addressLabel}
              regionLabel={d.jobs.regionLabel}
              callLabel={d.jobs.callButton}
              telegramLabel={d.jobs.contactTelegram}
              whatsappLabel={d.jobs.contactWhatsApp}
              showMoreLabel={d.jobs.showMoreDescription}
              descriptionModalTitle={d.jobs.descriptionModalTitle}
              closeModalLabel={d.jobs.closeModal}
            />
          ))}
        </div>
        <JobsPagination
          locale={locale}
          currentPage={page}
          totalPages={totalPages}
          baseQuery={baseQuery}
          prevLabel={d.jobs.paginationPrev}
          nextLabel={d.jobs.paginationNext}
          pageIndicatorTemplate={d.jobs.pageIndicator}
        />
      </>
    );

  return (
    <main className="flex flex-col gap-6 pb-12">
      <SectionLink href={routes.home(locale)} label={d.common.backToHome} />

      <Suspense fallback={<div className={`${ui.textMuted} text-sm`}>{d.common.loading}</div>}>
        <JobsNavProvider>
          <JobsFiltersLayout
            categories={categoryItems}
            regions={regionItems}
            openFilters={d.jobs.openFilters}
            filtersTitle={d.jobs.filtersTitle}
            categoriesTitle={d.jobs.filtersTitle}
            regionsTitle={d.jobs.regionsTitle}
            urgentLabel={d.common.urgent}
            clearFilters={d.jobs.clearFilters}
            applyFilters={d.jobs.applyFilters}
          >
            <div className={`${ui.panel} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
              <div>
                <h1 className="text-2xl font-semibold">{d.jobs.title}</h1>
                <p className={`mt-2 text-sm leading-7 ${ui.textMuted}`}>{d.jobs.subtitle}</p>
              </div>
              {session?.user ? (
                <div className="flex flex-wrap gap-3">
                  <Link href={routes.dashboard(locale)} className={`inline-flex shrink-0 ${ui.buttonSecondary}`}>
                    {d.dashboard.title}
                  </Link>
                  <Link href={routes.post(locale)} className={`inline-flex shrink-0 ${ui.buttonPrimary}`} data-tour="jobs-create">
                    {d.common.createTask}
                  </Link>
                </div>
              ) : null}
            </div>

            <JobsSortBar
              locale={locale}
              active={sortOld ? "old" : "new"}
              filters={filterQueryForSort}
              sortByLabel={d.jobs.sortBy}
              newestLabel={d.jobs.sortNewest}
              oldestLabel={d.jobs.sortOldest}
            />

            {listSection}
          </JobsFiltersLayout>
        </JobsNavProvider>
      </Suspense>
    </main>
  );
}
