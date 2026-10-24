import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const contentPath = path.join(process.cwd(), "content/portfolio.json");
const schema = JSON.parse(fs.readFileSync("content/portfolio.schema.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function validateDocument(document) {
  if (!validate(document)) {
    const message = (validate.errors ?? [])
      .map((error) => `${error.instancePath || "/"}: ${error.message}`)
      .join("\n");
    throw new Error(message);
  }

  for (const [field, label] of [["projects", "project ID"], ["articles", "article slug"], ["images", "image ID"]]) {
    const values = document[field].map((item) => item.id ?? item.slug);
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}.`);
  }

  for (const image of document.images) {
    const bytes = Buffer.from(image.data, "base64");
    if (!bytes.length || bytes.length > 9_000_000 || bytes.toString("base64") !== image.data) {
      throw new Error(`Image ${image.id} has invalid base64 or exceeds the 9 MB image limit.`);
    }
  }
}

function rebuildAssets(document) {
  const outputDirectory = path.join(process.cwd(), "public/generated-content");
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const image of document.images) {
    fs.writeFileSync(
      path.join(outputDirectory, path.basename(image.generatedFile)),
      Buffer.from(image.data, "base64"),
    );
  }
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 20_000_000) {
        reject(new Error("Editor request exceeds 20 MB."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Portfolio Content Editor</title>
  <style>
    :root{color-scheme:dark;--bg:#171917;--panel:#202320;--line:#3b403b;--text:#f1f1e9;--muted:#b0b5ad;--accent:#b9d77c;--danger:#ff9b8c;font:15px/1.5 ui-sans-serif,system-ui,sans-serif}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}
    header{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:14px;padding:15px 22px;background:#171917ed;border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}
    h1{font:600 19px/1.2 Georgia,serif;margin:0}.status{font-size:13px;color:var(--muted);margin-left:auto}
    button{border:1px solid var(--line);border-radius:5px;background:#292e29;color:var(--text);padding:7px 10px;cursor:pointer;font:inherit}button:hover{border-color:var(--accent)}button:disabled{opacity:.4;cursor:default}
    button.primary{background:var(--accent);color:#17200d;border-color:var(--accent);font-weight:700}.shell{display:grid;grid-template-columns:215px minmax(0,1fr);min-height:calc(100vh - 63px)}
    nav{padding:18px 12px;border-right:1px solid var(--line)}nav button{display:block;width:100%;text-align:left;margin:0 0 5px;background:transparent;border-color:transparent;color:var(--muted)}nav button.active{background:var(--panel);color:var(--text);border-color:var(--line)}
    main{max-width:1120px;width:100%;padding:26px clamp(16px,4vw,48px)}.intro{color:var(--muted);margin:0 0 22px}.group{margin:0 0 18px;padding:15px;border:1px solid var(--line);background:var(--panel);border-radius:5px}.group>legend{padding:0 7px;font:600 17px Georgia,serif}
    .field{display:grid;grid-template-columns:minmax(145px,220px) minmax(0,1fr);align-items:start;gap:14px;padding:10px 0;border-bottom:1px solid #343934}.field:last-child{border-bottom:0}.field>label{font-size:13px;color:var(--muted);overflow-wrap:anywhere;padding-top:8px}
    .field input:not([type=file]),.field textarea{width:100%;min-width:0;border:1px solid var(--line);border-radius:4px;padding:9px 10px;background:#151815;color:var(--text);font:13px/1.5 ui-monospace,monospace}.field textarea{min-height:76px;resize:vertical}.field input[type=file]{max-width:100%;color:var(--muted)}
    .array-item{margin:11px 0;padding:11px;border-left:2px solid #718b4d;background:#191c19}.array-heading{display:flex;align-items:center;gap:6px;padding-bottom:5px}.array-heading strong{font-size:12px;color:var(--muted);margin-right:auto}.array-heading button{padding:4px 8px;font-size:12px}.array-heading .remove{color:var(--danger)}
    .preview{display:block;max-width:190px;max-height:150px;object-fit:contain;background:#111;padding:6px;margin:8px 0;border:1px solid var(--line)}.array-actions{display:flex;gap:8px;margin-top:10px}details{margin-top:24px;border-top:1px solid var(--line);padding-top:14px;color:var(--muted)}
    details textarea{display:block;width:100%;min-height:280px;margin:10px 0;background:#101210;color:var(--text);border:1px solid var(--line);padding:12px;font:12px/1.5 ui-monospace,monospace}.toast{position:fixed;bottom:18px;right:18px;z-index:4;max-width:min(520px,calc(100vw - 36px));white-space:pre-wrap;background:#282e28;border:1px solid var(--line);padding:12px 16px;border-radius:5px;box-shadow:0 8px 30px #0008}.toast.error{border-color:var(--danger)}
    @media(max-width:700px){header{padding:12px}h1{font-size:16px}.shell{grid-template-columns:1fr}nav{display:flex;overflow-x:auto;gap:5px;padding:9px;border-right:0;border-bottom:1px solid var(--line)}nav button{width:auto;white-space:nowrap;margin:0}.field{grid-template-columns:1fr;gap:3px}.field>label{padding-top:0}}
  </style>
</head>
<body>
  <header><h1>Portfolio Content</h1><span class="status" id="status">Loading content…</span><button id="save" class="primary" type="button">Save JSON</button></header>
  <div class="shell"><nav id="sections" aria-label="Content sections"></nav><main>
    <p class="intro">Edits are saved to <code>content/portfolio.json</code>. Collection entries can be added, removed, and reordered. Images are embedded in JSON; generated files are rebuilt on save.</p>
    <div id="form"></div><details><summary>Raw JSON</summary><textarea id="raw" spellcheck="false"></textarea><button id="apply-raw" type="button">Apply raw JSON to form</button></details>
  </main></div><div id="toast" hidden class="toast"></div>
  <script>
    let documentData;
    let currentSection="site";
    const form=document.querySelector("#form"),nav=document.querySelector("#sections"),status=document.querySelector("#status"),raw=document.querySelector("#raw"),toast=document.querySelector("#toast");
    const labelize=(key)=>String(key).replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/[-_]/g," ").replace(/^./,c=>c.toUpperCase());
    function notify(message,error=false){toast.textContent=message;toast.className=error?"toast error":"toast";toast.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.hidden=true,5000)}
    function syncRaw(){raw.value=JSON.stringify(documentData,null,2)}
    function getCollection(path){let value=documentData;for(const key of path)value=value[key];return value}
    function setPath(path,value){let parent=documentData;for(const key of path.slice(0,-1))parent=parent[key];parent[path.at(-1)]=value;syncRaw()}
    function newEntry(path,items){
      const area=path.join(".");
      if(area==="projects")return{id:"new-project",title:"New project",description:"",longDescription:"",tags:[],status:"experimental",year:String(new Date().getFullYear()),repoUrl:"https://github.com/"};
      if(area==="articles")return{slug:"new-article",title:"New article",excerpt:"",date:new Date().toISOString().slice(0,10),readingTime:"1 min read",category:"Notes",tags:[],featured:false,body:""};
      if(area==="images")return{id:"new-image",mimeType:"image/png",data:"",alt:"",width:1,height:1,generatedFile:"/generated-content/new-image.png"};
      if(area==="navigation")return{label:"New link",href:"/"};
      if(area==="socials")return{label:"New social",href:"https://example.com",handle:""};
      if(area==="home.actions")return{label:"New action",href:"/"};
      if(area.endsWith(".tags"))return"new-tag";
      return items.length?structuredClone(items[0]):"";
    }
    function makeImageField(value,path){
      const row=document.createElement("div");row.className="field";
      const label=document.createElement("label");label.textContent="Image file";row.append(label);
      const wrap=document.createElement("div"),record=getCollection(path.slice(0,path.length-1));
      const preview=document.createElement("img");preview.className="preview";preview.alt=record.alt||"Image preview";
      if(value)preview.src="data:"+record.mimeType+";base64,"+value;
      const upload=document.createElement("input");upload.type="file";upload.accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon";
      upload.addEventListener("change",()=>{
        const file=upload.files[0];if(!file)return;
        const supported=["image/png","image/jpeg","image/webp","image/svg+xml","image/x-icon"];
        if(!supported.includes(file.type)){notify("Use PNG, JPEG, WebP, SVG, or ICO images.",true);upload.value="";return}
        if(file.size>9_000_000){notify("Image is over the 9 MB limit.",true);upload.value="";return}
        const reader=new FileReader();reader.onload=()=>{
          const data=String(reader.result).split(",")[1];record.data=data;record.mimeType=file.type;
          const extension={"image/jpeg":"jpg","image/svg+xml":"svg","image/x-icon":"ico"}[file.type]||file.type.split("/")[1];
          record.generatedFile="/generated-content/"+record.id+"."+extension;preview.onload=()=>{record.width=preview.naturalWidth||record.width;record.height=preview.naturalHeight||record.height;syncRaw()};preview.src=String(reader.result);syncRaw();
        };reader.readAsDataURL(file);
      });
      wrap.append(preview,upload);row.append(wrap);return row;
    }
    function makeField(key,value,path){
      if(key==="data"&&path.includes("images"))return makeImageField(value,path);
      const row=document.createElement("div");row.className="field";
      const label=document.createElement("label");label.textContent=labelize(key);row.append(label);
      if(value&&typeof value==="object"){
        const wrapper=document.createElement("div");
        if(Array.isArray(value)){
          value.forEach((entry,index)=>{
            const item=document.createElement("div");item.className="array-item";
            const heading=document.createElement("div");heading.className="array-heading";
            const title=document.createElement("strong");title.textContent=entry?.title||entry?.label||entry?.name||entry?.id||entry?.slug||(labelize(key)+" "+(index+1));heading.append(title);
            const up=document.createElement("button");up.type="button";up.textContent="↑";up.title="Move up";up.disabled=index===0;up.addEventListener("click",()=>{[value[index-1],value[index]]=[value[index],value[index-1]];render()});
            const down=document.createElement("button");down.type="button";down.textContent="↓";down.title="Move down";down.disabled=index===value.length-1;down.addEventListener("click",()=>{[value[index+1],value[index]]=[value[index],value[index+1]];render()});
            const remove=document.createElement("button");remove.type="button";remove.className="remove";remove.textContent="Remove";remove.addEventListener("click",()=>{value.splice(index,1);render()});
            heading.append(up,down,remove);item.append(heading);
            if(entry&&typeof entry==="object")for(const[childKey,childValue]of Object.entries(entry))item.append(makeField(childKey,childValue,[...path,index,childKey]));
            else item.append(makeField(String(index+1),entry,[...path,index]));
            wrapper.append(item);
          });
          const add=document.createElement("button");add.type="button";add.textContent="Add item";add.addEventListener("click",()=>{value.push(newEntry(path,value));render()});wrapper.append(add);
        }else for(const[childKey,childValue]of Object.entries(value))wrapper.append(makeField(childKey,childValue,[...path,childKey]));
        row.append(wrapper);return row;
      }
      if(typeof value==="boolean"){
        const input=document.createElement("input");input.type="checkbox";input.checked=value;input.addEventListener("change",()=>setPath(path,input.checked));row.append(input);return row;
      }
      const input=typeof value==="string"&&(value.length>100||key==="body"||key==="longDescription")?document.createElement("textarea"):document.createElement("input");
      input.value=value??"";input.addEventListener("input",()=>setPath(path,input.value));row.append(input);return row;
    }
    function render(){
      nav.replaceChildren();
      for(const section of Object.keys(documentData)){if(section==="schemaVersion")continue;const button=document.createElement("button");button.type="button";button.textContent=labelize(section);button.className=section===currentSection?"active":"";button.addEventListener("click",()=>{currentSection=section;render()});nav.append(button)}
      form.replaceChildren();const fieldset=document.createElement("fieldset");fieldset.className="group";const legend=document.createElement("legend");legend.textContent=labelize(currentSection);fieldset.append(legend);
      const section=documentData[currentSection];if(Array.isArray(section))fieldset.append(makeField(currentSection,section,[currentSection]));else for(const[key,value]of Object.entries(section))fieldset.append(makeField(key,value,[currentSection,key]));
      form.append(fieldset);syncRaw();
    }
    async function load(){const response=await fetch("/api/content");if(!response.ok)throw new Error(await response.text());documentData=await response.json();render();status.textContent="Connected to local content file"}
    document.querySelector("#save").addEventListener("click",async()=>{status.textContent="Validating and saving…";try{const response=await fetch("/api/content",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(documentData)});const result=await response.json();if(!response.ok)throw new Error(result.error);status.textContent="Saved locally";notify("Saved and rebuilt image assets.")}catch(error){status.textContent="Save failed";notify(error.message,true)}});
    document.querySelector("#apply-raw").addEventListener("click",()=>{try{documentData=JSON.parse(raw.value);currentSection=Object.keys(documentData).find(key=>key!=="schemaVersion");render();notify("Raw JSON loaded into the form.")}catch(error){notify("Invalid JSON: "+error.message,true)}});
    load().catch(error=>{status.textContent="Could not load content";notify(error.message,true)});
  </script>
</body>
</html>`;

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  if (request.method === "GET" && url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(page);
    return;
  }

  if (url.pathname === "/api/content" && request.method === "GET") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(fs.readFileSync(contentPath));
    return;
  }

  if (url.pathname === "/api/content" && request.method === "PUT") {
    const origin = request.headers.origin;
    if (origin && origin !== `http://${host}:${port}`) {
      response.writeHead(403, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Cross-origin editor writes are blocked." }));
      return;
    }

    try {
      const document = JSON.parse(await readRequestBody(request));
      validateDocument(document);
      const temporaryPath = `${contentPath}.tmp`;
      fs.writeFileSync(temporaryPath, `${JSON.stringify(document, null, 2)}\n`);
      fs.renameSync(temporaryPath, contentPath);
      rebuildAssets(document);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  response.writeHead(404, { "content-type": "text/plain" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`Portfolio editor listening at http://${host}:${port}`);
  console.log("Local-only editor; save writes content/portfolio.json and rebuilds image derivatives.");
});