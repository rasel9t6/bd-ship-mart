 type MediaType = 'image' | 'video';

 interface MediaItem {
  url: string;
  type: MediaType;
  id?: string; // Optional unique identifier
  name?: string; // Optional file name
  size?: number; // Optional file size
}

 interface MediaGalleryProps {
  visible: boolean;
  folderId: string;
  onClose: () => void;
  onSelect?: (url: string, type: MediaType) => void;
}

 interface MediaUploadProps {
  value?: MediaItem[];
  onChange: (url: string, type?: MediaType) => void;
  onRemove?: (url: string) => void;
  folderId?: string;
  multiple?: boolean;
  accept?: MediaType[]; // Optional: restrict media types
}
