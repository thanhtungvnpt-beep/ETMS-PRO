import { AboutUsPageData } from '../types/aboutUs';

const STORAGE_KEYS = {
  PUBLISHED: 'oos_about_us_published_v1',
  DRAFT: 'oos_about_us_draft_v1',
};

export const INITIAL_ABOUT_US_DATA: AboutUsPageData = {
  version: 1,
  lastUpdated: '10/01/2025 15:30',
  updatedBy: 'Admin',
  isPublished: true,
  header: {
    systemName: 'OUTSOURCING OPERATION SYSTEM',
    subTitle: 'MULTI-FACTORY OPERATIONS MANAGEMENT',
    departmentName: 'Bộ phận Outsourcing Operation',
    description:
      'Chúng tôi là bộ phận Outsourcing Operation, chịu trách nhiệm kết nối và điều phối nguồn lực giữa các nhà máy và đối tác, nhằm tối ưu vận hành, nâng cao hiệu quả, đảm bảo tính minh bạch và thúc đẩy phát triển bền vững trong toàn bộ chuỗi sản xuất.',
  },
  groupPhoto: {
    imageUrl: '/assets/aistudio/file_00000000849082119d44d83056308472_9ffd04f4.png',
    caption:
      'Tập thể cán bộ nhân viên bộ phận Outsourcing Operation System (OOS) tại Trung tâm Điều hành Sản xuất Thông minh',
    aspectRatio: '16:9',
    focalPoint: 'center',
    fit: 'cover',
  },
  slogans: {
    english: 'One Team. Connected Factories. Unified Operations.',
    vietnamese: 'KẾT NỐI NHÀ MÁY — ĐIỀU PHỐI NGUỒN LỰC — THỐNG NHẤT VẬN HÀNH',
    englishSub: 'Seamless Collaboration Across All Manufacturing Lines',
  },
  capabilities: [
    {
      id: 'cap-1',
      title: 'Quản lý nhân lực',
      description: 'Điều phối nhân sự 7 vendor, theo dõi thâm niên và ma trận kỹ năng.',
      iconName: 'users',
      accentColor: '#3B82F6',
    },
    {
      id: 'cap-2',
      title: 'Quản lý thiết bị',
      description: 'Số hóa hồ sơ vòng đời máy móc và phân bổ năng lực thiết bị.',
      iconName: 'cpu',
      accentColor: '#10B981',
    },
    {
      id: 'cap-3',
      title: 'Bảo trì sửa chữa',
      description: 'Lập lịch bảo dưỡng định kỳ và dịch vụ sửa chữa chuyên sâu.',
      iconName: 'wrench',
      accentColor: '#F97316',
    },
    {
      id: 'cap-4',
      title: 'MRO vật tư',
      description: 'Quản lý kho phụ tùng thay thế và định mức tiêu hao linh kiện.',
      iconName: 'boxes',
      accentColor: '#8B5CF6',
    },
    {
      id: 'cap-5',
      title: 'Điều động thiết bị',
      description: 'Quy trình 9 bước điều chuyển máy móc liên nhà máy chuẩn ISO.',
      iconName: 'truck',
      accentColor: '#EF4444',
    },
    {
      id: 'cap-6',
      title: 'Dự án Model mới',
      description: 'Quản trị quy trình từ kế hoạch, rà soát tài nguyên đến setup line.',
      iconName: 'folder',
      accentColor: '#06B6D4',
    },
    {
      id: 'cap-7',
      title: 'Báo cáo tổng hợp',
      description: 'Báo cáo trực quan KPI, dự báo nhu cầu và phân tích chuyên sâu.',
      iconName: 'chart',
      accentColor: '#F59E0B',
    },
  ],
  coreValues: [
    {
      id: 'val-1',
      title: 'Tối ưu vận hành',
      description: 'Nâng cao hiệu suất và năng suất trên toàn mạng lưới nhà máy.',
      iconName: 'trending',
    },
    {
      id: 'val-2',
      title: 'Quản lý tập trung',
      description: 'Dữ liệu chính xác, minh bạch, an toàn cho tất cả nhà máy và đối tác.',
      iconName: 'shield',
    },
    {
      id: 'val-3',
      title: 'Hỗ trợ ra quyết định',
      description: 'Báo cáo trực quan, theo thời gian thực, cảnh báo và phân tích thông minh.',
      iconName: 'lightbulb',
    },
  ],
  teamMembers: [
    {
      id: 'mem-1',
      name: 'Nguyễn Văn Minh',
      position: 'Project Director',
      group: 'DIRECTOR',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Chỉ đạo định hướng chiến lược và kết nối các đối tác vận hành cấp cao.',
      email: 'minh.nguyen@oos-enterprise.com',
    },
    {
      id: 'mem-2',
      name: 'Trần Đức Anh',
      position: 'Lead Frontend Developer',
      group: 'DEV',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Phụ trách kiến trúc giao diện người dùng và tối ưu trải nghiệm tương tác.',
      email: 'anh.tran@oos-enterprise.com',
    },
    {
      id: 'mem-3',
      name: 'Lê Minh Hoàng',
      position: 'Backend & Cloud Architect',
      group: 'DEV',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Thiết kế hạ tầng dữ liệu phân tán và bảo mật hệ thống vận hành.',
      email: 'hoang.le@oos-enterprise.com',
    },
    {
      id: 'mem-4',
      name: 'Phạm Quang Huy',
      position: 'Advisor - Vận hành & Sản xuất',
      group: 'ADVISOR',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      bio: 'Cố vấn quy trình sản xuất liên nhà máy và kiểm soát chuỗi cung ứng.',
      email: 'huy.pham@oos-advisor.com',
    },
    {
      id: 'mem-5',
      name: 'Trịnh Hoài Nam',
      position: 'Advisor - Thiết bị & Tự động hóa',
      group: 'ADVISOR',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      bio: 'Cố vấn tiêu chuẩn máy móc, cân chỉnh thông số và bảo dưỡng công nghiệp.',
      email: 'nam.trinh@oos-advisor.com',
    },
    {
      id: 'mem-6',
      name: 'Nguyễn Thị Lan',
      position: 'Advisor - Đảm bảo Chất lượng QA',
      group: 'ADVISOR',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Cố vấn quy chuẩn nghiệm thu, chứng từ bàn giao và kiểm định chất lượng.',
      email: 'lan.nguyen@oos-advisor.com',
    },
  ],
  sections: [
    {
      id: 'sec-brand-intro',
      type: 'BRAND_INTRO',
      title: 'Giới thiệu thương hiệu & Sứ mệnh',
      isVisible: true,
      order: 1,
    },
    {
      id: 'sec-group-photo',
      type: 'GROUP_PHOTO',
      title: 'Ảnh tập thể bộ phận',
      isVisible: true,
      order: 2,
    },
    {
      id: 'sec-slogans',
      type: 'SLOGANS',
      title: 'Slogan thương hiệu',
      isVisible: true,
      order: 3,
    },
    {
      id: 'sec-capabilities',
      type: 'CAPABILITIES',
      title: '7 Năng lực bộ phận',
      isVisible: true,
      order: 4,
    },
    {
      id: 'sec-core-values',
      type: 'CORE_VALUES',
      title: '3 Trụ cột giá trị cốt lõi',
      isVisible: true,
      order: 5,
    },
    {
      id: 'sec-team-members',
      type: 'TEAM_MEMBERS',
      title: 'Đội ngũ dự án & Cố vấn',
      isVisible: true,
      order: 6,
    },
  ],
};

