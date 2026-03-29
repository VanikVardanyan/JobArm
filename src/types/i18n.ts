export type Locale = "hy" | "ru" | "en" | "fa" | "hi";

export type TranslationTree = {
  common: {
    productName: string;
    createTask: string;
    browseTasks: string;
    defaultRegion: string;
    urgent: string;
    backToHome: string;
    backToJobs: string;
    signIn: string;
    signOut: string;
    callButton: string;
    loading: string;
    themeToggleLight: string;
    themeToggleDark: string;
    openMenu: string;
    closeMenu: string;
  };
  auth: {
    title: string;
    subtitle: string;
    button: string;
    guestHint: string;
  };
  dashboard: {
    title: string;
    empty: string;
    addJob: string;
    cabinetLink: string;
    editAction: string;
    deleteAction: string;
    closeAction: string;
    reopenAction: string;
    confirmDelete: string;
    statusActive: string;
    statusClosed: string;
    saveChanges: string;
    editTitle: string;
    updateSuccess: string;
    updateError: string;
    deleteError: string;
    /** Подпись к блоку описания в карточке заявки */
    description: string;
  };
  home: {
    badge: string;
    title: string;
    subtitle: string;
    publishCta: string;
    browseCta: string;
    stats: {
      fastPublish: string;
      guestAccess: string;
      geography: string;
    };
    howItWorks: {
      title: string;
      steps: {
        title: string;
        description: string;
      }[];
    };
  };
  jobs: {
    title: string;
    subtitle: string;
    filtersTitle: string;
    regionsTitle: string;
    openFilters: string;
    clearFilters: string;
    applyFilters: string;
    sortBy: string;
    sortNewest: string;
    sortOldest: string;
    showMoreDescription: string;
    descriptionModalTitle: string;
    closeModal: string;
    paginationPrev: string;
    paginationNext: string;
    pageIndicator: string;
    emptyHint: string;
    empty: string;
    emptyFiltered: string;
    titleLabel: string;
    budgetLabel: string;
    descriptionLabel: string;
    addressLabel: string;
    regionLabel: string;
    callButton: string;
    contactTelegram: string;
    contactWhatsApp: string;
  };
  post: {
    title: string;
    subtitle: string;
    fields: {
      title: string;
      description: string;
      category: string;
      price: string;
      region: string;
      address: string;
      date: string;
      time: string;
      phone: string;
    };
    placeholders: {
      category: string;
      region: string;
    };
    errors: {
      required: string;
      phoneInvalid: string;
    };
    submit: string;
    loginHint: string;
    successTitle: string;
    successText: string;
    errorText: string;
    authRequired: string;
    authRequiredHint: string;
    contactMethodLabel: string;
    contactByCall: string;
    contactByTelegram: string;
    contactByWhatsApp: string;
    contactPhoneHint: string;
  };
};
