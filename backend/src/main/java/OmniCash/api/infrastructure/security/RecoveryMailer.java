package OmniCash.api.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.util.Map;
import java.util.List;

@Service
public class RecoveryMailer {
    private final RestClient client;
    private final String key;
    private final String from;
    private final String frontendUrl;
    private long windowStarted;
    private int sentInWindow;

    public RecoveryMailer(@Value("${api.recovery.email-api-key:}") String key,
                          @Value("${api.recovery.from:}") String from,
                          @Value("${api.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.key = key;
        this.from = from;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.client = RestClient.builder().baseUrl("https://api.resend.com")
                .requestFactory(factory).build();
    }

    public boolean enabled() { return !key.isBlank() && !from.isBlank(); }

    public void send(String email, String token) {
        reserveDelivery();
        client.post().uri("/emails").header("Authorization", "Bearer " + key).header("User-Agent", "OmniCash/1.0")
                .body(Map.of("from", from, "to", List.of(email), "subject", "Redefina sua senha do OmniCash",
                        "text", "Recebemos um pedido para redefinir sua senha. O link vale por 30 minutos e só pode ser usado uma vez:\n\n"
                                + frontendUrl + "/#reset=" + token
                                + "\n\nSe você não fez esse pedido, ignore este e-mail."))
                .retrieve().toBodilessEntity();
    }

    private synchronized void reserveDelivery() {
        long now = System.currentTimeMillis();
        if (now - windowStarted >= 60_000) { windowStarted = now; sentInWindow = 0; }
        if (sentInWindow >= 20) throw new org.springframework.web.client.RestClientException("Email delivery rate exceeded");
        sentInWindow++;
    }
}
