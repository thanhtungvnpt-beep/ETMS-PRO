/**
 * Utility for client-side image optimization and preset photo libraries
 * Converts uploaded large files into compressed Base64 strings to prevent localStorage QuotaExceededError.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Resizes and compresses an image File on an offscreen HTML Canvas
 */
export async function optimizeImageFile(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Tệp tải lên không phải là định dạng hình ảnh hợp lệ.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể giải mã hình ảnh.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw base64 if canvas not supported
          return resolve(event.target?.result as string);
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Preset high-quality team and factory group photos
 */
export const PRESET_GROUP_PHOTOS = [
  {
    id: 'grp-default',
    title: 'Đội ngũ Outsourcing Operation (Hiện tại)',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
    description: 'Tập thể kỹ sư và điều phối viên vận hành đa nhà máy',
  },
  {
    id: 'grp-factory-control',
    title: 'Trung tâm điều hành sản xuất thông minh',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80',
    description: 'Kỹ sư giám sát tự động hóa và điều độ thiết bị',
  },
  {
    id: 'grp-smt-cleanroom',
    title: 'Nhà máy SMT & Công nghệ cao',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80',
    description: 'Đội ngũ kỹ thuật phòng sạch và bảo dưỡng dây chuyền',
  },
  {
    id: 'grp-corporate-board',
    title: 'Hội nghị điều hành liên nhà máy',
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80',
    description: 'Họp giao ban tiến độ New Model và điều động nguồn lực',
  },
  {
    id: 'grp-logistics-hub',
    title: 'Trung tâm Logistics & Điều phối MRO',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
    description: 'Đội ngũ kho vận và luân chuyển tài sản liên nhà máy',
  },
];

/**
 * Preset professional avatars for executive directors, developers, and advisors
 */
export const PRESET_AVATARS = [
  {
    id: 'av-exec-1',
    role: 'Chỉ đạo dự án / Giám đốc',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    gender: 'Nam',
  },
  {
    id: 'av-exec-2',
    role: 'Chỉ đạo dự án / Giám đốc',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    gender: 'Nữ',
  },
  {
    id: 'av-dev-1',
    role: 'Kỹ sư phát triển phần mềm',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    gender: 'Nam',
  },
  {
    id: 'av-dev-2',
    role: 'Kỹ sư phát triển phần mềm',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    gender: 'Nam',
  },
  {
    id: 'av-dev-3',
    role: 'Kỹ sư giao diện & hệ thống',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    gender: 'Nữ',
  },
  {
    id: 'av-adv-1',
    role: 'Cố vấn vận hành nhà máy',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    gender: 'Nam',
  },
  {
    id: 'av-adv-2',
    role: 'Cố vấn chất lượng & chuyển giao',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gender: 'Nữ',
  },
  {
    id: 'av-adv-3',
    role: 'Cố vấn kỹ thuật thiết bị',
    url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&q=80',
    gender: 'Nam',
  },
];
