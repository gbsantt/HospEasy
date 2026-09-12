package com.hospeasy.backend.config;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
public final class SecurityErrors {
    private SecurityErrors() {}
    public static void write(HttpServletResponse res,int status,String codigo,String mensagem) throws IOException {
        res.setStatus(status); res.setContentType("application/json"); res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"status\":"+status+",\"codigo\":\""+codigo+"\",\"mensagem\":\""+mensagem+"\"}");
    }
}
