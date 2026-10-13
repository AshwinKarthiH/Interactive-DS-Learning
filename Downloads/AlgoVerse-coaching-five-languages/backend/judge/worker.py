"""Runs only inside the restricted Docker container. Never run untrusted code on the host."""
import json, os, selectors, signal, subprocess, sys, tempfile, time

def run(command, stdin=b'', seconds=12):
    process=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
    process.stdin.write(stdin);process.stdin.close()
    selector=selectors.DefaultSelector();selector.register(process.stdout,selectors.EVENT_READ,'out');selector.register(process.stderr,selectors.EVENT_READ,'err')
    buffers={'out':bytearray(),'err':bytearray()};deadline=time.monotonic()+seconds
    try:
        while selector.get_map():
            if time.monotonic()>deadline:raise RuntimeError('Execution exceeded the time limit.')
            for key,_ in selector.select(.05):
                data=os.read(key.fileobj.fileno(),8192)
                if not data:selector.unregister(key.fileobj);continue
                buffers[key.data].extend(data)
                if len(buffers[key.data])>65536:raise RuntimeError('Output exceeded 64 KB. Remove excessive printing.')
        if process.wait()!=0:raise RuntimeError(buffers['err'].decode(errors='replace')[:3000] or 'Program exited unsuccessfully.')
        return buffers['out']
    finally:
        try:os.killpg(process.pid,signal.SIGKILL)
        except ProcessLookupError:pass
        process.wait();selector.close()

def main():
    payload=json.loads(sys.stdin.buffer.read(1048577));language=payload['language'];code=payload['code'];args=payload['args']
    if len(code)>50000 or language not in ('javascript','python','c','cpp','java'):raise RuntimeError('Invalid submission.')
    with tempfile.TemporaryDirectory(dir='/work') as directory:
        os.chdir(directory)
        if language=='python':
            open('solution.py','w').write(code)
            open('main.py','w').write("import json,sys\nfrom solution import solve\nprint(json.dumps([solve(args) for args in json.load(sys.stdin)],allow_nan=False))\n")
            command=['python3','-B','main.py']
        elif language=='javascript':
            open('main.js','w').write(code+'\nconst fs = require("fs"); const tests=JSON.parse(fs.readFileSync(0,"utf8")); console.log(JSON.stringify(tests.map(args => '+payload['fnName']+'(...args))));')
            command=['node','--max-old-space-size=128','main.js']
        elif language=='cpp':
            open('main.cpp','w').write('#include "json.hpp"\n#include <iostream>\nusing json=nlohmann::json;\n'+code+'\nint main(){json tests;std::cin>>tests;json out=json::array();for(const auto& args:tests)out.push_back(solve(args));std::cout<<out.dump();}')
            run(['g++','-std=c++17','-O1','-I/opt/judge/vendor','main.cpp','-o','solution'],seconds=20);command=['./solution']
        elif language=='c':
            open('main.c','w').write('#include "cJSON.h"\n#include <stdio.h>\n#include <stdlib.h>\n'+code+'\nint main(){char input[1048577];size_t n=fread(input,1,sizeof(input)-1,stdin);input[n]=0;cJSON *tests=cJSON_Parse(input),*out=cJSON_CreateArray(),*args=NULL;if(!tests)return 1;cJSON_ArrayForEach(args,tests){cJSON *answer=solve(args);if(!answer)return 2;cJSON_AddItemToArray(out,answer);}char *s=cJSON_PrintUnformatted(out);if(!s)return 3;puts(s);free(s);cJSON_Delete(out);cJSON_Delete(tests);}')
            run(['gcc','-std=c11','-O1','-I/opt/judge/vendor','main.c','/opt/judge/vendor/cJSON.c','-lm','-o','solution'],seconds=20);command=['./solution']
        else:
            open('Solution.java','w').write(code)
            run(['javac','-J-Xmx192m','-d','.', '/opt/judge/JavaRunner.java','Solution.java'],seconds=20);command=['java','-Xmx128m','-XX:MaxMetaspaceSize=96m','-cp','.','JavaRunner']
        start=time.monotonic();raw=run(command,json.dumps(args,allow_nan=False).encode(),seconds=4);outputs=json.loads(raw)
        if not isinstance(outputs,list) or len(outputs)!=len(args):raise RuntimeError('Return one JSON result per test; remove debug printing from stdout.')
        return {'outputs':outputs,'time':(time.monotonic()-start)*1000}

try:result=main()
except Exception as error:result={'error':str(error)[:3000]}
print(json.dumps(result,allow_nan=False))
