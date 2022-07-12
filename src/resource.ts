import joplin from "api";
import * as os from "os";
import * as path from "path";
import { promises } from "fs";
const { writeFile } = promises;

export async function createMindmapFile(svg = "") {
  const filepath = path.resolve(
    os.tmpdir(),
    Math.random().toString(36).slice(2) + ".mindmap.svg"
  );
  await writeFile(filepath, svg);
  return filepath;
}

export async function createMindmap() {
  const res = await joplin.data.post(
    ["resources"],
    null,
    { title: "mindmap.svg" },
    [
      {
        path: await createMindmapFile(""),
      },
    ]
  );
  return res;
}

export async function updateMindmap(resouceId, svg) {
  const res = await joplin.data.put(
    ["resources", resouceId],
    null,
    { title: "mindmap.svg" },
    [
      {
        path: await createMindmapFile(svg),
      },
    ]
  );
  return res;
}

export async function isDiagramResource(resourceId: string): Promise<boolean> {
  const resourceProperties = await joplin.data.get(["resources", resourceId]);
  return resourceProperties.title.startsWith("mindmap");
}

export async function getMindMap(resourceId: string) {
  const resourceData = await joplin.data.get(["resources", resourceId, "file"]);
  console.log(resourceData);
  return Buffer.from(resourceData.body).toString();
}
