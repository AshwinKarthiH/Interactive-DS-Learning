/* Sandbox has an opaque origin; inherited CSP blocks network. Worker is disposable. */
globalThis.AlgoRunner = {
 run(code, fnName, tests, unordered = false, timeout = 2000) {
  return new Promise((resolve, reject) => {
   const frame = document.createElement('iframe');
   frame.hidden = true; frame.setAttribute('sandbox', 'allow-scripts');
   const token = crypto.randomUUID();
   let timer;
   function cleanup() { clearTimeout(timer); window.removeEventListener('message', onMessage); frame.remove(); }
   function onMessage(event) {
    if (event.source !== frame.contentWindow || event.data?.token !== token) return;
    const message = event.data;
    if (message.started) {clearTimeout(timer); timer=setTimeout(()=>{cleanup();reject(new Error(`Execution exceeded ${timeout}ms. Check for an infinite loop.`));},timeout); return;}
    if (message.ready) {frame.contentWindow.postMessage({token, code, fnName, args: tests.map(t=>t.args)}, '*'); return;}
    cleanup();
    if (message.error) {reject(new Error(message.error)); return;}
    if (!Array.isArray(message.outputs) || message.outputs.length !== tests.length || !Number.isFinite(message.time)) {reject(new Error('Invalid execution output')); return;}
    const results = message.outputs.map((output,i) => {
     const expected=tests[i].expected;
     let actual=output;
     if (unordered && Array.isArray(actual)) actual=[...actual].sort((a,b)=>a-b);
     const target=unordered && Array.isArray(expected) ? [...expected].sort((a,b)=>a-b) : expected;
     return {actual: JSON.stringify(output), passed: JSON.stringify(actual) === JSON.stringify(target)};
    });
    resolve({results, time:message.time});
   }
   window.addEventListener('message', onMessage);
   timer = setTimeout(()=>{cleanup(); reject(new Error('Execution sandbox could not start within 10 seconds.'));},10000);
   const workerSource = "postMessage({started:true});\nonmessage = function(event) {\n const {code,fnName,args}=event.data; const send=postMessage.bind(self);\n try {\n  const start=performance.now();\n  const fn=new Function(code+'\\nreturn '+fnName+';')();\n  if(typeof fn!=='function') throw new Error('Expected function '+fnName);\n  const outputs=args.map(values=>fn(...values));\n  send({outputs,time:performance.now()-start});\n } catch(error) {send({error:String(error.message)});}\n};";
   const bridge = `
    const token=${JSON.stringify(token)};
    addEventListener('message', event => {
     if(event.source!==parent || event.data?.token!==token) return;
     const source = ${JSON.stringify(workerSource)};
     try {
      const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
      const worker=new Worker(url); URL.revokeObjectURL(url);
      worker.onmessage=e=>{parent.postMessage({...e.data,token},'*'); if(!e.data.started) worker.terminate();};
      worker.onerror=event=>{parent.postMessage({error:'Worker execution failed: '+event.message,token},'*');worker.terminate();};
      worker.postMessage(event.data);
     } catch(error) {parent.postMessage({error:String(error.message),token},'*');}
    }, {once:true});
    parent.postMessage({ready:true,token},'*');`;
   frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none'"><script>${bridge}<\/script>`;
   document.body.appendChild(frame);
  });
 }
};

