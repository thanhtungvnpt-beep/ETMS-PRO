// Types for OOS Internal About Us Page & Visual Page Builder

export type TeamGroupType = 'DIRECTOR' | 'DEV' | 'ADVISOR';

export interface AboutUsTeamMember {
  id: string;
  name: string;
  position: string;
  group: TeamGroupType;
  avatar: string;
  bio?: string;
  email?: string;
}

export interface AboutUsCapabilityItem {
  id: string;
  title: string;
  description: string;
  iconName: 'users' | 'cpu' | 'wrench' | 'boxes' | 'truck' | 'folder' | 'chart';
  accentColor: string;
}

export interface AboutUsCoreValueItem {
  id: string;
  title: string;
  description: string;
  iconName: 'trending' | 'shield' | 'lightbulb';
}

export type SectionType =
  | 'BRAND_INTRO'
  | 'GROUP_PHOTO'
  | 'SLOGANS'
  | 'CAPABILITIES'
  | 'TEAM_MEMBERS'
  | 'CORE_VALUES'
  | 'CUSTOM_TEXT'
  | 'DIVIDER'
  | 'SPACER';

export interface AboutUsSectionConfig {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
  customSettings?: {
    bgColor?: string;
    paddingY?: 'sm' | 'md' | 'lg';
    borderStyle?: 'none' | 'subtle' | 'card';
    textContent?: string;
    spacerHeight?: number;
  };
}

export interface AboutUsPageData {
  version: number;
  lastUpdated: string;
  updatedBy: string;
  isPublished: boolean;
  header: {
    systemName: string;
    subTitle: string;
    description: string;
    departmentName: string;
  };
  groupPhoto: {
    imageUrl: string;
    caption: string;
    aspectRatio: '16:9' | '4:3' | '3:2' | '21:9' | 'auto';
    focalPoint: 'center' | 'top' | 'bottom';
    fit: 'cover' | 'contain';
  };
  slogans: {
    english: string;
    vietnamese: string;
    englishSub?: string;
  };
  capabilities: AboutUsCapabilityItem[];
  coreValues: AboutUsCoreValueItem[];
  teamMembers: AboutUsTeamMember[];
  sections: AboutUsSectionConfig[];
}

export interface PageBuilderHistoryState {
  past: AboutUsPageData[];
  present: AboutUsPageData;
  future: AboutUsPageData[];
}
