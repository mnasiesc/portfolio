import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const contentPath = path.join(process.cwd(), "content/portfolio.json");
const contentEtag = () => `"${createHash("sha256").update(fs.readFileSync(contentPath)).digest("hex")}"`;
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
    button.primary{background:var(--accent);color:#17200d;border-color:var(--accent);font-weight:700}.shell{display:grid;grid-template-columns:225px minmax(0,1fr);min-height:calc(100vh - 63px)}
    nav{padding:18px 12px;border-right:1px solid var(--line)}
    .nav-group{margin:0 0 18px}
    .nav-group-title{font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--accent);text-transform:uppercase;padding:0 8px 6px;border-bottom:1px solid #2d332d;margin-bottom:6px;opacity:.9}
    nav button{display:block;width:100%;text-align:left;margin:0 0 4px;padding:7px 10px;border-radius:4px;background:transparent;border:1px solid transparent;color:var(--muted);font-size:13px}
    nav button:hover{background:#222622;color:var(--text)}
    nav button.active{background:var(--panel);color:var(--text);border-color:var(--line);font-weight:600}
    main{max-width:1120px;width:100%;padding:26px clamp(16px,4vw,48px)}.intro{color:var(--muted);margin:0 0 22px}.group{margin:0 0 18px;padding:15px;border:1px solid var(--line);background:var(--panel);border-radius:5px}.group>legend{padding:0 7px;font:600 17px Georgia,serif}
    .field{display:grid;grid-template-columns:minmax(145px,220px) minmax(0,1fr);align-items:start;gap:14px;padding:10px 0;border-bottom:1px solid #343934}.field:last-child{border-bottom:0}.field>label{font-size:13px;color:var(--muted);overflow-wrap:anywhere;padding-top:8px}
    .field input:not([type=file]),.field textarea,.field select{width:100%;min-width:0;border:1px solid var(--line);border-radius:4px;padding:9px 10px;background:#151815;color:var(--text);font:13px/1.5 ui-monospace,monospace}
    .field select{cursor:pointer}.field select option{background:#181c18;color:var(--text)}
    .field textarea{min-height:76px;resize:vertical}.field input[type=file]{max-width:100%;color:var(--muted)}
    .array-item{margin:11px 0;padding:11px;border-left:2px solid #718b4d;background:#191c19}.array-heading{display:flex;align-items:center;gap:6px;padding-bottom:5px}.array-heading strong{font-size:12px;color:var(--muted);margin-right:auto}.array-heading button{padding:4px 8px;font-size:12px}.array-heading .remove{color:var(--danger)}
    .preview{display:block;max-width:190px;max-height:150px;object-fit:contain;background:#111;padding:6px;margin:8px 0;border:1px solid var(--line)}.array-actions{display:flex;gap:8px;margin-top:10px}details{margin-top:24px;border-top:1px solid var(--line);padding-top:14px;color:var(--muted)}
    details textarea{display:block;width:100%;min-height:280px;margin:10px 0;background:#101210;color:var(--text);border:1px solid var(--line);padding:12px;font:12px/1.5 ui-monospace,monospace}.toast{position:fixed;bottom:18px;right:18px;z-index:4;max-width:min(520px,calc(100vw - 36px));white-space:pre-wrap;background:#282e28;border:1px solid var(--line);padding:12px 16px;border-radius:5px;box-shadow:0 8px 30px #0008}.toast.error{border-color:var(--danger)}
    @media(max-width:700px){header{padding:12px}h1{font-size:16px}.shell{grid-template-columns:1fr}nav{display:flex;overflow-x:auto;gap:8px;padding:9px;border-right:0;border-bottom:1px solid var(--line)}.nav-group{display:flex;gap:4px;margin:0}.nav-group-title{display:none}nav button{width:auto;white-space:nowrap;margin:0}.field{grid-template-columns:1fr;gap:3px}.field>label{padding-top:0}}
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
    let contentVersion;
    let currentSection="home";
    const form=document.querySelector("#form"),nav=document.querySelector("#sections"),status=document.querySelector("#status"),raw=document.querySelector("#raw"),toast=document.querySelector("#toast");
    const labelize=(key)=>String(key).replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/[-_]/g," ").replace(/^./,c=>c.toUpperCase());
    function notify(message,error=false){toast.textContent=message;toast.className=error?"toast error":"toast";toast.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.hidden=true,5000)}
    function syncRaw(){raw.value=JSON.stringify(documentData,null,2)}
    function getCollection(path){let value=documentData;for(const key of path)value=value[key];return value}
    function setPath(path,value){let parent=documentData;for(const key of path.slice(0,-1))parent=parent[key];parent[path.at(-1)]=value;syncRaw()}

    const PROJECT_STATUSES = [
      { value: "early", label: "Early" },
      { value: "featured", label: "Featured" },
      { value: "active", label: "Active" },
      { value: "experimental", label: "Experimental" },
      { value: "concept", label: "Concept" },
      { value: "maintenance", label: "Maintenance" },
      { value: "archived", label: "Archived" }
    ];

    const AVAILABILITY_OPTIONS = [
      "Open to Opportunities",
      "Available for Full-time",
      "Available for Freelance",
      "Limited Availability",
      "Exploring Ideas",
      "Unavailable / Busy"
    ];

    function newEntry(path,items){
      const area=path.join(".");
      if(area==="projects")return{id:"new-project",title:"New project",description:"",longDescription:"",tags:[],status:"early",year:String(new Date().getFullYear()),repoUrl:"https://github.com/"};
      if(area==="articles")return{slug:"new-article",title:"New article",excerpt:"",date:new Date().toISOString().slice(0,10),readingTime:"1 min read",category:"Notes",tags:[],featured:false,externalRedirect:true,body:""};
      if(area==="images")return{id:"new-image",mimeType:"image/png",data:"",alt:"",width:1,height:1,generatedFile:"/generated-content/new-image.png"};
      if(area==="navigation")return{label:"New link",href:"/"};
      if(area==="socials")return{label:"New social",href:"https://example.com",handle:""};
      if(area==="home.actions")return{label:"New action",href:"/"};
      if(area==="home.customSections")return{id:"new-section",title:"New Section (e.g. Hobbies / OSS)",description:"Short description of this section",items:[{title:"First Subsection Item",description:"Brief details about this item",meta:"",link:""}]};
      if(area.endsWith(".items")&&path.includes("customSections"))return{title:"New Subsection Item",description:"Description of this subsection",meta:"",link:""};
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

      // Availability dropdown (Home availability status)
      if(key==="availability"){
        const select=document.createElement("select");
        const allOpts=Array.from(new Set([...AVAILABILITY_OPTIONS,value||AVAILABILITY_OPTIONS[0]]));
        for(const opt of allOpts){
          const option=document.createElement("option");
          option.value=opt;
          option.textContent=opt;
          if(value===opt)option.selected=true;
          select.append(option);
        }
        select.addEventListener("change",()=>setPath(path,select.value));
        row.append(select);
        return row;
      }

      // Status dropdown (Project Status: Early, Featured, Active, Experimental, Concept, Maintenance, Archived)
      if(key==="status"&&path.includes("projects")){
        const select=document.createElement("select");
        for(const opt of PROJECT_STATUSES){
          const option=document.createElement("option");
          option.value=opt.value;
          option.textContent=opt.label;
          if(value===opt.value)option.selected=true;
          select.append(option);
        }
        select.addEventListener("change",()=>setPath(path,select.value));
        row.append(select);
        return row;
      }

      // Year dropdown (Year picker from currentYear + 2 down to 2018)
      if(key==="year"){
        const select=document.createElement("select");
        const currentYear=new Date().getFullYear();
        const yearSet=new Set();
        for(let y=currentYear+2;y>=2018;y--)yearSet.add(String(y));
        if(value)yearSet.add(String(value));
        const sortedYears=Array.from(yearSet).sort((a,b)=>Number(b)-Number(a));
        for(const y of sortedYears){
          const option=document.createElement("option");
          option.value=y;
          option.textContent=y;
          if(String(value)===y)option.selected=true;
          select.append(option);
        }
        select.addEventListener("change",()=>setPath(path,select.value));
        row.append(select);
        return row;
      }

      // Full Date picker for articles and complete dates
      if(key==="date"){
        const input=document.createElement("input");
        input.type="date";
        input.value=value?String(value).slice(0,10):"";
        input.addEventListener("input",()=>setPath(path,input.value));
        row.append(input);
        return row;
      }

      // Image ID reference dropdown
      if((key==="avatarImage"||(key==="image"&&path.includes("projects"))||(path.includes("icons")&&typeof value==="string"))&&Array.isArray(documentData?.images)){
        const select=document.createElement("select");
        if(key==="image"){
          const optNone=document.createElement("option");
          optNone.value="";
          optNone.textContent="— None —";
          select.append(optNone);
        }
        for(const img of documentData.images){
          const option=document.createElement("option");
          option.value = img.id;
          option.textContent = img.id + (img.alt ? " (" + img.alt + ")" : "");
          if (value === img.id) option.selected = true;
          select.append(option);
        }
        select.addEventListener("change",()=>setPath(path,select.value));
        row.append(select);
        return row;
      }

      // Article Category helper
      if(key==="category"&&path.includes("articles")){
        const wrap=document.createElement("div");wrap.style.display="flex";wrap.style.gap="8px";
        const select=document.createElement("select");
        const defaultCats=["Engineering","Architecture","Systems","Performance","Notes","Guides","Opinion"];
        const allCats=Array.from(new Set([...defaultCats,value||"Notes"]));
        for(const cat of allCats){
          const opt=document.createElement("option");opt.value=cat;opt.textContent=cat;
          if(value===cat)opt.selected=true;
          select.append(opt);
        }
        const customInput=document.createElement("input");customInput.type="text";customInput.placeholder="Or type category...";customInput.value=value||"";
        select.addEventListener("change",()=>{customInput.value=select.value;setPath(path,select.value)});
        customInput.addEventListener("input",()=>setPath(path,customInput.value));
        wrap.append(select,customInput);row.append(wrap);return row;
      }

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
          const add=document.createElement("button");add.type="button";
          const addLabel=key==="customSections"?"+ Add Custom Section":(key==="items"&&path.includes("customSections")?"+ Add Subsection Item":"+ Add item");
          add.textContent=addLabel;
          add.addEventListener("click",()=>{value.push(newEntry(path,value));render()});
          wrapper.append(add);
        }else for(const[childKey,childValue]of Object.entries(value))wrapper.append(makeField(childKey,childValue,[...path,childKey]));
        row.append(wrapper);return row;
      }
      if(typeof value==="boolean"){
        const input=document.createElement("input");input.type="checkbox";input.checked=value;input.addEventListener("change",()=>setPath(path,input.checked));row.append(input);return row;
      }
      const input=typeof value==="string"&&(value.length>100||key==="body"||key==="longDescription")?document.createElement("textarea"):document.createElement("input");
      input.value=value??"";input.addEventListener("input",()=>setPath(path,input.value));row.append(input);return row;
    }

    const NAV_GROUPS=[
      {
        title:"Header & Masthead",
        sections:[
          {id:"site",label:"Site Identity & SEO"},
          {id:"navigation",label:"Navigation Links"},
          {id:"socials",label:"Social Profiles"}
        ]
      },
      {
        title:"Main Panels",
        sections:[
          {id:"home",label:"Home Panel & Sections"},
          {id:"projects",label:"Engineering Projects"},
          {id:"articles",label:"Technical Articles"},
          {id:"writing",label:"Writing Settings"},
          {id:"terminal",label:"Terminal Config"},
          {id:"images",label:"Media & Assets"}
        ]
      }
    ];

    function render(){
      nav.replaceChildren();
      const allSections=Object.keys(documentData).filter(s=>s!=="schemaVersion");
      const placed=new Set();

      for(const group of NAV_GROUPS){
        const groupEl=document.createElement("div");groupEl.className="nav-group";
        const groupTitle=document.createElement("div");groupTitle.className="nav-group-title";groupTitle.textContent=group.title;groupEl.append(groupTitle);
        let hasSections=false;
        for(const item of group.sections){
          if(allSections.includes(item.id)){
            hasSections=true;placed.add(item.id);
            const button=document.createElement("button");button.type="button";
            button.textContent=item.label;
            button.className=item.id===currentSection?"active":"";
            button.addEventListener("click",()=>{currentSection=item.id;render()});
            groupEl.append(button);
          }
        }
        if(hasSections)nav.append(groupEl);
      }

      const leftovers=allSections.filter(s=>!placed.has(s));
      if(leftovers.length>0){
        const extraGroup=document.createElement("div");extraGroup.className="nav-group";
        const extraTitle=document.createElement("div");extraTitle.className="nav-group-title";extraTitle.textContent="Other Panels";extraGroup.append(extraTitle);
        for(const s of leftovers){
          const button=document.createElement("button");button.type="button";button.textContent=labelize(s);
          button.className=s===currentSection?"active":"";
          button.addEventListener("click",()=>{currentSection=s;render()});
          extraGroup.append(button);
        }
        nav.append(extraGroup);
      }

      form.replaceChildren();
      const fieldset=document.createElement("fieldset");fieldset.className="group";const legend=document.createElement("legend");legend.textContent=labelize(currentSection);fieldset.append(legend);

      if(currentSection==="home"&&!documentData.home.customSections){
        documentData.home.customSections=[];
      }

      const section=documentData[currentSection];
      if(Array.isArray(section))fieldset.append(makeField(currentSection,section,[currentSection]));
      else for(const[key,value]of Object.entries(section))fieldset.append(makeField(key,value,[currentSection,key]));
      form.append(fieldset);syncRaw();
    }
    async function load(){const response=await fetch("/api/content");if(!response.ok)throw new Error(await response.text());documentData=await response.json();contentVersion=response.headers.get("etag");render();status.textContent="Connected to local content file"}
    document.querySelector("#save").addEventListener("click",async()=>{status.textContent="Validating and saving…";try{const response=await fetch("/api/content",{method:"PUT",headers:{"content-type":"application/json","if-match":contentVersion||""},body:JSON.stringify(documentData)});const result=await response.json();if(response.status===409){status.textContent="Content changed elsewhere";notify("The JSON file changed after this editor loaded it. Reload the page before saving to avoid overwriting newer content.",true);return}if(!response.ok)throw new Error(result.error);contentVersion=response.headers.get("etag");status.textContent="Saved locally";notify("Saved and rebuilt image assets.")}catch(error){status.textContent="Save failed";notify(error.message,true)}});
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
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", etag: contentEtag() });
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
      const ifMatch = request.headers["if-match"];
      if (!ifMatch || ifMatch !== contentEtag()) {
        response.writeHead(409, { "content-type": "application/json", etag: contentEtag() });
        response.end(JSON.stringify({ error: "Content changed after this editor loaded. Reload before saving." }));
        return;
      }
      const document = JSON.parse(await readRequestBody(request));
      validateDocument(document);
      const temporaryPath = `${contentPath}.tmp`;
      fs.writeFileSync(temporaryPath, `${JSON.stringify(document, null, 2)}\n`);
      fs.renameSync(temporaryPath, contentPath);
      rebuildAssets(document);
      response.writeHead(200, { "content-type": "application/json", etag: contentEtag() });
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