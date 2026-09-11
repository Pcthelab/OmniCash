package OmniCash.api.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "google_identities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GoogleIdentityEntity {
    @Id
    @Column(length = 255)
    private String subject;
    @OneToOne(optional = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;
}
