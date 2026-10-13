package com.algoverse;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static com.algoverse.Errors.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
 final Store store;final PasswordEncoder passwords;final boolean secure;
 AuthController(Store store,PasswordEncoder passwords,@Value("${algoverse.secure-cookie}") boolean secure){this.store=store;this.passwords=passwords;this.secure=secure;}
 record Register(@NotBlank @Size(max=80) String name,@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=10,max=64) String password){}
 record Login(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(max=64) String password){}
 record Profile(@NotBlank @Size(max=80) String name){}
 record Password(@NotBlank String currentPassword,@NotBlank @Size(min=10,max=64) String newPassword){}
 static String email(String email){return email.trim().toLowerCase(Locale.ROOT);}
 static void validPassword(String password){check(password!=null&&password.length()>=10&&password.length()<=64&&password.getBytes(StandardCharsets.UTF_8).length<=72,"Password must have 10–64 characters and at most 72 UTF-8 bytes.");}
 static Data.User user(HttpServletRequest req){var u=(Data.User)req.getAttribute("algo.user");if(u==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Please sign in.");return u;}
 @PostMapping("/register") ResponseEntity<?> register(@Valid @RequestBody Register body,HttpServletResponse res){check(store.settings().registrationEnabled,"Registration is currently closed.");validPassword(body.password());Data.User u=new Data.User();u.email=email(body.email());u.name=text(body.name(),80);u.passwordHash=passwords.encode(body.password());store.mongo.insert(u);return ResponseEntity.status(201).body(session(u,res));}
 @PostMapping("/login") Map<String,Object> login(@Valid @RequestBody Login body,HttpServletResponse res){Data.User u=store.byEmail(email(body.email()));String hash=u==null?DUMMY:u.passwordHash;boolean matched=passwords.matches(body.password(),hash);if(u==null||!matched||!u.active)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Email or password is incorrect.");return session(u,res);}
 private static final String DUMMY=new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12).encode("unused-dummy-password");
 Map<String,Object> session(Data.User u,HttpServletResponse res){String token=SecurityConfig.token();Data.Session s=new Data.Session();s.id=SecurityConfig.hash(token);s.userId=u.id;s.csrf=SecurityConfig.token();s.expiresAt=Instant.now().plus(Duration.ofDays(7));store.mongo.insert(s);res.addHeader("Set-Cookie",ResponseCookie.from("ALGOVERSE_SESSION",token).httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(Duration.ofDays(7)).build().toString());return Map.of("user",u.view(),"csrf",s.csrf);}
 @GetMapping("/me") Map<String,Object> me(HttpServletRequest req){Data.User u=user(req);return Map.of("user",u.view(),"csrf",((Data.Session)req.getAttribute("algo.session")).csrf);}
 @PostMapping("/logout") Map<String,Object> logout(HttpServletRequest req,HttpServletResponse res){var s=(Data.Session)req.getAttribute("algo.session");if(s!=null)store.mongo.remove(s);res.addHeader("Set-Cookie",ResponseCookie.from("ALGOVERSE_SESSION","").httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(0).build().toString());return Map.of("ok",true);}
 @PatchMapping("/profile") Map<String,Object> profile(@Valid @RequestBody Profile p,HttpServletRequest req){var u=user(req);u.name=text(p.name(),80);store.mongo.save(u);return Map.of("user",u.view());}
 @PostMapping("/password") Map<String,Object> password(@Valid @RequestBody Password p,HttpServletRequest req,HttpServletResponse res){var u=user(req);if(!passwords.matches(p.currentPassword(),u.passwordHash))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Current password is incorrect.");validPassword(p.newPassword());u.passwordHash=passwords.encode(p.newPassword());store.mongo.save(u);store.revoke(u.id);return session(u,res);}
}
