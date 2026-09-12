package com.hospeasy.backend.config;
import org.springframework.context.annotation.*;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
@Configuration @EnableAsync
public class EmailAsyncConfig {
    @Bean("emailExecutor") public ThreadPoolTaskExecutor emailExecutor() {
        var executor=new ThreadPoolTaskExecutor(); executor.setCorePoolSize(1); executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100); executor.setThreadNamePrefix("email-");
        executor.setRejectedExecutionHandler((r,e)->org.slf4j.LoggerFactory.getLogger(EmailAsyncConfig.class).warn("Fila de e-mail ocupada."));
        executor.initialize(); return executor;
    }
}
