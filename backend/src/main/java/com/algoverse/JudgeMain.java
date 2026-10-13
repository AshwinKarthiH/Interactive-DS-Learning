package com.algoverse;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.graalvm.polyglot.*;
import org.graalvm.polyglot.io.IOAccess;
import java.io.*;
/** Disposable JVM; guest code receives no Java objects, network, filesystem or process access. */
public class JudgeMain {
 public static void main(String[] args)throws Exception{
  ObjectMapper mapper=new ObjectMapper();JsonNode input=mapper.readTree(System.in);ObjectNode result=mapper.createObjectNode();ArrayNode outputs=mapper.createArrayNode();
  try(Context context=Context.newBuilder("js").allowHostAccess(HostAccess.NONE).allowHostClassLookup(x->false).allowIO(IOAccess.NONE).allowCreateThread(false).allowNativeAccess(false).allowCreateProcess(false).allowEnvironmentAccess(EnvironmentAccess.NONE).option("engine.WarnInterpreterOnly","false").out(OutputStream.nullOutputStream()).err(OutputStream.nullOutputStream()).resourceLimits(ResourceLimits.newBuilder().statementLimit(2_000_000,null).build()).build()){
   Value parse=context.eval("js","JSON.parse.bind(JSON)"),stringify=context.eval("js","JSON.stringify.bind(JSON)");
   Value function=context.eval("js","(function(){ 'use strict';\n"+input.path("code").asText()+"\n;return "+input.path("fnName").asText()+";})()");
   if(!function.canExecute())throw new IllegalArgumentException("Expected the named function.");long start=System.nanoTime();
   for(JsonNode test:input.path("tests")){Value values=parse.execute(test.path("args").toString());Object[] arguments=new Object[(int)values.getArraySize()];for(int i=0;i<arguments.length;i++)arguments[i]=values.getArrayElement(i);String output=stringify.execute(function.execute(arguments)).asString();if(output==null||output.length()>16000)throw new IllegalArgumentException("Output is missing or too large.");outputs.add(mapper.readTree(output));}
   result.set("outputs",outputs);result.put("time",(System.nanoTime()-start)/1_000_000.0);
  }catch(Throwable e){result.put("error",e instanceof OutOfMemoryError?"Execution exceeded the memory limit.":"Execution failed: "+String.valueOf(e.getMessage()).substring(0,Math.min(300,String.valueOf(e.getMessage()).length())));}
  System.out.print(mapper.writeValueAsString(result));
 }
}
