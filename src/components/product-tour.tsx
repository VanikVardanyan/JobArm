"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ui } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Locale } from "@/types/i18n";

type TourStep = {
  selector?: string;
  title: string;
  body: string;
};

type TourCopy = {
  skip: string;
  next: string;
  done: string;
  step: string;
  steps: {
    default: TourStep[];
    home: TourStep[];
    jobs: TourStep[];
    post: TourStep[];
    dashboard: TourStep[];
  };
};

const TOUR_STORAGE_KEY = "jobarm-product-tour-v1";

const tourCopy: Record<Locale, TourCopy> = {
  hy: {
    skip: "Բաց թողնել",
    next: "Հաջորդը",
    done: "Փակել",
    step: "Քայլ",
    steps: {
      default: [
        {
          selector: '[data-tour="header-brand"]',
          title: "Գլխավոր նավիգացիա",
          body: "Այստեղից կարող եք վերադառնալ գլխավոր էջ և շարունակել աշխատանքը հարթակում։",
        },
      ],
      home: [
        {
          selector: '[data-tour="home-publish"]',
          title: "Ստեղծեք նոր հայտ",
          body: "Եթե արդեն մուտք եք գործել, այս կոճակով արագ կանցնեք հայտի ստեղծման ձևին։",
        },
        {
          selector: '[data-tour="home-browse"]',
          title: "Դիտեք հայտերը",
          body: "Բացեք ակտիվ հայտերի ցանկը, ֆիլտրեք և կապ հաստատեք անմիջապես քարտից։",
        },
      ],
      jobs: [
        {
          selector: '[data-tour="jobs-filters"]',
          title: "Ֆիլտրեր",
          body: "Ընտրեք կատեգորիա, շրջան կամ շտապ հայտեր, որպեսզի արագ գտնեք պետք եղածը։",
        },
        {
          selector: '[data-tour="jobs-create"]',
          title: "Ստեղծել հայտ",
          body: "Մուտք գործած օգտատերը կարող է նաև այստեղից անմիջապես ստեղծել նոր հայտ։",
        },
        {
          selector: '[data-tour="jobs-list"]',
          title: "Հայտերի քարտեր",
          body: "Քարտում երևում են վերնագիրը, բյուջեն, նկարագրությունը, հասցեն և կապի կոճակը։",
        },
      ],
      post: [
        {
          selector: '[data-tour="post-form"]',
          title: "Հայտի ձև",
          body: "Լրացրեք հիմնական տվյալները, կոնտակտը և հասցեն, որպեսզի հայտը հրապարակվի ժապավենում։",
        },
        {
          selector: '[data-tour="post-submit"]',
          title: "Հրապարակել",
          body: "Ուղարկումից հետո հայտը կավելանա ցուցակին, և դուք կկարողանաք անմիջապես տեսնել այն։",
        },
      ],
      dashboard: [
        {
          selector: '[data-tour="dashboard-add"]',
          title: "Նոր հայտ",
          body: "Ձեր աշխատասենյակից կարող եք արագ ստեղծել նոր հայտ։",
        },
        {
          selector: '[data-tour="dashboard-list"]',
          title: "Իմ հայտերը",
          body: "Այստեղ կարող եք խմբագրել, փակել կամ նորից ակտիվացնել ձեր հայտարարությունները։",
        },
      ],
    },
  },
  ru: {
    skip: "Пропустить",
    next: "Дальше",
    done: "Готово",
    step: "Шаг",
    steps: {
      default: [
        {
          selector: '[data-tour="header-brand"]',
          title: "Главная навигация",
          body: "Отсюда можно вернуться на главную и продолжить работу по сервису.",
        },
      ],
      home: [
        {
          selector: '[data-tour="home-publish"]',
          title: "Создать заявку",
          body: "Если вы уже вошли, эта кнопка быстро переведет вас к форме создания заявки.",
        },
        {
          selector: '[data-tour="home-browse"]',
          title: "Смотреть заявки",
          body: "Откройте список активных заявок, фильтруйте их и связывайтесь прямо из карточки.",
        },
      ],
      jobs: [
        {
          selector: '[data-tour="jobs-filters"]',
          title: "Фильтры",
          body: "Выбирайте категорию, регион и срочность, чтобы быстрее найти нужные заявки.",
        },
        {
          selector: '[data-tour="jobs-create"]',
          title: "Создать заявку",
          body: "Авторизованный пользователь может создать новую заявку прямо со страницы списка.",
        },
        {
          selector: '[data-tour="jobs-list"]',
          title: "Карточки заявок",
          body: "В карточке видны заголовок, бюджет, описание, адрес и кнопка связи.",
        },
      ],
      post: [
        {
          selector: '[data-tour="post-form"]',
          title: "Форма заявки",
          body: "Заполните основные данные, контакт и адрес, чтобы заявка появилась в ленте.",
        },
        {
          selector: '[data-tour="post-submit"]',
          title: "Публикация",
          body: "После отправки заявка попадет в список, и вы сразу сможете ее проверить.",
        },
      ],
      dashboard: [
        {
          selector: '[data-tour="dashboard-add"]',
          title: "Новая заявка",
          body: "Из кабинета можно быстро перейти к созданию новой заявки.",
        },
        {
          selector: '[data-tour="dashboard-list"]',
          title: "Мои заявки",
          body: "Здесь можно редактировать, закрывать и повторно открывать свои объявления.",
        },
      ],
    },
  },
  en: {
    skip: "Skip",
    next: "Next",
    done: "Done",
    step: "Step",
    steps: {
      default: [
        {
          selector: '[data-tour="header-brand"]',
          title: "Main navigation",
          body: "Use this area to get back home and continue moving through the product.",
        },
      ],
      home: [
        {
          selector: '[data-tour="home-publish"]',
          title: "Create a task",
          body: "If you are signed in, this takes you straight to the task creation form.",
        },
        {
          selector: '[data-tour="home-browse"]',
          title: "Browse listings",
          body: "Open the active listings feed, apply filters, and contact people from the card.",
        },
      ],
      jobs: [
        {
          selector: '[data-tour="jobs-filters"]',
          title: "Filters",
          body: "Filter by category, region, and urgency to narrow the feed faster.",
        },
        {
          selector: '[data-tour="jobs-create"]',
          title: "Create a task",
          body: "Signed-in users can also create a new task directly from the listings page.",
        },
        {
          selector: '[data-tour="jobs-list"]',
          title: "Listing cards",
          body: "Each card shows the title, budget, description, address, and contact action.",
        },
      ],
      post: [
        {
          selector: '[data-tour="post-form"]',
          title: "Task form",
          body: "Fill out the core details, contact method, and address to publish the task.",
        },
        {
          selector: '[data-tour="post-submit"]',
          title: "Publish",
          body: "After submitting, the task appears in the feed so you can verify it right away.",
        },
      ],
      dashboard: [
        {
          selector: '[data-tour="dashboard-add"]',
          title: "New task",
          body: "Your dashboard gives you a quick path to create another task.",
        },
        {
          selector: '[data-tour="dashboard-list"]',
          title: "My tasks",
          body: "This is where you edit, close, and reopen your own listings.",
        },
      ],
    },
  },
  fa: {
    skip: "رد کردن",
    next: "بعدی",
    done: "بستن",
    step: "مرحله",
    steps: {
      default: [
        {
          selector: '[data-tour="header-brand"]',
          title: "ناوبری اصلی",
          body: "از این بخش می‌توانید به صفحه اصلی برگردید و کار با سرویس را ادامه دهید.",
        },
      ],
      home: [
        {
          selector: '[data-tour="home-publish"]',
          title: "ایجاد درخواست",
          body: "اگر وارد شده باشید، این دکمه شما را مستقیم به فرم ایجاد درخواست می‌برد.",
        },
        {
          selector: '[data-tour="home-browse"]',
          title: "مشاهده فهرست",
          body: "فهرست درخواست‌های فعال را باز کنید، فیلتر بزنید و مستقیم از کارت تماس بگیرید.",
        },
      ],
      jobs: [
        {
          selector: '[data-tour="jobs-filters"]',
          title: "فیلترها",
          body: "با دسته‌بندی، منطقه و فوریت، خیلی سریع‌تر مورد مناسب را پیدا کنید.",
        },
        {
          selector: '[data-tour="jobs-create"]',
          title: "ایجاد درخواست",
          body: "کاربر واردشده می‌تواند از همین صفحه هم درخواست جدید ثبت کند.",
        },
        {
          selector: '[data-tour="jobs-list"]',
          title: "کارت‌های درخواست",
          body: "هر کارت عنوان، بودجه، توضیحات، آدرس و راه تماس را نشان می‌دهد.",
        },
      ],
      post: [
        {
          selector: '[data-tour="post-form"]',
          title: "فرم درخواست",
          body: "جزئیات اصلی، روش تماس و آدرس را پر کنید تا درخواست منتشر شود.",
        },
        {
          selector: '[data-tour="post-submit"]',
          title: "انتشار",
          body: "بعد از ارسال، درخواست در فهرست دیده می‌شود و می‌توانید فوراً آن را بررسی کنید.",
        },
      ],
      dashboard: [
        {
          selector: '[data-tour="dashboard-add"]',
          title: "درخواست جدید",
          body: "از داشبورد خود می‌توانید سریع یک درخواست تازه بسازید.",
        },
        {
          selector: '[data-tour="dashboard-list"]',
          title: "درخواست‌های من",
          body: "در این بخش می‌توانید درخواست‌های خود را ویرایش، ببندید یا دوباره فعال کنید.",
        },
      ],
    },
  },
  hi: {
    skip: "छोड़ें",
    next: "आगे",
    done: "समाप्त",
    step: "चरण",
    steps: {
      default: [
        {
          selector: '[data-tour="header-brand"]',
          title: "मुख्य नेविगेशन",
          body: "यहां से आप होम पर लौट सकते हैं और प्रोडक्ट में आगे बढ़ सकते हैं।",
        },
      ],
      home: [
        {
          selector: '[data-tour="home-publish"]',
          title: "कार्य बनाएँ",
          body: "अगर आप साइन इन हैं, यह बटन आपको सीधे कार्य-निर्माण फ़ॉर्म पर ले जाएगा।",
        },
        {
          selector: '[data-tour="home-browse"]',
          title: "सूची देखें",
          body: "सक्रिय सूचियाँ खोलें, फ़िल्टर लगाएँ और कार्ड से सीधे संपर्क करें।",
        },
      ],
      jobs: [
        {
          selector: '[data-tour="jobs-filters"]',
          title: "फ़िल्टर",
          body: "श्रेणी, क्षेत्र और अर्जेंसी के आधार पर जल्दी सही सूची ढूँढें।",
        },
        {
          selector: '[data-tour="jobs-create"]',
          title: "कार्य बनाएँ",
          body: "साइन-इन उपयोगकर्ता इसी पेज से नई सूची भी बना सकते हैं।",
        },
        {
          selector: '[data-tour="jobs-list"]',
          title: "सूची कार्ड",
          body: "हर कार्ड में शीर्षक, बजट, विवरण, पता और संपर्क बटन दिखता है।",
        },
      ],
      post: [
        {
          selector: '[data-tour="post-form"]',
          title: "कार्य फ़ॉर्म",
          body: "मुख्य जानकारी, संपर्क तरीका और पता भरें ताकि सूची प्रकाशित हो सके।",
        },
        {
          selector: '[data-tour="post-submit"]',
          title: "प्रकाशित करें",
          body: "सबमिट करने के बाद सूची फ़ीड में दिखेगी और आप उसे तुरंत देख सकेंगे।",
        },
      ],
      dashboard: [
        {
          selector: '[data-tour="dashboard-add"]',
          title: "नई सूची",
          body: "डैशबोर्ड से आप बहुत जल्दी नई सूची बना सकते हैं।",
        },
        {
          selector: '[data-tour="dashboard-list"]',
          title: "मेरे कार्य",
          body: "यहाँ आप अपनी सूचियों को एडिट, बंद और फिर से खोल सकते हैं।",
        },
      ],
    },
  },
};

