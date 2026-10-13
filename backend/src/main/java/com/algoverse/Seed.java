package com.algoverse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.io.ClassPathResource;
@Component
public class Seed implements CommandLineRunner {
 final Store store;final ObjectMapper mapper;final PasswordEncoder passwords;final String email,password;
 Seed(Store store,ObjectMapper mapper,PasswordEncoder passwords,@Value("${algoverse.admin-email}")String email,@Value("${algoverse.admin-password}")String password){this.store=store;this.mapper=mapper;this.passwords=passwords;this.email=email;this.password=password;}
 public void run(String...args)throws Exception{
  Errors.check(email.isBlank()==password.isBlank(),"Set both ADMIN_EMAIL and ADMIN_PASSWORD for initial administration.");
  if(!email.isBlank())Errors.check(email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"),"Set a valid administrator email.");
  store.mongo.executeCommand("{ping:1}");
  try(InputStream input=new ClassPathResource("catalog.json").getInputStream()){var catalog=mapper.readTree(input);for(var node:catalog.path("problems")){var p=mapper.treeToValue(node,Data.Problem.class);if(store.byId(p.id,Data.Problem.class)==null)store.mongo.insert(p);}for(var node:catalog.path("lessons")){var l=mapper.treeToValue(node,Data.Lesson.class);if(store.byId(l.id,Data.Lesson.class)==null)store.mongo.insert(l);}}
  if(store.byId("dsa-basics",Data.Quiz.class)==null){var q=new Data.Quiz();q.id="dsa-basics";q.title="DSA basics";String[][] rows={{"What does a stack remove first?","The oldest item","The newest item","1","A stack follows last in, first out."},{"What does binary search require?","Sorted data","Random data","0","Each comparison chooses one half of a sorted collection."},{"Why use a hash map?","To find a value by its key","To keep every value sorted","0","A hash function points you to a bucket for the key."},{"What does dynamic programming save?","Only the final answer","Answers to smaller repeated problems","1","Saved answers avoid solving the same subproblem again."}};for(String[] row:rows){var item=new Data.Question();item.prompt=row[0];item.choices=java.util.List.of(row[1],row[2]);item.correctIndex=Integer.parseInt(row[3]);item.explanation=row[4];q.questions.add(item);}store.mongo.insert(q);}
  if(!email.isBlank()&&!password.isBlank()&&store.byEmail(AuthController.email(email))==null){AuthController.validPassword(password);var u=new Data.User();u.email=AuthController.email(email);u.name="Administrator";u.role="admin";u.passwordHash=passwords.encode(password);store.mongo.insert(u);org.slf4j.LoggerFactory.getLogger(Seed.class).info("Initial administrator created. Remove ADMIN_PASSWORD from your environment after setup.");}
  store.ready=true;
 }
}
