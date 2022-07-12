const htmlTagRegExp = /^mindmap$/i;
const idAttributeName = "src";

function extractCodeFromIdAttribute(idAttribute) {
  //:/dc918ec87077460fbdbb0986a91c4c9d
  const splitViewMatch = idAttribute.match(/^\:\/([A-Za-z0-9]+)/);
  if (splitViewMatch) {
    return splitViewMatch[1];
  }
  //file://C:/Users/user/.config/joplin-desktop/resources/dc918ec87077460fbdbb0986a91c4c9d.png?t=1647790570726
  const richTextMatch = idAttribute.match(
    /^file\:\/\/.+?([a-z0-9]+)\.(svg|png)(\?t=[0-9]+)?$/
  );
  if (richTextMatch) {
    return richTextMatch[1];
  }
  return null;
}

function getDiagramTagId(token) {
  if (token.attrs && token.attrs.length > 0) {
    for (const attr of token.attrs) {
      if (attr[0] === idAttributeName) {
        return attr[1];
      }
    }
  }
  return "";
}

function buildRenderer(contentScriptId, renderer) {
  const defaultRender =
    renderer ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  return function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    let defaultOutput = defaultRender(tokens, idx, options, env, self);
    console.log("token", token);
    console.log("defaultOutput", defaultOutput);
    if (htmlTagRegExp.test(token.content)) {
      const diagramId = extractCodeFromIdAttribute(getDiagramTagId(token));
      // if (diagramId) {
      const messages = {
        edit: JSON.stringify({ diagramId: diagramId, action: "edit" }),
        check: JSON.stringify({ diagramId: diagramId, action: "check" }),
      };
      const div = document.createElement("div");
      div.innerHTML = defaultOutput;
      const img = div.querySelector("img");
      var newUrl = img.src.replace(/\?.*$/, "?t=" + Date.now());
      img.src = newUrl;
      const sendContentToJoplinPlugin = `
                    document.getElementById('mindmap-${diagramId}-edit').addEventListener('click', async e => {
                        webviewApi.postMessage('${contentScriptId}', ${messages.edit}).then(() => {
                          var button = document.getElementById('mindmap-${diagramId}-edit');
                          var img = button.parentElement.querySelector('img');
                          if (img) {
                            var newUrl = img.src.replace(/\\?.*$/, '?t=' + Date.now());
                            img.src = newUrl
                          }
                        });
                    });
                    // webviewApi.postMessage('${contentScriptId}', ${messages.check}).then((response) => {
                    //     if (response.isValid) {
                    //         document.getElementById('mindmap-${diagramId}-edit').style = "";
                    //     } else {
                    //         document.getElementById('mindmap-${diagramId}-edit').remove();
                    //     }
                    // });
                `.replace(/"/g, "&quot;");
      return `
                    <span class="mindmap-container">
                        ${div.innerHTML}
                        <button id="mindmap-${diagramId}-edit" style="">Edit</button>
                    </span>
                    <style onload="${sendContentToJoplinPlugin}"></style>
                `;
      // }
    }
    return defaultOutput;
  };
}

export default function (context) {
  return {
    plugin: async function (markdownIt, _options) {
      markdownIt.renderer.rules.image = buildRenderer(
        context.contentScriptId,
        markdownIt.renderer.rules.image
      );
    },
    assets: function () {
      return [{ name: "style.css" }];
    },
  };
}
