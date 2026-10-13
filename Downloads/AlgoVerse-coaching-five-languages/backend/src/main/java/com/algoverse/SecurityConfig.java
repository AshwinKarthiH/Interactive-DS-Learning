package com.algoverse;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwords(){return new BCryptPasswordEncoder(12);}
 @Bean SecurityFilterChain chain(HttpSecurity http,Store store,@Value("${algoverse.origin}") String origin) throws Exception {
  // JSON mutations require a configured Origin and a session-bound CSRF header below.
  return http.csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/register","/api/auth/login","/api/auth/me","/api/health","/api/settings/public").permitAll().requestMatchers("/api/admin/**","/admin.html").hasRole("ADMIN").requestMatchers("/api/**","/dashboard.html").authenticated().requestMatchers("/","/index.html","/*.css","/*.js","/examples/**").permitAll().anyRequest().denyAll())
   .exceptionHandling(e->e.authenticationEntryPoint((q,r,x)->{if(q.getRequestURI().endsWith(".html"))r.sendRedirect("/index.html");else json(r,401,"Please sign in.");}).accessDeniedHandler((q,r,x)->{if(q.getRequestURI().equals("/admin.html"))r.sendRedirect("/dashboard.html");else json(r,403,"You do not have permission.");}))
   .headers(h->h.contentSecurityPolicy(c->c.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; worker-src blob:; frame-src 'self'")))
   .addFilterBefore(new SessionFilter(store,origin),UsernamePasswordAuthenticationFilter.class).build();
 }
 static void json(HttpServletResponse r,int status,String message)throws IOException{r.setStatus(status);r.setContentType("application/json");r.getWriter().write("{\"error\":\""+message+"\"}");}
 public static String token(){byte[] b=new byte[32];new SecureRandom().nextBytes(b);return Base64.getUrlEncoder().withoutPadding().encodeToString(b);}
 public static String hash(String token){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
 static class SessionFilter extends OncePerRequestFilter {
  private final Store store;private final String origin;
  private final Map<String,long[]> buckets=new ConcurrentHashMap<>();
  SessionFilter(Store store,String origin){this.store=store;this.origin=origin;}
  @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
   if(!req.getRequestURI().startsWith("/api/")&&!Set.of("/dashboard.html","/admin.html").contains(req.getRequestURI())){chain.doFilter(req,res);return;}
   boolean mutation=!Set.of("GET","HEAD","OPTIONS").contains(req.getMethod());
   if(mutation&&(!origin.equals(req.getHeader("Origin"))||!"1".equals(req.getHeader("X-Algoverse-Request")))){json(res,403,"Request origin verification failed.");return;}
   if(mutation){String key=req.getRemoteAddr()+":"+(req.getRequestURI().startsWith("/api/auth/")?"auth":"writes");long now=System.currentTimeMillis();if(buckets.size()>10000)buckets.entrySet().removeIf(e->now-e.getValue()[0]>60000);long[] b=buckets.computeIfAbsent(key,k->new long[]{now,0});synchronized(b){if(now-b[0]>60000){b[0]=now;b[1]=0;}if(++b[1]>(key.endsWith("auth")?20:150)){res.setHeader("Retry-After","60");json(res,429,"Too many requests. Try again in a minute.");return;}}}
   String cookie=null;if(req.getCookies()!=null)for(Cookie c:req.getCookies())if(c.getName().equals("ALGOVERSE_SESSION"))cookie=c.getValue();
   Data.Session session=null;
   if(cookie!=null&&cookie.matches("[A-Za-z0-9_-]{43}")){session=store.byId(hash(cookie),Data.Session.class);if(session!=null&&session.expiresAt.isAfter(Instant.now())){Data.User user=store.byId(session.userId,Data.User.class);if(user!=null&&user.active){SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user.id,null,List.of(new SimpleGrantedAuthority("ROLE_"+user.role.toUpperCase(Locale.ROOT)))));req.setAttribute("algo.user",user);req.setAttribute("algo.session",session);}}}
   if(mutation&&req.getAttribute("algo.user")!=null&&!req.getRequestURI().equals("/api/auth/login")&&!req.getRequestURI().equals("/api/auth/register")){
    String csrf=req.getHeader("X-CSRF-Token");if(csrf==null||!MessageDigest.isEqual(session.csrf.getBytes(StandardCharsets.UTF_8),csrf.getBytes(StandardCharsets.UTF_8))){json(res,403,"Session verification failed. Reload and try again.");return;}
   }
   chain.doFilter(req,res);
  }
 }
}
