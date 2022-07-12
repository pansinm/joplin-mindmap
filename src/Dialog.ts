import joplin from "api";
import { readFile } from "fs/promises";

class Dialog {
  private handle: string;
  async open(svg: string = "") {
    if (!this.handle) {
      this.handle = await joplin.views.dialogs.create("mindmap-dialog");
      await joplin.views.dialogs.setFitToContent(this.handle, false);
      await joplin.views.dialogs.addScript(this.handle, "./dialog/mindmap.js");
      await joplin.views.dialogs.setButtons(this.handle, [
        { id: "ok", title: "Save" },
        { id: "cancel", title: "Close" },
      ]);
    }
    await joplin.views.dialogs.setHtml(
      this.handle,
      `<div>
        <form name="mindmap">
            <input id="savedSvg" name="savedSvg">
            <input name="openedSvg" value="${encodeURIComponent(svg)}">
        </form>
      </div>
      `
    );
    const res = await joplin.views.dialogs.open(this.handle);
    if (res.id !== 'ok') {
      throw new Error('cancel');
    }
    console.log(res);
    return res.formData?.mindmap?.savedSvg;
  }
}

export default new Dialog();