export const getStoredPublishedAboutUs = (): AboutUsPageData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PUBLISHED);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(INITIAL_ABOUT_US_DATA));
      return INITIAL_ABOUT_US_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading published about us data', e);
    return INITIAL_ABOUT_US_DATA;
  }
};

export const getStoredDraftAboutUs = (): AboutUsPageData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!raw) {
      // Default draft to published data
      const published = getStoredPublishedAboutUs();
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(published));
      return published;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading draft about us data', e);
    return INITIAL_ABOUT_US_DATA;
  }
};

export const saveStoredDraftAboutUs = (data: AboutUsPageData, user = 'Admin'): AboutUsPageData => {
  try {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updatedData: AboutUsPageData = {
      ...data,
      lastUpdated: formatted,
      updatedBy: user,
      isPublished: false,
    };
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(updatedData));
    return updatedData;
  } catch (e) {
    console.error('Error saving draft about us data', e);
    return data;
  }
};

export const publishStoredAboutUs = (data: AboutUsPageData, user = 'Admin'): AboutUsPageData => {
  try {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const publishedData: AboutUsPageData = {
      ...data,
      lastUpdated: formatted,
      updatedBy: user,
      isPublished: true,
      version: (data.version || 1) + 1,
    };
    localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(publishedData));
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(publishedData));
    return publishedData;
  } catch (e) {
    console.error('Error publishing about us data', e);
    return data;
  }
};

export const resetStoredAboutUsToInitial = (): AboutUsPageData => {
  try {
    localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(INITIAL_ABOUT_US_DATA));
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(INITIAL_ABOUT_US_DATA));
    return INITIAL_ABOUT_US_DATA;
  } catch (e) {
    console.error('Error resetting about us data', e);
    return INITIAL_ABOUT_US_DATA;
  }
};
