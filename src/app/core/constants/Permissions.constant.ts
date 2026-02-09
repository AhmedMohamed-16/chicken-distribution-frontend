export const PERMISSIONS = {
  SYSTEM:{
    APPLICATION_ADMIN:'APPLICATION_ADMIN'
  },
  USERS: {
    MANAGE_USERS: 'MANAGE_USERS',
    VIEW_USERS: 'VIEW_USERS',
  },
  PARTNERS: {
    MANAGE_PARTNERS: 'MANAGE_PARTNERS',
    VIEW_PARTNERS: 'VIEW_PARTNERS',
  },
  FARMS: {
    MANAGE_FARMS: 'MANAGE_FARMS',
    VIEW_FARMS: 'VIEW_FARMS',
  },
  BUYERS: {
    MANAGE_BUYERS: 'MANAGE_BUYERS',
    VIEW_BUYERS: 'VIEW_BUYERS',
  },
  VEHICLES: {
    MANAGE_VEHICLES: 'MANAGE_VEHICLES',
    VIEW_VEHICLES: 'VIEW_VEHICLES'
  },
  COST_CATEGORIES: {
    MANAGE_COST_CATEGORIES: 'MANAGE_COST_CATEGORIES',
    VIEW_COST_CATEGORIES: 'VIEW_COST_CATEGORIES',
  },
  CHICKEN_TYPES: {
    MANAGE_CHICKEN_TYPES: 'MANAGE_CHICKEN_TYPES',
    VIEW_CHICKEN_TYPES: 'VIEW_CHICKEN_TYPES',
  },
  OPERATIONS: {
    CLOSE_OPERATION: 'CLOSE_OPERATION',
    RECORD_FARM_LOADING: 'RECORD_FARM_LOADING',
    RECORD_SALE: 'RECORD_SALE',
    RECORD_TRANSPORT_LOSS: 'RECORD_TRANSPORT_LOSS',
    RECORD_COST: 'RECORD_COST',
  },
  REPORTS: {
    VIEW_DAILY_REPORT: 'VIEW_DAILY_REPORT',
    VIEW_PERIOD_REPORT: 'VIEW_PERIOD_REPORT',
    VIEW_PROFIT_REPORT: 'VIEW_PROFIT_REPORT',
    VIEW_DEBT_REPORT: 'VIEW_DEBT_REPORT',
    // VIEW_FARM_BALANCES: 'VIEW_FARM_BALANCES',
  },
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Helper to get all permission keys as an array
export const getAllPermissionKeys = (): string[] => {
  const keys: string[] = [];
  Object.values(PERMISSIONS).forEach(category => {
    Object.values(category).forEach(key => {
      keys.push(key);
    });
  });
  return keys;
};

// Helper to get permission keys by category
export const getPermissionKeysByCategory = (category: keyof typeof PERMISSIONS): string[] => {
  return Object.values(PERMISSIONS[category]);
};

// Permission display names (Arabic)
export const PERMISSION_NAMES: Record<string, string> = {
  // Users
  MANAGE_USERS: 'إدارة المستخدمين',
  VIEW_USERS: 'عرض المستخدمين',

  // Partners
  MANAGE_PARTNERS: 'إدارة الشركاء',
  VIEW_PARTNERS: 'عرض الشركاء',

  // Farms
  MANAGE_FARMS: 'إدارة المزارع',
  VIEW_FARMS: 'عرض المزارع',

  // Buyers
  MANAGE_BUYERS: 'إدارة المشترين',
  VIEW_BUYERS: 'عرض المشترين',

  // Vehicles
  MANAGE_VEHICLES: 'إدارة المركبات',
  VIEW_VEHICLES: 'عرض المركبات',

  // Operations
   CLOSE_OPERATION: 'إغلاق عمليات التوزيع اليومية',
   RECORD_FARM_LOADING: 'تسجيل التحميل من المزارع',
  RECORD_SALE: 'تسجيل المبيعات',
  RECORD_TRANSPORT_LOSS: 'تسجيل خسائر النقل',
  RECORD_COST: 'تسجيل التكاليف',

  MANAGE_CHICKEN_TYPES: 'إدارة أنواع الفراخ',
  VIEW_CHICKEN_TYPES: 'عرض أنواع الفراخ',

  MANAGE_COST_CATEGORIES: 'إدارة فئات التكاليف',
  VIEW_COST_CATEGORIES: 'عرض فئات التكاليف',

  // Reports
  VIEW_DAILY_REPORT: 'عرض التقرير اليومي',
  VIEW_PERIOD_REPORT: 'عرض تقرير الفترة',
  VIEW_PROFIT_REPORT: 'عرض تقرير الأرباح',
  VIEW_DEBT_REPORT: 'عرض تقرير الديون',
  // VIEW_FARM_BALANCES: 'عرض أرصدة المزارع',
};

// Category display names (Arabic)
export const CATEGORY_NAMES: Record<string, string> = {
  USERS: 'المستخدمين',
  PARTNERS: 'الشركاء',
  FARMS: 'المزارع',
  BUYERS: 'المشترين',
  VEHICLES: 'المركبات',
  OPERATIONS: 'عمليات التوزيع',
  REPORTS: 'التقارير',
  CHICKEN_TYPES: 'أنواع الفراخ',
  COST_CATEGORIES: 'فئات التكاليف',
};
