export interface ImageData {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  category?: string;
  tags?: string[];
  description?: string;
  caption?: string;
  createdAt?: string;
  isDeleted?: boolean;
  shareLink?: string;
}

export interface GalleryProps {
  images: ImageData[];
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onSetCaption?: (id: string, caption: string) => void;
  showDeleted?: boolean;
  sortOrder?: SortOrder;
  onAddToHistory?: (image: ImageData, actionType: 'view') => void;
}

export interface HeaderProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  onUploadClick?: () => void;
  onToggleDeleted?: () => void;
  showDeleted?: boolean;
  sortOrder?: SortOrder;
  onSortChange?: (sortOrder: SortOrder) => void;
  onToggleHistory?: () => void;
  showHistory?: boolean;
}

export interface ImageCardProps {
  image: ImageData;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  showDeleted?: boolean;
}

export interface UploadFormProps {
  onSuccess: (image: ImageData) => void;
  onCancel: () => void;
}

export type SortOrder = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export interface ZoomableImageProps {
  src: string;
  alt: string;
  maxZoom?: number;
}

export interface ImageCaptionProps {
  caption: string;
  onSave: (caption: string) => void;
}

export interface HistoryEntry {
  id: string;
  imageId: string;
  timestamp: string;
  actionType: 'view' | 'delete' | 'restore';
  imageData: ImageData;
}

export interface HistoryProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onRestoreImage?: (id: string) => void;
  onViewImage?: (image: ImageData) => void;
  activeTab: 'viewHistory' | 'deleteHistory';
  onTabChange: (tab: 'viewHistory' | 'deleteHistory') => void;
} 