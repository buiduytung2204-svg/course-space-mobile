import React, { createContext, useContext, useEffect, useState } from "react";
import { router, usePathname } from "expo-router";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Picker } from "@react-native-picker/picker";
import { api } from "./src/api";
import {
  Category,
  Course,
  CourseInput,
  isHttpUrl,
  validateCourse,
} from "./src/models";
const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );
const msg = (e: unknown) =>
  e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại.";
const blank = (): CourseInput => ({
  title: "",
  description: "",
  categoryId: "",
  instructor: "",
  price: 0,
  duration: 1,
  thumbnail: "",
  trailerUrl: "",
  createdAt: new Date().toISOString().slice(0, 10),
});
function Button({
  title,
  onPress,
  danger = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[s.button, danger && s.danger, disabled && { opacity: 0.5 }]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  numeric = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        style={[
          s.input,
          multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
        multiline={multiline}
        keyboardType={numeric ? "decimal-pad" : "default"}
        autoCapitalize={label.includes("URL") ? "none" : "sentences"}
      />
    </View>
  );
}
function Cover({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return failed || !isHttpUrl(uri) ? (
    <View style={[s.cover, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={s.muted}>Không có ảnh bìa</Text>
    </View>
  ) : (
    <Image
      accessibilityLabel="Ảnh bìa khóa học"
      source={{ uri }}
      style={s.cover}
      onError={() => setFailed(true)}
    />
  );
}
function Trailer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => p.play());
  const { status, error } = useEvent(player, "statusChange", {
    status: player.status,
    error: undefined,
  });
  return (
    <View style={{ gap: 12 }}>
      <VideoView
        player={player}
        nativeControls
        fullscreenOptions={{ enable: true }}
        style={{ width: "100%", height: 240, backgroundColor: "black" }}
      />
      {status === "loading" && <ActivityIndicator />}
      {error && (
        <Text style={s.error}>
          Không phát được trailer. Kiểm tra URL MP4 và kết nối mạng.
        </Text>
      )}
    </View>
  );
}
function useStore() {
  const [courses, setCourses] = useState<Course[]>([]),
    [categories, setCategories] = useState<Category[]>([]);

  const [selected, setSelected] = useState<Course | null>(null),
    [draft, setDraft] = useState<CourseInput>(blank());
  const [price, setPrice] = useState("0"),
    [duration, setDuration] = useState("1"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [playing, setPlaying] = useState(false);
  const [categoryForm, setCategoryForm] = useState(false),
    [editingCategory, setEditingCategory] = useState<Category | null>(null),
    [catName, setCatName] = useState(""),
    [catDescription, setCatDescription] = useState("");
  const [confirm, setConfirm] = useState<{
    text: string;
    action: () => Promise<void>;
  } | null>(null);
  return {
    courses,
    setCourses,
    categories,
    setCategories,
    selected,
    setSelected,
    draft,
    setDraft,
    price,
    setPrice,
    duration,
    setDuration,
    query,
    setQuery,
    filter,
    setFilter,
    loading,
    setLoading,
    busy,
    setBusy,
    error,
    setError,
    playing,
    setPlaying,
    categoryForm,
    setCategoryForm,
    editingCategory,
    setEditingCategory,
    catName,
    setCatName,
    catDescription,
    setCatDescription,
    confirm,
    setConfirm,
  };
}
const Store = createContext<ReturnType<typeof useStore> | null>(null);
export function CourseProvider({ children }: { children: React.ReactNode }) {
  const value = useStore();
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export default function Main() {
  const {
    courses,
    setCourses,
    categories,
    setCategories,
    selected,
    setSelected,
    draft,
    setDraft,
    price,
    setPrice,
    duration,
    setDuration,
    query,
    setQuery,
    filter,
    setFilter,
    loading,
    setLoading,
    busy,
    setBusy,
    error,
    setError,
    playing,
    setPlaying,
    categoryForm,
    setCategoryForm,
    editingCategory,
    setEditingCategory,
    catName,
    setCatName,
    catDescription,
    setCatDescription,
    confirm,
    setConfirm,
  } = useContext(Store)!;
  const pathname = usePathname();
  const screen =
    pathname === "/categories"
      ? "categories"
      : pathname === "/form"
        ? "form"
        : pathname === "/detail"
          ? "detail"
          : "courses";
  function setScreen(next: string) {
    router.replace(
      next === "courses"
        ? "/"
        : next === "categories"
          ? "/categories"
          : next === "form"
            ? "/form"
            : "/detail",
    );
  }
  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [cs, cats] = await Promise.all([api.courses(), api.categories()]);
      setCourses(cs);
      setCategories(cats);
    } catch (e) {
      setError(msg(e));
    } finally {
      setLoading(false);
    }
  }
  // Reload server data whenever a screen is opened.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void reload();
    return () => setPlaying(false);
  }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen !== "courses") {
        setScreen("courses");
        setError("");
        return true;
      }
      return false;
    });
    return () => sub.remove(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  async function mutate(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  }
  function go(next: typeof screen) {
    setError("");
    setScreen(next);
  }
  function edit(course?: Course) {
    setSelected(course || null);
    const data = course || blank();
    setDraft(data);
    setPrice(String(data.price));
    setDuration(String(data.duration));
    go("form");
  }
  async function open(course: Course) {
    await mutate(async () => {
      setSelected(await api.course(course.id));
      go("detail");
    });
  }
  async function save() {
    const data = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      instructor: draft.instructor.trim(),
      thumbnail: draft.thumbnail.trim(),
      trailerUrl: draft.trailerUrl.trim(),
      price: price.trim() ? Number(price) : NaN,
      duration: duration.trim() ? Number(duration) : NaN,
    };
    const invalid = validateCourse(data, categories);
    if (invalid) {
      setError(invalid);
      return;
    }
    await mutate(async () => {
      const cats = await api.categories();
      const invalid = validateCourse(data, cats);
      if (invalid) throw new Error(invalid);
      setSelected(await api.saveCourse(data, selected?.id));
      go("detail");
      await reload();
    });
  }
  function editCat(cat?: Category) {
    setEditingCategory(cat || null);
    setCatName(cat?.name || "");
    setCatDescription(cat?.description || "");
    setCategoryForm(true);
    setError("");
  }
  const catLabel = (id: string) =>
    categories.find((c) => c.id === String(id))?.name ||
    "Danh mục không còn tồn tại";
  const visible = courses.filter(
    (c) =>
      c.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")) &&
      (!filter || String(c.categoryId) === filter),
  );
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <View>
            <Text style={s.brand}>COURSE SPACE</Text>
            <Text style={s.heading}>
              {screen === "courses"
                ? "Khám phá khóa học"
                : screen === "categories"
                  ? "Quản lý danh mục"
                  : screen === "form"
                    ? selected
                      ? "Sửa khóa học"
                      : "Thêm khóa học"
                    : "Chi tiết khóa học"}
            </Text>
          </View>
          {screen !== "courses" && (
            <Pressable onPress={() => go("courses")}>
              <Text style={s.link}>← Trở về</Text>
            </Pressable>
          )}
        </View>
        {!!error && (
          <View accessibilityRole="alert" style={s.errorBox}>
            <Text style={s.error}>{error}</Text>
            <Pressable onPress={() => void reload()}>
              <Text style={s.link}>Tải lại dữ liệu</Text>
            </Pressable>
          </View>
        )}
        {busy && <ActivityIndicator color="#245b49" />}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void reload()}
            />
          }
        >
          {screen === "courses" && (
            <>
              <View style={s.hero}>
                <Text style={s.eyebrow}>HỌC HÔM NAY, TIẾN XA HƠN</Text>
                <Text style={s.heroTitle}>Kiến thức mới.{"\n"}Cơ hội mới.</Text>
                <Text style={s.muted}>
                  {courses.length} khóa học · {categories.length} danh mục
                </Text>
              </View>
              <TextInput
                accessibilityLabel="Tìm khóa học"
                placeholder="Tìm theo tên khóa học…"
                style={s.input}
                value={query}
                onChangeText={setQuery}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.row}>
                  {[{ id: "", name: "Tất cả" }, ...categories].map((c) => (
                    <Pressable
                      key={c.id}
                      style={[s.chip, filter === c.id && s.chipActive]}
                      onPress={() => setFilter(c.id)}
                    >
                      <Text
                        style={filter === c.id ? { color: "white" } : s.muted}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Button
                title="＋ Thêm khóa học"
                disabled={busy}
                onPress={() => edit()}
              />
              {!loading && !visible.length && (
                <Text style={s.empty}>
                  {error
                    ? "Chưa tải được dữ liệu."
                    : "Chưa có khóa học phù hợp. Hãy đổi bộ lọc hoặc thêm khóa học."}
                </Text>
              )}
              {visible.map((c) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  key={c.id}
                  style={s.card}
                  onPress={() => void open(c)}
                >
                  <Cover uri={c.thumbnail} />
                  <View style={s.cardBody}>
                    <Text style={s.eyebrow}>{catLabel(c.categoryId)}</Text>
                    <Text style={s.title}>{c.title}</Text>
                    <Text style={s.muted}>{c.instructor}</Text>
                    <View style={s.between}>
                      <Text style={s.price}>{money(Number(c.price))}</Text>
                      <Text style={s.muted}>{c.duration} giờ →</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          )}
          {screen === "detail" && selected && (
            <>
              <Cover uri={selected.thumbnail} />
              <Text style={s.eyebrow}>{catLabel(selected.categoryId)}</Text>
              <Text style={s.bigTitle}>{selected.title}</Text>
              <Text style={s.muted}>Giảng viên: {selected.instructor}</Text>
              <View style={s.between}>
                <Text style={s.price}>{money(Number(selected.price))}</Text>
                <Text>{selected.duration} giờ</Text>
              </View>
              <Text style={s.label}>Giới thiệu khóa học</Text>
              <Text style={s.description}>{selected.description}</Text>
              <Text style={s.muted}>Ngày tạo: {selected.createdAt}</Text>
              <Button title="▶ Xem trailer" onPress={() => setPlaying(true)} />
              <Button
                title="Sửa khóa học"
                disabled={busy}
                onPress={() => edit(selected)}
              />
              <Button
                title="Xóa khóa học"
                danger
                disabled={busy}
                onPress={() =>
                  setConfirm({
                    text: `Xóa khóa học “${selected.title}”? Thao tác không thể hoàn tác.`,
                    action: async () => {
                      await api.deleteCourse(selected.id);
                      setSelected(null);
                      go("courses");
                      await reload();
                    },
                  })
                }
              />
            </>
          )}
          {screen === "form" && (
            <>
              <Field
                label="Tên khóa học *"
                value={draft.title}
                onChange={(title) => setDraft({ ...draft, title })}
              />
              <Field
                label="Mô tả *"
                multiline
                value={draft.description}
                onChange={(description) => setDraft({ ...draft, description })}
              />
              <Text style={s.label}>Danh mục *</Text>
              <View style={s.picker}>
                <Picker
                  selectedValue={draft.categoryId}
                  onValueChange={(categoryId) =>
                    setDraft({ ...draft, categoryId })
                  }
                >
                  <Picker.Item label="Chọn danh mục" value="" />
                  {categories.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              </View>
              {!categories.length && (
                <Text style={s.muted}>
                  Hãy tạo danh mục trước khi thêm khóa học.
                </Text>
              )}
              <Field
                label="Giảng viên *"
                value={draft.instructor}
                onChange={(instructor) => setDraft({ ...draft, instructor })}
              />
              <Field
                label="Học phí (VNĐ) *"
                numeric
                value={price}
                onChange={setPrice}
              />
              <Field
                label="Thời lượng (giờ) *"
                numeric
                value={duration}
                onChange={setDuration}
              />
              <Field
                label="URL ảnh bìa *"
                value={draft.thumbnail}
                onChange={(thumbnail) => setDraft({ ...draft, thumbnail })}
              />
              {isHttpUrl(draft.thumbnail) && <Cover uri={draft.thumbnail} />}
              <Field
                label="URL trailer MP4 *"
                value={draft.trailerUrl}
                onChange={(trailerUrl) => setDraft({ ...draft, trailerUrl })}
              />
              <Field
                label="Ngày tạo (YYYY-MM-DD) *"
                value={draft.createdAt}
                onChange={(createdAt) => setDraft({ ...draft, createdAt })}
              />
              <Button
                title={busy ? "Đang lưu…" : "Lưu khóa học"}
                disabled={busy || loading}
                onPress={() => void save()}
              />
            </>
          )}
          {screen === "categories" && (
            <>
              <Text style={s.muted}>
                Sắp xếp nội dung học tập theo từng lĩnh vực.
              </Text>
              <Button
                title="＋ Thêm danh mục"
                disabled={busy}
                onPress={() => editCat()}
              />
              {categoryForm && (
                <View style={s.cardBody}>
                  <Text style={s.title}>
                    {editingCategory ? "Sửa danh mục" : "Danh mục mới"}
                  </Text>
                  <Field
                    label="Tên danh mục *"
                    value={catName}
                    onChange={setCatName}
                  />
                  <Field
                    label="Mô tả danh mục *"
                    multiline
                    value={catDescription}
                    onChange={setCatDescription}
                  />
                  <Button
                    title="Lưu danh mục"
                    disabled={busy}
                    onPress={() => {
                      if (!catName.trim() || !catDescription.trim()) {
                        setError("Nhập tên và mô tả danh mục.");
                        return;
                      }
                      void mutate(async () => {
                        await api.saveCategory(
                          {
                            name: catName.trim(),
                            description: catDescription.trim(),
                          },
                          editingCategory?.id,
                        );
                        setCategoryForm(false);
                        await reload();
                      });
                    }}
                  />
                  <Button
                    title="Hủy"
                    disabled={busy}
                    onPress={() => setCategoryForm(false)}
                  />
                </View>
              )}
              {!loading && !categories.length && (
                <Text style={s.empty}>Chưa có danh mục.</Text>
              )}
              {categories.map((c) => (
                <View key={c.id} style={[s.card, s.cardBody]}>
                  <Text style={s.title}>{c.name}</Text>
                  <Text style={s.description}>{c.description}</Text>
                  <Text style={s.muted}>
                    {
                      courses.filter((x) => String(x.categoryId) === c.id)
                        .length
                    }{" "}
                    khóa học
                  </Text>
                  <View style={s.row}>
                    <Button
                      title="Sửa"
                      disabled={busy}
                      onPress={() => editCat(c)}
                    />
                    <Button
                      title="Xóa"
                      danger
                      disabled={busy}
                      onPress={() =>
                        setConfirm({
                          text: `Xóa danh mục “${c.name}”? Chỉ được xóa khi không còn khóa học.`,
                          action: async () => {
                            await api.deleteCategory(c.id);
                            if (filter === c.id) setFilter("");
                            await reload();
                          },
                        })
                      }
                    />
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
        <View style={s.nav}>
          <Pressable style={s.navItem} onPress={() => go("courses")}>
            <Text style={screen !== "categories" ? s.navActive : s.muted}>
              ▤ Khóa học
            </Text>
          </Pressable>
          <Pressable style={s.navItem} onPress={() => go("categories")}>
            <Text style={screen === "categories" ? s.navActive : s.muted}>
              ▦ Danh mục
            </Text>
          </Pressable>
        </View>
        <Modal
          visible={playing}
          animationType="slide"
          onRequestClose={() => setPlaying(false)}
        >
          <SafeAreaView style={s.safe}>
            <View style={s.content}>
              <Button title="Đóng trailer" onPress={() => setPlaying(false)} />
              {playing && selected && <Trailer url={selected.trailerUrl} />}
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
          transparent
          visible={!!confirm}
          animationType="fade"
          onRequestClose={() => setConfirm(null)}
        >
          <View style={s.overlay}>
            <View style={s.dialog}>
              <Text style={s.title}>Xác nhận xóa</Text>
              <Text style={s.description}>{confirm?.text}</Text>
              <Button
                title="Xác nhận xóa"
                danger
                onPress={() => {
                  const action = confirm?.action;
                  setConfirm(null);
                  if (action) void mutate(action);
                }}
              />
              <Button title="Hủy" onPress={() => setConfirm(null)} />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f7f2" },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#245b49",
    marginBottom: 7,
  },
  heading: { fontSize: 21, fontWeight: "700", color: "#182e27" },
  content: {
    padding: 20,
    paddingTop: 4,
    gap: 16,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingBottom: 36,
  },
  hero: { backgroundColor: "#e2eddf", padding: 24, borderRadius: 20, gap: 14 },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#183e2e",
    lineHeight: 42,
  },
  eyebrow: {
    color: "#37684b",
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dce1d8",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "white",
    fontSize: 16,
    color: "#182e27",
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  chip: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "#e9ece4",
  },
  chipActive: { backgroundColor: "#245b49" },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e8df",
  },
  cardBody: {
    padding: 18,
    gap: 12,
    backgroundColor: "white",
    borderRadius: 16,
  },
  cover: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    backgroundColor: "#e4e8df",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#182e27" },
  bigTitle: { fontSize: 29, fontWeight: "800", color: "#182e27" },
  muted: { color: "#637268", lineHeight: 21 },
  description: { fontSize: 16, lineHeight: 25, color: "#394c40" },
  price: { fontSize: 20, fontWeight: "800", color: "#245b49" },
  label: { fontSize: 14, fontWeight: "600", color: "#253e30" },
  button: {
    backgroundColor: "#245b49",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  danger: { backgroundColor: "#a33d35" },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
  link: { color: "#245b49", fontWeight: "700", paddingVertical: 8 },
  errorBox: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "#fff0e9",
    borderRadius: 12,
  },
  error: { color: "#a33d35", lineHeight: 21 },
  empty: { textAlign: "center", padding: 25, color: "#637268", lineHeight: 24 },
  picker: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#dce1d8",
    borderRadius: 12,
  },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#dce1d8",
    backgroundColor: "white",
  },
  navItem: { flex: 1, padding: 19, alignItems: "center" },
  navActive: { color: "#245b49", fontWeight: "800" },
  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "white",
    gap: 18,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
});
