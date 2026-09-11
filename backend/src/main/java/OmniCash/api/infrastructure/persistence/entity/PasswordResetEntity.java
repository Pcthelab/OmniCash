package OmniCash.api.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "password_resets")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetEntity {
    @Id
    private Long userId;
    @OneToOne(optional = false)
    @JoinColumn(name = "userId", referencedColumnName = "id", insertable = false, updatable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private UserEntity user;
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private Instant requestedAt;
}
