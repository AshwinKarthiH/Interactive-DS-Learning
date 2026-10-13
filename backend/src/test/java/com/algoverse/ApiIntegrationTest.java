package com.algoverse;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.*;
import jakarta.servlet.http.Cookie;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
@EnabledIfEnvironmentVariable(named="MONGODB_TEST_URI",matches=".+")
@SpringBootTest @AutoConfigureMockMvc
@org.springframework.test.context.TestExecutionListeners(listeners=org.springframework.test.context.support.DependencyInjectionTestExecutionListener.class,mergeMode=org.springframework.test.context.TestExecutionListeners.MergeMode.REPLACE_DEFAULTS)
class ApiIntegrationTest {
 static final String DB="algoverse_test_"+UUID.randomUUID().toString().replace("-","");
 @DynamicPropertySource static void properties(DynamicPropertyRegistry registry){registry.add("spring.data.mongodb.uri",()->System.getenv("MONGODB_TEST_URI"));registry.add("spring.data.mongodb.database",()->DB);registry.add("algoverse.admin-email",()->"");registry.add("algoverse.admin-password",()->"");}
 @Autowired MockMvc mvc;@Autowired Store store;@Autowired ObjectMapper mapper;
 record Account(Cookie cookie,String csrf,String id){}
 MockHttpServletRequestBuilder write(MockHttpServletRequestBuilder b,Account a){b.header("Origin","http://localhost:8080").header("X-Algoverse-Request","1").contentType(MediaType.APPLICATION_JSON);if(a!=null)b.cookie(a.cookie()).header("X-CSRF-Token",a.csrf());return b;}
 JsonNode request(MockHttpServletRequestBuilder b,int expected)throws Exception{var response=mvc.perform(b).andReturn().getResponse();assertEquals(expected,response.getStatus(),response.getContentAsString());return response.getContentAsString().isBlank()?mapper.createObjectNode():mapper.readTree(response.getContentAsString());}
 Account register(String email)throws Exception{var response=mvc.perform(write(post("/api/auth/register"),null).content(mapper.writeValueAsString(Map.of("name","Test student","email",email,"password","valid-test-password")))).andReturn().getResponse();assertEquals(201,response.getStatus());var body=mapper.readTree(response.getContentAsString());assertFalse(body.path("user").has("passwordHash"));String raw=response.getHeader("Set-Cookie");assertTrue(raw.contains("HttpOnly"));assertTrue(raw.contains("SameSite=Lax"));return new Account(new Cookie("ALGOVERSE_SESSION",raw.split(";",2)[0].split("=",2)[1]),body.path("csrf").asText(),body.path("user").path("id").asText());}
 @Test void endToEndDatabaseIsolationAuthenticationGradingAndAdmin()throws Exception{
  assertEquals("MongoDB",request(get("/api/health"),200).path("database").asText());request(get("/api/progress"),401);
  request(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{}"),403);
  request(write(post("/api/auth/register"),null).content("{\"name\":\"x\",\"email\":\"invalid\",\"password\":\"valid-test-password\"}"),400);
  var student=register("student@example.test");var other=register("other@example.test");
  var plan=request(get("/api/roadmap").cookie(student.cookie()),200);assertEquals(35,plan.path("total").asInt());assertEquals("traverse",plan.path("recommended").asText());
  assertEquals(0,request(get("/api/problems/two-sum/hints").cookie(student.cookie()),200).path("revealed").asInt());assertEquals(1,request(write(post("/api/problems/two-sum/hints"),student).content("{}"),200).path("revealed").asInt());assertEquals(0,request(get("/api/problems/two-sum/hints").cookie(other.cookie()),200).path("revealed").asInt());
  assertTrue(request(get("/api/runtimes").cookie(student.cookie()),200).path("javascript").path("available").asBoolean());
  var page=mvc.perform(get("/dashboard.html").cookie(student.cookie())).andReturn().getResponse();assertEquals(200,page.getStatus());assertEquals(302,mvc.perform(get("/admin.html").cookie(student.cookie())).andReturn().getResponse().getStatus());
  request(write(post("/api/auth/register"),null).content("{\"name\":\"x\",\"email\":\"extra@example.test\",\"password\":\"valid-test-password\",\"role\":\"admin\"}"),400);
  request(write(post("/api/auth/login"),null).content("{\"email\":\"student@example.test\",\"password\":\"incorrect-password\"}"),401);
  request(write(post("/api/auth/register"),null).content("{\"name\":\"x\",\"email\":\"student@example.test\",\"password\":\"valid-test-password\"}"),409);
  request(get("/api/admin/users").cookie(student.cookie()),403);request(get("/backend/src/main/resources/application.properties"),401);
  request(put("/api/drafts/two-sum").cookie(student.cookie()).header("Origin","http://localhost:8080").header("X-Algoverse-Request","1").contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"javascript\",\"code\":\"a\"}"),403);
  request(write(put("/api/drafts/two-sum"),student).content("{\"language\":\"javascript\",\"code\":\"saved draft\"}"),200);
  assertEquals("saved draft",request(get("/api/drafts").cookie(student.cookie()),200).get(0).path("code").asText());assertEquals(0,request(get("/api/drafts").cookie(other.cookie()),200).size());
  var publicProblems=request(get("/api/problems").cookie(student.cookie()),200);assertEquals(8,publicProblems.size());assertFalse(publicProblems.get(0).has("tests"));assertEquals(3,publicProblems.get(0).path("sampleTests").size());
  var p=store.byId("two-sum",Data.Problem.class);var correct=request(write(post("/api/problems/two-sum/execute"),student).content(mapper.writeValueAsString(Map.of("code",p.jsStarter,"language","javascript","submit",true))),200);assertTrue(correct.path("accepted").asBoolean());assertEquals(5,correct.path("total").asInt());assertEquals(3,correct.path("results").size());
  var wrong=request(write(post("/api/problems/two-sum/execute"),other).content(mapper.writeValueAsString(Map.of("code","function twoSum(){return [0,1]}","language","javascript","submit",true))),200);assertFalse(wrong.path("accepted").asBoolean());assertEquals(0,request(get("/api/progress").cookie(other.cookie()),200).path("solved").size());assertEquals("two-sum",request(get("/api/progress").cookie(student.cookie()),200).path("solved").get(0).asText());
  assertEquals("hash_chaining",request(get("/api/roadmap").cookie(other.cookie()),200).path("recommended").asText());
  var secretError=request(write(post("/api/problems/two-sum/execute"),student).content(mapper.writeValueAsString(Map.of("code","function twoSum(){throw new Error('PRIVATE-INPUT-LEAK')}","language","javascript","submit",true))),200);assertFalse(secretError.path("error").asText().contains("PRIVATE-INPUT-LEAK"));
  request(write(put("/api/progress/lessons/bubble"),student).content("{\"completed\":true}"),200);assertEquals(1,request(get("/api/progress").cookie(student.cookie()),200).path("lessons").size());
  var quiz=request(get("/api/quizzes").cookie(student.cookie()),200);assertFalse(quiz.get(0).path("questions").get(0).has("correctIndex"));assertEquals(4,request(write(post("/api/quizzes/dsa-basics/attempts"),student).content("{\"answers\":[1,0,0,1]}"),200).path("score").asInt());assertEquals(1,request(get("/api/quiz-attempts").cookie(student.cookie()),200).size());assertEquals(0,request(get("/api/quiz-attempts").cookie(other.cookie()),200).size());
  request(write(put("/api/notes"),student).content("{\"operations\":[{\"type\":\"pen\",\"color\":\"#101827\",\"size\":4,\"points\":[{\"x\":10,\"y\":20}]}]}"),200);assertEquals(1,request(get("/api/notes").cookie(student.cookie()),200).path("operations").size());assertEquals(0,request(get("/api/notes").cookie(other.cookie()),200).path("operations").size());
  var u=store.byId(other.id(),Data.User.class);u.role="admin";store.mongo.save(u);var admin=other;
  assertEquals(2,request(get("/api/admin/users").cookie(admin.cookie()),200).size());assertEquals(2,request(get("/api/admin/analytics").cookie(admin.cookie()),200).path("users").asInt());
  request(write(patch("/api/admin/users/"+admin.id()),admin).content("{\"name\":\"Admin\",\"role\":\"student\",\"active\":true}"),400);
  request(write(put("/api/admin/settings"),admin).content("{\"platformName\":\"Test platform\",\"welcomeMessage\":\"Welcome\",\"registrationEnabled\":false}"),200);assertFalse(request(get("/api/settings/public"),200).path("registrationEnabled").asBoolean());
  request(write(post("/api/auth/register"),null).content("{\"name\":\"x\",\"email\":\"closed@example.test\",\"password\":\"valid-test-password\"}"),400);
  request(write(delete("/api/admin/users/"+student.id()),admin),200);request(get("/api/progress").cookie(student.cookie()),401);assertNull(store.byId(student.id(),Data.Notes.class));
  request(write(post("/api/auth/logout"),admin).content("{}"),200);request(get("/api/admin/users").cookie(admin.cookie()),401);
 }
 @AfterEach void cleanup(){assertTrue(store.mongo.getDb().getName().startsWith("algoverse_test_"));store.mongo.getDb().drop();}
}
