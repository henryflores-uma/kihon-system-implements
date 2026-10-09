package com.sunkku.sistema.kihonsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
// import jakarta.annotation.PostConstruct;

@Configuration
public class SupabaseConfig {

    @Value("${supabase.project-url}")
    private String url;

    @Value("${SUNKU_SUPABASE_SECRET_KEY}")
    private String secretKey;

    public String getUrl() {
        return url;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getProjectUrl() {
        return url;
    }

    // @PostConstruct
    // public void mostrarConfiguracion() {
    // String variable = System.getenv("SUNKU_SUPABASE_SECRET_KEY");

    // System.out.println("========== DIAGNOSTICO SUPABASE ==========");
    // System.out.println("URL: " + url);
    // System.out.println("Longitud de variable de entorno: "
    // + (variable == null ? 0 : variable.length()));
    // System.out.println("Longitud de propiedad Spring: "
    // + (secretKey == null ? 0 : secretKey.length()));
    // System.out.println("¿Coinciden?: "
    // + (variable != null && variable.equals(secretKey)));
    // System.out.println("==========================================");
    // }
}