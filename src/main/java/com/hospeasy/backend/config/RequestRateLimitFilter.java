package com.hospeasy.backend.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;
@Component
public class RequestRateLimitFilter extends OncePerRequestFilter {
    private final Map<String,Window> windows=new HashMap<>();
    private record Window(long expires,int count) {}
    private synchronized boolean allow(String key,int limit) {
        long now=System.currentTimeMillis();
        windows.entrySet().removeIf(e->e.getValue().expires()<now);
        var w=windows.get(key);
        if(w==null) { if(windows.size()>=10000) return false; windows.put(key,new Window(now+60000,1)); return true; }
        if(w.count()>=limit) return false;
        windows.put(key,new Window(w.expires(),w.count()+1)); return true;
    }
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)
        throws IOException,ServletException {
        String path=req.getServletPath();
        boolean auth=Set.of("/usuarios/login","/usuarios/cadastro","/usuarios/esqueci-senha","/usuarios/verificar-codigo","/usuarios/redefinir-senha").contains(path);
        if("POST".equals(req.getMethod()) && (auth || path.equals("/cameras/medicoes"))) {
            // Forwarded addresses must only be supplied by a trusted proxy configured at deployment.
            int limit=path.equals("/usuarios/esqueci-senha")?5:(auth?20:120);
            if(!allow(req.getRemoteAddr()+":"+path,limit)) {
                res.setHeader("Retry-After","60");
                SecurityErrors.write(res,429,"LIMITE_REQUISICOES","Muitas tentativas. Aguarde antes de tentar novamente."); return;
            }
        }
        chain.doFilter(req,res);
    }
}
