
package com.sunkku.sistema.kihonsystem.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.sunkku.sistema.kihonsystem.config.SupabaseConfig;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

@Service
public class SupabaseStorageService {

        private final SupabaseConfig supabaseConfig;
        private final ObjectMapper objectMapper;
        private final HttpClient httpClient = HttpClient.newHttpClient();

        private static final String BUCKET = "sunkku-storage";
        private static final int DURACION_URL_SEGUNDOS = 3600;

        public SupabaseStorageService(
                        SupabaseConfig supabaseConfig,
                        ObjectMapper objectMapper) {
                this.supabaseConfig = supabaseConfig;
                this.objectMapper = objectMapper;
        }

        /**
         * Sube una imagen a Supabase Storage.
         * Devuelve la ruta relativa que se guardará en PostgreSQL.
         */
        public String subirImagenProducto(
                        MultipartFile archivo,
                        Long productoId)
                        throws IOException, InterruptedException {

                if (archivo == null || archivo.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "El archivo está vacío");
                }

                String tipoContenido = archivo.getContentType();

                if (tipoContenido == null
                                || !tipoContenido.startsWith("image/")) {
                        throw new IllegalArgumentException(
                                        "El archivo debe ser una imagen");
                }

                String nombreArchivo = archivo.getOriginalFilename();

                if (nombreArchivo == null || nombreArchivo.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El archivo no tiene un nombre válido");
                }

                // Evita utilizar rutas proporcionadas por el cliente.
                nombreArchivo = nombreArchivo.replace("\\", "/");
                nombreArchivo = nombreArchivo.substring(
                                nombreArchivo.lastIndexOf('/') + 1);

                if (nombreArchivo.isBlank()
                                || nombreArchivo.equals(".")
                                || nombreArchivo.equals("..")) {
                        throw new IllegalArgumentException(
                                        "El nombre del archivo no es válido");
                }

                String ruta = "productos/" + productoId
                                + "/" + nombreArchivo;

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/"
                                + BUCKET + "/" + rutaCodificada;

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .header(
                                                HttpHeaders.CONTENT_TYPE,
                                                tipoContenido)
                                .header("x-upsert", "true")
                                .PUT(HttpRequest.BodyPublishers.ofByteArray(
                                                archivo.getBytes()))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200
                                || response.statusCode() >= 300) {
                        throw new RuntimeException(
                                        "Error al subir la imagen a Supabase Storage. "
                                                        + "Código: " + response.statusCode()
                                                        + " - " + response.body());
                }

                return ruta;
        }

        /**
         * Genera una URL firmada temporal para un archivo privado.
         * La URL caduca después de una hora.
         */
        public String generarUrlFirmada(String ruta)
                        throws IOException, InterruptedException {

                if (ruta == null || ruta.isBlank()) {
                        throw new IllegalArgumentException(
                                        "La ruta de la imagen está vacía");
                }

                String rutaCodificada = codificarRuta(ruta);

                String endpoint = supabaseConfig.getUrl()
                                + "/storage/v1/object/sign/"
                                + BUCKET + "/" + rutaCodificada;

                String cuerpoJson = objectMapper.writeValueAsString(
                                java.util.Map.of(
                                                "expiresIn",
                                                DURACION_URL_SEGUNDOS));

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(endpoint))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .header(
                                                HttpHeaders.CONTENT_TYPE,
                                                "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(
                                                cuerpoJson))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200
                                || response.statusCode() >= 300) {
                        throw new RuntimeException(
                                        "Error al generar URL firmada. Código: "
                                                        + response.statusCode()
                                                        + " - " + response.body());
                }

                JsonNode respuesta = objectMapper.readTree(
                                response.body());

                String signedURL = respuesta.path("signedURL").stringValue("");

                if (signedURL.isBlank()) {
                        throw new RuntimeException(
                                        "Supabase no devolvió una URL firmada");
                }

                if (signedURL.startsWith("https://")
                                || signedURL.startsWith("http://")) {
                        return signedURL;
                }

                // Supabase normalmente devuelve una ruta relativa.
                return supabaseConfig.getUrl()
                                + "/storage/v1"
                                + (signedURL.startsWith("/")
                                                ? signedURL
                                                : "/" + signedURL);
        }

        /**
         * Codifica cada segmento de la ruta sin codificar las barras.
         */
        private String codificarRuta(String ruta) {
                String[] segmentos = ruta.split("/", -1);
                StringBuilder resultado = new StringBuilder();

                for (String segmento : segmentos) {
                        if (resultado.length() > 0) {
                                resultado.append("/");
                        }

                        resultado.append(
                                        URLEncoder.encode(
                                                        segmento,
                                                        StandardCharsets.UTF_8)
                                                        .replace("+", "%20"));
                }

                return resultado.toString();
        }

        public String getSupabaseUrl() {
                return supabaseConfig.getUrl();
        }

        public String getBucket() {
                return BUCKET;
        }
}