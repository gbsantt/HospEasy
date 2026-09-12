package com.hospeasy.backend.validation;
import jakarta.validation.*;
import java.lang.annotation.*;
@Target({ElementType.FIELD,ElementType.PARAMETER,ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=SenhaValida.Validator.class)
public @interface SenhaValida {
    String message() default "A senha deve possuir no máximo 72 bytes em UTF-8.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    class Validator implements ConstraintValidator<SenhaValida,String> {
        public boolean isValid(String value,ConstraintValidatorContext c) {
            return value==null || value.getBytes(java.nio.charset.StandardCharsets.UTF_8).length<=72;
        }
    }
}
