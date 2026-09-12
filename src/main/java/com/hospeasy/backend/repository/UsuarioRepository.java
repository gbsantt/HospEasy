package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email,Long id);
    long countByTipoAndAtivoTrue(TipoUsuario tipo);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from Usuario u order by u.id")
    List<Usuario> bloquearUsuarios();
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from Usuario u where u.email = :email")
    Optional<Usuario> bloquearPorEmail(String email);
}
