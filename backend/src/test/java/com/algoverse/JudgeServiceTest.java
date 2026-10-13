package com.algoverse;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
class JudgeServiceTest {
 final JudgeService judge=new JudgeService(new ObjectMapper(),10);
 Data.Problem problem(){var p=new Data.Problem();p.fnName="solve";var t=new Data.TestCase();t.args=List.of(List.of(1,2,3));t.expected=6;p.tests=List.of(t);return p;}
 @Test void gradesOutputsAndDoesNotTrustCodeClaims()throws Exception{var good=judge.run("function solve(a){return a.reduce((x,y)=>x+y,0)}",problem(),true);assertNull(good.error());assertEquals(1,good.passed());var bad=judge.run("function solve(){return {passed:true,accepted:true}}",problem(),true);assertEquals(0,bad.passed());}
 @Test void limitsExecutionAndDeniesHostFacilities()throws Exception{assertNotNull(judge.run("function solve(){while(true){}}",problem(),true).error());assertNotNull(judge.run("function solve(){return Java.type('java.lang.System').getenv()}",problem(),true).error());assertNotNull(judge.run("function solve(){return fetch('https://example.com')}",problem(),true).error());}
 @Test void hiddenCasesAreGradedButNeverReturned()throws Exception{var p=problem();var hidden=new Data.TestCase();hidden.hidden=true;hidden.args=List.of(List.of(10));hidden.expected=10;p.tests=List.of(p.tests.get(0),hidden);var r=judge.run("function solve(){return 6}",p,true);assertEquals(2,r.total());assertEquals(1,r.passed());assertEquals(1,r.results().size());}
 @Test void gradesEverySeededProblemIncludingPrivateCases()throws Exception{var mapper=new ObjectMapper();try(var input=getClass().getResourceAsStream("/catalog.json")){for(var node:mapper.readTree(input).path("problems")){var p=mapper.treeToValue(node,Data.Problem.class);String code=p.id.equals("debug-sum")?p.jsStarter.replace("value, 1)","value, 0)"):p.jsStarter;var result=judge.run(code,p,true);assertNull(result.error(),p.id);assertEquals(result.total(),result.passed(),p.id);}}}
}
