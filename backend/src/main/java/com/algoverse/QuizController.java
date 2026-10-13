package com.algoverse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.mongodb.core.query.Query;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static com.algoverse.Errors.*;
@RestController @RequestMapping("/api")
public class QuizController {
 final Store store;QuizController(Store store){this.store=store;}
 @GetMapping("/quizzes") Object quizzes(){return store.mongo.find(Query.query(where("active").is(true)),Data.Quiz.class).stream().map(Data.Quiz::view).toList();}
 record Answers(@NotNull @Size(max=30) List<Integer> answers){}
 @PostMapping("/quizzes/{id}/attempts") Object attempt(@PathVariable String id,@Valid @RequestBody Answers p,HttpServletRequest req){var quiz=store.byId(id,Data.Quiz.class);check(quiz!=null&&quiz.active,"Quiz not found.");check(p.answers().size()==quiz.questions.size(),"Answer every question.");int score=0;List<Map<String,Object>> feedback=new ArrayList<>();for(int i=0;i<quiz.questions.size();i++){var q=quiz.questions.get(i);Integer answer=p.answers().get(i);check(answer!=null&&answer>=0&&answer<q.choices.size(),"Invalid answer.");boolean correct=answer==q.correctIndex;if(correct)score++;feedback.add(Map.of("correct",correct,"correctIndex",q.correctIndex,"explanation",q.explanation));}var a=new Data.QuizAttempt();a.userId=AuthController.user(req).id;a.quizId=id;a.score=score;a.total=quiz.questions.size();store.mongo.insert(a);return Map.of("score",score,"total",a.total,"feedback",feedback);}
 @GetMapping("/quiz-attempts") Object attempts(HttpServletRequest req){return store.mongo.find(Query.query(where("userId").is(AuthController.user(req).id)).with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt")).limit(100),Data.QuizAttempt.class);}
 @GetMapping("/admin/quizzes") Object admin(){return store.mongo.findAll(Data.Quiz.class);}
 record QuizBody(@NotBlank @Pattern(regexp="[a-z0-9-]{1,60}")String id,@NotBlank @Size(max=120)String title,boolean active,@NotNull @Size(min=1,max=30)List<Data.Question> questions){}
 Data.Quiz validate(QuizBody p){for(var q:p.questions()){text(q.prompt,2000);text(q.explanation,4000);check(q.choices!=null&&q.choices.size()>=2&&q.choices.size()<=6&&q.correctIndex>=0&&q.correctIndex<q.choices.size(),"Invalid quiz choices.");for(String choice:q.choices)text(choice,1000);}var q=new Data.Quiz();q.id=p.id();q.title=p.title();q.active=p.active();q.questions=p.questions();return q;}
 @PostMapping("/admin/quizzes") Object create(@Valid @RequestBody QuizBody p,HttpServletRequest req){var q=validate(p);store.mongo.insert(q);store.audit(AuthController.user(req).id,"quiz.create",q.id);return q;}
 @PutMapping("/admin/quizzes/{id}") Object update(@PathVariable String id,@Valid @RequestBody QuizBody p,HttpServletRequest req){check(id.equals(p.id())&&store.byId(id,Data.Quiz.class)!=null,"Quiz identifier cannot change.");var q=validate(p);store.mongo.save(q);store.audit(AuthController.user(req).id,"quiz.update",q.id);return q;}
 @DeleteMapping("/admin/quizzes/{id}") Object delete(@PathVariable String id,HttpServletRequest req){var q=store.byId(id,Data.Quiz.class);check(q!=null,"Quiz not found.");q.active=false;store.mongo.save(q);store.audit(AuthController.user(req).id,"quiz.archive",id);return Map.of("ok",true);}
}
