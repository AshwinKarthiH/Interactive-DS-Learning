package com.algoverse;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.util.Set;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component @Order(-200)
public class PayloadFilter extends OncePerRequestFilter {
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  if(!req.getRequestURI().startsWith("/api/")||Set.of("GET","HEAD","OPTIONS","DELETE").contains(req.getMethod())){chain.doFilter(req,res);return;}
  if(req.getContentType()==null||!req.getContentType().toLowerCase().startsWith("application/json")){SecurityConfig.json(res,415,"Use application/json.");return;}
  byte[] bytes=req.getInputStream().readNBytes(1_048_577);if(bytes.length>1_048_576){SecurityConfig.json(res,413,"Request body is too large.");return;}
  HttpServletRequest wrapped=new HttpServletRequestWrapper(req){
   @Override public ServletInputStream getInputStream(){ByteArrayInputStream in=new ByteArrayInputStream(bytes);return new ServletInputStream(){public int read(){return in.read();}public boolean isFinished(){return in.available()==0;}public boolean isReady(){return true;}public void setReadListener(ReadListener listener){throw new UnsupportedOperationException();}};}
   @Override public BufferedReader getReader(){return new BufferedReader(new InputStreamReader(getInputStream(),java.nio.charset.StandardCharsets.UTF_8));}
  };chain.doFilter(wrapped,res);
 }
}