function getStepsForPath(pathname: string, locale: Locale): TourStep[] {
  const copy = tourCopy[locale];
  const localizedPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");

  if (localizedPath === "" || localizedPath === "/") {
    return [...copy.steps.default, ...copy.steps.home];
  }
  if (localizedPath.startsWith("/jobs")) {
    return [...copy.steps.default, ...copy.steps.jobs];
  }
  if (localizedPath.startsWith("/post")) {
    return [...copy.steps.default, ...copy.steps.post];
  }
  if (localizedPath.startsWith("/dashboard")) {
    return [...copy.steps.default, ...copy.steps.dashboard];
  }

  return copy.steps.default;
}

export function ProductTour({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const copy = tourCopy[locale];
  const steps = useMemo(() => getStepsForPath(pathname, locale), [pathname, locale]);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const seen = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!seen) {
      const timer = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleRestart = () => {
      setCurrentStep(0);
      setOpen(true);
    };

    window.addEventListener("jobarm:start-tour", handleRestart);
    return () => window.removeEventListener("jobarm:start-tour", handleRestart);
  }, []);

  useEffect(() => {
    if (!open) {
      setHighlightRect(null);
      return;
    }

    const selector = steps[currentStep]?.selector;
    if (!selector) {
      setHighlightRect(null);
      return;
    }

    const updateRect = () => {
      const target = document.querySelector(selector);
      if (!(target instanceof HTMLElement)) {
        setHighlightRect(null);
        return;
      }
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      window.setTimeout(() => {
        setHighlightRect(target.getBoundingClientRect());
      }, 180);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, currentStep, steps]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeTour() {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "seen");
    setOpen(false);
  }

  function goNext() {
    if (currentStep >= steps.length - 1) {
      closeTour();
      return;
    }
    setCurrentStep((step) => step + 1);
  }

  if (!open || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgba(15,10,6,0.66)] backdrop-blur-[2px]" />
      {highlightRect ? (
        <div
          className="pointer-events-none fixed z-50 rounded-[1.5rem] border-2 border-[color:var(--accent)] shadow-[0_0_0_9999px_rgba(15,10,6,0.52)] transition-all duration-200"
          style={{
            top: Math.max(highlightRect.top - 10, 8),
            left: Math.max(highlightRect.left - 10, 8),
            width: highlightRect.width + 20,
            maxWidth: "calc(100vw - 16px)",
            height: highlightRect.height + 20,
          }}
        />
      ) : null}
      <div className="fixed inset-x-4 bottom-4 z-50 sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div className={cn(ui.panel, "border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5 shadow-2xl")}>
          <div className="flex items-center justify-between gap-3">
            <span className={cn("text-xs font-semibold uppercase tracking-[0.14em]", ui.textMuted)}>
              {copy.step} {currentStep + 1} / {steps.length}
            </span>
            <button type="button" onClick={closeTour} className={cn("text-sm font-semibold", ui.textMuted)}>
              {copy.skip}
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{step.title}</h2>
            <p className={cn("text-sm leading-7", ui.textMuted)}>{step.body}</p>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={goNext} className={ui.buttonPrimary}>
              {currentStep === steps.length - 1 ? copy.done : copy.next}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
