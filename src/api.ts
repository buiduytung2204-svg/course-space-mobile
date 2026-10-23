import type { Category, Course, CourseInput } from "./models";
export const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
export function createApi(base: string) {
  async function request<T>(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    if (!base)
      throw new Error(
        "Chưa cấu hình MockAPI. Thêm EXPO_PUBLIC_API_BASE_URL trong file .env rồi khởi động lại Expo.",
      );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${base}${path}`, {
        method,
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok)
        throw new Error(
          `MockAPI trả lỗi ${response.status}. Kiểm tra endpoint và kết nối mạng.`,
        );
      return response.status === 204 ? (undefined as T) : await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError")
        throw new Error("Kết nối quá thời gian chờ. Vui lòng thử lại.");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  return {
    categories: () => request<Category[]>("/categories"),
    courses: () => request<Course[]>("/courses"),
    course: (id: string) =>
      request<Course>(`/courses/${encodeURIComponent(id)}`),
    saveCourse: (data: CourseInput, id?: string) =>
      request<Course>(
        `/courses${id ? "/" + encodeURIComponent(id) : ""}`,
        id ? "PUT" : "POST",
        data,
      ),
    deleteCourse: (id: string) =>
      request<void>(`/courses/${encodeURIComponent(id)}`, "DELETE"),
    saveCategory: (data: Omit<Category, "id">, id?: string) =>
      request<Category>(
        `/categories${id ? "/" + encodeURIComponent(id) : ""}`,
        id ? "PUT" : "POST",
        data,
      ),
    deleteCategory: async (id: string) => {
      const courses = await request<Course[]>("/courses");
      if (courses.some((c) => String(c.categoryId) === id))
        throw new Error(
          "Không thể xóa danh mục đang có khóa học. Hãy chuyển hoặc xóa các khóa học trước.",
        );
      return request<void>(`/categories/${encodeURIComponent(id)}`, "DELETE");
    },
  };
}
export const api = createApi(BASE_URL);
