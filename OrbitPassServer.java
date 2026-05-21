import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class OrbitPassServer {
    private static final int PORT = 4173;
    private static final Path ROOT = Path.of("").toAbsolutePath().normalize();
    private static final Path DATA_DIR = ROOT.resolve("data");
    private static final Path LEADS_FILE = DATA_DIR.resolve("emails.json");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern LEAD_PATTERN = Pattern.compile(
        "\\{\\s*\"id\"\\s*:\\s*\"(.*?)\"\\s*,\\s*\"email\"\\s*:\\s*\"(.*?)\"\\s*,\\s*\"createdAt\"\\s*:\\s*\"(.*?)\"\\s*,\\s*\"source\"\\s*:\\s*\"(.*?)\"\\s*\\}",
        Pattern.DOTALL
    );

    record Lead(String id, String email, String createdAt, String source) {}

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
        server.createContext("/", OrbitPassServer::handle);
        server.setExecutor(null);
        server.start();
        System.out.println("NeonGate rodando em http://localhost:" + PORT);
    }

    private static void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("POST".equals(method) && "/api/login".equals(path)) {
                handleAccess(exchange, "login");
                return;
            }

            if ("POST".equals(method) && "/api/register".equals(path)) {
                handleAccess(exchange, "cadastro");
                return;
            }

            if ("GET".equals(method) && "/api/leads".equals(path)) {
                handleLeads(exchange);
                return;
            }

            if ("GET".equals(method)) {
                serveStatic(exchange, path);
                return;
            }

            sendJson(exchange, 405, "{\"message\":\"Método não permitido.\"}");
        } catch (Exception error) {
            sendJson(exchange, 500, "{\"message\":\"Erro interno do servidor.\"}");
        }
    }

    private static void handleAccess(HttpExchange exchange, String source) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String email = extractJsonValue(body, "email").trim().toLowerCase(Locale.ROOT);
        String password = extractJsonValue(body, "password");

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            sendJson(exchange, 400, "{\"message\":\"Digite um email válido.\"}");
            return;
        }

        if (password.length() < 6) {
            sendJson(exchange, 400, "{\"message\":\"A senha demo precisa ter pelo menos 6 caracteres.\"}");
            return;
        }

        List<Lead> leads = readLeads();
        Lead lead = new Lead(UUID.randomUUID().toString(), email, DateTimeFormatter.ISO_INSTANT.format(Instant.now()), source);

        leads.add(0, lead);
        if (leads.size() > 100) {
            leads = new ArrayList<>(leads.subList(0, 100));
        }

        writeLeads(leads);

        sendJson(exchange, 200, """
            {
              "redirectTo": "/dashboard.html",
              "session": {
                "id": "%s",
                "email": "%s",
                "createdAt": "%s"
              }
            }
            """.formatted(escapeJson(lead.id()), escapeJson(lead.email()), escapeJson(lead.createdAt())));
    }

    private static void handleLeads(HttpExchange exchange) throws IOException {
        List<Lead> leads = readLeads();
        Set<String> uniqueEmails = new LinkedHashSet<>();

        for (Lead lead : leads) {
            uniqueEmails.add(lead.email());
        }

        String lastLogin = leads.isEmpty() ? "null" : "\"" + escapeJson(leads.get(0).createdAt()) + "\"";

        sendJson(exchange, 200, """
            {
              "total": %d,
              "unique": %d,
              "lastLogin": %s,
              "leads": %s
            }
            """.formatted(leads.size(), uniqueEmails.size(), lastLogin, leadsToJson(leads)));
    }

    private static void serveStatic(HttpExchange exchange, String requestedPath) throws IOException {
        String decodedPath = URLDecoder.decode(requestedPath, StandardCharsets.UTF_8);
        String staticPath = "/".equals(decodedPath) ? "/index.html" : decodedPath;
        Path filePath = ROOT.resolve(staticPath.substring(1)).normalize();

        if (!filePath.startsWith(ROOT)) {
            sendText(exchange, 403, "Forbidden", "text/plain; charset=utf-8");
            return;
        }

        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            sendText(exchange, 404, "Página não encontrada.", "text/plain; charset=utf-8");
            return;
        }

        byte[] content = Files.readAllBytes(filePath);
        exchange.getResponseHeaders().set("Content-Type", contentType(filePath));
        exchange.sendResponseHeaders(200, content.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(content);
        }
    }

    private static List<Lead> readLeads() throws IOException {
        if (!Files.exists(LEADS_FILE)) {
            return new ArrayList<>();
        }

        String json = Files.readString(LEADS_FILE, StandardCharsets.UTF_8);
        Matcher matcher = LEAD_PATTERN.matcher(json);
        List<Lead> leads = new ArrayList<>();

        while (matcher.find()) {
            leads.add(new Lead(
                unescapeJson(matcher.group(1)),
                unescapeJson(matcher.group(2)),
                unescapeJson(matcher.group(3)),
                unescapeJson(matcher.group(4))
            ));
        }

        return leads;
    }

    private static void writeLeads(List<Lead> leads) throws IOException {
        Files.createDirectories(DATA_DIR);
        Files.writeString(LEADS_FILE, leadsToJson(leads), StandardCharsets.UTF_8);
    }

    private static String leadsToJson(List<Lead> leads) {
        List<String> items = new ArrayList<>();

        for (Lead lead : leads) {
            items.add("""
                {
                  "id": "%s",
                  "email": "%s",
                  "createdAt": "%s",
                  "source": "%s"
                }
                """.formatted(
                escapeJson(lead.id()),
                escapeJson(lead.email()),
                escapeJson(lead.createdAt()),
                escapeJson(lead.source())
            ));
        }

        return "[\n" + String.join(",\n", items) + "\n]";
    }

    private static String extractJsonValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"(.*?)\"", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? unescapeJson(matcher.group(1)) : "";
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        sendText(exchange, statusCode, json, "application/json; charset=utf-8");
    }

    private static void sendText(HttpExchange exchange, int statusCode, String text, String contentType) throws IOException {
        byte[] content = text.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(statusCode, content.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(content);
        }
    }

    private static String contentType(Path filePath) {
        String fileName = filePath.getFileName().toString();

        if (fileName.endsWith(".html")) return "text/html; charset=utf-8";
        if (fileName.endsWith(".css")) return "text/css; charset=utf-8";
        if (fileName.endsWith(".js")) return "text/javascript; charset=utf-8";
        if (fileName.endsWith(".json")) return "application/json; charset=utf-8";
        if (fileName.endsWith(".md")) return "text/markdown; charset=utf-8";

        return "application/octet-stream";
    }

    private static String escapeJson(String value) {
        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r");
    }

    private static String unescapeJson(String value) {
        return value
            .replace("\\r", "\r")
            .replace("\\n", "\n")
            .replace("\\\"", "\"")
            .replace("\\\\", "\\");
    }
}
