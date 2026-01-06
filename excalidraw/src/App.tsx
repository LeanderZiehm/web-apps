import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { v4 as uuidv4 } from "uuid";

const LOCAL_STORAGE_KEY = "excalidraw_scene";

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // Load saved scene from localStorage
const loadScene = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return null;

  const parsed = JSON.parse(saved);

  // Ensure collaborators is a Map
  return {
    ...parsed,
    appState: {
      ...parsed.appState,
      collaborators: parsed.appState?.collaborators
        ? new Map(Object.entries(parsed.appState.collaborators))
        : new Map(),
    },
  };
};


  useEffect(() => {
    if (!excalidrawAPI) return;

    // Subscribe to changes and save to localStorage
    const unsubscribe = excalidrawAPI.onChange((elements, appState, files) => {
      const fullScene = { elements, appState, files };
      // Save scene to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullScene));
    });

    return () => unsubscribe();
  }, [excalidrawAPI]);

  useEffect(() => {
    if (!excalidrawAPI) return;

    // Add a circle every second
    const interval = setInterval(() => {
      const width = 50;
      const height = 50;
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const newCircle = {
        type: "ellipse",
        id: uuidv4(),
        x,
        y,
        width,
        height,
        angle: 0,
        strokeColor: "#000000",
        backgroundColor: "#ffb3c1",
        fillStyle: "solid",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        isDeleted: false,
        groupIds: [],
        boundElements: null,
        locked: false,
        updated: Date.now(),
        roundness: null,
      };

      const elements = excalidrawAPI.getSceneElements();
      excalidrawAPI.updateScene({
        elements: [...elements, newCircle],
        captureUpdate: "immediately",
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [excalidrawAPI]);

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={loadScene()} // Load previously saved scene
      />
    </div>
  );
}
