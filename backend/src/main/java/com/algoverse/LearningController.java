package com.algoverse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static com.algoverse.Errors.*;
@RestController @RequestMapping("/api")
public class LearningController {
 final Store store;final JudgeService judge;final DockerJudge docker;
 LearningController(Store store,JudgeService judge,DockerJudge docker){this.store=store;this.judge=judge;this.docker=docker;}
 @GetMapping("/runtimes") Object runtimes(){boolean ready=docker.available();return Map.of("javascript",Map.of("available",true,"provider","Restricted Java runtime"),"python",Map.of("available",ready,"provider","Docker"),"c",Map.of("available",ready,"provider","Docker"),"cpp",Map.of("available",ready,"provider","Docker"),"java",Map.of("available",ready,"provider","Docker"));}
 @GetMapping("/health") Map<String,Object> health(){if(!store.ready)throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"The backend is starting.");store.mongo.executeCommand("{ ping: 1 }");return Map.of("status","ok","database","MongoDB","backend","Spring Boot");}
 @GetMapping("/settings/public") Map<String,Object> settings(){var s=store.settings();return Map.of("platformName",s.platformName,"welcomeMessage",s.welcomeMessage,"registrationEnabled",s.registrationEnabled);}
 @GetMapping("/problems") Object problems(){return store.mongo.find(Query.query(where("active").is(true)),Data.Problem.class).stream().map(Data.Problem::view).toList();}
 Data.Problem problem(String id){var p=store.byId(id,Data.Problem.class);if(p==null||!p.active)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Problem not found.");return p;}
 @GetMapping("/lessons") Object lessons(){return store.mongo.find(Query.query(where("active").is(true)),Data.Lesson.class);}
 @GetMapping("/progress") Object progress(HttpServletRequest req){return store.progress(AuthController.user(req).id);}
 record Completion(boolean completed){}
 @PutMapping("/progress/lessons/{id}") Object lesson(@PathVariable String id,@RequestBody Completion body,HttpServletRequest req){check(store.byId(id,Data.Lesson.class)!=null,"Unknown lesson.");String user=AuthController.user(req).id;String key=user+":"+id;var l=store.byId(key,Data.Learning.class);if(l==null){l=new Data.Learning();l.id=key;l.userId=user;l.lessonId=id;}l.completed=l.completed||body.completed();l.updatedAt=Instant.now();store.mongo.save(l);return l;}
 record DraftBody(@NotBlank @Size(max=32)String language,@Size(max=50000)String code){}
 static void language(String lang){check(Set.of("javascript","python","c","cpp","java").contains(lang),"Unknown language.");}
 @GetMapping("/drafts") Object drafts(HttpServletRequest req){return store.mongo.find(Query.query(where("userId").is(AuthController.user(req).id)),Data.Draft.class);}
 @PutMapping("/drafts/{id}") Object draft(@PathVariable String id,@Valid @RequestBody DraftBody body,HttpServletRequest req){problem(id);language(body.language());check(body.code()!=null,"Code is required.");String user=AuthController.user(req).id;var d=new Data.Draft();d.id=user+":"+id+":"+body.language();d.userId=user;d.problemId=id;d.language=body.language();d.code=body.code();d.updatedAt=Instant.now();store.mongo.save(d);return Map.of("ok",true);}
 record SubmissionBody(@NotBlank @Size(max=50000)String code,@NotBlank String language,boolean submit){}
 @PostMapping("/problems/{id}/execute") Object execute(@PathVariable String id,@Valid @RequestBody SubmissionBody body,HttpServletRequest req)throws Exception{
  var p=problem(id);language(body.language());var r=body.language().equals("javascript")?judge.run(body.code(),p,body.submit()):docker.run(body.code(),p,body.language(),body.submit());
  boolean accepted=r.error()==null&&r.total()>0&&r.passed()==r.total();
  if(body.submit()){var s=new Data.Submission();s.userId=AuthController.user(req).id;s.problemId=p.id;s.language=body.language();s.code=body.code();s.passed=r.passed();s.total=r.total();s.accepted=accepted;s.time=r.time();s.status=r.error()!=null?"Execution error":accepted?"Accepted":"Wrong answer";store.mongo.insert(s);}
  var answer=new LinkedHashMap<String,Object>();answer.put("results",r.results());answer.put("time",r.time());answer.put("accepted",accepted);answer.put("passed",r.passed());answer.put("total",r.total());answer.put("feedback",accepted?"Well done. Your solution passed the selected tests.":r.error()!=null?"Fix the compilation or runtime error first, then try a visible example.":"Compare your actual output with the expected output. Check empty inputs, duplicates and boundaries; gradual hints are available below the question.");if(r.error()!=null)answer.put("error",body.submit()?"Submission could not execute. Use Run on the visible examples to inspect the compilation or runtime error.":r.error());return answer;
 }
 @GetMapping("/submissions") Object submissions(HttpServletRequest req){return store.submissions(AuthController.user(req).id,100).stream().map(Data.Submission::view).toList();}
 @GetMapping("/notes") Object notes(HttpServletRequest req){var n=store.byId(AuthController.user(req).id,Data.Notes.class);return n==null?Map.of("operations",List.of()):n;}
 record NotesBody(@NotNull @Size(max=1000)List<Map<String,Object>> operations){}
 @PutMapping("/notes") Object notes(@Valid @RequestBody NotesBody body,HttpServletRequest req){int points=0;for(var op:body.operations()){check(op.get("type") instanceof String&&Set.of("pen","eraser","clear").contains(op.get("type")),"Invalid drawing tool.");if("clear".equals(op.get("type")))continue;check(op.get("color") instanceof String&&((String)op.get("color")).matches("#[0-9a-fA-F]{6}"),"Invalid pen color.");check(op.get("size") instanceof Number&&((Number)op.get("size")).doubleValue()>0&&((Number)op.get("size")).doubleValue()<=90,"Invalid pen size.");check(op.get("points") instanceof List<?> && !((List<?>)op.get("points")).isEmpty(),"Invalid stroke.");for(Object point:(List<?>)op.get("points")){check(point instanceof Map<?,?>,"Invalid point.");var p=(Map<?,?>)point;for(String axis:List.of("x","y"))check(p.get(axis) instanceof Number&&Double.isFinite(((Number)p.get(axis)).doubleValue())&&Math.abs(((Number)p.get(axis)).doubleValue())<20000,"Invalid point.");if(++points>20000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Notes are too large; clear some strokes.");}}var n=new Data.Notes();n.id=AuthController.user(req).id;n.operations=body.operations();n.updatedAt=Instant.now();store.mongo.save(n);return Map.of("ok",true);}
}
