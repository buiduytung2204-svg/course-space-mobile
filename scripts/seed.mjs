// Only seed an EMPTY pair of resources. Never overwrites existing homework data.
import { readFileSync } from "node:fs";
const env = (() => {
  try {
    return readFileSync(".env", "utf8")
      .match(/^EXPO_PUBLIC_API_BASE_URL=(.+)$/m)?.[1]
      .trim();
  } catch {
    return "";
  }
})();
const base = (process.env.EXPO_PUBLIC_API_BASE_URL || env || "").replace(
  /\/+$/,
  "",
);
if (!base || base.includes("YOUR_PROJECT"))
  throw new Error("Cấu hình Base URL trong .env trước.");
async function request(path, method = "GET", body) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok)
    throw new Error(
      `${method} ${path}: HTTP ${r.status}. Tạo resource trong MockAPI trước.`,
    );
  return r.json();
}
const [cats, courses] = await Promise.all([
  request("/categories"),
  request("/courses"),
]);
if (cats.length || courses.length)
  throw new Error("Dừng: resource đã có dữ liệu. Script không ghi đè bài cũ.");
const samples = [
  ["Lập trình Mobile", "Android, Flutter, React Native"],
  ["Lập trình Web", "Frontend và Backend"],
  ["Trí tuệ nhân tạo", "AI, Machine Learning, Deep Learning"],
];
const ids = [];
for (const [name, description] of samples)
  ids.push((await request("/categories", "POST", { name, description })).id);
const titles = [
  "Lập trình Android cơ bản",
  "Flutter từ cơ bản đến thực hành",
  "React Native với Expo",
  "Kotlin cho người mới",
  "HTML và CSS nền tảng",
  "JavaScript thực chiến",
  "React xây dựng giao diện",
  "Node.js và REST API",
  "Python cho khoa học dữ liệu",
  "Machine Learning nhập môn",
];
for (let i = 0; i < titles.length; i++) {
  await request("/courses", "POST", {
    title: titles[i],
    description: `Khóa học ${titles[i]} giúp bạn nắm vững kiến thức nền tảng, thực hành theo từng bước và xây dựng dự án cuối khóa.`,
    categoryId: String(ids[i < 4 ? 0 : i < 8 ? 1 : 2]),
    instructor: ["Nguyễn Minh Anh", "Trần Hoàng Nam", "Lê Thu Hà"][i % 3],
    price: 450000 + i * 50000,
    duration: 20 + i * 3,
    thumbnail: `https://picsum.photos/seed/course-${i + 1}/900/500`,
    trailerUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  console.log(`Đã tạo ${i + 1}/10: ${titles[i]}`);
}
console.log(
  "Hoàn tất: 3 danh mục, 10 khóa học. Trailer là video mẫu công khai, thay bằng nội dung khóa học nếu có.",
);
