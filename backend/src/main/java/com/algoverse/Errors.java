package com.algoverse;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class Errors {
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("error",e.getReason()==null?"Request failed.":e.getReason()));}
 @ExceptionHandler(DuplicateKeyException.class) ResponseEntity<?> duplicate(){return ResponseEntity.status(409).body(Map.of("error","That email or identifier is already in use."));}
 @ExceptionHandler({IllegalArgumentException.class,org.springframework.http.converter.HttpMessageNotReadableException.class,org.springframework.web.bind.MethodArgumentNotValidException.class}) ResponseEntity<?> bad(){return ResponseEntity.badRequest().body(Map.of("error","Invalid request. Check the supplied fields."));}
 @ExceptionHandler(Exception.class) ResponseEntity<?> other(Exception e){org.slf4j.LoggerFactory.getLogger(Errors.class).error("Request failed: {}",e.getClass().getSimpleName());return ResponseEntity.status(500).body(Map.of("error","The server could not complete this request."));}
 public static void check(boolean valid,String message){if(!valid)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
 public static String text(String value,int max){check(value!=null&&!value.isBlank()&&value.length()<=max,"Invalid text field.");return value.trim();}
}
