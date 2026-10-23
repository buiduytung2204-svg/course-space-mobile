import test from "node:test";
import assert from "node:assert/strict";
import { validateCourse } from "../src/models.ts";
import { createApi } from "../src/api.ts";
const categories = [{ id: "42", name: "Mobile", description: "Test" }];
const valid = {
  title: "React Native",
  description: "Mô tả",
  categoryId: "42",
  instructor: "An",
  price: 0,
  duration: 10,
  thumbnail: "https://example.org/a.jpg",
  trailerUrl: "https://example.org/a.mp4",
  createdAt: "2026-10-23",
};
test("validation accepts free course and rejects missing category, negative price, bad date and URLs", () => {
  assert.equal(validateCourse(valid, categories), undefined);
  for (const data of [
    { ...valid, categoryId: "1" },
    { ...valid, price: -1 },
    { ...valid, price: NaN },
    { ...valid, duration: 0 },
    { ...valid, title: " " },
    { ...valid, createdAt: "2026-02-30" },
    { ...valid, trailerUrl: "javascript:alert(1)" },
  ])
    assert.ok(validateCourse(data, categories));
});
test("REST client sends correct methods/body, propagates errors and protects linked category", async () => {
  const old = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    return new Response(
      JSON.stringify(
        String(url).endsWith("/courses") && options.method === "GET"
          ? [{ id: "9", categoryId: "42" }]
          : { id: "9" },
      ),
      { status: 200 },
    );
  };
  try {
    const api = createApi("https://unit.test");
    await api.saveCourse(valid);
    await api.saveCourse(valid, "9");
    await api.course("9");
    await api.deleteCourse("9");
    await api.saveCategory({ name: "New", description: "D" });
    await api.saveCategory({ name: "Edit", description: "D" }, "42");
    assert.deepEqual(
      calls.map((c) => c[1].method),
      ["POST", "PUT", "GET", "DELETE", "POST", "PUT"],
    );
    assert.equal(JSON.parse(calls[0][1].body).categoryId, "42");
    await assert.rejects(api.deleteCategory("42"), /Không thể xóa/);
    assert.equal(calls.at(-1)[1].method, "GET");
    await api.deleteCategory("empty");
    assert.equal(calls.at(-1)[1].method, "DELETE");
    globalThis.fetch = async () => new Response("not found", { status: 404 });
    await assert.rejects(api.courses(), /404/);
    await assert.rejects(createApi("").courses(), /Chưa cấu hình/);
  } finally {
    globalThis.fetch = old;
  }
});
