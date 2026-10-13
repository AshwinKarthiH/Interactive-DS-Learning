package com.algoverse;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;
class DockerJudgeTest {
 @Test void containerHasNoNetworkPrivilegesOrHostMounts(){var command=DockerJudge.command("algoverse-test");for(String flag:List.of("--network=none","--read-only","--memory=512m","--memory-swap=512m","--cpus=1","--pids-limit=64","--cap-drop=ALL","--security-opt=no-new-privileges","--user=10001:10001","--pull=never"))assertTrue(command.contains(flag));assertFalse(command.contains("--privileged"));assertFalse(command.contains("-v"));}
 @Test @EnabledIfEnvironmentVariable(named="DOCKER_JUDGE_TEST",matches="1") void actualFiveLanguageContainers()throws Exception{
  var p=new Data.Problem();p.fnName="solve";var t=new Data.TestCase();t.args=List.of(List.of(1,2,3));t.expected=6;p.tests=List.of(t);var judge=new DockerJudge(new ObjectMapper());assertTrue(judge.available(),"Build/start the judge image first.");
  var codes=Map.of("javascript","function solve(values){return values.reduce((a,b)=>a+b,0)}","python","def solve(args):\n    return sum(args[0])\n","cpp","json solve(const json& args){int sum=0;for(auto v:args[0])sum+=v.get<int>();return sum;}","c","cJSON *solve(const cJSON *args){double sum=0;const cJSON *v=NULL;cJSON_ArrayForEach(v,cJSON_GetArrayItem(args,0))sum+=v->valuedouble;return cJSON_CreateNumber(sum);}","java","import java.util.*;public class Solution{public static Object solve(List<Object> args){long sum=0;for(Object v:(List<?>)args.get(0))sum+=((Number)v).longValue();return sum;}}");
  for(var entry:codes.entrySet()){var result=judge.run(entry.getValue(),p,entry.getKey(),true);assertNull(result.error(),entry.getKey());assertEquals(1,result.passed(),entry.getKey());}
 }
}
