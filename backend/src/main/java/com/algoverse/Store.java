package com.algoverse;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import java.util.*;
import static org.springframework.data.mongodb.core.query.Criteria.where;
@Service
public class Store {
 public final MongoTemplate mongo;
 public volatile boolean ready=false;
 public Store(MongoTemplate mongo){this.mongo=mongo;}
 public <T>T byId(String id,Class<T> type){return mongo.findById(id,type);}
 public Data.User byEmail(String email){return mongo.findOne(Query.query(where("email").is(email)),Data.User.class);}
 public void revoke(String userId){mongo.remove(Query.query(where("userId").is(userId)),Data.Session.class);}
 public Data.Settings settings(){var s=byId("platform",Data.Settings.class);return s==null?new Data.Settings():s;}
 public void audit(String actor,String action,String target){var a=new Data.Audit();a.actorId=actor;a.action=action;a.targetId=target;mongo.save(a);}
 public List<Data.Submission> submissions(String userId,int limit){return mongo.find(Query.query(where("userId").is(userId)).with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt")).limit(limit),Data.Submission.class);}
 public Map<String,Object> progress(String userId){
  var solved=mongo.find(Query.query(where("userId").is(userId).and("accepted").is(true)),Data.Submission.class).stream().map(s->s.problemId).distinct().toList();
  var lessons=mongo.find(Query.query(where("userId").is(userId)),Data.Learning.class);
  long attempts=mongo.count(Query.query(where("userId").is(userId)),Data.Submission.class),accepted=mongo.count(Query.query(where("userId").is(userId).and("accepted").is(true)),Data.Submission.class);
  var quizzes=mongo.find(Query.query(where("userId").is(userId)).with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt")).limit(30),Data.QuizAttempt.class);
  return Map.of("solved",solved,"lessons",lessons,"attempts",attempts,"accepted",accepted,"history",submissions(userId,30).stream().map(Data.Submission::view).toList(),"quizAttempts",quizzes);
 }
}
