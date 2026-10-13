package com.algoverse;
import com.fasterxml.jackson.databind.*;
import java.io.*;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class JudgeService {
 private final ObjectMapper mapper;private final Semaphore slots=new Semaphore(2);private final int timeout;
 JudgeService(ObjectMapper mapper,@Value("${algoverse.judge-timeout-seconds}")int timeout){this.mapper=mapper;this.timeout=timeout;}
 public record Result(List<Map<String,Object>> results,double time,String error,int passed,int total){}
 public Result run(String code,Data.Problem problem,boolean submit)throws Exception{
  if(!slots.tryAcquire())throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"The judge is busy. Try again shortly.");
  Process process=null;ExecutorService reader=Executors.newSingleThreadExecutor();List<Data.TestCase> tests=problem.tests.stream().filter(t->submit||!t.hidden).toList();
  try{
   String java=Path.of(System.getProperty("java.home"),"bin",System.getProperty("os.name").startsWith("Windows")?"java.exe":"java").toString();
   ProcessBuilder builder=new ProcessBuilder(java,"-Xmx256m","-Xss1m","-XX:MaxMetaspaceSize=128m","-cp",System.getProperty("java.class.path"),"com.algoverse.JudgeMain");
   builder.environment().keySet().removeIf(k->k.toUpperCase(Locale.ROOT).matches(".*(PASSWORD|SECRET|TOKEN|MONGODB|ADMIN_EMAIL).*"));builder.redirectError(ProcessBuilder.Redirect.DISCARD);process=builder.start();
   try(OutputStream input=process.getOutputStream()){mapper.writeValue(input,Map.of("code",code,"fnName",problem.fnName,"tests",tests));}
   final InputStream output=process.getInputStream();Future<byte[]> bytes=reader.submit(()->{byte[] b=output.readNBytes(65537);if(b.length>65536)throw new IOException("Output limit exceeded");return b;});
   if(!process.waitFor(timeout,TimeUnit.SECONDS)){process.destroyForcibly();return new Result(List.of(),0,"Execution exceeded the time limit.",0,tests.size());}
   byte[] raw=bytes.get(2,TimeUnit.SECONDS);if(raw.length==0)return new Result(List.of(),0,"Execution exceeded a resource limit or could not start.",0,tests.size());
   JsonNode result=mapper.readTree(raw);if(result.has("error"))return new Result(List.of(),0,result.path("error").asText(),0,tests.size());
   JsonNode outputs=result.path("outputs");if(!outputs.isArray()||outputs.size()!=tests.size())throw new IOException("Invalid judge response");
   List<Map<String,Object>> visible=new ArrayList<>();int passed=0;
   for(int i=0;i<tests.size();i++){JsonNode actual=outputs.get(i),expected=mapper.valueToTree(tests.get(i).expected);boolean ok=canonical(actual,problem.unordered).equals(canonical(expected,problem.unordered));if(ok)passed++;if(!tests.get(i).hidden)visible.add(Map.of("actual",actual.toString(),"passed",ok));}
   return new Result(visible,result.path("time").asDouble(),null,passed,tests.size());
  }finally{if(process!=null&&process.isAlive())process.destroyForcibly();reader.shutdownNow();slots.release();}
 }
 private String canonical(JsonNode n,boolean unordered){if(unordered&&n.isArray()){List<String> parts=new ArrayList<>();n.forEach(x->parts.add(x.toString()));Collections.sort(parts);return parts.toString();}return n.toString();}
}
