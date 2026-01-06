import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { v4 as uuidv4 } from "uuid";

const LOCAL_STORAGE_KEY = "excalidraw_projects";

interface Project {
  id: string;
  name: string;
  data: any; // saved scene JSON
}

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Load all projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setProjects(JSON.parse(saved));
      if (JSON.parse(saved).length > 0) {
        setCurrentProjectId(JSON.parse(saved)[0].id);
      }
    }
  }, []);

  // Save all projects whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Auto-save current canvas on change
  useEffect(() => {
    if (!excalidrawAPI || !currentProjectId) return;

    const unsubscribe = excalidrawAPI.onChange((elements, appState, files) => {
      const fullScene = {
        elements,
        appState: {
          ...appState,
          collaborators: new Map(), // safe default
        },
        files,
      };

      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentProjectId ? { ...p, data: fullScene } : p
        )
      );
    });

    return () => unsubscribe();
  }, [excalidrawAPI, currentProjectId]);

  // Create a new project
  const createProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: `Untitled ${projects.length + 1}`,
      data: null,
    };
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
  };

  // Delete a project
  const deleteProject = (id: string) => {
    const filtered = projects.filter((p) => p.id !== id);
    setProjects(filtered);
    if (currentProjectId === id) {
      setCurrentProjectId(filtered[0]?.id || null);
    }
  };

  // Rename a project
  const renameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  // Load project data when switching
  useEffect(() => {
    if (!excalidrawAPI || !currentProjectId) return;
    const project = projects.find((p) => p.id === currentProjectId);
    if (!project) return;

    const sceneData = project.data || { elements: [], appState: { collaborators: new Map() } };
    excalidrawAPI.updateScene(sceneData);
  }, [currentProjectId, excalidrawAPI]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar UI */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <button onClick={createProject} style={{ marginBottom: "10px" }}>
          + New Canvas
        </button>
        {projects.map((p) => (
          <div key={p.id} style={{ marginBottom: "5px", display: "flex", alignItems: "center" }}>
            <input
              value={p.name}
              onChange={(e) => renameProject(p.id, e.target.value)}
              style={{
                flex: 1,
                marginRight: "5px",
                border: currentProjectId === p.id ? "2px solid blue" : "1px solid #ccc",
              }}
            />
            <button onClick={() => setCurrentProjectId(p.id)}>Load</button>
            <button onClick={() => deleteProject(p.id)} style={{ marginLeft: "5px" }}>
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Excalidraw Canvas */}
      <div style={{ flex: 1 }}>
        <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
      </div>
    </div>
  );
}
