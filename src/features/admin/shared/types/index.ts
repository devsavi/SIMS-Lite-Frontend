export interface AdminTabItem {
  id: string;
  label: string;
  href: string;
  permission?: string;
  iconName?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
