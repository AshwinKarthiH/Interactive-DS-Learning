package com.algoverse;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import com.fasterxml.jackson.databind.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class DockerJudge {
 final ObjectMapper mapper;final Semaphore slots=new Semaphore(2);
 volatile long checked=0;volatile boolean ready=false;
 DockerJudge(ObjectMapper mapper){this.mapper=mapper;}
 public synchronized boolean available(){if(System.currentTimeMillis()-checked<10000)return ready;checked=System.currentTimeMillis();try{Process p=new ProcessBuilder("docker","image","inspect","algoverse-judge:1").redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();ready=p.waitFor(2,TimeUnit.SECONDS)&&p.exitValue()==0;if(p.isAlive())p.destroyForcibly();}catch(Exception e){ready=false;}return ready;}
 public static List<String> command(String name){return List.of("docker","run","--rm","--pull=never","--name",name,"--network=none","--read-only","--memory=512m","--memory-swap=512m","--cpus=1","--pids-limit=64","--cap-drop=ALL","--security-opt=no-new-privileges","--user=10001:10001","--tmpfs","/work:rw,exec,nosuid,size=67108864,mode=1777","--tmpfs","/tmp:rw,noexec,nosuid,size=33554432,mode=1777","--ulimit","nofile=128:128","-i","algoverse-judge:1");}
 public JudgeService.Result run(String code,Data.Problem problem,String language,boolean submit)throws Exception{
  if(!available())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Docker judge is not ready. Install/start Docker Desktop and run backend/judge/setup.ps1.");
  if(!slots.tryAcquire())throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"The judge is busy. Try again shortly.");
  String name="algoverse-"+UUID.randomUUID();Process process=null;ExecutorService readers=Executors.newSingleThreadExecutor();var tests=problem.tests.stream().filter(t->submit||!t.hidden).toList();
  try{
   process=new ProcessBuilder(command(name)).redirectError(ProcessBuilder.Redirect.DISCARD).start();
   try(var input=process.getOutputStream()){mapper.writeValue(input,Map.of("code",code,"fnName",problem.fnName,"language",language,"args",tests.stream().map(t->t.args).toList()));}
   final InputStream stream=process.getInputStream();var future=readers.submit(()->{byte[] bytes=stream.readNBytes(65537);if(bytes.length>65536)throw new IOException("Output limit exceeded");return bytes;});
   if(!process.waitFor(30,TimeUnit.SECONDS))return new JudgeService.Result(List.of(),0,"Compilation or execution exceeded 30 seconds.",0,tests.size());
   byte[] raw=future.get(2,TimeUnit.SECONDS);if(raw.length==0)return new JudgeService.Result(List.of(),0,"The isolated runtime exited or exceeded a resource limit.",0,tests.size());
   var result=mapper.readTree(raw);if(result.has("error"))return new JudgeService.Result(List.of(),0,result.path("error").asText(),0,tests.size());
   var outputs=result.path("outputs");if(!outputs.isArray()||outputs.size()!=tests.size())return new JudgeService.Result(List.of(),0,"Invalid runtime output. Return JSON-compatible values.",0,tests.size());
   List<Map<String,Object>> visible=new ArrayList<>();int passed=0;
   for(int i=0;i<tests.size();i++){var actual=outputs.get(i);var expected=mapper.valueToTree(tests.get(i).expected);boolean ok=canonical(actual,problem.unordered).equals(canonical(expected,problem.unordered));if(ok)passed++;if(!tests.get(i).hidden)visible.add(Map.of("actual",actual.toString(),"passed",ok));}
   return new JudgeService.Result(visible,result.path("time").asDouble(),null,passed,tests.size());
  }finally{if(process!=null&&process.isAlive())process.destroyForcibly();try{var cleanup=new ProcessBuilder("docker","rm","-f",name).redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();if(!cleanup.waitFor(3,TimeUnit.SECONDS))cleanup.destroyForcibly();}catch(IOException ignored){}readers.shutdownNow();slots.release();}
 }
 String canonical(JsonNode node,boolean unordered){if(unordered&&node.isArray()){List<String> values=new ArrayList<>();node.forEach(x->values.add(x.toString()));Collections.sort(values);return values.toString();}return node.toString();}
}
