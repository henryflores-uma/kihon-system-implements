
package com.sunkku.sistema.kihonsystem.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> manejarValidacion(
                        MethodArgumentNotValidException ex) {

                Map<String, String> errores = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .collect(Collectors.toMap(
                                                error -> error.getField(),
                                                error -> error.getDefaultMessage() != null
                                                                ? error.getDefaultMessage()
                                                                : "Valor inválido",
                                                (primero, segundo) -> primero,
                                                LinkedHashMap::new));

                Map<String, Object> respuesta = new LinkedHashMap<>();
                respuesta.put("estado", HttpStatus.BAD_REQUEST.value());
                respuesta.put("error", "Error de validación");
                respuesta.put("detalles", errores);

                return ResponseEntity.badRequest().body(respuesta);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> manejarArgumentoInvalido(
                        IllegalArgumentException ex) {

                Map<String, Object> respuesta = new LinkedHashMap<>();
                respuesta.put("estado", HttpStatus.BAD_REQUEST.value());
                respuesta.put("error", "Solicitud inválida");
                respuesta.put("mensaje", ex.getMessage());

                return ResponseEntity.badRequest().body(respuesta);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, Object>> manejarIntegridad(
                        DataIntegrityViolationException ex) {

                Map<String, Object> respuesta = new LinkedHashMap<>();
                respuesta.put("estado", HttpStatus.CONFLICT.value());
                respuesta.put("error", "Conflicto de datos");
                respuesta.put(
                                "mensaje",
                                "La operación incumple una restricción de la base de datos.");

                return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<Map<String, Object>> manejarJsonInvalido(
                        HttpMessageNotReadableException ex) {

                Map<String, Object> respuesta = new LinkedHashMap<>();
                respuesta.put("estado", HttpStatus.BAD_REQUEST.value());
                respuesta.put("error", "JSON inválido");
                respuesta.put(
                                "mensaje",
                                "Revisa el formato y los tipos de los datos enviados.");

                return ResponseEntity.badRequest().body(respuesta);
        }
}