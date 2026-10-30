
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  gallery_images: string[] | null;
};

async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(
    /[^a-zA-Z0-9.-]/g,
    "-"
  )}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("project-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
function validateImageFile(file: File): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Please upload JPG, PNG or WebP images only.");
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must not exceed 5 MB.");
    return false;
  }

  return true;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [galleryImagesText, setGalleryImagesText] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/admin");
        return;
      }

      await loadProjects();
      setChecking(false);
    }

    initialize();
  }, [router]);

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, image_url, category, gallery_images")      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load projects: " + error.message);
      return;
    }

    setProjects((data ?? []) as Project[]);
  }

  function clearForm() {
  setTitle("");
  setDescription("");
  setImageUrl("");
  setGalleryImagesText("");
  setCoverFile(null);
  setGalleryFiles([]);
  setCoverPreview("");
  setGalleryPreviews([]);
  setCategory("");
  setEditingId(null);
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setSaving(true);
  setMessage("");

  try {
    // Upload cover image if selected
    const finalImageUrl = coverFile
      ? await uploadImage(coverFile)
      : imageUrl.trim();

    // Upload all selected gallery screenshots
    const uploadedGalleryUrls = await Promise.all(
      galleryFiles.map((file) => uploadImage(file))
    );

    // Keep existing URLs and add newly uploaded images
    const existingGalleryUrls = galleryImagesText
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      image_url: finalImageUrl,
      category: category.trim(),
      gallery_images: [
        ...existingGalleryUrls,
        ...uploadedGalleryUrls,
      ],
    };

    if (editingId) {
      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingId);

      if (error) throw error;
      setMessage("Project updated successfully!");
    } else {
      const { error } = await supabase
        .from("projects")
        .insert([projectData]);

      if (error) throw error;
      setMessage("Project added successfully!");
    }

    clearForm();
    await loadProjects();

  } catch (error) {
    console.error("Project save error:", error);

    setMessage(
      error instanceof Error
        ? error.message
        : JSON.stringify(error)
    );
  } finally {
    setSaving(false);
  }
}

  function handleEdit(project: Project) {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setImageUrl(project.image_url);
    setGalleryImagesText((project.gallery_images ?? []).join("\n"));
    setCategory(project.category);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Could not delete project: " + error.message);
      return;
    }

    setMessage("Project deleted successfully!");
    if (editingId === id) clearForm();
    await loadProjects();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  if (checking) {
    return <main className="dashboard">Checking login...</main>;
  }

  return (
    <main className="dashboard">
      <section className="panel">
        <h1>Dashboard</h1>
        <p>Manage your portfolio projects here.</p>

        <div className="project-box">
          <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Project title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <label htmlFor="imageUrl">Project image URL</label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              
            />
            <label htmlFor="coverFile">Or upload cover image</label>
            <input
               id="coverFile"
               type="file"
               accept="image/png,image/jpeg,image/webp"
               onChange={(e) => {
  const file = e.target.files?.[0];

  if (file && validateImageFile(file)) {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  } else {
    setCoverFile(null);
    setCoverPreview("");
    e.target.value = "";
  }
}}
            />
            {coverPreview && (
  <div>
    <p>Cover image preview:</p>
    <img
      src={coverPreview}
      alt="Cover preview"
      style={{
        width: "200px",
        height: "auto",
        borderRadius: "10px",
        objectFit: "cover",
      }}
    />
  </div>
)}
            <p>Recommended: 1200 × 900 px. Maximum size: 5 MB.</p>
            <label htmlFor="galleryImages">
  Project gallery images (one URL per line)
</label>

<textarea
  id="galleryImages"
  value={galleryImagesText}
  onChange={(e) => setGalleryImagesText(e.target.value)}
  placeholder={"https://example.com/screenshot1.png\nhttps://example.com/screenshot2.png"}
  rows={5}
/>
<label htmlFor="galleryFiles">
  Or upload gallery screenshots
</label>

<input
  id="galleryFiles"
  type="file"
  accept="image/png,image/jpeg,image/webp"
  multiple
 onChange={(e) => {
  const files = Array.from(e.target.files ?? []);

  if (files.every((file) => validateImageFile(file))) {
    setGalleryFiles(files);
    setGalleryPreviews(
      files.map((file) => URL.createObjectURL(file))
    );
  } else {
    setGalleryFiles([]);
    setGalleryPreviews([]);
    e.target.value = "";
  }
}}
/>
{galleryPreviews.length > 0 && (
  <div>
    <p>Gallery image previews:</p>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      {galleryPreviews.map((preview, index) => (
        <img
          key={index}
          src={preview}
          alt={`Gallery preview ${index + 1}`}
          style={{
            width: "130px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ))}
    </div>
  </div>
)}

<p>
  Recommended dimensions: 1512 × 983 px.
  Maximum size: 5 MB per image.
  Accepted formats: JPG, PNG, WebP.
</p>

<p>
  Add each screenshot URL on a new line. These images will appear
  when someone opens this project.
</p>

            <label htmlFor="category">Category</label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="UI/UX Design"
              required
            />

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Project"
                  : "Add Project"}
            </button>

            {editingId && (
              <button type="button" onClick={clearForm}>
                Cancel Edit
              </button>
            )}
          </form>

          {message && <p role="status">{message}</p>}
        </div>

        <h2>Existing Projects ({projects.length})</h2>

        <div className="project-list">
          {projects.map((project) => (
            <article className="project-item" key={project.id}>
              <h3>{project.title}</h3>
              <p>{project.category}</p>
              <p>{project.description}</p>

              <div className="actions">
                <button onClick={() => handleEdit(project)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(project.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}

          {projects.length === 0 && <p>No projects added yet.</p>}
        </div>

        <button onClick={handleLogout}>Sign Out</button>
      </section>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          padding: 24px;
          display: flex;
          justify-content: center;
          background: #100b1d;
          color: white;
          font-family: Arial, sans-serif;
        }

        .panel {
          width: 100%;
          max-width: 800px;
          padding: 32px;
          border: 1px solid #39284f;
          border-radius: 16px;
          background: #1b1429;
        }

        h1 {
          margin-top: 0;
          font-size: 30px;
        }

        p {
          color: #c2b8d1;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .project-box,
        .project-item {
          margin: 24px 0;
          padding: 20px;
          border: 1px solid #514065;
          border-radius: 12px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        label {
          font-size: 14px;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #514065;
          border-radius: 8px;
          background: #100b1d;
          color: white;
          font: inherit;
        }

        button {
          margin: 6px 8px 6px 0;
          padding: 12px 18px;
          border: none;
          border-radius: 8px;
          background: #a78bfa;
          color: #160d27;
          font-weight: bold;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      `}</style>
    </main>
  );
}
