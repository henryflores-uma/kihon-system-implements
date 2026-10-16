
package com.sunkku.sistema.kihonsystem.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.sunkku.sistema.kihonsystem.config.SupabaseConfig;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class SupabaseStorageService {

        private final SupabaseConfig supabaseConfig;
        private final ObjectMapper objectMapper;
        private final HttpClient httpClient = HttpClient.newHttpClient();

        private static final String BUCKET = "sunkku-storage";
        private static final int DURACION_URL_SEGUNDOS = 3600;
        private static final long TAMANO_MAXIMO_IMAGEN = 5L * 1024 * 1024;

        public SupabaseStorageService(
                        SupabaseConfig supabaseConfig,
                        ObjectMapper objectMapper) {
                this.supabaseConfig = supabaseConfig;
                this.objectMapper = objectMapper;
        }

        /**
         * Sube una imagen de producto a Supabase Storage.
         * Guarda la ruta relativa para almacenarla en la base de datos.
         */
        public String subirImagenProducto(
                        MultipartFile archivo,
                        Long productoId) throws IOException, InterruptedException {

                validarArchivoImagen(archivo);

                if (productoId == null || productoId <= 0) {
                        throw new IllegalArgumentException(
                                        "El identificador del producto no es válido.");
                }

                String nombreArchivo = obtenerNombreArchivo(archivo);
                String ruta = "productos/" + productoId + "/" + nombreArchivo;

                subirArchivo(archivo, ruta);

                return ruta;
        }

        /**
         * Sube una imagen de servicio a Supabase Storage.
         * Guarda la ruta relativa para almacenarla en la base de datos.
         */
        public String subirImagenServicio(
                        MultipartFile archivo,
                        Long servicioId) throws IOException, InterruptedException {

                validarArchivoImagen(archivo);

                if (servicioId == null || servicioId <= 0) {
                        throw new IllegalArgumentException(
                                        "El identificador del servicio no es válido.");
                }

                String nombreArchivo = obtenerNombreArchivo(archivo);
                String ruta = "servicios/" + servicioId + "/" + nombreArchivo;

                subirArchivo(archivo, ruta);

                return ruta;
        }

        /**
         * Sube el archivo al bucket privado y devuelve su ruta relativa.
         */
        private void subirArchivo(
                        MultipartFile archivo,
                        String ruta) throws IOException, InterruptedException {

                String tipoContenido = archivo.getContentType();
                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/"
                                + BUCKET
                                + "/"
                                + rutaCodificada;

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
                                        "Error al subir la imagen a Supabase Storage. Código: "
                                                        + response.statusCode()
                                                        + " - "
                                                        + response.body());
                }
        }

        /**
         * Genera una URL firmada temporal para acceder a un archivo privado.
         */
        public String generarUrlFirmada(
                        String ruta) throws IOException, InterruptedException {

                if (ruta == null || ruta.isBlank()) {
                        throw new IllegalArgumentException(
                                        "La ruta de la imagen no puede estar vacía.");
                }

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/sign/"
                                + BUCKET
                                + "/"
                                + rutaCodificada;

                String cuerpoJson = """
                                {
                                    "expiresIn": %d
                                }
                                """.formatted(DURACION_URL_SEGUNDOS);

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
                                                "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(
                                                cuerpoJson,
                                                StandardCharsets.UTF_8))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200
                                || response.statusCode() >= 300) {

                        throw new RuntimeException(
                                        "Error al generar la URL firmada de Supabase Storage. Código: "
                                                        + response.statusCode()
                                                        + " - "
                                                        + response.body());
                }

                JsonNode respuesta = objectMapper.readTree(response.body());
                JsonNode nodoUrl = respuesta.get("signedURL");

                if (nodoUrl == null || nodoUrl.isNull()
                                || nodoUrl.asString().isBlank()) {
                        throw new RuntimeException(
                                        "Supabase no devolvió una URL firmada válida.");
                }

                String urlFirmada = nodoUrl.asString();

                if (urlFirmada.startsWith("http://")
                                || urlFirmada.startsWith("https://")) {
                        return urlFirmada;
                }

                String baseStorage = supabaseConfig.getUrl()
                                + "/storage/v1";

                if (urlFirmada.startsWith("/")) {
                        return baseStorage + urlFirmada;
                }

                return baseStorage + "/" + urlFirmada;
        }

        /**
         * Valida el archivo antes de enviarlo a Supabase.
         */
        private void validarArchivoImagen(MultipartFile archivo) {

                if (archivo == null || archivo.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "El archivo de imagen está vacío.");
                }

                if (archivo.getSize() > TAMANO_MAXIMO_IMAGEN) {
                        throw new IllegalArgumentException(
                                        "La imagen no puede superar los 5 MB.");
                }

                String tipoContenido = archivo.getContentType();

                if (tipoContenido == null
                                || !(tipoContenido.equalsIgnoreCase("image/jpeg")
                                                || tipoContenido.equalsIgnoreCase("image/png")
                                                || tipoContenido.equalsIgnoreCase("image/webp"))) {

                        throw new IllegalArgumentException(
                                        "Formato de imagen no permitido. "
                                                        + "Utiliza JPG, PNG o WEBP.");
                }
        }

        /**
         * Obtiene únicamente el nombre del archivo y evita conservar
         * rutas locales enviadas por el navegador.
         */
        private String obtenerNombreArchivo(MultipartFile archivo) {

                String nombreArchivo = archivo.getOriginalFilename();

                if (nombreArchivo == null || nombreArchivo.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El nombre del archivo no es válido.");
                }

                nombreArchivo = nombreArchivo.replace("\\", "/");

                nombreArchivo = nombreArchivo.substring(
                                nombreArchivo.lastIndexOf('/') + 1);

                if (nombreArchivo.isBlank()
                                || nombreArchivo.equals(".")
                                || nombreArchivo.equals("..")) {
                        throw new IllegalArgumentException(
                                        "El nombre del archivo no es válido.");
                }

                return nombreArchivo;
        }

        /**
         * Codifica cada segmento de la ruta, preservando las barras.
         */
        private String codificarRuta(String ruta) {

                String[] segmentos = ruta.split("/");
                StringBuilder rutaCodificada = new StringBuilder();

                for (String segmento : segmentos) {

                        if (rutaCodificada.length() > 0) {
                                rutaCodificada.append("/");
                        }

                        rutaCodificada.append(
                                        URLEncoder.encode(
                                                        segmento,
                                                        StandardCharsets.UTF_8)
                                                        .replace("+", "%20"));
                }

                return rutaCodificada.toString();
        }

        public String getSupabaseUrl() {
                return supabaseConfig.getUrl();
        }

        public String getBucket() {
                return BUCKET;
        }
}
