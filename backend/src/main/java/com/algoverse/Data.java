package com.algoverse;
import java.time.Instant;
import java.util.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

public final class Data {
 @Document("hints") public static class Hints {@Id public String id;@Indexed public String userId;public int revealed;}
 @Document("users") public static class User {
  @Id public String id;
  @Indexed(unique=true) public String email;
  public String name,passwordHash,role="student";
  public boolean active=true;
  public Instant createdAt=Instant.now();
  public Map<String,Object> view(){return Map.of("id",id,"email",email,"name",name,"role",role,"active",active,"createdAt",createdAt);}
 }
 @Document("sessions") public static class Session {
  @Id public String id;
  @Indexed public String userId;
  public String csrf;
  @Indexed(expireAfter="0s") public Instant expiresAt;
 }
 @Document("problems") public static class Problem {
  @Id public String id;
  public int number;
  public String title,difficulty,description,hint,jsStarter,fnName;
  public List<String> tags=new ArrayList<>(),constraints=new ArrayList<>();
  public List<Map<String,Object>> examples=new ArrayList<>();
  public List<TestCase> tests=new ArrayList<>();
  public boolean active=true,unordered=false;
  public Map<String,Object> view(){Map<String,Object> v=new LinkedHashMap<>();v.put("id",id);v.put("number",number);v.put("title",title);v.put("description",description);v.put("difficulty",difficulty);v.put("hint",hint);v.put("jsStarter",jsStarter);v.put("starters",PracticeStarters.forProblem(this));v.put("tags",tags);v.put("constraints",constraints);v.put("examples",examples);v.put("acceptance","—");v.put("fnName",fnName);v.put("sampleTests",tests.stream().filter(t->!t.hidden).toList());return v;}
 }
 public static class TestCase {public List<Object> args=new ArrayList<>();public Object expected;public boolean hidden=false;}
 @Document("lessons") public static class Lesson {
  @Id public String id;
  public String title,summary;
  public List<String> steps=new ArrayList<>();
  public boolean active=true;
 }
 @Document("learning") public static class Learning {
  @Id public String id;
  @Indexed public String userId;
  public String lessonId;
  public boolean completed;
  public Instant updatedAt;
 }
 @Document("drafts") public static class Draft {
  @Id public String id;
  @Indexed public String userId;
  public String problemId,language,code;
  public Instant updatedAt;
 }
 @Document("submissions") public static class Submission {
  @Id public String id;
  @Indexed public String userId;
  public String problemId,language,code,status;
  public boolean accepted;
  public int passed,total;
  public double time;
  public Instant createdAt=Instant.now();
  public Map<String,Object> view(){return Map.of("id",id,"problemId",problemId,"language",language,"status",status,"accepted",accepted,"passed",passed,"total",total,"time",time,"createdAt",createdAt);}
 }
 @Document("notes") public static class Notes {
  @Id public String id;
  public List<Map<String,Object>> operations=new ArrayList<>();
  public Instant updatedAt;
 }
 @Document("settings") public static class Settings {
  @Id public String id="platform";
  public String platformName="AlgoVerse",welcomeMessage="Learn one step at a time.";
  public boolean registrationEnabled=true;
 }
 @Document("audit") public static class Audit {
  @Id public String id;
  public String actorId,action,targetId;
  public Instant createdAt=Instant.now();
 }
 @Document("quizzes") public static class Quiz {
  @Id public String id;
  public String title;
  public boolean active=true;
  public List<Question> questions=new ArrayList<>();
  public Map<String,Object> view(){return Map.of("id",id,"title",title,"questions",questions.stream().map(q->Map.of("prompt",q.prompt,"choices",q.choices)).toList());}
 }
 public static class Question {public String prompt,explanation;public List<String> choices=new ArrayList<>();public int correctIndex;}
 @Document("quiz_attempts") public static class QuizAttempt {
  @Id public String id;
  @Indexed public String userId;
  public String quizId;
  public int score,total;
  public Instant createdAt=Instant.now();
 }
}
