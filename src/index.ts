import joplin from "api";
import { ContentScriptType, MenuItem, MenuItemLocation } from "api/types";
import Dialog from "./Dialog";
import {
  createMindmap,
  getMindMap,
  isDiagramResource,
  updateMindmap,
} from "./resource";

const Config = {
  ContentScriptId: "mindmap-content-script",
};

joplin.plugins.register({
  onStart: async function () {
    const insert = async () => {
      const resource = await createMindmap();
      const svg = await Dialog.open();
      const newRes = await updateMindmap(resource.id, svg);
      await joplin.commands.execute("insertText", `![mindmap](:/${newRes.id})`);
    };

    await joplin.commands.register({
      name: "insert-mindmap",
      label: "Insert Mindmap",
      execute: insert,
    });

    await joplin.views.menus.create(
      "menu-mindmap",
      "Mindmap",
      [
        {
          label: "Insert Mindmap",
          commandName: "insert-mindmap",
        },
      ],
      MenuItemLocation.Tools
    );

    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      Config.ContentScriptId,
      "./contentScript/contentScript.js"
    );

    async function edit(resourceId) {
      const newSvg = await Dialog.open(await getMindMap(resourceId));
      await updateMindmap(resourceId, newSvg);
      await joplin.commands.execute("focusElement", "noteBody");
    }
    /**
     * Messages handling
     */
    await joplin.contentScripts.onMessage(
      Config.ContentScriptId,
      async (request: { diagramId: string; action: string }) => {
        console.log(request);
        switch (request.action) {
          case "edit":
            await edit(request.diagramId);
            return;
          case "check":
            return { isValid: await isDiagramResource(request.diagramId) };
          default:
            return `Invalid action: ${request.action}`;
        }
      }
    );
  },
});
