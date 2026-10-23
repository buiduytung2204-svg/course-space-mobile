export interface Category {
  id: string;
  name: string;
  description: string;
}
export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
}
export type CourseInput = Omit<Course, "id">;
export function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
export function validateCourse(
  value: CourseInput,
  categories: Category[],
): string | undefined {
  if (
    ![value.title, value.description, value.instructor, value.createdAt].every(
      (v) => v.trim(),
    )
  )
    return "Vui lòng nhập đầy đủ các trường bắt buộc.";
  if (!categories.some((c) => c.id === value.categoryId))
    return "Hãy chọn danh mục còn tồn tại.";
  if (!Number.isFinite(value.price) || value.price < 0)
    return "Học phí phải là số không âm.";
  if (!Number.isFinite(value.duration) || value.duration <= 0)
    return "Thời lượng phải lớn hơn 0.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value.createdAt) ||
    Number.isNaN(Date.parse(value.createdAt)) ||
    new Date(value.createdAt).toISOString().slice(0, 10) !== value.createdAt
  )
    return "Ngày tạo phải hợp lệ, định dạng YYYY-MM-DD.";
  if (!isHttpUrl(value.thumbnail) || !isHttpUrl(value.trailerUrl))
    return "Ảnh bìa và trailer cần URL HTTP/HTTPS hợp lệ.";
}
