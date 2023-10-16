globalThis.scriptFolder = "scripts";

// function createTextArea(txt) {
//   let x = document.createElement("TEXTAREA");
//   let t = document.createTextNode(txt);
//   x.appendChild(t);
//   x.id = "data-result";
//   document.body.append(x);
// }

// function updateTextArea(txt) {
//   let data = document.querySelector("#data-result");
//   data.value = "";
//   data.value = txt;
// }

// const loadTextarea = function () {
//   chrome.runtime.sendMessage({ for: "get-user-data" }, function (response) {
//     if (document.body.contains(document.querySelector("#data-result"))) {
//       updateTextArea(JSON.stringify(response, false, 3));
//     } else {
//       createTextArea(JSON.stringify(response, false, 3));
//     }
//   });
// };

async function getScriptsList() {
  return (await fetch("data/scripts-list.json")).json();
}

function prepareOptions(list) {
  let select =
    document.querySelector("select#scripts-name") ??
    document.createElement("select");
  select.hasAttribute("id") || select.setAttribute("id", "scripts-name");

  document.querySelector("select#scripts-name") || document.querySelector('#scripts-container').append(select);

  const options_new = list.map((item) => {
    const op = new Option(item, item);
    return op;
  });

  select.replaceChildren(select.querySelectorAll("option"), ...options_new);
}

function prepareFrames(list) {
  let select =
    document.querySelector("select#frames-name") ??
    document.createElement("select");
  select.hasAttribute("id") || select.setAttribute("id", "frames-name");

  document.querySelector("select#frames-name") || document.body.append(select);

  const options_new = list.map((item) => {
    const op = new Option(item, item);
    return op;
  });

  select.replaceChildren(select.querySelectorAll("option"), ...options_new);
}

const loadScripts = function () {
  getScriptsList().then((data) => {
    prepareOptions(data);
  });
};

const loadFrames = function () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ for: "get-all-frames" }, function (response) {
      prepareFrames(response.map(f =>{
        console.log(f);
        return `${f.frameId}-${f.frameType}-${f.url}`;
      }));
    });
  });
};

document.addEventListener("DOMContentLoaded", async function (e) {
  loadScripts();
  loadFrames();
});

// document
//   .querySelector("button#load-textarea")
//   .addEventListener("click", loadTextarea);

document
  .querySelector("button#load-script")
  .addEventListener("click", loadScripts);

document
  .querySelector("button#load-frames")
  .addEventListener("click", loadFrames);

function getSelectedScript() {
  try {
    const select = document.querySelector("select#scripts-name");
    if (select) {
      const scriptname = select.options[select.selectedIndex].value;
      if (scriptname) {
        return scriptname;
      } else {
        console.log("script name not found " + scriptname);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return false;
}

document
  .querySelector("button#run-script")
  .addEventListener("click", function (e) {
    let scriptName = getSelectedScript();
    if (scriptName) {
      const fullPath = `${globalThis.scriptFolder}/${scriptName}.js`;
      const frames = [];
      frames.push(document.querySelector("select#frames-name")?.value?.toString()?.split('-')[0]);
      chrome.runtime.sendMessage(
        { for: "run-script", path: fullPath, ...(frames && {frames:[...frames]}) },
        function (response) {
          console.log('popup scripting completed');
          console.log(response);
        }
      );
    }
  });
